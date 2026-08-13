import {
  commitTransaction,
  initTransaction,
  killTransaction,
  type PayloadHandler,
} from 'payload'
import {
  checkoutAccessToken,
  placeCodOrder,
  readCheckoutInput,
  readTrackQuery,
  type CheckoutProduct,
  type CheckoutStore,
} from '@/lib/checkout'
import { CheckoutError, reserveVariantStock } from '@/lib/inventory'
import { notifyOrderPlaced } from '@/lib/notifications'
import { formatOrderStatus, formatPaymentStatus, orderStatusMessage } from '@/lib/orders'
import { formatPkr } from '@/lib/pakistan'
import { formatShippingStatus } from '@/lib/shipping'
import {
  clientIp,
  isSameOrigin,
  publicError,
  publicHttpUrl,
  RATE_LIMITS,
  rateLimit,
  rateLimitedResponse,
  rejectOversizedJson,
  requireJsonPost,
  safePublicError,
} from '@/lib/security'

function checkoutErrorResponse(error: unknown) {
  if (error instanceof CheckoutError) {
    if (error.status >= 500) {
      return publicError('Could not place order. Please try again.', 500)
    }
    return publicError(error.message, error.status)
  }
  return null
}

export const checkoutHandler: PayloadHandler = async (req) => {
  try {
    if (!isSameOrigin(req)) {
      return publicError('Invalid request origin.', 403)
    }
    if (req.method && req.method !== 'POST') {
      return publicError('Method not allowed.', 405)
    }
    const jsonError = requireJsonPost(req)
    if (jsonError) return jsonError
    const oversized = rejectOversizedJson(req)
    if (oversized) return oversized

    const ip = clientIp(req)
    const ipLimit = rateLimit(`checkout:ip:${ip}`, RATE_LIMITS.checkoutIp.limit, RATE_LIMITS.checkoutIp.windowMs)
    if (!ipLimit.ok) return rateLimitedResponse(ipLimit.retryAfter)

    if (!req.json) {
      return publicError('Invalid request.')
    }

    let body: Record<string, unknown>
    try {
      body = (await req.json()) as Record<string, unknown>
    } catch {
      return publicError('Invalid request.')
    }

    const parsed = readCheckoutInput(body)
    if (!parsed.ok) {
      return publicError(parsed.message, parsed.status)
    }

    const phoneLimit = rateLimit(
      `checkout:phone:${parsed.input.phone}`,
      RATE_LIMITS.checkoutPhone.limit,
      RATE_LIMITS.checkoutPhone.windowMs,
    )
    if (!phoneLimit.ok) return rateLimitedResponse(phoneLimit.retryAfter)

    const shouldCommit = await initTransaction(req)
    const transactionID = req.transactionID instanceof Promise ? await req.transactionID : req.transactionID
    if (!transactionID) {
      return publicError('Could not start checkout. Please try again.', 503)
    }

    const store: CheckoutStore = {
      async getSettings() {
        return req.payload.findGlobal({
          slug: 'site-settings',
          overrideAccess: true,
        })
      },
      async getProduct(id) {
        const product = await req.payload.findByID({
          collection: 'products',
          id,
          overrideAccess: true,
          depth: 0,
          draft: false,
          req,
        })
        if (!product) return null
        return {
          id: Number(product.id),
          title: product.title,
          _status: product._status,
          variants: (product.variants || []) as CheckoutProduct['variants'],
        }
      },
      reserveStock: (line) => reserveVariantStock(req, line),
      async createOrder(order) {
        const created = await req.payload.create({
          collection: 'orders',
          overrideAccess: true,
          disableTransaction: true,
          req,
          data: order,
        })
        return {
          ...order,
          id: created.id,
          orderNumber: String(created.orderNumber),
          total: Number(created.total),
        }
      },
    }

    try {
      const order = await placeCodOrder(store, parsed.input)

      if (shouldCommit) {
        await commitTransaction(req)
      }

      const settings = await req.payload.findGlobal({
        slug: 'site-settings',
        overrideAccess: true,
      })
      const notification = await notifyOrderPlaced({
        payload: req.payload,
        order,
        settings,
        logger: req.payload.logger,
      }).catch((error) => {
        req.payload.logger.error({ err: error, msg: 'Order placed but notifications did not complete.' })
        return null
      })

      return Response.json({
        ok: true,
        orderNumber: order.orderNumber,
        accessToken: checkoutAccessToken(String(order.orderNumber)),
        total: order.total,
        formattedTotal: formatPkr(Number(order.total)),
        message: 'Order placed. Pay cash when your parcel arrives.',
        whatsapp: notification?.whatsapp || { available: false, url: null },
      })
    } catch (error) {
      await killTransaction(req)
      const response = checkoutErrorResponse(error)
      if (response) return response
      req.payload.logger.error({ err: error, msg: 'COD checkout failed; inventory left unchanged.' })
      return publicError('Could not place order. Please try again.', 500)
    }
  } catch (error) {
    return safePublicError(error, req.payload?.logger)
  }
}

export const trackOrderHandler: PayloadHandler = async (req) => {
  try {
    if (!isSameOrigin(req)) {
      return publicError('Invalid request origin.', 403)
    }

    const ip = clientIp(req)
    const ipLimit = rateLimit(`track:ip:${ip}`, RATE_LIMITS.trackIp.limit, RATE_LIMITS.trackIp.windowMs)
    if (!ipLimit.ok) return rateLimitedResponse(ipLimit.retryAfter)

    const url = req.url ? new URL(req.url) : null
    const parsed = readTrackQuery(url?.searchParams.get('orderNumber') || '', url?.searchParams.get('phone') || '')
    if (!parsed.ok) {
      return publicError(parsed.message, parsed.status)
    }
    const { orderNumber, phone } = parsed

    const result = await req.payload.find({
      collection: 'orders',
      overrideAccess: true,
      depth: 0,
      where: {
        and: [{ orderNumber: { equals: orderNumber } }, { phone: { equals: phone } }],
      },
      limit: 1,
      select: {
        orderNumber: true,
        status: true,
        paymentStatus: true,
        city: true,
        total: true,
        createdAt: true,
        items: true,
        statusHistory: true,
        shipment: true,
      },
    })

    const order = result.docs[0]
    if (!order) {
      return publicError('No matching order found.', 404)
    }

    return Response.json({
      orderNumber: order.orderNumber,
      status: order.status,
      statusLabel: formatOrderStatus(order.status),
      statusMessage: orderStatusMessage(order.status),
      paymentStatus: order.paymentStatus,
      paymentLabel: formatPaymentStatus(order.paymentStatus),
      city: order.city,
      total: order.total,
      formattedTotal: formatPkr(Number(order.total)),
      createdAt: order.createdAt,
      items: (order.items || []).map((item) => ({
        title: item.title,
        size: item.size,
        color: item.color,
        qty: item.qty,
        price: item.price,
      })),
      statusHistory: (order.statusHistory || []).map((entry) => ({
        status: entry.status,
        label: formatOrderStatus(entry.status),
        at: entry.at,
      })),
      shipment: order.shipment
        ? {
            courierName: order.shipment.courierName,
            trackingNumber: order.shipment.trackingNumber,
            trackingUrl: publicHttpUrl(order.shipment.trackingUrl),
            shippingStatus: order.shipment.shippingStatus,
            shippingStatusLabel: formatShippingStatus(order.shipment.shippingStatus),
            shipmentDate: order.shipment.shipmentDate,
            deliveryDate: order.shipment.deliveryDate,
            codAmount: order.shipment.codAmount,
          }
        : null,
    })
  } catch (error) {
    return safePublicError(error, req.payload?.logger)
  }
}

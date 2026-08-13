import {
  commitTransaction,
  initTransaction,
  killTransaction,
  type PayloadHandler,
} from 'payload'
import {
  CheckoutError,
  normalizeCheckoutLines,
  reserveVariantStock,
  StockReservationError,
} from '@/lib/inventory'
import { notifyOrderPlaced } from '@/lib/notifications'
import { createOrderAccessToken } from '@/lib/order-access'
import { formatOrderStatus, formatPaymentStatus, orderStatusMessage } from '@/lib/orders'
import {
  clampText,
  formatPkr,
  isPakistanCity,
  isValidEmail,
  isValidPkPhone,
  normalizePkPhone,
  type PakistanCity,
} from '@/lib/pakistan'
import { formatShippingStatus } from '@/lib/shipping'
import {
  clientIp,
  isSameOrigin,
  ORDER_NUMBER_PATTERN,
  publicError,
  publicHttpUrl,
  RATE_LIMITS,
  rateLimit,
  rateLimitedResponse,
  rejectOversizedJson,
  requireJsonPost,
  safePublicError,
  SKU_PATTERN,
} from '@/lib/security'

type CartItemInput = {
  productId: string | number
  sku: string
  qty: number
}

function generateOrderNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  const rand = crypto.getRandomValues(new Uint32Array(1))[0] % 900000
  return `RNZ-${stamp}-${String(100000 + rand)}`
}

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

    if (clampText(body.website, 80) || clampText(body.company, 80)) {
      return publicError('Could not place order. Please try again.')
    }

    const customerName = clampText(body.customerName, 80)
    const phone = normalizePkPhone(clampText(body.phone, 20))
    const emailRaw = clampText(body.email, 120)
    const email = emailRaw || undefined
    const city = clampText(body.city, 40)
    const area = clampText(body.area, 80)
    const address = clampText(body.address, 300)
    const landmark = clampText(body.landmark, 120) || undefined
    const customerNotes = clampText(body.customerNotes, 300) || undefined
    const itemsInput = Array.isArray(body.items) ? (body.items as CartItemInput[]) : []

    if (customerName.length < 3) {
      return publicError('Please enter your full name.')
    }
    if (!isValidPkPhone(phone)) {
      return publicError('Enter a valid Pakistani mobile number (03XXXXXXXXX).')
    }
    if (email && !isValidEmail(email)) {
      return publicError('Enter a valid email, or leave it blank.')
    }
    if (!isPakistanCity(city)) {
      return publicError('Please select your city.')
    }
    if (area.length < 2) {
      return publicError('Please enter your area or colony.')
    }
    if (address.length < 8) {
      return publicError('Please enter a complete delivery address.')
    }
    if (itemsInput.length === 0 || itemsInput.length > 20) {
      return publicError('Your cart is empty.')
    }
    if (itemsInput.some((item) => !SKU_PATTERN.test(String(item.sku || '')))) {
      return publicError('Your cart has an invalid item. Please refresh and try again.')
    }

    const phoneLimit = rateLimit(
      `checkout:phone:${phone}`,
      RATE_LIMITS.checkoutPhone.limit,
      RATE_LIMITS.checkoutPhone.windowMs,
    )
    if (!phoneLimit.ok) return rateLimitedResponse(phoneLimit.retryAfter)

    let lines
    try {
      lines = normalizeCheckoutLines(itemsInput)
    } catch (error) {
      const response = checkoutErrorResponse(error)
      if (response) return response
      return safePublicError(error, req.payload.logger)
    }

    const settings = await req.payload.findGlobal({
      slug: 'site-settings',
      overrideAccess: true,
    })

    const shouldCommit = await initTransaction(req)
    const transactionID = req.transactionID instanceof Promise ? await req.transactionID : req.transactionID
    if (!transactionID) {
      return publicError('Could not start checkout. Please try again.', 503)
    }

    try {
      const orderItems: Array<{
        product: number
        title: string
        sku: string
        size: string
        color: string
        qty: number
        price: number
      }> = []

      let subtotal = 0

      for (const line of lines) {
        const product = await req.payload.findByID({
          collection: 'products',
          id: line.productId,
          overrideAccess: true,
          depth: 0,
          draft: false,
          req,
        })

        if (!product || product._status !== 'published') {
          throw new CheckoutError('A product in your cart is no longer available.')
        }

        const variants = (product.variants || []) as Array<{
          sku: string
          size: string
          color: string
          price: number
          stock: number
        }>
        const variant = variants.find((item) => item.sku === line.sku)
        if (!variant) {
          throw new CheckoutError('A product in your cart is no longer available.')
        }

        const reserved = await reserveVariantStock(req, line)
        if (!reserved.ok) {
          const label = `${product.title} (${variant.size} / ${variant.color})`
          if (reserved.reason === 'missing') {
            throw new StockReservationError('A product in your cart is no longer available.')
          }
          throw new StockReservationError(
            reserved.available < 1 ? `${label} is out of stock.` : `${label} only has ${reserved.available} left.`,
          )
        }

        orderItems.push({
          product: Number(product.id),
          title: product.title,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          qty: line.qty,
          price: variant.price,
        })
        subtotal += variant.price * line.qty
      }

      const cityRates = (settings.cityShipping || []) as Array<{ city: string; fee: number }>
      const cityRate = cityRates.find((rate) => rate.city === city)
      const defaultShipping = Number(settings.defaultShippingFee || 250)
      const threshold = Number(settings.freeShippingThreshold || 0)
      const shipping = threshold > 0 && subtotal >= threshold ? 0 : (cityRate?.fee ?? defaultShipping)
      const codFee = Number(settings.codFee || 0)
      const total = subtotal + shipping + codFee

      const order = await req.payload.create({
        collection: 'orders',
        overrideAccess: true,
        disableTransaction: true,
        req,
        data: {
          orderNumber: generateOrderNumber(),
          status: 'pending',
          paymentMethod: 'cod',
          paymentStatus: 'unpaid',
          customerName,
          phone,
          email,
          city: city as PakistanCity,
          area,
          address,
          landmark,
          customerNotes,
          items: orderItems,
          subtotal,
          shipping,
          codFee,
          total,
          shipment: {
            provider: 'manual',
            shippingStatus: 'not_booked',
            codAmount: total,
          },
        },
      })

      if (shouldCommit) {
        await commitTransaction(req)
      }

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
        accessToken: createOrderAccessToken(String(order.orderNumber)),
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
    const orderNumber = clampText(url?.searchParams.get('orderNumber'), 24).toUpperCase()
    const phone = normalizePkPhone(clampText(url?.searchParams.get('phone'), 20))

    if (!ORDER_NUMBER_PATTERN.test(orderNumber) || !isValidPkPhone(phone)) {
      return publicError('Enter your order number and the phone used at checkout.')
    }

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

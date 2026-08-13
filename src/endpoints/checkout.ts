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
import {
  formatPkr,
  isValidPkPhone,
  normalizePkPhone,
  type PakistanCity,
} from '@/lib/pakistan'

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
    return Response.json({ error: error.message }, { status: error.status })
  }
  return null
}

export const checkoutHandler: PayloadHandler = async (req) => {
  if (!req.json) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const body = await req.json()
  const customerName = String(body.customerName || '').trim()
  const phone = normalizePkPhone(String(body.phone || ''))
  const email = String(body.email || '').trim() || undefined
  const city = String(body.city || '').trim() as PakistanCity
  const area = String(body.area || '').trim()
  const address = String(body.address || '').trim()
  const landmark = String(body.landmark || '').trim() || undefined
  const customerNotes = String(body.customerNotes || '').trim() || undefined
  const itemsInput = Array.isArray(body.items) ? (body.items as CartItemInput[]) : []

  if (customerName.length < 3) {
    return Response.json({ error: 'Please enter your full name.' }, { status: 400 })
  }
  if (!isValidPkPhone(phone)) {
    return Response.json({ error: 'Enter a valid Pakistani mobile number (03XXXXXXXXX).' }, { status: 400 })
  }
  if (!city) {
    return Response.json({ error: 'Please select your city.' }, { status: 400 })
  }
  if (area.length < 2) {
    return Response.json({ error: 'Please enter your area or colony.' }, { status: 400 })
  }
  if (address.length < 8) {
    return Response.json({ error: 'Please enter a complete delivery address.' }, { status: 400 })
  }
  if (itemsInput.length === 0) {
    return Response.json({ error: 'Your cart is empty.' }, { status: 400 })
  }

  let lines
  try {
    lines = normalizeCheckoutLines(itemsInput)
  } catch (error) {
    const response = checkoutErrorResponse(error)
    if (response) return response
    throw error
  }

  const settings = await req.payload.findGlobal({
    slug: 'site-settings',
    overrideAccess: true,
  })

  const shouldCommit = await initTransaction(req)
  const transactionID = req.transactionID instanceof Promise ? await req.transactionID : req.transactionID
  if (!transactionID) {
    return Response.json({ error: 'Could not start checkout. Please try again.' }, { status: 503 })
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
        throw new CheckoutError(`Variant ${line.sku} was not found.`)
      }

      const reserved = await reserveVariantStock(req, line)
      if (!reserved.ok) {
        const label = `${product.title} (${variant.size} / ${variant.color})`
        if (reserved.reason === 'missing') {
          throw new StockReservationError(`${label} was not found.`)
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
        city,
        area,
        address,
        landmark,
        customerNotes,
        items: orderItems,
        subtotal,
        shipping,
        codFee,
        total,
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
    return Response.json({ error: 'Could not place order. Please try again.' }, { status: 500 })
  }
}

export const trackOrderHandler: PayloadHandler = async (req) => {
  const url = req.url ? new URL(req.url) : null
  const orderNumber = url?.searchParams.get('orderNumber')?.trim()
  const phone = normalizePkPhone(url?.searchParams.get('phone') || '')

  if (!orderNumber || !isValidPkPhone(phone)) {
    return Response.json({ error: 'Enter your order number and the phone used at checkout.' }, { status: 400 })
  }

  const result = await req.payload.find({
    collection: 'orders',
    overrideAccess: true,
    where: {
      and: [{ orderNumber: { equals: orderNumber } }, { phone: { equals: phone } }],
    },
    limit: 1,
  })

  const order = result.docs[0]
  if (!order) {
    return Response.json({ error: 'No matching order found.' }, { status: 404 })
  }

  return Response.json({
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    city: order.city,
    total: order.total,
    formattedTotal: formatPkr(Number(order.total)),
    createdAt: order.createdAt,
    items: order.items,
  })
}

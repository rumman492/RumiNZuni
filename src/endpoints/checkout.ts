import type { PayloadHandler } from 'payload'
import type { Product } from '@/payload-types'
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
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `RNZ-${stamp}-${rand}`
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

  const settings = await req.payload.findGlobal({
    slug: 'site-settings',
    overrideAccess: true,
  })

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

  for (const line of itemsInput) {
    const qty = Number(line.qty)
    if (!line.productId || !line.sku || !Number.isInteger(qty) || qty < 1 || qty > 20) {
      return Response.json({ error: 'One of the cart items is invalid.' }, { status: 400 })
    }

    const product = await req.payload.findByID({
      collection: 'products',
      id: line.productId,
      overrideAccess: true,
      depth: 0,
    })

    if (!product || product._status !== 'published') {
      return Response.json({ error: 'A product in your cart is no longer available.' }, { status: 400 })
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
      return Response.json({ error: `Variant ${line.sku} was not found.` }, { status: 400 })
    }
    if (variant.stock < qty) {
      return Response.json(
        { error: `${product.title} (${variant.size} / ${variant.color}) only has ${variant.stock} left.` },
        { status: 400 },
      )
    }

    orderItems.push({
      product: Number(product.id),
      title: product.title,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      qty,
      price: variant.price,
    })
    subtotal += variant.price * qty
  }

  const cityRates = (settings.cityShipping || []) as Array<{ city: string; fee: number }>
  const cityRate = cityRates.find((rate) => rate.city === city)
  const defaultShipping = Number(settings.defaultShippingFee || 250)
  const threshold = Number(settings.freeShippingThreshold || 0)
  const shipping = threshold > 0 && subtotal >= threshold ? 0 : (cityRate?.fee ?? defaultShipping)
  const codFee = Number(settings.codFee || 0)
  const total = subtotal + shipping + codFee

  const orderNumber = generateOrderNumber()

  const order = await req.payload.create({
    collection: 'orders',
    overrideAccess: true,
    data: {
      orderNumber,
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

  for (const line of orderItems) {
    const product = await req.payload.findByID({
      collection: 'products',
      id: line.product,
      overrideAccess: true,
      depth: 0,
    })
    const variants = (product.variants || []) as Product['variants']
    await req.payload.update({
      collection: 'products',
      id: product.id,
      overrideAccess: true,
      data: {
        variants: variants.map((variant) =>
          variant.sku === line.sku ? { ...variant, stock: Math.max(0, variant.stock - line.qty) } : variant,
        ),
      },
    })
  }

  return Response.json({
    ok: true,
    orderNumber: order.orderNumber,
    total: order.total,
    formattedTotal: formatPkr(Number(order.total)),
    message: 'Order placed. Pay cash when your parcel arrives.',
  })
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

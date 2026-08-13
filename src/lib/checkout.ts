import {
  CheckoutError,
  evaluateStockReservation,
  normalizeCheckoutLines,
  StockReservationError,
  type CheckoutLine,
  type ReserveStockResult,
} from '@/lib/inventory'
import { createOrderAccessToken, verifyOrderAccessToken } from '@/lib/order-access'
import {
  clampText,
  isPakistanCity,
  isValidEmail,
  isValidPkPhone,
  normalizePkPhone,
  type PakistanCity,
} from '@/lib/pakistan'
import { ORDER_NUMBER_PATTERN, SKU_PATTERN } from '@/lib/security'
import { quoteCodTotals } from '@/lib/shipping'

export type CheckoutItemInput = {
  productId: string | number
  sku: string
  qty: number
}

export type CheckoutCustomerInput = {
  customerName: string
  phone: string
  email?: string
  city: PakistanCity
  area: string
  address: string
  landmark?: string
  customerNotes?: string
  items: CheckoutItemInput[]
}

export type CheckoutProduct = {
  id: number
  title: string
  _status?: string | null
  variants: Array<{
    sku: string
    size: string
    color: string
    price: number
    stock: number
  }>
}

export type CheckoutSettings = {
  defaultShippingFee?: number | null
  freeShippingThreshold?: number | null
  cityShipping?: Array<{ city: string; fee: number }> | null
  codFee?: number | null
}

export type PlacedOrderItem = {
  product: number
  title: string
  sku: string
  size: string
  color: string
  qty: number
  price: number
}

export type NewOrder = {
  orderNumber: string
  status: 'pending'
  paymentMethod: 'cod'
  paymentStatus: 'unpaid'
  customerName: string
  phone: string
  email?: string
  city: PakistanCity
  area: string
  address: string
  landmark?: string
  customerNotes?: string
  items: PlacedOrderItem[]
  subtotal: number
  shipping: number
  codFee: number
  total: number
  shipment: {
    provider: 'manual'
    shippingStatus: 'not_booked'
    codAmount: number
  }
}

export type PlacedOrder = NewOrder & { id: string | number }

export type CheckoutStore = {
  getSettings(): Promise<CheckoutSettings>
  getProduct(id: number): Promise<CheckoutProduct | null>
  reserveStock(line: CheckoutLine): Promise<ReserveStockResult>
  createOrder(order: NewOrder): Promise<PlacedOrder>
}

export type CheckoutFailure = {
  ok: false
  message: string
  status: number
}

export type CheckoutSuccess = {
  ok: true
  input: CheckoutCustomerInput
}

export function generateOrderNumber(now = new Date(), randomInt?: () => number) {
  const stamp = now.toISOString().slice(0, 10).replaceAll('-', '')
  const rand =
    typeof randomInt === 'function'
      ? Math.abs(randomInt()) % 900000
      : crypto.getRandomValues(new Uint32Array(1))[0] % 900000
  return `RNZ-${stamp}-${String(100000 + rand)}`
}

export function canViewOrderConfirmation(orderNumber: string, token?: string | null) {
  return ORDER_NUMBER_PATTERN.test(orderNumber) && verifyOrderAccessToken(orderNumber, token)
}

export function readCheckoutInput(body: Record<string, unknown>): CheckoutSuccess | CheckoutFailure {
  if (clampText(body.website, 80) || clampText(body.company, 80)) {
    return { ok: false, message: 'Could not place order. Please try again.', status: 400 }
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
  const items = Array.isArray(body.items) ? (body.items as CheckoutItemInput[]) : []

  if (customerName.length < 3) {
    return { ok: false, message: 'Please enter your full name.', status: 400 }
  }
  if (!isValidPkPhone(phone)) {
    return { ok: false, message: 'Enter a valid Pakistani mobile number (03XXXXXXXXX).', status: 400 }
  }
  if (email && !isValidEmail(email)) {
    return { ok: false, message: 'Enter a valid email, or leave it blank.', status: 400 }
  }
  if (!isPakistanCity(city)) {
    return { ok: false, message: 'Please select your city.', status: 400 }
  }
  if (area.length < 2) {
    return { ok: false, message: 'Please enter your area or colony.', status: 400 }
  }
  if (address.length < 8) {
    return { ok: false, message: 'Please enter a complete delivery address.', status: 400 }
  }
  if (items.length === 0 || items.length > 20) {
    return { ok: false, message: 'Your cart is empty.', status: 400 }
  }
  if (items.some((item) => !SKU_PATTERN.test(String(item.sku || '')))) {
    return { ok: false, message: 'Your cart has an invalid item. Please refresh and try again.', status: 400 }
  }

  return {
    ok: true,
    input: {
      customerName,
      phone,
      email,
      city,
      area,
      address,
      landmark,
      customerNotes,
      items,
    },
  }
}

export function readTrackQuery(
  orderNumberRaw: string,
  phoneRaw: string,
): { ok: true; orderNumber: string; phone: string } | CheckoutFailure {
  const orderNumber = clampText(orderNumberRaw, 24).toUpperCase()
  const phone = normalizePkPhone(clampText(phoneRaw, 20))
  if (!ORDER_NUMBER_PATTERN.test(orderNumber) || !isValidPkPhone(phone)) {
    return { ok: false, message: 'Enter your order number and the phone used at checkout.', status: 400 }
  }
  return { ok: true, orderNumber, phone }
}

export async function placeCodOrder(store: CheckoutStore, input: CheckoutCustomerInput): Promise<PlacedOrder> {
  const lines = normalizeCheckoutLines(input.items)
  const settings = await store.getSettings()
  const orderItems: PlacedOrderItem[] = []
  let subtotal = 0

  for (const line of lines) {
    const product = await store.getProduct(line.productId)
    if (!product || product._status !== 'published') {
      throw new CheckoutError('A product in your cart is no longer available.')
    }

    const variant = product.variants.find((item) => item.sku === line.sku)
    if (!variant) {
      throw new CheckoutError('A product in your cart is no longer available.')
    }

    const reserved = await store.reserveStock(line)
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
      product: product.id,
      title: product.title,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      qty: line.qty,
      price: variant.price,
    })
    subtotal += variant.price * line.qty
  }

  const quote = quoteCodTotals({
    subtotal,
    city: input.city,
    defaultShippingFee: settings.defaultShippingFee,
    freeShippingThreshold: settings.freeShippingThreshold,
    cityShipping: settings.cityShipping,
    codFee: settings.codFee,
  })

  return store.createOrder({
    orderNumber: generateOrderNumber(),
    status: 'pending',
    paymentMethod: 'cod',
    paymentStatus: 'unpaid',
    customerName: input.customerName,
    phone: input.phone,
    email: input.email,
    city: input.city,
    area: input.area,
    address: input.address,
    landmark: input.landmark,
    customerNotes: input.customerNotes,
    items: orderItems,
    subtotal: quote.subtotal,
    shipping: quote.shipping,
    codFee: quote.codFee,
    total: quote.total,
    shipment: {
      provider: 'manual',
      shippingStatus: 'not_booked',
      codAmount: quote.total,
    },
  })
}

export function checkoutAccessToken(orderNumber: string) {
  return createOrderAccessToken(orderNumber)
}

export function ordersMatchForTracking(
  order: { orderNumber: string; phone: string },
  orderNumber: string,
  phone: string,
) {
  return order.orderNumber === orderNumber && order.phone === phone
}

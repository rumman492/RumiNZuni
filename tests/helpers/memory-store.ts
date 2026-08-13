import {
  evaluateStockReservation,
  type CheckoutLine,
} from '@/lib/inventory'
import type {
  CheckoutProduct,
  CheckoutSettings,
  CheckoutStore,
  PlacedOrder,
} from '@/lib/checkout'

export type MemoryProduct = CheckoutProduct

export function createMemoryStore(options?: {
  settings?: CheckoutSettings
  products?: MemoryProduct[]
}): CheckoutStore & {
  products: Map<number, MemoryProduct>
  orders: PlacedOrder[]
  settings: CheckoutSettings
} {
  const products = new Map<number, MemoryProduct>((options?.products || []).map((product) => [product.id, structuredClone(product)]))
  const orders: PlacedOrder[] = []
  const settings: CheckoutSettings = {
    defaultShippingFee: 250,
    freeShippingThreshold: 3000,
    cityShipping: [{ city: 'Karachi', fee: 150 }],
    codFee: 50,
    ...options?.settings,
  }
  let nextOrderId = 1

  const store: CheckoutStore & {
    products: Map<number, MemoryProduct>
    orders: PlacedOrder[]
    settings: CheckoutSettings
  } = {
    products,
    orders,
    settings,
    async getSettings() {
      return settings
    },
    async getProduct(id) {
      const product = products.get(id)
      return product ? structuredClone(product) : null
    },
    async reserveStock(line: CheckoutLine) {
      const product = products.get(line.productId)
      const variant = product?.variants.find((item) => item.sku === line.sku)
      const result = evaluateStockReservation(variant?.stock, line.qty)
      if (result.ok && variant) {
        variant.stock = result.remaining
      }
      return result
    },
    async createOrder(order) {
      const created: PlacedOrder = { ...order, id: nextOrderId }
      nextOrderId += 1
      orders.push(created)
      return created
    },
  }

  return store
}

export function samplePolo(overrides?: Partial<MemoryProduct>): MemoryProduct {
  return {
    id: 11,
    title: 'Everyday polo',
    _status: 'published',
    variants: [
      { sku: 'RNZ-POLO-2Y-NAVY', size: '2y', color: 'Navy', price: 1800, stock: 4 },
      { sku: 'RNZ-POLO-3Y-NAVY', size: '3y', color: 'Navy', price: 1900, stock: 2 },
    ],
    ...overrides,
  }
}

export function sampleCheckoutBody(overrides?: Record<string, unknown>) {
  return {
    customerName: 'Ayesha Khan',
    phone: '03001234567',
    email: 'ayesha@example.com',
    city: 'Karachi',
    area: 'DHA Phase 6',
    address: 'House 12, Street 4, DHA Phase 6',
    items: [{ productId: 11, sku: 'RNZ-POLO-2Y-NAVY', qty: 2 }],
    ...overrides,
  }
}

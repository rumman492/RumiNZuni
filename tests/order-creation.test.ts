import { describe, expect, it } from 'vitest'
import { CheckoutError } from '@/lib/inventory'
import { generateOrderNumber, placeCodOrder, readCheckoutInput } from '@/lib/checkout'
import { ORDER_NUMBER_PATTERN } from '@/lib/security'
import { createMemoryStore, sampleCheckoutBody, samplePolo } from './helpers/memory-store'

describe('order creation', () => {
  it('creates a pending unpaid COD order using server prices, not the client cart', async () => {
    const store = createMemoryStore({ products: [samplePolo()] })
    const parsed = readCheckoutInput(
      sampleCheckoutBody({
        items: [{ productId: 11, sku: 'RNZ-POLO-2Y-NAVY', qty: 2, price: 1 }],
      }),
    )
    if (!parsed.ok) throw new Error(parsed.message)

    const order = await placeCodOrder(store, parsed.input)
    expect(order.paymentMethod).toBe('cod')
    expect(order.status).toBe('pending')
    expect(order.paymentStatus).toBe('unpaid')
    expect(order.items[0]?.price).toBe(1800)
    expect(order.subtotal).toBe(3600)
    expect(order.shipping).toBe(0)
    expect(order.codFee).toBe(50)
    expect(order.total).toBe(3650)
    expect(order.shipment).toMatchObject({ provider: 'manual', shippingStatus: 'not_booked', codAmount: 3650 })
    expect(order.orderNumber).toMatch(ORDER_NUMBER_PATTERN)
  })

  it('charges city shipping when the subtotal is under the free-delivery threshold', async () => {
    const store = createMemoryStore({ products: [samplePolo()] })
    const parsed = readCheckoutInput(
      sampleCheckoutBody({ items: [{ productId: 11, sku: 'RNZ-POLO-2Y-NAVY', qty: 1 }] }),
    )
    if (!parsed.ok) throw new Error(parsed.message)
    const order = await placeCodOrder(store, parsed.input)
    expect(order.subtotal).toBe(1800)
    expect(order.shipping).toBe(150)
    expect(order.total).toBe(2000)
  })

  it('rejects a SKU that is no longer on the product', async () => {
    const store = createMemoryStore({ products: [samplePolo()] })
    const parsed = readCheckoutInput(
      sampleCheckoutBody({ items: [{ productId: 11, sku: 'RNZ-GONE', qty: 1 }] }),
    )
    if (!parsed.ok) throw new Error(parsed.message)
    await expect(placeCodOrder(store, parsed.input)).rejects.toBeInstanceOf(CheckoutError)
    expect(store.orders).toHaveLength(0)
  })

  it('mints RNZ order numbers with a date stamp', () => {
    expect(generateOrderNumber(new Date('2026-08-13T10:00:00.000Z'), () => 42)).toBe('RNZ-20260813-100042')
  })
})

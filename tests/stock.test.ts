import { describe, expect, it } from 'vitest'
import { CheckoutError, evaluateStockReservation, normalizeCheckoutLines, StockReservationError } from '@/lib/inventory'
import { placeCodOrder, readCheckoutInput } from '@/lib/checkout'
import { createMemoryStore, sampleCheckoutBody, samplePolo } from './helpers/memory-store'

describe('stock handling', () => {
  it('reserves remaining units and reports missing or insufficient stock', () => {
    expect(evaluateStockReservation(4, 2)).toEqual({ ok: true, remaining: 2 })
    expect(evaluateStockReservation(1, 2)).toEqual({ ok: false, reason: 'insufficient', available: 1 })
    expect(evaluateStockReservation(0, 1)).toEqual({ ok: false, reason: 'insufficient', available: 0 })
    expect(evaluateStockReservation(null, 1)).toEqual({ ok: false, reason: 'missing', available: 0 })
  })

  it('decrements catalog stock when a COD order is placed', async () => {
    const store = createMemoryStore({ products: [samplePolo()] })
    const parsed = readCheckoutInput(sampleCheckoutBody({ items: [{ productId: 11, sku: 'RNZ-POLO-2Y-NAVY', qty: 3 }] }))
    if (!parsed.ok) throw new Error(parsed.message)
    await placeCodOrder(store, parsed.input)
    expect(store.products.get(11)?.variants[0]?.stock).toBe(1)
  })

  it('does not create an order when stock is insufficient', async () => {
    const store = createMemoryStore({ products: [samplePolo({ variants: [{ sku: 'RNZ-POLO-2Y-NAVY', size: '2y', color: 'Navy', price: 1800, stock: 1 }] })] })
    const parsed = readCheckoutInput(sampleCheckoutBody({ items: [{ productId: 11, sku: 'RNZ-POLO-2Y-NAVY', qty: 2 }] }))
    if (!parsed.ok) throw new Error(parsed.message)
    await expect(placeCodOrder(store, parsed.input)).rejects.toBeInstanceOf(StockReservationError)
    expect(store.orders).toHaveLength(0)
    expect(store.products.get(11)?.variants[0]?.stock).toBe(1)
  })

  it('rejects unpublished products before reserving stock', async () => {
    const store = createMemoryStore({ products: [samplePolo({ _status: 'draft' })] })
    const parsed = readCheckoutInput(sampleCheckoutBody())
    if (!parsed.ok) throw new Error(parsed.message)
    await expect(placeCodOrder(store, parsed.input)).rejects.toBeInstanceOf(CheckoutError)
    expect(store.products.get(11)?.variants[0]?.stock).toBe(4)
  })

  it('locks lines in a stable product/SKU order to avoid deadlocks', () => {
    const lines = normalizeCheckoutLines([
      { productId: 20, sku: 'B', qty: 1 },
      { productId: 11, sku: 'Z', qty: 1 },
      { productId: 11, sku: 'A', qty: 1 },
    ])
    expect(lines.map((line) => `${line.productId}:${line.sku}`)).toEqual(['11:A', '11:Z', '20:B'])
  })
})

import { describe, expect, it } from 'vitest'
import { placeCodOrder, readCheckoutInput, readTrackQuery, ordersMatchForTracking } from '@/lib/checkout'
import { formatOrderStatus, formatPaymentStatus, orderStatusMessage } from '@/lib/orders'
import { formatShippingStatus } from '@/lib/shipping'
import { createMemoryStore, sampleCheckoutBody, samplePolo } from './helpers/memory-store'

describe('order tracking', () => {
  it('requires a valid RNZ order number and checkout phone', () => {
    expect(readTrackQuery('RNZ-20260813-123456', '03001234567')).toEqual({
      ok: true,
      orderNumber: 'RNZ-20260813-123456',
      phone: '03001234567',
    })
    expect(readTrackQuery('rnz-20260813-123456', '+923001234567').ok).toBe(true)
    expect(readTrackQuery('12345', '03001234567').ok).toBe(false)
    expect(readTrackQuery('RNZ-20260813-123456', '02134567890').ok).toBe(false)
  })

  it('matches a placed order only with the same phone used at checkout', async () => {
    const store = createMemoryStore({ products: [samplePolo()] })
    const parsed = readCheckoutInput(sampleCheckoutBody({ phone: '03219876543' }))
    if (!parsed.ok) throw new Error(parsed.message)
    const order = await placeCodOrder(store, parsed.input)

    const query = readTrackQuery(order.orderNumber, '03219876543')
    expect(query.ok).toBe(true)
    if (!query.ok) return
    expect(ordersMatchForTracking(order, query.orderNumber, query.phone)).toBe(true)
    expect(ordersMatchForTracking(order, query.orderNumber, '03001234567')).toBe(false)
  })

  it('exposes customer-facing COD status copy without leaking admin notes', () => {
    expect(formatOrderStatus('pending')).toBe('Pending')
    expect(orderStatusMessage('pending')).toContain('cash-on-delivery')
    expect(formatPaymentStatus('unpaid')).toBe('Pay cash on delivery')
    expect(formatPaymentStatus('collected')).toBe('Payment collected')
    expect(formatShippingStatus('not_booked')).toBe('Not booked')
    expect(formatShippingStatus('out_for_delivery')).toBe('Out for delivery')
  })
})

import { describe, expect, it } from 'vitest'
import { CheckoutError, normalizeCheckoutLines } from '@/lib/inventory'
import { readCheckoutInput } from '@/lib/checkout'
import { sampleCheckoutBody } from './helpers/memory-store'

describe('checkout validation', () => {
  it('accepts a complete Pakistani COD checkout payload', () => {
    const parsed = readCheckoutInput(sampleCheckoutBody())
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(parsed.input.phone).toBe('03001234567')
      expect(parsed.input.city).toBe('Karachi')
    }
  })

  it('normalizes +92 phones before validating', () => {
    const parsed = readCheckoutInput(sampleCheckoutBody({ phone: '+92 300 1234567' }))
    expect(parsed.ok).toBe(true)
    if (parsed.ok) expect(parsed.input.phone).toBe('03001234567')
  })

  it('rejects missing name, city, area, address, and empty carts', () => {
    expect(readCheckoutInput(sampleCheckoutBody({ customerName: 'Al' })).ok).toBe(false)
    expect(readCheckoutInput(sampleCheckoutBody({ city: 'Dubai' })).ok).toBe(false)
    expect(readCheckoutInput(sampleCheckoutBody({ area: 'A' })).ok).toBe(false)
    expect(readCheckoutInput(sampleCheckoutBody({ address: 'Street' })).ok).toBe(false)
    expect(readCheckoutInput(sampleCheckoutBody({ items: [] })).ok).toBe(false)
  })

  it('rejects invalid phones and optional emails', () => {
    expect(readCheckoutInput(sampleCheckoutBody({ phone: '02134567890' })).ok).toBe(false)
    expect(readCheckoutInput(sampleCheckoutBody({ email: 'not-an-email' })).ok).toBe(false)
    expect(readCheckoutInput(sampleCheckoutBody({ email: '' })).ok).toBe(true)
  })

  it('silently rejects honeypot spam the same way as a failed order', () => {
    const parsed = readCheckoutInput(sampleCheckoutBody({ website: 'http://spam.test' }))
    expect(parsed).toMatchObject({ ok: false, message: 'Could not place order. Please try again.' })
  })

  it('rejects unsafe SKUs before stock is touched', () => {
    const parsed = readCheckoutInput(
      sampleCheckoutBody({ items: [{ productId: 11, sku: 'RNZ POLO;DROP', qty: 1 }] }),
    )
    expect(parsed.ok).toBe(false)
  })

  it('merges duplicate product+SKU lines and rejects invalid quantities', () => {
    const lines = normalizeCheckoutLines([
      { productId: '11', sku: 'RNZ-POLO-2Y-NAVY', qty: 2 },
      { productId: 11, sku: 'RNZ-POLO-2Y-NAVY', qty: 1 },
    ])
    expect(lines).toEqual([{ productId: 11, sku: 'RNZ-POLO-2Y-NAVY', qty: 3 }])
    expect(() => normalizeCheckoutLines([{ productId: 11, sku: 'RNZ-POLO-2Y-NAVY', qty: 0 }])).toThrow(CheckoutError)
    expect(() => normalizeCheckoutLines([{ productId: 11, sku: 'RNZ-POLO-2Y-NAVY', qty: 21 }])).toThrow(CheckoutError)
  })
})

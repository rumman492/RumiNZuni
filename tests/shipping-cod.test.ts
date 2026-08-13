import { describe, expect, it } from 'vitest'
import { quoteCodTotals } from '@/lib/shipping'

const settings = {
  defaultShippingFee: 250,
  freeShippingThreshold: 3000,
  cityShipping: [
    { city: 'Karachi', fee: 150 },
    { city: 'Lahore', fee: 200 },
  ],
  codFee: 50,
}

describe('shipping and COD calculations', () => {
  it('uses the city rate plus COD fee under the free-shipping threshold', () => {
    expect(quoteCodTotals({ subtotal: 1800, city: 'Karachi', ...settings })).toEqual({
      subtotal: 1800,
      shipping: 150,
      codFee: 50,
      total: 2000,
    })
  })

  it('waives shipping when the cart reaches the free-delivery threshold', () => {
    expect(quoteCodTotals({ subtotal: 3000, city: 'Lahore', ...settings })).toEqual({
      subtotal: 3000,
      shipping: 0,
      codFee: 50,
      total: 3050,
    })
  })

  it('falls back to the default shipping fee for cities without a custom rate', () => {
    expect(quoteCodTotals({ subtotal: 1000, city: 'Multan', ...settings }).shipping).toBe(250)
  })

  it('keeps a zero COD fee when the store has not configured one', () => {
    const quote = quoteCodTotals({
      subtotal: 1000,
      city: 'Karachi',
      defaultShippingFee: 250,
      freeShippingThreshold: 0,
      cityShipping: [{ city: 'Karachi', fee: 150 }],
      codFee: 0,
    })
    expect(quote.codFee).toBe(0)
    expect(quote.shipping).toBe(150)
    expect(quote.total).toBe(1150)
  })

  it('does not treat a zero threshold as free shipping', () => {
    expect(
      quoteCodTotals({
        subtotal: 9000,
        city: 'Karachi',
        defaultShippingFee: 250,
        freeShippingThreshold: 0,
        cityShipping: [{ city: 'Karachi', fee: 150 }],
        codFee: 0,
      }).shipping,
    ).toBe(150)
  })
})

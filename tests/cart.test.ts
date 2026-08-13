import { describe, expect, it } from 'vitest'
import { addCartItem, cartCount, cartTotal, removeCartItem, updateCartQty, type CartItem } from '@/lib/cart'
import { formatPkr } from '@/lib/pakistan'

function item(overrides: Partial<CartItem> & Pick<CartItem, 'sku' | 'price'>): CartItem {
  return {
    productId: 11,
    slug: 'everyday-polo',
    title: 'Everyday polo',
    size: '2y',
    sizeLabel: '2 years',
    color: 'Navy',
    qty: 1,
    ...overrides,
  }
}

describe('cart calculations', () => {
  it('sums line totals in PKR and ignores a second item price on the same SKU merge', () => {
    const first = addCartItem([], item({ sku: 'RNZ-POLO-2Y-NAVY', price: 1800, qty: 2 }))
    const merged = addCartItem(first, item({ sku: 'RNZ-POLO-2Y-NAVY', price: 1, qty: 1 }))
    expect(cartCount(merged)).toBe(3)
    expect(cartTotal(merged)).toBe(1800 * 3)
    expect(formatPkr(cartTotal(merged))).toBe('Rs 5,400')
  })

  it('adds a distinct SKU as a separate line', () => {
    const cart = addCartItem(
      addCartItem([], item({ sku: 'RNZ-POLO-2Y-NAVY', price: 1800 })),
      item({ sku: 'RNZ-POLO-3Y-NAVY', price: 1900, qty: 2 }),
    )
    expect(cart).toHaveLength(2)
    expect(cartTotal(cart)).toBe(1800 + 3800)
  })

  it('removes a line when quantity drops below 1', () => {
    const cart = addCartItem([], item({ sku: 'RNZ-POLO-2Y-NAVY', price: 1800, qty: 2 }))
    expect(updateCartQty(cart, 'RNZ-POLO-2Y-NAVY', 0)).toEqual([])
  })

  it('updates quantity and removes by SKU', () => {
    const cart = addCartItem(
      addCartItem([], item({ sku: 'A', price: 100, qty: 1 })),
      item({ sku: 'B', price: 250, qty: 2 }),
    )
    const updated = updateCartQty(cart, 'B', 4)
    expect(cartTotal(updated)).toBe(100 + 1000)
    expect(cartTotal(removeCartItem(updated, 'A'))).toBe(1000)
  })

  it('defaults invalid add quantities to 1', () => {
    const cart = addCartItem([], item({ sku: 'RNZ-POLO-2Y-NAVY', price: 1800, qty: 0 }))
    expect(cart[0]?.qty).toBe(1)
    expect(cartTotal(cart)).toBe(1800)
  })
})

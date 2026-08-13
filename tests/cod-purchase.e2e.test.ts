import { describe, expect, it } from 'vitest'
import { addCartItem, cartTotal, type CartItem } from '@/lib/cart'
import {
  canViewOrderConfirmation,
  checkoutAccessToken,
  ordersMatchForTracking,
  placeCodOrder,
  readCheckoutInput,
  readTrackQuery,
} from '@/lib/checkout'
import { StockReservationError } from '@/lib/inventory'
import { recordOrderStatusHistory } from '@/collections/hooks/recordOrderStatusHistory'
import { createMemoryStore, sampleCheckoutBody, samplePolo } from './helpers/memory-store'

function asCart(items: Array<Pick<CartItem, 'sku' | 'price' | 'qty'>>): CartItem[] {
  return items.reduce<CartItem[]>(
    (cart, item) =>
      addCartItem(cart, {
        productId: 11,
        slug: 'everyday-polo',
        title: 'Everyday polo',
        size: '2y',
        sizeLabel: '2 years',
        color: 'Navy',
        sku: item.sku,
        price: item.price,
        qty: item.qty,
      }),
    [],
  )
}

describe('end-to-end customer COD purchase', () => {
  it('walks a guest from cart to paid-on-delivery confirmation and tracking', async () => {
    process.env.PAYLOAD_SECRET = 'test-order-secret'
    const store = createMemoryStore({
      products: [samplePolo()],
      settings: {
        defaultShippingFee: 250,
        freeShippingThreshold: 3000,
        cityShipping: [{ city: 'Karachi', fee: 150 }],
        codFee: 50,
      },
    })

    const cart = asCart([
      { sku: 'RNZ-POLO-2Y-NAVY', price: 1800, qty: 1 },
      { sku: 'RNZ-POLO-2Y-NAVY', price: 1800, qty: 1 },
    ])
    expect(cart).toHaveLength(1)
    expect(cart[0]?.qty).toBe(2)
    expect(cartTotal(cart)).toBe(3600)

    const parsed = readCheckoutInput(
      sampleCheckoutBody({
        items: cart.map((item) => ({ productId: item.productId, sku: item.sku, qty: item.qty, price: 1 })),
      }),
    )
    expect(parsed.ok).toBe(true)
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
    expect(store.products.get(11)?.variants[0]?.stock).toBe(2)

    const token = checkoutAccessToken(order.orderNumber)
    expect(canViewOrderConfirmation(order.orderNumber, token)).toBe(true)
    expect(canViewOrderConfirmation(order.orderNumber, 'forged')).toBe(false)

    const track = readTrackQuery(order.orderNumber, '03001234567')
    expect(track.ok).toBe(true)
    if (!track.ok) throw new Error(track.message)
    expect(ordersMatchForTracking(order, track.orderNumber, track.phone)).toBe(true)
    expect(store.orders).toHaveLength(1)

    const delivered = recordOrderStatusHistory({
      collection: 'orders',
      context: {},
      operation: 'update',
      req: { user: { email: 'admin@ruminzuni.com' } } as never,
      originalDoc: { ...order, status: 'out_for_delivery', paymentStatus: 'unpaid', statusHistory: [] },
      data: { status: 'delivered', paymentStatus: 'unpaid' },
    })
    expect(delivered?.paymentStatus).toBe('collected')
    expect(delivered?.statusHistory?.at(-1)).toMatchObject({
      status: 'delivered',
      paymentStatus: 'collected',
      source: 'admin',
    })

    const leftover = readCheckoutInput(
      sampleCheckoutBody({
        phone: '03331234567',
        items: [{ productId: 11, sku: 'RNZ-POLO-2Y-NAVY', qty: 3 }],
      }),
    )
    if (!leftover.ok) throw new Error(leftover.message)
    await expect(placeCodOrder(store, leftover.input)).rejects.toBeInstanceOf(StockReservationError)
    expect(store.orders).toHaveLength(1)
    expect(store.products.get(11)?.variants[0]?.stock).toBe(2)
  })
})

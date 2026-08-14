'use client'

import Link from 'next/link'
import { useCart } from '@/components/CartProvider'
import { formatPkr } from '@/lib/pakistan'

export function CartView() {
  const { items, subtotal, updateQty, removeItem } = useCart()

  return (
    <div>
      <h1 className="display text-5xl">Your little shopping bag</h1>
      {items.length === 0 ? (
        <div className="mt-6 max-w-lg">
          <p className="text-ink-soft">Looks like you haven’t found their next favourite yet.</p>
          <Link href="/shop/kids-wear" className="mt-4 inline-flex rounded-full bg-coral px-5 py-2 text-sm font-bold text-white">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.sku} className="flex gap-4 rounded-3xl bg-white p-4 shadow-sm">
                <div className="h-24 w-24 overflow-hidden rounded-2xl bg-sand">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <p className="font-bold">{item.title}</p>
                  <p className="text-sm text-ink-soft">
                    {item.sizeLabel} · {item.color}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{formatPkr(item.price)}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(event) => updateQty(item.sku, Number(event.target.value))}
                      className="w-20 rounded-xl border border-sand px-3 py-2"
                    />
                    <button type="button" onClick={() => removeItem(item.sku)} className="text-sm text-coral">
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="h-fit rounded-3xl bg-ink p-6 text-cream">
            <p className="flex justify-between text-lg font-bold">
              <span>Subtotal</span>
              <span>{formatPkr(subtotal)}</span>
            </p>
            <p className="mt-2 text-sm text-cream/70">Almost ready for their next adventure? Shipping is calculated at checkout. Payment is cash on delivery.</p>
            <Link href="/checkout" className="mt-6 block rounded-full bg-coral py-3 text-center text-sm font-bold">
              Continue to Checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  )
}

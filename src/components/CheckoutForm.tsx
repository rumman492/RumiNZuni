'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/CartProvider'
import { formatPkr, PAKISTAN_CITIES } from '@/lib/pakistan'

export function CheckoutForm({
  defaultShipping,
  freeShippingThreshold,
  codFee,
}: {
  defaultShipping: number
  freeShippingThreshold: number
  codFee: number
}) {
  const router = useRouter()
  const { items, subtotal, clear } = useCart()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const shipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold ? 0 : defaultShipping
  const total = subtotal + shipping + codFee

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }
    setPending(true)
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.get('customerName'),
          phone: form.get('phone'),
          email: form.get('email'),
          city: form.get('city'),
          area: form.get('area'),
          address: form.get('address'),
          landmark: form.get('landmark'),
          customerNotes: form.get('customerNotes'),
          website: form.get('website'),
          items: items.map((item) => ({
            productId: item.productId,
            sku: item.sku,
            qty: item.qty,
          })),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not place order.')
        setPending(false)
        return
      }
      clear()
      const token = typeof data.accessToken === 'string' ? `?t=${encodeURIComponent(data.accessToken)}` : ''
      router.push(`/order/${data.orderNumber}${token}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setPending(false)
    }
  }

  if (items.length === 0) {
    return <p className="text-ink-soft">Your cart is empty. Add a few outfits before checkout.</p>
  }

  return (
    <form onSubmit={onSubmit} className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="display text-2xl">Delivery details</h2>
        <p className="text-sm text-ink-soft">We will call or WhatsApp to confirm before dispatch.</p>
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label>
            Website
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <label className="block text-sm font-semibold">
          Full name
          <input name="customerName" required className="mt-1 w-full rounded-2xl border border-sand px-4 py-3" />
        </label>
        <label className="block text-sm font-semibold">
          Mobile number
          <input
            name="phone"
            required
            placeholder="03XXXXXXXXX"
            className="mt-1 w-full rounded-2xl border border-sand px-4 py-3"
          />
        </label>
        <label className="block text-sm font-semibold">
          Email <span className="font-normal text-ink-soft">(optional)</span>
          <input name="email" type="email" className="mt-1 w-full rounded-2xl border border-sand px-4 py-3" />
        </label>
        <label className="block text-sm font-semibold">
          City
          <select name="city" required defaultValue="Karachi" className="mt-1 w-full rounded-2xl border border-sand px-4 py-3">
            {PAKISTAN_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Area / colony
          <input name="area" required placeholder="e.g. DHA Phase 6" className="mt-1 w-full rounded-2xl border border-sand px-4 py-3" />
        </label>
        <label className="block text-sm font-semibold">
          Full address
          <textarea name="address" required rows={3} className="mt-1 w-full rounded-2xl border border-sand px-4 py-3" />
        </label>
        <label className="block text-sm font-semibold">
          Landmark <span className="font-normal text-ink-soft">(optional)</span>
          <input name="landmark" className="mt-1 w-full rounded-2xl border border-sand px-4 py-3" />
        </label>
        <label className="block text-sm font-semibold">
          Notes for rider
          <textarea name="customerNotes" rows={2} className="mt-1 w-full rounded-2xl border border-sand px-4 py-3" />
        </label>
      </div>

      <aside className="h-fit space-y-4 rounded-3xl bg-ink p-6 text-cream">
        <h2 className="display text-2xl">Order summary</h2>
        <ul className="space-y-3 text-sm">
          {items.map((item) => (
            <li key={item.sku} className="flex justify-between gap-3">
              <span>
                {item.title} · {item.sizeLabel} · {item.color} × {item.qty}
              </span>
              <span>{formatPkr(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-white/10 pt-4 text-sm">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPkr(subtotal)}</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : formatPkr(shipping)}</span>
          </p>
          {codFee > 0 ? (
            <p className="flex justify-between">
              <span>COD fee</span>
              <span>{formatPkr(codFee)}</span>
            </p>
          ) : null}
          <p className="flex justify-between pt-2 text-lg font-bold">
            <span>Total</span>
            <span>{formatPkr(total)}</span>
          </p>
        </div>
        <div className="rounded-2xl bg-white/10 p-4 text-sm">
          <p className="font-bold">Cash on delivery</p>
          <p className="mt-1 text-cream/80">No card needed. Pay the rider when your order arrives.</p>
        </div>
        {error ? <p className="rounded-2xl bg-coral px-4 py-3 text-sm text-white">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-coral py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {pending ? 'Placing order…' : 'Place COD order'}
        </button>
      </aside>
    </form>
  )
}

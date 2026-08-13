'use client'

import { useState } from 'react'
import { formatPkr } from '@/lib/pakistan'

type TrackResult = {
  orderNumber: string
  status: string
  paymentStatus: string
  city: string
  formattedTotal: string
  createdAt: string
  items: Array<{ title: string; size: string; color: string; qty: number; price: number }>
}

export function TrackForm() {
  const [error, setError] = useState('')
  const [order, setOrder] = useState<TrackResult | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setOrder(null)
    const form = new FormData(event.currentTarget)
    const orderNumber = String(form.get('orderNumber') || '').trim()
    const phone = String(form.get('phone') || '').trim()
    setPending(true)
    try {
      const response = await fetch(
        `/api/track-order?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`,
      )
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Could not find that order.')
      } else {
        setOrder(data)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Order number
          <input name="orderNumber" required placeholder="RNZ-20260813-1234" className="mt-1 w-full rounded-2xl border border-sand px-4 py-3" />
        </label>
        <label className="block text-sm font-semibold">
          Phone used at checkout
          <input name="phone" required placeholder="03XXXXXXXXX" className="mt-1 w-full rounded-2xl border border-sand px-4 py-3" />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-cream sm:col-span-2"
        >
          {pending ? 'Searching…' : 'Track order'}
        </button>
      </form>
      {error ? <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral-dark">{error}</p> : null}
      {order ? (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-wide text-ink-soft">{order.orderNumber}</p>
          <h2 className="display mt-1 text-3xl capitalize">{order.status}</h2>
          <p className="mt-2 text-sm text-ink-soft">
            {order.city} · {order.paymentStatus === 'collected' ? 'Payment collected' : 'Pay cash on delivery'} ·{' '}
            {order.formattedTotal}
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={`${item.title}-${item.size}-${item.color}`}>
                {item.title} · {item.size} · {item.color} × {item.qty} — {formatPkr(item.price * item.qty)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

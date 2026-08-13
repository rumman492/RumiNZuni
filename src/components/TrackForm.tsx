'use client'

import { useState } from 'react'
import { formatPkr } from '@/lib/pakistan'

type HistoryEntry = {
  status?: string | null
  label?: string | null
  at?: string | null
  note?: string | null
}

type TrackResult = {
  orderNumber: string
  status: string
  statusLabel: string
  statusMessage: string
  paymentStatus: string
  paymentLabel: string
  city: string
  formattedTotal: string
  createdAt: string
  items: Array<{ title: string; size: string; color: string; qty: number; price: number }>
  statusHistory?: HistoryEntry[]
}

function formatWhen(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })
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
          <h2 className="display mt-1 text-3xl">{order.statusLabel || order.status}</h2>
          <p className="mt-2 text-sm text-ink-soft">{order.statusMessage}</p>
          <p className="mt-2 text-sm text-ink-soft">
            {order.city} · {order.paymentLabel} · {order.formattedTotal}
          </p>
          {order.statusHistory && order.statusHistory.length > 0 ? (
            <ol className="mt-6 space-y-3 border-l border-sand pl-4">
              {order.statusHistory.map((entry, index) => (
                <li key={`${entry.status}-${entry.at}-${index}`}>
                  <p className="text-sm font-bold">{entry.label || entry.status}</p>
                  <p className="text-xs text-ink-soft">{formatWhen(entry.at)}</p>
                  {entry.note ? <p className="text-xs text-ink-soft">{entry.note}</p> : null}
                </li>
              ))}
            </ol>
          ) : null}
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

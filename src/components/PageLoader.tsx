'use client'

import { useEffect, useState } from 'react'
import { BrandMark } from '@/components/BrandMark'

const TIPS = [
  'Picking something cute…',
  'Checking sizes and stock…',
  'Cash on delivery, almost ready…',
  'Opening handbags and beauty…',
  'Packing a smile for Pakistan…',
]

const BAGS = [
  { id: 'coral', className: 'bg-coral', delay: '0ms' },
  { id: 'sage', className: 'bg-sage', delay: '140ms' },
  { id: 'blush', className: 'bg-blush', delay: '280ms' },
  { id: 'lemon', className: 'bg-lemon', delay: '420ms' },
] as const

export function PageLoader({ label = 'Loading the shop' }: { label?: string }) {
  const [tip, setTip] = useState(0)
  const [pops, setPops] = useState<Record<string, number>>({})

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTip((index) => (index + 1) % TIPS.length)
    }, 1800)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div
      className="grid min-h-[52vh] place-items-center px-4 py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <div className="w-full max-w-md text-center">
        <p className="display mb-6 text-3xl tracking-tight">
          <BrandMark />
        </p>
        <div className="mx-auto mb-4 h-1.5 w-48 overflow-hidden rounded-full bg-sand">
          <div className="page-loader-bar h-full w-1/3 rounded-full bg-gradient-to-r from-coral via-blush to-sage" />
        </div>
        <div className="mb-6 flex items-end justify-center gap-3">
          {BAGS.map((bag) => (
            <button
              key={bag.id}
              type="button"
              className={`page-loader-bag h-11 w-9 rounded-t-2xl rounded-b-md shadow-sm ${bag.className} ${pops[bag.id] ? 'page-loader-pop' : ''}`}
              style={{ animationDelay: bag.delay }}
              aria-label="Bounce this bag while the page loads"
              onClick={() => setPops((current) => ({ ...current, [bag.id]: Date.now() }))}
            />
          ))}
        </div>
        <p className="text-sm font-semibold text-ink">{TIPS[tip]}</p>
        <p className="mt-2 text-xs text-ink-soft">Tap a bag to play while we load.</p>
        <span className="sr-only">{label}</span>
      </div>
    </div>
  )
}

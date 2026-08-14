'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { recommendSize, type SizeRecord } from '@/lib/sizing'

export function SizeFinderForm({ sizes }: { sizes: SizeRecord[] }) {
  const [ageYears, setAgeYears] = useState('6')
  const [heightCm, setHeightCm] = useState('119')
  const [submitted, setSubmitted] = useState(false)

  const result = useMemo(() => {
    if (!submitted) return null
    const height = Number(heightCm)
    const age = Number(ageYears)
    return recommendSize({
      heightCm: height,
      ageYears: Number.isFinite(age) ? age : undefined,
      sizes,
    })
  }, [ageYears, heightCm, sizes, submitted])

  return (
    <form
      className="mt-8 grid gap-4 rounded-[2rem] bg-white p-6 shadow-sm md:p-8"
      onSubmit={(event) => {
        event.preventDefault()
        setSubmitted(true)
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Age (years)
          <input
            className="mt-1 w-full rounded-2xl border border-ink/10 bg-cream px-3 py-2 text-sm outline-none focus:border-coral"
            type="number"
            min={0}
            max={16}
            step={0.5}
            inputMode="decimal"
            value={ageYears}
            onChange={(event) => {
              setAgeYears(event.target.value)
              setSubmitted(false)
            }}
          />
        </label>
        <label className="text-sm font-semibold">
          Height (cm)
          <input
            className="mt-1 w-full rounded-2xl border border-ink/10 bg-cream px-3 py-2 text-sm outline-none focus:border-coral"
            type="number"
            min={40}
            max={190}
            inputMode="numeric"
            required
            value={heightCm}
            onChange={(event) => {
              setHeightCm(event.target.value)
              setSubmitted(false)
            }}
          />
        </label>
      </div>
      <button type="submit" className="play-pop rounded-full bg-coral px-6 py-3 text-sm font-bold text-white">
        Find my child&apos;s size
      </button>

      {submitted && result ? (
        <div className="rounded-[1.5rem] bg-lemon/70 p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-ink-soft">Recommended size</p>
          <p className="display mt-2 text-4xl">{result.size.label}</p>
          <p className="mt-2 text-sm text-ink-soft">
            Height {result.size.heightMinCm}–{result.size.heightMaxCm} cm
            {result.size.ageLabel ? ` · ${result.size.ageLabel}` : ''}
          </p>
          <p className="mt-2 text-sm text-ink-soft">{result.reason} Between sizes? Choose the larger one.</p>
          <Link
            href={`/shop?size=${encodeURIComponent(result.size.code)}`}
            className="mt-4 inline-flex rounded-full bg-ink px-5 py-2 text-sm font-bold text-cream"
          >
            Shop {result.size.label}
          </Link>
        </div>
      ) : null}

      {submitted && !result ? (
        <p className="rounded-2xl bg-coral/10 px-4 py-3 text-sm text-coral-dark">
          Enter a height between 40 and 190 cm to get a recommendation.
        </p>
      ) : null}
    </form>
  )
}

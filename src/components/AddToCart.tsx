'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/CartProvider'
import { formatPkr, PRODUCT_SIZES } from '@/lib/pakistan'

type Variant = {
  sku: string
  size: string
  color: string
  price: number
  compareAtPrice?: number | null
  stock: number
}

export function AddToCart({
  productId,
  slug,
  title,
  image,
  variants,
}: {
  productId: string | number
  slug: string
  title: string
  image?: string | null
  variants: Variant[]
}) {
  const router = useRouter()
  const { addItem } = useCart()
  const colors = useMemo(() => [...new Set(variants.map((item) => item.color))], [variants])
  const [color, setColor] = useState(colors[0] || '')
  const sizesForColor = variants.filter((item) => item.color === color)
  const [sku, setSku] = useState(sizesForColor[0]?.sku || variants[0]?.sku)
  const selected = variants.find((item) => item.sku === sku) || variants[0]

  if (!selected) return null

  const sizeLabel = PRODUCT_SIZES.find((item) => item.value === selected.size)?.label || selected.size

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-bold">Color</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {colors.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setColor(value)
                const next = variants.find((item) => item.color === value)
                if (next) setSku(next.sku)
              }}
              className={`rounded-full border px-4 py-2 text-sm ${color === value ? 'border-ink bg-ink text-cream' : 'border-sand bg-white'}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-bold">Size</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {sizesForColor.map((item) => {
            const label = PRODUCT_SIZES.find((size) => size.value === item.size)?.label || item.size
            const disabled = item.stock < 1
            return (
              <button
                key={item.sku}
                type="button"
                disabled={disabled}
                onClick={() => setSku(item.sku)}
                className={`rounded-full border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
                  sku === item.sku ? 'border-ink bg-ink text-cream' : 'border-sand bg-white'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
      <p className="display text-3xl">{formatPkr(selected.price)}</p>
      <p className="text-sm text-ink-soft">
        {selected.stock < 1 ? 'Out of stock' : `${selected.stock} in stock · Cash on delivery`}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={selected.stock < 1}
          onClick={() =>
            addItem({
              productId,
              slug,
              title,
              sku: selected.sku,
              size: selected.size,
              sizeLabel,
              color: selected.color,
              price: selected.price,
              image,
              qty: 1,
            })
          }
          className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-cream disabled:opacity-40"
        >
          Add to cart
        </button>
        <button
          type="button"
          disabled={selected.stock < 1}
          onClick={() => {
            addItem({
              productId,
              slug,
              title,
              sku: selected.sku,
              size: selected.size,
              sizeLabel,
              color: selected.color,
              price: selected.price,
              image,
              qty: 1,
            })
            router.push('/checkout')
          }}
          className="rounded-full bg-coral px-6 py-3 text-sm font-bold text-white disabled:opacity-40"
        >
          Buy with COD
        </button>
      </div>
    </div>
  )
}

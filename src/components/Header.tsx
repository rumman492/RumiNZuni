'use client'

import Link from 'next/link'
import { Search, ShoppingBag } from 'lucide-react'
import { useCart } from '@/components/CartProvider'

const nav = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop/boys', label: 'Boys' },
  { href: '/shop/girls', label: 'Girls' },
  { href: '/shop/newborn', label: 'Newborn' },
  { href: '/track', label: 'Track order' },
]

export function Header({ announcement }: { announcement?: string | null }) {
  const { count } = useCart()

  return (
    <header className="sticky top-0 z-40">
      {announcement ? (
        <p className="bg-ink px-4 py-2 text-center text-xs font-medium tracking-wide text-cream sm:text-sm">
          {announcement}
        </p>
      ) : null}
      <div className="border-b border-sand bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="display text-2xl tracking-tight text-ink">
            Rumi<span className="text-coral">NZ</span>uni
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-ink-soft md:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-coral">
                {item.label}
              </Link>
            ))}
          </nav>
          <form action="/shop" method="get" className="relative hidden min-w-0 flex-1 max-w-xs lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              name="q"
              placeholder="Search kids wear"
              className="w-full rounded-full border border-ink/10 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-coral"
              autoComplete="off"
            />
          </form>
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-2 text-sm font-semibold"
          >
            <ShoppingBag className="h-4 w-4" />
            Cart
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1 text-[11px] text-white">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
        <nav className="flex gap-4 overflow-x-auto px-4 pb-3 text-sm font-semibold text-ink-soft md:hidden">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap">
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/shop" method="get" className="px-4 pb-3 lg:hidden">
          <label className="sr-only" htmlFor="header-search">
            Search kids wear
          </label>
          <input
            id="header-search"
            type="search"
            name="q"
            placeholder="Search kids wear"
            className="w-full rounded-full border border-ink/10 bg-white px-4 py-2 text-sm outline-none focus:border-coral"
            autoComplete="off"
          />
        </form>
      </div>
    </header>
  )
}

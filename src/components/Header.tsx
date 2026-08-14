'use client'

import Link from 'next/link'
import { useEffect, useId, useState } from 'react'
import { ChevronDown, Search, ShoppingBag } from 'lucide-react'
import { BrandMark } from '@/components/BrandMark'
import { useCart } from '@/components/CartProvider'
import { buildStorefrontNav, type StorefrontNavItem } from '@/lib/taxonomy'

const navFallback = buildStorefrontNav()

function NavLinks({
  items,
  nested,
  onNavigate,
}: {
  items: StorefrontNavItem[]
  nested?: boolean
  onNavigate?: () => void
}) {
  return (
    <ul className={nested ? 'mt-1 space-y-0.5 border-l border-sand pl-2' : 'space-y-0.5'}>
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            onClick={onNavigate}
            className={`block rounded-xl px-3 py-2 hover:bg-lemon hover:text-ink ${nested ? 'text-sm font-medium' : 'text-sm font-semibold'}`}
          >
            {item.label}
          </Link>
          {item.children?.length ? (
            <NavLinks items={item.children} nested onNavigate={onNavigate} />
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function NavBranch({ item }: { item: StorefrontNavItem }) {
  const [open, setOpen] = useState(false)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!item.children?.length) {
    return (
      <Link href={item.href} className="rounded-full px-2 py-1 hover:bg-lemon hover:text-ink">
        {item.label}
      </Link>
    )
  }

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div className="flex items-center">
        <Link href={item.href} className="rounded-full px-2 py-1 hover:bg-lemon hover:text-ink">
          {item.label}
        </Link>
        <button
          type="button"
          className="rounded-full p-1 hover:bg-lemon hover:text-ink"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={`${item.label} menu`}
          onClick={() => setOpen((value) => !value)}
        >
          <ChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open ? (
        <div
          id={menuId}
          className="absolute left-0 top-full z-50 min-w-60 pt-2"
          onMouseEnter={() => setOpen(true)}
        >
          <div className="rounded-2xl border border-sand bg-white p-2 shadow-lg">
            <Link
              href={item.href}
              className="mb-1 block rounded-xl px-3 py-2 text-sm font-semibold text-coral hover:bg-lemon hover:text-ink"
              onClick={() => setOpen(false)}
            >
              Shop all {item.label}
            </Link>
            <NavLinks items={item.children} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function MobileNav({ nav }: { nav: StorefrontNavItem[] }) {
  const [openHref, setOpenHref] = useState<string | null>(null)

  return (
    <div className="md:hidden">
      <nav className="flex gap-3 overflow-x-auto px-4 pb-2 text-sm font-semibold text-ink-soft">
        {nav.map((item) =>
          item.children?.length ? (
            <button
              key={item.href}
              type="button"
              className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 ${openHref === item.href ? 'bg-lemon text-ink' : ''}`}
              aria-expanded={openHref === item.href}
              onClick={() => setOpenHref((value) => (value === item.href ? null : item.href))}
            >
              {item.label}
              <ChevronDown className={`h-3.5 w-3.5 transition ${openHref === item.href ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <Link key={item.href} href={item.href} className="shrink-0 whitespace-nowrap px-1 py-1">
              {item.label}
            </Link>
          ),
        )}
      </nav>
      {nav.map((item) =>
        item.children?.length && openHref === item.href ? (
          <div key={item.href} className="border-t border-sand/80 bg-white px-3 py-2">
            <Link href={item.href} className="mb-1 block rounded-xl px-3 py-2 text-sm font-semibold text-coral" onClick={() => setOpenHref(null)}>
              Shop all {item.label}
            </Link>
            <NavLinks items={item.children} onNavigate={() => setOpenHref(null)} />
          </div>
        ) : null,
      )}
    </div>
  )
}

export function Header({
  announcement,
  nav = navFallback,
}: {
  announcement?: string | null
  nav?: StorefrontNavItem[]
}) {
  const { count } = useCart()

  return (
    <header className="sticky top-0 z-40">
      {announcement ? (
        <p className="bg-gradient-to-r from-coral via-blush to-sage px-4 py-2 text-center text-xs font-bold tracking-wide text-white sm:text-sm">
          {announcement}
        </p>
      ) : null}
      <div className="border-b border-sand/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="display text-2xl tracking-tight">
            <BrandMark />
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-semibold text-ink-soft md:flex">
            {nav.map((item) => (
              <NavBranch key={item.href} item={item} />
            ))}
          </nav>
          <form action="/shop" method="get" className="relative hidden min-w-0 flex-1 max-w-xs lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              name="q"
              placeholder="What are you looking for?"
              className="w-full rounded-full border border-ink/10 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-coral"
              autoComplete="off"
            />
          </form>
          <Link
            href="/cart"
            className="play-pop relative inline-flex items-center gap-2 rounded-full bg-coral px-3 py-2 text-sm font-semibold text-white"
          >
            <ShoppingBag className="h-4 w-4" />
            Cart
            {count > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-lemon px-1 text-[11px] text-ink">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
        <MobileNav nav={nav} />
        <form action="/shop" method="get" className="px-4 pb-3 lg:hidden">
          <label className="sr-only" htmlFor="header-search">
            Search the shop
          </label>
          <input
            id="header-search"
            type="search"
            name="q"
            placeholder="What are you looking for?"
            className="w-full rounded-full border border-ink/10 bg-white px-4 py-2 text-sm outline-none focus:border-coral"
            autoComplete="off"
          />
        </form>
      </div>
    </header>
  )
}

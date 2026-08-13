import Link from 'next/link'
import { Truck, HandCoins, RotateCcw, Sparkles } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { productCardData, getPublishedProducts, getSettings } from '@/lib/products'

export default async function HomePage() {
  let settings: Awaited<ReturnType<typeof getSettings>> | null = null
  let featured: Awaited<ReturnType<typeof getPublishedProducts>> = []

  try {
    ;[settings, featured] = await Promise.all([
      getSettings(),
      getPublishedProducts({ featured: true }),
    ])
    if (featured.length === 0) {
      featured = await getPublishedProducts()
    }
  } catch {
    featured = []
  }

  const cards = featured.slice(0, 8).map(productCardData)

  return (
    <div className="space-y-16">
      <section className="grid items-center gap-10 rounded-[2.5rem] bg-sand px-6 py-12 md:grid-cols-2 md:px-12">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-coral">Pakistan · Cash on delivery</p>
          <h1 className="display mt-4 text-4xl leading-tight md:text-6xl">
            {settings?.heroTitle || 'Little outfits, made for everyday play'}
          </h1>
          <p className="mt-4 max-w-lg text-lg text-ink-soft">
            {settings?.heroSubtitle ||
              'Breathable kids wear for Pakistani weather. Order on cash on delivery — pay when it arrives.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="rounded-full bg-coral px-6 py-3 text-sm font-bold text-white">
              {settings?.heroCta || 'Shop new arrivals'}
            </Link>
            <Link href="/shipping" className="rounded-full border border-ink/15 px-6 py-3 text-sm font-bold">
              How COD works
            </Link>
          </div>
        </div>
        <div className="grid aspect-square place-items-center rounded-[2rem] bg-cream text-center">
          <div>
            <Sparkles className="mx-auto h-10 w-10 text-gold" />
            <p className="display mt-4 text-3xl">Ages newborn – 12</p>
            <p className="mt-2 text-ink-soft">Boys · Girls · Unisex</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { href: '/shop/boys', title: 'Boys', copy: 'Polos, sets, and play tees' },
          { href: '/shop/girls', title: 'Girls', copy: 'Frocks, two-piece sets, everyday knits' },
          { href: '/shop/newborn', title: 'Newborn', copy: 'Rompers, sleepsuits, first outfits' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5">
            <h2 className="display text-3xl">{item.title}</h2>
            <p className="mt-2 text-sm text-ink-soft">{item.copy}</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-coral">Featured</p>
            <h2 className="display text-4xl">Little bestsellers</h2>
          </div>
          <Link href="/shop" className="text-sm font-bold">
            View all
          </Link>
        </div>
        {cards.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-ink-soft">
            Products will appear here after you seed the catalog or add items in the admin panel.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((product) => (
              <ProductCard key={product.slug} {...product} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 rounded-[2rem] bg-white p-6 md:grid-cols-3">
        {[
          { icon: HandCoins, title: 'Cash on delivery', copy: 'Pay the rider in PKR when your parcel arrives. No card needed.' },
          { icon: Truck, title: 'Pakistan-wide', copy: 'We ship to major cities. Free delivery over the store threshold.' },
          { icon: RotateCcw, title: 'Easy exchanges', copy: 'Wrong size? Message us on WhatsApp within 3 days of delivery.' },
        ].map((item) => (
          <div key={item.title} className="p-4">
            <item.icon className="h-6 w-6 text-coral" />
            <h3 className="mt-3 font-bold">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{item.copy}</p>
          </div>
        ))}
      </section>
    </div>
  )
}

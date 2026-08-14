import Link from 'next/link'
import { BrandMark } from '@/components/BrandMark'
import { STORE_NAME } from '@/lib/site'

export function Footer({
  whatsapp,
  phone,
  email,
  shopLinks,
}: {
  whatsapp?: string | null
  phone?: string | null
  email?: string | null
  shopLinks?: Array<{ href: string; label: string }>
}) {
  const links = shopLinks?.length
    ? shopLinks
    : [
        { href: '/shop', label: 'Shop' },
        { href: '/shop/kids-wear', label: 'Kids Wear' },
        { href: '/shop/boys', label: 'Boys' },
        { href: '/shop/girls', label: 'Girls' },
        { href: '/shop/baby-kids-accessories', label: 'Accessories' },
        { href: '/shop/kids-footwear', label: 'Footwear' },
        { href: '/shop/womens', label: "Women's" },
      ]
  return (
    <footer className="mt-20 border-t-8 border-coral bg-sand/70">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <p className="display text-2xl">
            <BrandMark />
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-ink-soft">
            Beautiful clothes for little moments. Kids wear from newborn to 12 years, with cash on
            delivery across Pakistan.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide">Shop</p>
          <div className="mt-3 grid gap-2 text-sm text-ink-soft">
            {links.map((item) => (
              <Link key={`${item.href}-${item.label}`} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide">Customer Care</p>
          <div className="mt-3 grid gap-2 text-sm text-ink-soft">
            <Link href="/size-finder">Size Guide</Link>
            <Link href="/shipping">Shipping &amp; COD</Link>
            <Link href="/returns">Returns &amp; Exchanges</Link>
            <Link href="/track">Track Order</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide">About Rumi &amp; Zuni</p>
          <div className="mt-3 grid gap-2 text-sm text-ink-soft">
            <p>Thoughtful styles for growing up — comfort for play, ease for parents.</p>
            <p>Cash on Delivery available.</p>
            {whatsapp ? <p>WhatsApp {whatsapp}</p> : null}
            {phone ? <p>Call {phone}</p> : null}
            {email ? <p>{email}</p> : null}
          </div>
        </div>
      </div>
      <p className="border-t border-sand px-4 py-4 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} {STORE_NAME}. Cash on delivery across Pakistan.
      </p>
    </footer>
  )
}

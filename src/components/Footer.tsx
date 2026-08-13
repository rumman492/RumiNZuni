import Link from 'next/link'

export function Footer({
  whatsapp,
  phone,
  email,
}: {
  whatsapp?: string | null
  phone?: string | null
  email?: string | null
}) {
  return (
    <footer className="mt-20 border-t border-sand bg-sand/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="display text-2xl">RumiNZuni</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-ink-soft">
            Kids wear made for Pakistani weather — soft cotton, easy everyday fits, and cash on
            delivery nationwide. Pay when your parcel arrives.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide">Shop</p>
          <div className="mt-3 grid gap-2 text-sm text-ink-soft">
            <Link href="/shop">All products</Link>
            <Link href="/shop/boys">Boys</Link>
            <Link href="/shop/girls">Girls</Link>
            <Link href="/shop/newborn">Newborn</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide">Help</p>
          <div className="mt-3 grid gap-2 text-sm text-ink-soft">
            <Link href="/shipping">Shipping & COD</Link>
            <Link href="/returns">Returns</Link>
            <Link href="/track">Track order</Link>
            <Link href="/contact">Contact</Link>
            {whatsapp ? <p>WhatsApp {whatsapp}</p> : null}
            {phone ? <p>Call {phone}</p> : null}
            {email ? <p>{email}</p> : null}
          </div>
        </div>
      </div>
      <p className="border-t border-sand px-4 py-4 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} RumiNZuni. Cash on delivery across Pakistan.
      </p>
    </footer>
  )
}

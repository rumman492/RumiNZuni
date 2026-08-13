import { Breadcrumbs } from '@/components/Breadcrumbs'
import { getSettings } from '@/lib/products'
import { toWhatsAppNumber } from '@/lib/pakistan'
import { pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'Contact',
  description: 'WhatsApp RumiNZuni about size, stock, or a cash-on-delivery order anywhere in Pakistan.',
  path: '/contact',
})

export default async function ContactPage() {
  let whatsapp: string | null = null
  let phone: string | null = null
  let email: string | null = null
  try {
    const settings = await getSettings()
    whatsapp = settings.whatsapp || null
    phone = settings.phone || null
    email = settings.email || null
  } catch {
    // Store settings unavailable
  }

  return (
    <article className="mx-auto max-w-2xl space-y-4">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Contact', href: '/contact' }]} />
      <h1 className="display text-5xl">Contact</h1>
      <p>Questions about size, stock, or an order? WhatsApp is the fastest way once the shop number is published.</p>
      {whatsapp ? <p>WhatsApp: {whatsapp}</p> : null}
      {phone ? <p>Phone: {phone}</p> : null}
      {email ? <p>Email: {email}</p> : null}
      {!whatsapp && !phone && !email ? (
        <p className="text-ink-soft">Contact details will appear here after they are added in Store settings.</p>
      ) : null}
      {whatsapp ? (
        <a
          href={`https://wa.me/${toWhatsAppNumber(whatsapp)}`}
          className="inline-block rounded-full bg-sage px-6 py-3 text-sm font-bold text-white"
        >
          Chat on WhatsApp
        </a>
      ) : null}
    </article>
  )
}

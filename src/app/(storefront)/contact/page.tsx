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
  let whatsapp = '03001234567'
  let phone = '03001234567'
  let email = 'hello@ruminzuni.com'
  try {
    const settings = await getSettings()
    whatsapp = String(settings.whatsapp || whatsapp)
    phone = String(settings.phone || phone)
    email = String(settings.email || email)
  } catch {
    // defaults
  }

  return (
    <article className="mx-auto max-w-2xl space-y-4">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Contact', href: '/contact' }]} />
      <h1 className="display text-5xl">Contact</h1>
      <p>Questions about size, stock, or an order? Message us on WhatsApp — that is the fastest way.</p>
      <p>WhatsApp: {whatsapp}</p>
      <p>Phone: {phone}</p>
      <p>Email: {email}</p>
      <a
        href={`https://wa.me/${toWhatsAppNumber(whatsapp)}`}
        className="inline-block rounded-full bg-sage px-6 py-3 text-sm font-bold text-white"
      >
        Chat on WhatsApp
      </a>
    </article>
  )
}

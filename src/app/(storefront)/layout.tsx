import type { Metadata } from 'next'
import { Fraunces, Nunito_Sans } from 'next/font/google'
import { CartProvider } from '@/components/CartProvider'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { JsonLd } from '@/components/JsonLd'
import { mediaUrl } from '@/lib/media'
import { getSettings } from '@/lib/products'
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, organizationJsonLd, websiteJsonLd } from '@/lib/seo'
import { absoluteMediaUrl, siteOrigin } from '@/lib/site'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
})

const nunito = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const origin = siteOrigin()
  let title = DEFAULT_TITLE
  let description = DEFAULT_DESCRIPTION
  let image: string | undefined

  try {
    const settings = await getSettings()
    const name = settings.storeName || 'RumiNZuni'
    const tagline = settings.tagline || 'Kids wear, cash on delivery'
    title = `${name} — ${tagline}`
    description = `${name} sells kids wear across Pakistan on cash on delivery. ${tagline}.`
    if (settings.logo && typeof settings.logo === 'object') {
      image = absoluteMediaUrl(mediaUrl(settings.logo)) || undefined
    }
  } catch {
    // defaults
  }

  return {
    metadataBase: new URL(origin),
    title: {
      default: title,
      template: '%s · RumiNZuni',
    },
    description,
    applicationName: 'RumiNZuni',
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'en_PK',
      url: origin,
      siteName: 'RumiNZuni',
      title,
      description,
      images: image ? [{ url: image, alt: 'RumiNZuni' }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  let announcement: string | null = null
  let whatsapp: string | null = null
  let phone: string | null = null
  let email: string | null = null
  let settings: Awaited<ReturnType<typeof getSettings>> | null = null

  try {
    settings = await getSettings()
    announcement = settings.announcement || null
    whatsapp = settings.whatsapp || null
    phone = settings.phone || null
    email = settings.email || null
  } catch {
    announcement = 'Cash on delivery across Pakistan'
  }

  return (
    <html lang="en-PK" className={`${fraunces.variable} ${nunito.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <JsonLd data={organizationJsonLd(settings)} />
        <JsonLd data={websiteJsonLd(settings)} />
        <CartProvider>
          <Header announcement={announcement} />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <Footer whatsapp={whatsapp} phone={phone} email={email} />
        </CartProvider>
      </body>
    </html>
  )
}

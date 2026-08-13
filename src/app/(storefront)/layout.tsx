import type { Metadata } from 'next'
import { Fraunces, Nunito_Sans } from 'next/font/google'
import { CartProvider } from '@/components/CartProvider'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getPayloadClient } from '@/lib/payload'
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

export const metadata: Metadata = {
  title: {
    default: 'RumiNZuni — Kids wear, cash on delivery',
    template: '%s · RumiNZuni',
  },
  description:
    'RumiNZuni sells kids wear across Pakistan on cash on delivery. Soft everyday outfits for newborn to 12 years.',
}

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  let announcement: string | null = null
  let whatsapp: string | null = null
  let phone: string | null = null
  let email: string | null = null

  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'site-settings' })
    announcement = settings.announcement || null
    whatsapp = settings.whatsapp || null
    phone = settings.phone || null
    email = settings.email || null
  } catch {
    announcement = 'Cash on delivery across Pakistan'
  }

  return (
    <html lang="en" className={`${fraunces.variable} ${nunito.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <CartProvider>
          <Header announcement={announcement} />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <Footer whatsapp={whatsapp} phone={phone} email={email} />
        </CartProvider>
      </body>
    </html>
  )
}

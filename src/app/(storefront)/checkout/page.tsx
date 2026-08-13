import { CheckoutForm } from '@/components/CheckoutForm'
import { getSettings } from '@/lib/products'
import { pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'Checkout',
  description: 'Place a RumiNZuni cash-on-delivery order. Pay the rider in PKR when your parcel arrives.',
  path: '/checkout',
  index: false,
  follow: false,
})

export default async function CheckoutPage() {
  let defaultShipping = 250
  let freeShippingThreshold = 3000
  let codFee = 0
  try {
    const settings = await getSettings()
    defaultShipping = Number(settings.defaultShippingFee || 250)
    freeShippingThreshold = Number(settings.freeShippingThreshold || 3000)
    codFee = Number(settings.codFee || 0)
  } catch {
    // use defaults if CMS is not seeded yet
  }

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-wide text-coral">Cash on delivery</p>
      <h1 className="display mt-2 text-5xl">Checkout</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        No payment now. Confirm your address and we will collect cash when the order is delivered.
      </p>
      <div className="mt-8">
        <CheckoutForm
          defaultShipping={defaultShipping}
          freeShippingThreshold={freeShippingThreshold}
          codFee={codFee}
        />
      </div>
    </div>
  )
}

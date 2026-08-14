import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CmsRichText } from '@/components/CmsRichText'
import { getCmsPage } from '@/lib/pages'
import { pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'Shipping & cash on delivery',
  description:
    'Rumi & Zuni delivers kids wear across Pakistan. Pay cash when the parcel arrives — no card required.',
  path: '/shipping',
})

export default async function ShippingPage() {
  const page = await getCmsPage('shipping')

  return (
    <article className="mx-auto max-w-2xl space-y-4">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Shipping & COD', href: '/shipping' }]} />
      <h1 className="display text-5xl">{page?.title || 'Shipping & cash on delivery'}</h1>
      {page?.content ? (
        <CmsRichText content={page.content} />
      ) : (
        <>
          <p>Rumi & Zuni delivers across Pakistan. You pay in cash when the parcel arrives — no card or bank transfer required.</p>
          <p>We confirm every order on WhatsApp before dispatch. Delivery usually takes 2–5 working days depending on your city.</p>
          <p>Shipping is calculated at checkout. Orders above the free-delivery threshold ship free.</p>
        </>
      )}
    </article>
  )
}

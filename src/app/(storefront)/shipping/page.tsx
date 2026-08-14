import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CmsRichText } from '@/components/CmsRichText'
import { getCmsPage } from '@/lib/pages'
import { pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'Shipping & cash on delivery',
  description:
    'Rumi & Zuni packs each kids-wear order with care. Pay cash on delivery in PKR when it arrives.',
  path: '/shipping',
})

export default async function ShippingPage() {
  const page = await getCmsPage('shipping')

  return (
    <article className="mx-auto max-w-2xl space-y-4">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Shipping & COD', href: '/shipping' }]} />
      <h1 className="display text-5xl">{page?.title || 'From our door to yours'}</h1>
      {page?.content ? (
        <CmsRichText content={page.content} />
      ) : (
        <>
          <p>We carefully pack every order and send it on its way to you. You pay in cash when it arrives — no card needed.</p>
          <p>Delivery time depends on your city. Shipping is calculated at checkout. Orders above the free-delivery amount shown in the shop ship free.</p>
          <p>We confirm orders before dispatch whenever we can reach you on WhatsApp or phone.</p>
        </>
      )}
    </article>
  )
}

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CmsRichText } from '@/components/CmsRichText'
import { getCmsPage } from '@/lib/pages'
import { pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'Returns & exchanges',
  description:
    'Wrong size or a stitching issue? WhatsApp Rumi & Zuni within 3 days of delivery for an exchange.',
  path: '/returns',
})

export default async function ReturnsPage() {
  const page = await getCmsPage('returns')

  return (
    <article className="mx-auto max-w-2xl space-y-4">
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Returns', href: '/returns' }]} />
      <h1 className="display text-5xl">{page?.title || 'Returns & exchanges'}</h1>
      {page?.content ? (
        <CmsRichText content={page.content} />
      ) : (
        <>
          <p>If the size is wrong or an item has a stitching issue, WhatsApp us within 3 days of delivery with photos and your order number.</p>
          <p>Unworn items with tags can be exchanged. Sale items are exchange-only. COD refunds, when approved, are arranged after we receive the return.</p>
        </>
      )}
    </article>
  )
}

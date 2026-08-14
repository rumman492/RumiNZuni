import { Breadcrumbs } from '@/components/Breadcrumbs'
import { CmsRichText } from '@/components/CmsRichText'
import { getCmsPage } from '@/lib/pages'
import { pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'Returns & exchanges',
  description:
    'Need a different size? Contact Rumi & Zuni within 3 days of delivery and we will help with an exchange.',
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
          <p>If the size is not quite right, or something arrived with a stitching issue, message us within 3 days of delivery with photos and your order number.</p>
          <p>Unworn items with tags can be exchanged. Sale items are exchange-only. When a cash refund is approved, we arrange it after we receive the return.</p>
        </>
      )}
    </article>
  )
}

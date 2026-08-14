import { SizeFinderForm } from '@/components/SizeFinderForm'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { loadShopSizing } from '@/lib/catalog'
import { pageMeta } from '@/lib/seo'
import { DEFAULT_SIZES } from '@/lib/sizing'

export const metadata = pageMeta({
  title: 'Find my child’s size',
  description: 'Enter your child’s height in cm to get a Rumi & Zuni size. Sizing is based on height, with age as a hint.',
  path: '/size-finder',
})

export default async function SizeFinderPage() {
  const sizing = await loadShopSizing().catch(() => ({ sizes: DEFAULT_SIZES, ageGroups: [] }))

  return (
    <article className="mx-auto max-w-2xl">
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Find my child’s size', href: '/size-finder' },
        ]}
      />
      <p className="inline-flex rounded-full bg-mint px-3 py-1 text-sm font-bold uppercase tracking-wide">Height first</p>
      <h1 className="display mt-3 text-5xl">Find my child’s size</h1>
      <p className="mt-4 text-ink-soft">
        Clothes fit the body, not the birthday. Enter height in centimetres — age is only a hint if two sizes are close.
      </p>
      <SizeFinderForm sizes={sizing.sizes.filter((size) => size.storefrontVisible)} />
    </article>
  )
}

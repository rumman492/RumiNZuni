import { SizeFinderForm } from '@/components/SizeFinderForm'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { loadShopSizing } from '@/lib/catalog'
import { pageMeta } from '@/lib/seo'
import { DEFAULT_SIZES } from '@/lib/sizing'

export const metadata = pageMeta({
  title: 'Size Guide',
  description: 'Check our size guide before ordering. Enter height in cm — a quick measurement makes the right fit easier.',
  path: '/size-finder',
})

export default async function SizeFinderPage() {
  const sizing = await loadShopSizing().catch(() => ({ sizes: DEFAULT_SIZES, ageGroups: [] }))

  return (
    <article className="mx-auto max-w-2xl">
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Size Guide', href: '/size-finder' },
        ]}
      />
      <p className="inline-flex rounded-full bg-mint px-3 py-1 text-sm font-bold uppercase tracking-wide">Size Guide</p>
      <h1 className="display mt-3 text-5xl">Not sure about the size?</h1>
      <p className="mt-4 text-ink-soft">
        Check our size guide before ordering — a quick measurement in centimetres can make finding the right fit much easier. Age is only a hint if two sizes are close.
      </p>
      <SizeFinderForm sizes={sizing.sizes.filter((size) => size.storefrontVisible)} />
    </article>
  )
}

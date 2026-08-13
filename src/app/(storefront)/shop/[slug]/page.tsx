import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShopListing } from '@/components/ShopListing'
import {
  SHOP_PRESETS,
  catalogMetadata,
  getCategoryBySlug,
  parseCatalogSearchParams,
  type CatalogLock,
  type CatalogSearchParams,
} from '@/lib/catalog'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<CatalogSearchParams>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const query = parseCatalogSearchParams(await searchParams)
  const preset = SHOP_PRESETS[slug]
  const category = preset ? null : await getCategoryBySlug(slug).catch(() => null)
  if (!preset && !category) return { title: 'Shop' }

  const locked: CatalogLock = preset
    ? { gender: preset.gender, age: preset.age }
    : { category: slug }
  const heading = preset?.title || category?.name || slug

  return catalogMetadata(
    { ...query, ...locked },
    {
      basePath: `/shop/${slug}`,
      heading,
      description: preset?.description || category?.description || `Shop ${heading} at RumiNZuni. Cash on delivery across Pakistan.`,
      locked,
    },
  )
}

export default async function ShopSlugPage({ params, searchParams }: Props) {
  const { slug } = await params
  const parsed = parseCatalogSearchParams(await searchParams)
  const preset = SHOP_PRESETS[slug]
  const category = preset ? null : await getCategoryBySlug(slug).catch(() => null)

  if (!preset && !category) notFound()

  const locked: CatalogLock = preset
    ? { gender: preset.gender, age: preset.age }
    : { category: slug }

  const query = {
    ...parsed,
    gender: locked.gender || parsed.gender,
    age: locked.age || parsed.age,
    category: locked.category || parsed.category,
  }

  const title = preset?.title || category?.name || slug
  const description =
    preset?.description ||
    category?.description ||
    `Shop ${title} with cash on delivery across Pakistan.`

  return (
    <ShopListing title={title} description={description} basePath={`/shop/${slug}`} query={query} locked={locked} />
  )
}

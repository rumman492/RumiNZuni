import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShopListing } from '@/components/ShopListing'
import {
  SHOP_PRESETS,
  catalogMetadata,
  getAgeGroupBySlug,
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
  const ageGroup = preset || category ? null : await getAgeGroupBySlug(slug).catch(() => null)
  if (!preset && !category && !ageGroup) return { title: 'Shop' }

  const locked: CatalogLock = preset
    ? { gender: preset.gender, age: preset.age }
    : category
      ? { category: slug }
      : { age: slug }
  const heading = preset?.title || category?.name || ageGroup?.name || slug

  return catalogMetadata(
    { ...query, ...locked },
    {
      basePath: `/shop/${slug}`,
      heading,
      description:
        preset?.description ||
        category?.description ||
        ageGroup?.blurb ||
        `Shop ${heading} at Rumi & Zuni. Cash on delivery across Pakistan.`,
      locked,
    },
  )
}

export default async function ShopSlugPage({ params, searchParams }: Props) {
  const { slug } = await params
  const parsed = parseCatalogSearchParams(await searchParams)
  const preset = SHOP_PRESETS[slug]
  const category = preset ? null : await getCategoryBySlug(slug).catch(() => null)
  const ageGroup = preset || category ? null : await getAgeGroupBySlug(slug).catch(() => null)

  if (!preset && !category && !ageGroup) notFound()

  const locked: CatalogLock = preset
    ? { gender: preset.gender, age: preset.age }
    : category
      ? { category: slug }
      : { age: slug }

  const query = {
    ...parsed,
    gender: locked.gender || parsed.gender,
    age: locked.age || parsed.age,
    category: locked.category || parsed.category,
  }

  const title = preset?.title || category?.name || ageGroup?.name || slug
  const description =
    preset?.description ||
    category?.description ||
    ageGroup?.blurb ||
    `Shop ${title} with cash on delivery across Pakistan.`

  return (
    <ShopListing
      title={title}
      description={description}
      basePath={`/shop/${slug}`}
      query={query}
      locked={locked}
      breadcrumbs={[
        { name: 'Home', href: '/' },
        { name: 'Shop', href: '/shop' },
        { name: title, href: `/shop/${slug}` },
      ]}
    />
  )
}

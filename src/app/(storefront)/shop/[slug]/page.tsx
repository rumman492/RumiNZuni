import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { ShopListing } from '@/components/ShopListing'
import {
  SHOP_PRESETS,
  catalogMetadata,
  getAgeGroupBySlug,
  getCategoryBySlug,
  getDepartmentBySlug,
  getWomenHubs,
  parseCatalogSearchParams,
  type CatalogLock,
  type CatalogSearchParams,
} from '@/lib/catalog'
import { SHOP_ALIASES } from '@/lib/taxonomy'
import { mediaUrl } from '@/lib/media'
import { absoluteMediaUrl } from '@/lib/site'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<CatalogSearchParams>
}

function seoFrom(
  doc:
    | { seo?: { title?: string | null; description?: string | null; noindex?: boolean | null; ogImage?: unknown } | null; description?: string | null; name?: string }
    | null,
) {
  const image =
    doc?.seo?.ogImage && typeof doc.seo.ogImage === 'object'
      ? absoluteMediaUrl(mediaUrl(doc.seo.ogImage as never))
      : null
  return {
    title: doc?.seo?.title || undefined,
    description: doc?.seo?.description || doc?.description || undefined,
    noindex: Boolean(doc?.seo?.noindex),
    image,
  }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  if (SHOP_ALIASES[slug]) return { title: 'Shop' }
  const query = parseCatalogSearchParams(await searchParams)
  const preset = SHOP_PRESETS[slug]
  const department = preset ? null : await getDepartmentBySlug(slug).catch(() => null)
  const category = preset || department ? null : await getCategoryBySlug(slug).catch(() => null)
  const ageGroup = preset || department || category ? null : await getAgeGroupBySlug(slug).catch(() => null)
  if (!preset && !department && !category && !ageGroup) return { title: 'Shop' }

  const locked: CatalogLock = preset
    ? { gender: preset.gender, age: preset.age, department: preset.department, audience: preset.audience }
    : department
      ? { department: slug, audience: department.audience === 'women' ? 'women' : 'kids' }
      : category
        ? { category: slug }
        : { age: slug }

  const heading = preset?.title || department?.name || category?.name || ageGroup?.name || slug
  const extra = seoFrom((department || category) as never)
  const meta = catalogMetadata(
    { ...query, ...locked },
    {
      basePath: `/shop/${slug}`,
      heading: extra.title || heading,
      description:
        extra.description ||
        preset?.description ||
        department?.description ||
        category?.description ||
        ageGroup?.blurb ||
        `Shop ${heading} at Rumi & Zuni. Cash on delivery across Pakistan.`,
      locked,
    },
  )
  if (extra.noindex) {
    meta.robots = { index: false, follow: true }
  }
  if (extra.image) {
    meta.openGraph = { ...meta.openGraph, images: [{ url: extra.image }] }
  }
  return meta
}

export default async function ShopSlugPage({ params, searchParams }: Props) {
  const { slug } = await params
  if (SHOP_ALIASES[slug]) permanentRedirect(SHOP_ALIASES[slug])

  const parsed = parseCatalogSearchParams(await searchParams)
  const preset = SHOP_PRESETS[slug]
  const department = preset ? null : await getDepartmentBySlug(slug).catch(() => null)
  const category = preset || department ? null : await getCategoryBySlug(slug).catch(() => null)
  const ageGroup = preset || department || category ? null : await getAgeGroupBySlug(slug).catch(() => null)

  if (!preset && !department && !category && !ageGroup) notFound()

  const locked: CatalogLock = preset
    ? { gender: preset.gender, age: preset.age, department: preset.department, audience: preset.audience }
    : department
      ? { department: slug, audience: department.audience === 'women' ? 'women' : 'kids' }
      : category
        ? { category: slug }
        : { age: slug }

  const query = {
    ...parsed,
    gender: locked.gender || parsed.gender,
    age: locked.age || parsed.age,
    category: locked.category || parsed.category,
    department: locked.department || parsed.department,
    audience: locked.audience || parsed.audience,
  }

  const hubs =
    (preset?.department === 'womens' || department?.slug === 'womens') && !locked.category
      ? await getWomenHubs().catch(() => [])
      : undefined

  const title = preset?.title || department?.name || category?.name || ageGroup?.name || slug
  const description =
    preset?.description ||
    department?.description ||
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
      hubs={hubs}
      breadcrumbs={[
        { name: 'Home', href: '/' },
        { name: 'Shop', href: '/shop' },
        { name: title, href: `/shop/${slug}` },
      ]}
    />
  )
}

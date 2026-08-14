import type { Metadata } from 'next'
import type { Where } from 'payload'
import { getPayloadClient } from '@/lib/payload'
import { productCardData, type ProductDoc } from '@/lib/products'
import { pageMeta } from '@/lib/seo'
import { absoluteUrl, STORE_NAME } from '@/lib/site'
import {
  DEFAULT_AGE_GROUPS,
  DEFAULT_SIZES,
  formatProductSize,
  shopAgeOptions,
  shopSizeOptions,
  sizeCode,
  sizeCodesForAgeGroup,
  sizeCodesForHeightRange,
  type AgeGroupRecord,
  type SizeRecord,
} from '@/lib/sizing'
import {
  AGE_OPTIONS,
  GENDER_OPTIONS,
  catalogHref,
  hasFacetParams,
  type CatalogFacets,
  type CatalogLock,
  type CatalogQuery,
} from '@/lib/catalog-params'

export const CATALOG_PAGE_SIZE = 24
export const CATALOG_FETCH_LIMIT = 200

export {
  AGE_OPTIONS,
  GENDER_OPTIONS,
  SHOP_PRESETS,
  SORT_OPTIONS,
  catalogFilterChips,
  catalogHref,
  catalogQueryString,
  parseCatalogSearchParams,
  type CatalogFacets,
  type CatalogLock,
  type CatalogQuery,
  type CatalogSearchParams,
  type CatalogSort,
} from '@/lib/catalog-params'

export function catalogMetadata(
  query: CatalogQuery,
  opts: { basePath: string; heading: string; description?: string; locked?: CatalogLock },
): Metadata {
  const bits = [
    query.q ? `“${query.q}”` : '',
    query.gender ? GENDER_OPTIONS.find((item) => item.value === query.gender)?.label : '',
    query.age ? AGE_OPTIONS.find((item) => item.value === query.age)?.label : '',
    query.size ? formatProductSize(query.size) : '',
    query.color,
    query.inStock ? 'in stock' : '',
  ].filter(Boolean)

  const title = bits.length > 0 ? `${opts.heading}: ${bits.join(' · ')}` : opts.heading
  const description =
    opts.description ||
    `${opts.heading} at ${STORE_NAME}. Kids wear with cash on delivery across Pakistan.`
  const index = !hasFacetParams(query, opts.locked)
  const sharePath = index ? opts.basePath : catalogHref(opts.basePath, { ...query, page: 1 })

  return {
    ...pageMeta({
      title,
      description,
      path: sharePath,
      index,
      follow: true,
    }),
    alternates: {
      canonical: absoluteUrl(opts.basePath),
      languages: {
        'en-PK': absoluteUrl(opts.basePath),
        'x-default': absoluteUrl(opts.basePath),
      },
    },
  }
}

type Variant = NonNullable<ProductDoc['variants']>[number]

function variantMatches(variant: Variant, query: CatalogQuery, sizeCodes?: Set<string>) {
  const code = sizeCode(variant.size)
  if (query.size && code !== query.size) return false
  if (sizeCodes && sizeCodes.size > 0 && !sizeCodes.has(code)) return false
  if (query.color && variant.color.trim().toLowerCase() !== query.color.trim().toLowerCase()) return false
  if (query.min != null && variant.price < query.min) return false
  if (query.max != null && variant.price > query.max) return false
  if (query.inStock && variant.stock < 1) return false
  return true
}

export function matchingVariants(product: ProductDoc, query: CatalogQuery, sizeCodes?: Set<string>) {
  return (product.variants || []).filter((variant) => variantMatches(variant, query, sizeCodes))
}

export function catalogDisplayVariant(product: ProductDoc, query: CatalogQuery) {
  const matched = matchingVariants(product, query)
  const pool = matched.length > 0 ? matched : product.variants || []
  const inStock = pool.filter((variant) => variant.stock > 0)
  const list = (inStock.length > 0 ? inStock : pool).slice()
  list.sort((a, b) => a.price - b.price)
  return list[0]
}

function createdAt(product: ProductDoc) {
  return Date.parse(String(product.createdAt || '')) || 0
}

function sortProducts(products: ProductDoc[], query: CatalogQuery) {
  const sorted = products.slice()
  const sort = query.sort || 'featured'
  sorted.sort((a, b) => {
    if (sort === 'name') return a.title.localeCompare(b.title, 'en')
    if (sort === 'newest') return createdAt(b) - createdAt(a)
    const priceA = catalogDisplayVariant(a, query)?.price || 0
    const priceB = catalogDisplayVariant(b, query)?.price || 0
    if (sort === 'price-asc') return priceA - priceB
    if (sort === 'price-desc') return priceB - priceA
    const priority = (b.sortPriority || 0) - (a.sortPriority || 0)
    if (priority !== 0) return priority
    return createdAt(b) - createdAt(a)
  })
  return sorted
}

export async function getCatalogFacets(): Promise<CatalogFacets> {
  const payload = await getPayloadClient()
  const [categories, products, sizing] = await Promise.all([
    payload.find({
      collection: 'categories',
      limit: 50,
      sort: 'name',
      depth: 0,
    }),
    payload.find({
      collection: 'products',
      where: { _status: { equals: 'published' } },
      limit: CATALOG_FETCH_LIMIT,
      depth: 0,
    }),
    loadShopSizing().catch(() => ({
      ageGroups: DEFAULT_AGE_GROUPS,
      sizes: DEFAULT_SIZES,
    })),
  ])

  const colors = new Map<string, string>()
  for (const doc of products.docs as unknown as ProductDoc[]) {
    for (const variant of doc.variants || []) {
      const key = variant.color.trim().toLowerCase()
      if (key && !colors.has(key)) colors.set(key, variant.color.trim())
    }
  }

  return {
    categories: categories.docs.map((doc) => ({ name: doc.name, slug: doc.slug })),
    colors: [...colors.values()].sort((a, b) => a.localeCompare(b, 'en')),
    ageGroups: shopAgeOptions(sizing.ageGroups),
    sizes: shopSizeOptions(sizing.sizes),
  }
}

export async function loadShopSizing() {
  try {
    const payload = await getPayloadClient()
    const [groups, sizes] = await Promise.all([
      payload.find({ collection: 'age-groups', limit: 50, sort: 'sortOrder', depth: 0, overrideAccess: true }),
      payload.find({ collection: 'sizes', limit: 100, sort: 'sortOrder', depth: 1, overrideAccess: true }),
    ])
    if (groups.totalDocs === 0 || sizes.totalDocs === 0) {
      return { ageGroups: DEFAULT_AGE_GROUPS, sizes: DEFAULT_SIZES }
    }
    const ageGroups: AgeGroupRecord[] = groups.docs.map((doc) => ({
      name: doc.name,
      slug: doc.slug,
      blurb: doc.blurb || '',
      sortOrder: Number(doc.sortOrder || 0),
      storefrontVisible: Boolean(doc.storefrontVisible),
      heightMinCm: Number(doc.heightMinCm),
      heightMaxCm: Number(doc.heightMaxCm),
      ageMinMonths: Number(doc.ageMinMonths || 0),
      ageMaxMonths: Number(doc.ageMaxMonths || 0),
    }))
    const mapped: SizeRecord[] = sizes.docs.map((doc) => ({
      code: doc.code,
      label: doc.label,
      ageLabel: doc.ageLabel || '',
      sortOrder: Number(doc.sortOrder || 0),
      storefrontVisible: Boolean(doc.storefrontVisible),
      heightMinCm: Number(doc.heightMinCm),
      heightMaxCm: Number(doc.heightMaxCm),
      chestMinCm: doc.chestMinCm != null ? Number(doc.chestMinCm) : undefined,
      chestMaxCm: doc.chestMaxCm != null ? Number(doc.chestMaxCm) : undefined,
      waistMinCm: doc.waistMinCm != null ? Number(doc.waistMinCm) : undefined,
      waistMaxCm: doc.waistMaxCm != null ? Number(doc.waistMaxCm) : undefined,
      ageMinMonths: Number(doc.ageMinMonths || 0),
      ageMaxMonths: Number(doc.ageMaxMonths || 0),
      eu: doc.eu || undefined,
      uk: doc.uk || undefined,
      us: doc.us || undefined,
      ageGroupSlugs: (doc.ageGroups || []).flatMap((item) =>
        typeof item === 'object' && item && 'slug' in item ? [String(item.slug)] : [],
      ),
    }))
    return { ageGroups, sizes: mapped }
  } catch {
    return { ageGroups: DEFAULT_AGE_GROUPS, sizes: DEFAULT_SIZES }
  }
}

export async function getAgeGroupBySlug(slug: string) {
  const { ageGroups } = await loadShopSizing()
  return ageGroups.find((group) => group.slug === slug && group.storefrontVisible) || null
}

export async function getCategoryBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return result.docs[0] || null
}

export async function searchCatalog(query: CatalogQuery) {
  const payload = await getPayloadClient()
  const sizing = await loadShopSizing()
  const ageGroup = query.age ? sizing.ageGroups.find((group) => group.slug === query.age) : undefined
  const heightCodes =
    query.heightMin != null || query.heightMax != null
      ? sizeCodesForHeightRange(sizing.sizes, query.heightMin, query.heightMax)
      : []
  const ageCodes = ageGroup ? sizeCodesForAgeGroup(sizing.sizes, ageGroup) : []
  const sizeCodes = new Set([...heightCodes, ...ageCodes])
  const filterBySizeBand = sizeCodes.size > 0 && !query.size

  const and: Where[] = [{ _status: { equals: 'published' } }]

  if (query.category) and.push({ 'category.slug': { equals: query.category } })
  if (query.gender) and.push({ gender: { equals: query.gender } })
  if (query.size) and.push({ 'variants.size': { equals: query.size } })
  if (filterBySizeBand) {
    and.push({
      or: [
        { 'variants.size': { in: [...sizeCodes] } },
        ...(query.age ? [{ 'ageGroup.slug': { equals: query.age } }] : []),
      ],
    })
  } else if (query.age) {
    and.push({ 'ageGroup.slug': { equals: query.age } })
  }
  if (query.color) and.push({ 'variants.color': { contains: query.color } })
  if (query.min != null) and.push({ 'variants.price': { greater_than_equal: query.min } })
  if (query.max != null) and.push({ 'variants.price': { less_than_equal: query.max } })
  if (query.inStock) and.push({ 'variants.stock': { greater_than: 0 } })

  const q = query.q
  if (q) {
    and.push({
      or: [
        { title: { contains: q } },
        { description: { contains: q } },
        { slug: { contains: q } },
        { material: { contains: q } },
        { 'variants.sku': { contains: q } },
        { 'variants.color': { contains: q } },
        { 'tags.name': { contains: q } },
      ],
    })
  }

  const result = await payload.find({
    collection: 'products',
    where: { and },
    depth: 2,
    limit: CATALOG_FETCH_LIMIT,
    sort: ['-sortPriority', '-createdAt'],
  })

  const matched = (result.docs as unknown as ProductDoc[]).filter((product) => {
    if (query.size || query.color || query.min != null || query.max != null || query.inStock || filterBySizeBand) {
      return matchingVariants(product, query, filterBySizeBand ? sizeCodes : undefined).length > 0
    }
    return true
  })

  const sorted = sortProducts(matched, query)
  const total = sorted.length
  const pageCount = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE))
  const page = Math.min(query.page || 1, pageCount)
  const start = (page - 1) * CATALOG_PAGE_SIZE
  const products = sorted.slice(start, start + CATALOG_PAGE_SIZE)

  return {
    products,
    cards: products.map((product) => {
      const variant = catalogDisplayVariant(product, query)
      return productCardData(product, variant)
    }),
    total,
    page,
    pageCount,
  }
}

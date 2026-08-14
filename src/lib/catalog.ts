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
  catalogSectionIndex,
  flagsForShopQuery,
  flagsFromDepartment,
  isUnisexPublicItem,
  shopFacetLabel,
  shopFacetSlugsForQuery,
  SHOP_DEPARTMENT_OPTIONS,
  STOREFRONT_NAV,
  WOMEN_SHOP_LINKS,
} from '@/lib/taxonomy'
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

function relationSlug(value: unknown) {
  if (value && typeof value === 'object' && 'slug' in value && typeof (value as { slug?: unknown }).slug === 'string') {
    return (value as { slug: string }).slug
  }
  return ''
}

function productInFacetScope(product: ProductDoc, query?: CatalogQuery) {
  const category = relationSlug(product.category)
  const department = relationSlug(product.department)
  if (query?.category) {
    if (query.category === 'womens') return ['handbags', 'beauty', 'skincare', 'womens'].includes(category)
    return category === query.category
  }
  if (query?.department === 'womens' || query?.audience === 'women') {
    return (
      department === 'womens' ||
      department.startsWith('womens-') ||
      ['handbags', 'beauty', 'skincare', 'womens'].includes(category)
    )
  }
  if (query?.department === 'kids-wear') {
    const clothing = department === 'kids-wear' || ['boys', 'girls', 'newborn', 'unisex'].includes(category)
    if (!clothing) return false
    if (query.gender === 'boys' || query.gender === 'girls') {
      return product.gender === query.gender || product.gender === 'unisex'
    }
    return true
  }
  if (query?.department === 'baby-kids-accessories') {
    return department === 'baby-kids-accessories' || category === 'baby-kids-accessories'
  }
  if (query?.department === 'kids-footwear') {
    return department === 'kids-footwear' || category === 'kids-footwear'
  }
  return true
}

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

const NEW_ARRIVAL_MS = 1000 * 60 * 60 * 24 * 30

function isNewArrival(product: ProductDoc) {
  const created = createdAt(product)
  return created > 0 && Date.now() - created < NEW_ARRIVAL_MS
}

function sortProducts(products: ProductDoc[], query: CatalogQuery, soldCounts: Map<string, number>) {
  const sorted = products.slice()
  const sort = query.sort || 'featured'
  sorted.sort((a, b) => {
    if (sort === 'name') return a.title.localeCompare(b.title, 'en')
    if (sort === 'newest') return createdAt(b) - createdAt(a)
    const priceA = catalogDisplayVariant(a, query)?.price || 0
    const priceB = catalogDisplayVariant(b, query)?.price || 0
    if (sort === 'price-asc') return priceA - priceB
    if (sort === 'price-desc') return priceB - priceA
    const soldA = soldCounts.get(String(a.id)) || 0
    const soldB = soldCounts.get(String(b.id)) || 0
    if (sort === 'best-selling') {
      if (soldB !== soldA) return soldB - soldA
      return createdAt(b) - createdAt(a)
    }
    const featured = Number(Boolean(b.featured)) - Number(Boolean(a.featured))
    if (featured !== 0) return featured
    const newRank = Number(isNewArrival(b)) - Number(isNewArrival(a))
    if (newRank !== 0) return newRank
    if (soldB !== soldA) return soldB - soldA
    const priority = (b.sortPriority || 0) - (a.sortPriority || 0)
    if (priority !== 0) return priority
    return createdAt(b) - createdAt(a)
  })
  return sorted
}

export async function getCatalogFacets(query?: CatalogQuery): Promise<CatalogFacets> {
  const payload = await getPayloadClient()
  const [categories, products, sizing, departments] = await Promise.all([
    payload.find({
      collection: 'categories',
      where: { active: { not_equals: false } },
      limit: 80,
      sort: 'sortOrder',
      depth: 1,
    }),
    payload.find({
      collection: 'products',
      where: { _status: { equals: 'published' } },
      limit: CATALOG_FETCH_LIMIT,
      depth: 1,
    }),
    loadShopSizing().catch(() => ({
      ageGroups: DEFAULT_AGE_GROUPS,
      sizes: DEFAULT_SIZES,
    })),
    payload.find({ collection: 'departments', limit: 30, depth: 0 }).catch(() => ({ docs: [] })),
  ])

  const categoryDoc = categories.docs.find((doc) => doc.slug === query?.category)
  const categoryDepartment =
    categoryDoc && typeof categoryDoc.department === 'object' && categoryDoc.department
      ? categoryDoc.department.slug
      : undefined
  const departmentSlug = query?.department || categoryDepartment
  const department =
    departments.docs.find((doc) => doc.slug === departmentSlug) ||
    (query?.audience === 'women' ? departments.docs.find((doc) => doc.slug === 'womens') : undefined) ||
    null
  const flags =
    !query?.department && !query?.category && !query?.gender && query?.audience !== 'women'
      ? flagsForShopQuery(query)
      : department
        ? {
            ...flagsFromDepartment(department),
            material: query?.category === 'handbags' || department.slug === 'womens-handbags',
            gender:
              query?.category === 'boys' ||
              query?.category === 'girls' ||
              query?.gender === 'boys' ||
              query?.gender === 'girls'
                ? false
                : Boolean(department.usesGender),
          }
        : flagsForShopQuery(query)
  const sizeKind: SizeRecord['kind'] | undefined =
    query?.department === 'kids-footwear' || query?.category === 'kids-footwear'
      ? 'footwear'
      : query?.department === 'kids-wear' || query?.gender === 'boys' || query?.gender === 'girls'
        ? 'clothing'
        : flags.size
          ? ((department?.sizeKind as SizeRecord['kind'] | undefined) || undefined)
          : 'none'

  const allowed = shopFacetSlugsForQuery(query)
  const allowedSet = new Set(allowed)
  const masterShop = allowed.includes('kids-wear') && allowed.includes('womens')
  const departmentOptions = SHOP_DEPARTMENT_OPTIONS.map((item) => ({ name: item.label, slug: item.slug }))
  const visibleCats = categories.docs
    .filter((doc) => doc.slug && allowedSet.has(doc.slug) && !isUnisexPublicItem({ name: doc.name, slug: doc.slug }))
    .sort((a, b) => catalogSectionIndex(a.slug) - catalogSectionIndex(b.slug))

  const scopedProducts = (products.docs as unknown as ProductDoc[]).filter((doc) => productInFacetScope(doc, query))
  const colors = new Map<string, string>()
  const brands = new Set<string>()
  const bagTypes = new Set<string>()
  const productKinds = new Set<string>()
  const skinTypes = new Set<string>()
  const materials = new Set<string>()
  for (const doc of scopedProducts) {
    if (doc.brand) brands.add(doc.brand)
    if (doc.bagType) bagTypes.add(doc.bagType)
    if (doc.productKind) productKinds.add(doc.productKind)
    if (doc.skinType) skinTypes.add(doc.skinType)
    if (doc.material) materials.add(doc.material)
    for (const variant of doc.variants || []) {
      const key = variant.color.trim().toLowerCase()
      if (key && !colors.has(key)) colors.set(key, variant.color.trim())
    }
  }

  return {
    departments: departmentOptions,
    categories: masterShop
      ? []
      : visibleCats.map((doc) => ({
          name: shopFacetLabel(doc.slug, doc.name),
          slug: doc.slug,
        })),
    colors: [...colors.values()].sort((a, b) => a.localeCompare(b, 'en')),
    brands: [...brands].sort((a, b) => a.localeCompare(b, 'en')),
    bagTypes: [...bagTypes].sort((a, b) => a.localeCompare(b, 'en')),
    productKinds: [...productKinds].sort((a, b) => a.localeCompare(b, 'en')),
    skinTypes: [...skinTypes].sort((a, b) => a.localeCompare(b, 'en')),
    materials: [...materials].sort((a, b) => a.localeCompare(b, 'en')),
    ageGroups: shopAgeOptions(sizing.ageGroups),
    sizes: shopSizeOptions(sizing.sizes, sizeKind === 'none' ? undefined : sizeKind),
    filters: flags,
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
      kind: (doc.kind as SizeRecord['kind']) || 'clothing',
      heightMinCm: doc.heightMinCm != null ? Number(doc.heightMinCm) : undefined,
      heightMaxCm: doc.heightMaxCm != null ? Number(doc.heightMaxCm) : undefined,
      footLengthCm: doc.footLengthCm != null ? Number(doc.footLengthCm) : undefined,
      chestMinCm: doc.chestMinCm != null ? Number(doc.chestMinCm) : undefined,
      chestMaxCm: doc.chestMaxCm != null ? Number(doc.chestMaxCm) : undefined,
      waistMinCm: doc.waistMinCm != null ? Number(doc.waistMinCm) : undefined,
      waistMaxCm: doc.waistMaxCm != null ? Number(doc.waistMaxCm) : undefined,
      ageMinMonths: Number(doc.ageMinMonths || 0),
      ageMaxMonths: Number(doc.ageMaxMonths || 0),
      eu: doc.eu || undefined,
      uk: doc.uk || undefined,
      us: doc.us || undefined,
      pk: doc.pk || undefined,
      ageGroupSlugs: (doc.ageGroups || []).flatMap((item) =>
        typeof item === 'object' && item && 'slug' in item ? [String(item.slug)] : [],
      ),
    }))
    return { ageGroups, sizes: mapped }
  } catch {
    return { ageGroups: DEFAULT_AGE_GROUPS, sizes: DEFAULT_SIZES }
  }
}

async function loadSoldCounts(payload: Awaited<ReturnType<typeof getPayloadClient>>) {
  const counts = new Map<string, number>()
  const orders = await payload.find({
    collection: 'orders',
    limit: 200,
    depth: 0,
    overrideAccess: true,
    where: { status: { not_in: ['cancelled', 'refused', 'failed_delivery', 'returned'] } },
  })
  for (const order of orders.docs) {
    for (const item of order.items || []) {
      const product = item.product
      const id = product && typeof product === 'object' && 'id' in product ? product.id : product
      if (id == null) continue
      counts.set(String(id), (counts.get(String(id)) || 0) + Number(item.qty || 0))
    }
  }
  return counts
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

export async function getWomenHubs() {
  const payload = await getPayloadClient()
  const hubs: Array<{ href: string; title: string; copy: string; image: string | null }> = []
  for (const item of WOMEN_SHOP_LINKS) {
    const products = await payload.find({
      collection: 'products',
      where: {
        and: [{ _status: { equals: 'published' } }, { 'category.slug': { equals: item.slug } }],
      },
      limit: 1,
      depth: 1,
      sort: '-sortPriority',
    })
    const product = products.docs[0] as unknown as ProductDoc | undefined
    hubs.push({
      href: item.href,
      title: item.label,
      copy: item.copy,
      image: product ? productCardData(product).image || null : null,
    })
  }
  return hubs
}

export async function getDepartmentBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'departments',
    where: { slug: { equals: slug }, storefrontVisible: { not_equals: false } },
    limit: 1,
    depth: 0,
  })
  return result.docs[0] || null
}

export async function getStorefrontNav() {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    const links = (settings as { navLinks?: Array<{ label?: string | null; href?: string | null }> }).navLinks
    if (links && links.length > 0) {
      return links
        .filter((item) => item.label && item.href && !isUnisexPublicItem({ label: item.label, href: item.href }))
        .map((item) => ({ href: String(item.href), label: String(item.label) }))
    }
  } catch {
    // fallback
  }
  return STOREFRONT_NAV.filter((item) => !isUnisexPublicItem(item))
}

export async function getFooterShopLinks() {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    const links = (settings as { footerShopLinks?: Array<{ label?: string | null; href?: string | null }> }).footerShopLinks
    if (links && links.length > 0) {
      return links
        .filter((item) => item.label && item.href && !isUnisexPublicItem({ label: item.label, href: item.href }))
        .map((item) => ({ href: String(item.href), label: String(item.label) }))
    }
  } catch {
    // fallback
  }
  return [
    { href: '/shop', label: 'All products' },
    { href: '/shop/kids-wear', label: 'Kids Wear' },
    { href: '/shop/boys', label: 'Boys' },
    { href: '/shop/girls', label: 'Girls' },
    { href: '/shop/baby-kids-accessories', label: 'Kids accessories' },
    { href: '/shop/kids-footwear', label: 'Kids footwear' },
    { href: '/shop/womens', label: "Women's" },
    { href: '/shop/handbags', label: 'Bags' },
    { href: '/shop/beauty', label: 'Beauty' },
    { href: '/shop/skincare', label: 'Skincare' },
  ]
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
  const sizeKind =
    query.department === 'kids-footwear' || query.category === 'kids-footwear'
      ? 'footwear'
      : query.audience === 'women' || query.department === 'womens'
        ? 'none'
        : undefined
  const sizeCodes = new Set(
    [...heightCodes, ...ageCodes].filter((code) => {
      if (!sizeKind) return true
      const row = sizing.sizes.find((size) => size.code === code)
      return (row?.kind || 'clothing') === sizeKind
    }),
  )
  const filterBySizeBand = sizeCodes.size > 0 && !query.size

  const and: Where[] = [{ _status: { equals: 'published' } }]

  if (query.category) {
    const category = await getCategoryBySlug(query.category)
    if (category) {
      const children = await payload.find({
        collection: 'categories',
        where: { parent: { equals: category.id } },
        limit: 40,
        depth: 0,
      })
      const ids = [category.id, ...children.docs.map((doc) => doc.id)]
      and.push({ category: { in: ids } })
    } else {
      and.push({ 'category.slug': { equals: query.category } })
    }
  }

  if ((query.department === 'womens' || query.audience === 'women') && !query.category) {
    and.push({ 'department.audience': { equals: 'women' } })
  } else if (query.department === 'kids-wear') {
    and.push({
      or: [
        { 'department.slug': { equals: 'kids-wear' } },
        {
          and: [
            { department: { exists: false } },
            { 'category.slug': { in: ['boys', 'girls', 'newborn', 'unisex'] } },
          ],
        },
      ],
    })
  } else if (query.department) {
    and.push({ 'department.slug': { equals: query.department } })
  } else if (query.audience === 'kids') {
    and.push({
      or: [{ 'department.audience': { equals: 'kids' } }, { department: { exists: false } }],
    })
  }

  if (query.gender === 'boys' || query.gender === 'girls') {
    and.push({
      or: [{ gender: { equals: query.gender } }, { gender: { equals: 'unisex' } }],
    })
  }
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
  if (query.brand) and.push({ brand: { contains: query.brand } })
  if (query.bagType) and.push({ bagType: { contains: query.bagType } })
  if (query.productKind) and.push({ productKind: { contains: query.productKind } })
  if (query.skinType) and.push({ skinType: { contains: query.skinType } })
  if (query.material) and.push({ material: { contains: query.material } })
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
        { 'category.name': { contains: q } },
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

  const soldCounts = await loadSoldCounts(payload).catch(() => new Map<string, number>())
  const sorted = sortProducts(matched, query, soldCounts)
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

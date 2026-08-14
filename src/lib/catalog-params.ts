import { shopAgeOptions, shopSizeOptions, formatProductSize } from '@/lib/sizing'

export const GENDER_OPTIONS = [
  { label: 'Boys', value: 'boys' },
  { label: 'Girls', value: 'girls' },
  { label: 'Unisex', value: 'unisex' },
] as const

/** Fallback labels when CMS is unavailable. Shop UI should pass live age groups. */
export const AGE_OPTIONS = shopAgeOptions()

export const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: low to high', value: 'price-asc' },
  { label: 'Price: high to low', value: 'price-desc' },
  { label: 'Name A–Z', value: 'name' },
] as const

export type CatalogSort = (typeof SORT_OPTIONS)[number]['value']

export const SHOP_PRESETS: Record<
  string,
  { title: string; gender?: string; age?: string; description: string }
> = {
  boys: {
    title: 'Boys',
    gender: 'boys',
    description: 'Everyday boys wear with cash on delivery across Pakistan.',
  },
  girls: {
    title: 'Girls',
    gender: 'girls',
    description: 'Frocks, sets, and everyday girls outfits. Cash on delivery across Pakistan.',
  },
  newborn: {
    title: 'Newborn',
    age: 'newborn',
    description: 'First outfits and sleepsuits for newborns. Cash on delivery across Pakistan.',
  },
  unisex: {
    title: 'Unisex',
    gender: 'unisex',
    description: 'Soft unisex basics for everyday play. Cash on delivery across Pakistan.',
  },
}

export type CatalogQuery = {
  q?: string
  category?: string
  gender?: string
  age?: string
  size?: string
  color?: string
  min?: number
  max?: number
  heightMin?: number
  heightMax?: number
  inStock?: boolean
  sort?: CatalogSort
  page?: number
}

export type CatalogSearchParams = Record<string, string | string[] | undefined>

export type CatalogFacets = {
  categories: Array<{ name: string; slug: string }>
  colors: string[]
  ageGroups: Array<{ label: string; value: string }>
  sizes: Array<{ label: string; value: string; height: string }>
}

export type CatalogLock = {
  category?: string
  gender?: string
  age?: string
}

const GENDER_VALUES = new Set(GENDER_OPTIONS.map((item) => item.value))
const SORT_VALUES = new Set(SORT_OPTIONS.map((item) => item.value))
const LEGACY_AGE: Record<string, string> = { infant: 'baby' }

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function cleanText(value: string | undefined, max: number) {
  const trimmed = value?.trim().slice(0, max).replace(/[%_]/g, '') || ''
  return trimmed || undefined
}

function cleanSlug(value: string | undefined) {
  const slug = value?.trim().toLowerCase() || ''
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : undefined
}

function cleanSizeCode(value: string | undefined) {
  const code = value?.trim().toLowerCase() || ''
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(code) ? code : undefined
}

function cleanInt(value: string | undefined) {
  if (value == null || value === '') return undefined
  const amount = Number.parseInt(value, 10)
  return Number.isFinite(amount) && amount >= 0 ? amount : undefined
}

export function parseCatalogSearchParams(params: CatalogSearchParams): CatalogQuery {
  const q = cleanText(firstParam(params.q), 80)
  const category = cleanSlug(firstParam(params.category))
  const genderRaw = firstParam(params.gender)?.trim().toLowerCase()
  const ageRaw = LEGACY_AGE[firstParam(params.age)?.trim().toLowerCase() || ''] || firstParam(params.age)?.trim().toLowerCase()
  const sizeRaw = cleanSizeCode(firstParam(params.size))
  const color = cleanText(firstParam(params.color), 40)
  let min = cleanInt(firstParam(params.min))
  let max = cleanInt(firstParam(params.max))
  if (min != null && max != null && min > max) [min, max] = [max, min]
  let heightMin = cleanInt(firstParam(params.heightMin) || firstParam(params.minHeight))
  let heightMax = cleanInt(firstParam(params.heightMax) || firstParam(params.maxHeight))
  if (heightMin != null && heightMax != null && heightMin > heightMax) [heightMin, heightMax] = [heightMax, heightMin]
  const inStockRaw = firstParam(params.inStock)?.trim().toLowerCase()
  const sortRaw = firstParam(params.sort)?.trim().toLowerCase()
  const page = Math.max(1, cleanInt(firstParam(params.page)) || 1)

  return {
    q,
    category,
    gender: genderRaw && GENDER_VALUES.has(genderRaw as never) ? genderRaw : undefined,
    age: cleanSlug(ageRaw),
    size: sizeRaw,
    color,
    min,
    max,
    heightMin,
    heightMax,
    inStock: inStockRaw === '1' || inStockRaw === 'true' || inStockRaw === 'on' || inStockRaw === 'yes',
    sort: sortRaw && SORT_VALUES.has(sortRaw as CatalogSort) ? (sortRaw as CatalogSort) : undefined,
    page,
  }
}

export function catalogQueryString(query: CatalogQuery) {
  const params = new URLSearchParams()
  if (query.q) params.set('q', query.q)
  if (query.category) params.set('category', query.category)
  if (query.gender) params.set('gender', query.gender)
  if (query.age) params.set('age', query.age)
  if (query.size) params.set('size', query.size)
  if (query.color) params.set('color', query.color)
  if (query.min != null && Number.isFinite(query.min)) params.set('min', String(query.min))
  if (query.max != null && Number.isFinite(query.max)) params.set('max', String(query.max))
  if (query.heightMin != null && Number.isFinite(query.heightMin)) params.set('heightMin', String(query.heightMin))
  if (query.heightMax != null && Number.isFinite(query.heightMax)) params.set('heightMax', String(query.heightMax))
  if (query.inStock) params.set('inStock', '1')
  if (query.sort && query.sort !== 'featured') params.set('sort', query.sort)
  if (query.page && query.page > 1) params.set('page', String(query.page))
  return params.toString()
}

export function catalogHref(basePath: string, query: CatalogQuery) {
  const qs = catalogQueryString(query)
  return qs ? `${basePath}?${qs}` : basePath
}

export function extraCatalogQuery(query: CatalogQuery, locked?: CatalogLock): CatalogQuery {
  return {
    ...query,
    category: query.category && query.category !== locked?.category ? query.category : undefined,
    gender: query.gender && query.gender !== locked?.gender ? query.gender : undefined,
    age: query.age && query.age !== locked?.age ? query.age : undefined,
  }
}

export function hasFacetParams(query: CatalogQuery, locked?: CatalogLock) {
  const extra = extraCatalogQuery(query, locked)
  return Boolean(
    extra.q ||
      extra.size ||
      extra.color ||
      extra.min != null ||
      extra.max != null ||
      extra.heightMin != null ||
      extra.heightMax != null ||
      extra.inStock ||
      (extra.sort && extra.sort !== 'featured') ||
      (extra.page && extra.page > 1) ||
      extra.category ||
      extra.gender ||
      extra.age,
  )
}

export function catalogFilterChips(query: CatalogQuery, facets: CatalogFacets) {
  const chips: Array<{ key: keyof CatalogQuery; label: string }> = []
  if (query.q) chips.push({ key: 'q', label: `Search: ${query.q}` })
  if (query.category) {
    const name = facets.categories.find((item) => item.slug === query.category)?.name || query.category
    chips.push({ key: 'category', label: name })
  }
  if (query.gender) {
    chips.push({
      key: 'gender',
      label: GENDER_OPTIONS.find((item) => item.value === query.gender)?.label || query.gender,
    })
  }
  if (query.age) {
    chips.push({
      key: 'age',
      label: facets.ageGroups.find((item) => item.value === query.age)?.label || query.age,
    })
  }
  if (query.size) {
    chips.push({
      key: 'size',
      label: facets.sizes.find((item) => item.value === query.size)?.label || formatProductSize(query.size),
    })
  }
  if (query.color) chips.push({ key: 'color', label: query.color })
  if (query.min != null) chips.push({ key: 'min', label: `From Rs ${query.min}` })
  if (query.max != null) chips.push({ key: 'max', label: `Up to Rs ${query.max}` })
  if (query.heightMin != null) chips.push({ key: 'heightMin', label: `From ${query.heightMin} cm` })
  if (query.heightMax != null) chips.push({ key: 'heightMax', label: `Up to ${query.heightMax} cm` })
  if (query.inStock) chips.push({ key: 'inStock', label: 'In stock' })
  return chips
}

export { shopAgeOptions, shopSizeOptions }

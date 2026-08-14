/** Height-first kids sizing. Age is a hint; centimetres decide the size. */

export type AgeGroupRecord = {
  name: string
  slug: string
  blurb: string
  sortOrder: number
  storefrontVisible: boolean
  heightMinCm: number
  heightMaxCm: number
  ageMinMonths: number
  ageMaxMonths: number
}

export type SizeRecord = {
  code: string
  label: string
  ageLabel: string
  sortOrder: number
  storefrontVisible: boolean
  kind?: 'clothing' | 'footwear' | 'none'
  heightMinCm?: number
  heightMaxCm?: number
  footLengthCm?: number
  chestMinCm?: number
  chestMaxCm?: number
  waistMinCm?: number
  waistMaxCm?: number
  ageMinMonths: number
  ageMaxMonths: number
  eu?: string
  uk?: string
  us?: string
  pk?: string
  ageGroupSlugs: string[]
}

export const DEFAULT_AGE_GROUPS: AgeGroupRecord[] = [
  {
    name: 'Newborn',
    slug: 'newborn',
    blurb: 'First outfits for life’s newest little moments.',
    sortOrder: 10,
    storefrontVisible: true,
    heightMinCm: 46,
    heightMaxCm: 62,
    ageMinMonths: 0,
    ageMaxMonths: 3,
  },
  {
    name: 'Baby',
    slug: 'baby',
    blurb: 'Soft, easy pieces for curious little explorers.',
    sortOrder: 20,
    storefrontVisible: true,
    heightMinCm: 62,
    heightMaxCm: 80,
    ageMinMonths: 3,
    ageMaxMonths: 12,
  },
  {
    name: 'Toddler',
    slug: 'toddler',
    blurb: 'Easy-going looks for busy little adventures.',
    sortOrder: 30,
    storefrontVisible: true,
    heightMinCm: 80,
    heightMaxCm: 104,
    ageMinMonths: 12,
    ageMaxMonths: 36,
  },
  {
    name: 'Little Kids',
    slug: 'little-kids',
    blurb: 'Play-ready styles for every little personality.',
    sortOrder: 40,
    storefrontVisible: true,
    heightMinCm: 98,
    heightMaxCm: 116,
    ageMinMonths: 36,
    ageMaxMonths: 72,
  },
  {
    name: 'Kids',
    slug: 'kids',
    blurb: 'Everyday favourites for growing confidence.',
    sortOrder: 50,
    storefrontVisible: true,
    heightMinCm: 116,
    heightMaxCm: 134,
    ageMinMonths: 72,
    ageMaxMonths: 108,
  },
  {
    name: 'Big Kids',
    slug: 'big-kids',
    blurb: 'Cooler looks for bigger personalities.',
    sortOrder: 60,
    storefrontVisible: true,
    heightMinCm: 134,
    heightMaxCm: 158,
    ageMinMonths: 108,
    ageMaxMonths: 144,
  },
  {
    name: 'Pre-Teen',
    slug: 'pre-teen',
    blurb: 'Older kids styles — hidden until you tick storefront.',
    sortOrder: 70,
    storefrontVisible: false,
    heightMinCm: 152,
    heightMaxCm: 164,
    ageMinMonths: 144,
    ageMaxMonths: 168,
  },
  {
    name: 'Teen',
    slug: 'teen',
    blurb: 'Teen sizes for later — hidden until you tick storefront.',
    sortOrder: 80,
    storefrontVisible: false,
    heightMinCm: 164,
    heightMaxCm: 176,
    ageMinMonths: 168,
    ageMaxMonths: 192,
  },
]

export const DEFAULT_SIZES: SizeRecord[] = [
  { code: 'newborn', label: 'Newborn', ageLabel: '0–1 months', sortOrder: 10, storefrontVisible: true, heightMinCm: 46, heightMaxCm: 56, chestMinCm: 36, chestMaxCm: 40, waistMinCm: 36, waistMaxCm: 38, ageMinMonths: 0, ageMaxMonths: 1, eu: '50', uk: 'newborn', us: 'NB', ageGroupSlugs: ['newborn'] },
  { code: '0-3m', label: '0–3 months', ageLabel: '0–3 months', sortOrder: 20, storefrontVisible: true, heightMinCm: 50, heightMaxCm: 62, chestMinCm: 38, chestMaxCm: 42, waistMinCm: 38, waistMaxCm: 42, ageMinMonths: 0, ageMaxMonths: 3, eu: '56', uk: '0-3m', us: '0-3M', ageGroupSlugs: ['newborn', 'baby'] },
  { code: '3-6m', label: '3–6 months', ageLabel: '3–6 months', sortOrder: 30, storefrontVisible: true, heightMinCm: 62, heightMaxCm: 68, chestMinCm: 42, chestMaxCm: 44, waistMinCm: 42, waistMaxCm: 44, ageMinMonths: 3, ageMaxMonths: 6, eu: '62', uk: '3-6m', us: '3-6M', ageGroupSlugs: ['baby'] },
  { code: '6-9m', label: '6–9 months', ageLabel: '6–9 months', sortOrder: 40, storefrontVisible: true, heightMinCm: 68, heightMaxCm: 74, chestMinCm: 44, chestMaxCm: 46, waistMinCm: 44, waistMaxCm: 46, ageMinMonths: 6, ageMaxMonths: 9, eu: '68', uk: '6-9m', us: '6-9M', ageGroupSlugs: ['baby'] },
  { code: '9-12m', label: '9–12 months', ageLabel: '9–12 months', sortOrder: 50, storefrontVisible: true, heightMinCm: 74, heightMaxCm: 80, chestMinCm: 46, chestMaxCm: 48, waistMinCm: 46, waistMaxCm: 48, ageMinMonths: 9, ageMaxMonths: 12, eu: '74', uk: '9-12m', us: '9-12M', ageGroupSlugs: ['baby'] },
  { code: '12-18m', label: '12–18 months', ageLabel: '12–18 months', sortOrder: 60, storefrontVisible: true, heightMinCm: 80, heightMaxCm: 86, chestMinCm: 48, chestMaxCm: 50, waistMinCm: 48, waistMaxCm: 50, ageMinMonths: 12, ageMaxMonths: 18, eu: '80', uk: '12-18m', us: '12-18M', ageGroupSlugs: ['toddler'] },
  { code: '18-24m', label: '18–24 months', ageLabel: '18–24 months', sortOrder: 70, storefrontVisible: true, heightMinCm: 86, heightMaxCm: 92, chestMinCm: 50, chestMaxCm: 52, waistMinCm: 50, waistMaxCm: 52, ageMinMonths: 18, ageMaxMonths: 24, eu: '86', uk: '18-24m', us: '18-24M', ageGroupSlugs: ['toddler'] },
  { code: '2y', label: '2 years', ageLabel: '1–3 years', sortOrder: 80, storefrontVisible: true, heightMinCm: 92, heightMaxCm: 98, chestMinCm: 52, chestMaxCm: 54, waistMinCm: 51, waistMaxCm: 53, ageMinMonths: 24, ageMaxMonths: 36, eu: '92', uk: '2y', us: '2T', ageGroupSlugs: ['toddler'] },
  { code: '3y', label: '3 years', ageLabel: '2–4 years', sortOrder: 90, storefrontVisible: true, heightMinCm: 98, heightMaxCm: 104, chestMinCm: 54, chestMaxCm: 56, waistMinCm: 52, waistMaxCm: 54, ageMinMonths: 36, ageMaxMonths: 48, eu: '98', uk: '3y', us: '3T', ageGroupSlugs: ['toddler', 'little-kids'] },
  { code: '4y', label: '4 years', ageLabel: '3–5 years', sortOrder: 100, storefrontVisible: true, heightMinCm: 104, heightMaxCm: 110, chestMinCm: 56, chestMaxCm: 58, waistMinCm: 53, waistMaxCm: 55, ageMinMonths: 48, ageMaxMonths: 60, eu: '104', uk: '4y', us: '4', ageGroupSlugs: ['little-kids'] },
  { code: '5y', label: '5 years', ageLabel: '4–6 years', sortOrder: 110, storefrontVisible: true, heightMinCm: 110, heightMaxCm: 116, chestMinCm: 58, chestMaxCm: 60, waistMinCm: 54, waistMaxCm: 56, ageMinMonths: 60, ageMaxMonths: 72, eu: '110', uk: '5y', us: '5', ageGroupSlugs: ['little-kids'] },
  { code: '6y', label: '6–7 years', ageLabel: '5–7 years', sortOrder: 120, storefrontVisible: true, heightMinCm: 116, heightMaxCm: 122, chestMinCm: 60, chestMaxCm: 62, waistMinCm: 55, waistMaxCm: 57, ageMinMonths: 72, ageMaxMonths: 84, eu: '116', uk: '6y', us: '6', ageGroupSlugs: ['kids'] },
  { code: '7-8y', label: '7–8 years', ageLabel: '6–9 years', sortOrder: 130, storefrontVisible: true, heightMinCm: 122, heightMaxCm: 134, chestMinCm: 62, chestMaxCm: 66, waistMinCm: 56, waistMaxCm: 60, ageMinMonths: 84, ageMaxMonths: 108, eu: '128', uk: '7-8y', us: '7-8', ageGroupSlugs: ['kids'] },
  { code: '9-10y', label: '9–10 years', ageLabel: '8–11 years', sortOrder: 140, storefrontVisible: true, heightMinCm: 134, heightMaxCm: 146, chestMinCm: 66, chestMaxCm: 72, waistMinCm: 60, waistMaxCm: 64, ageMinMonths: 108, ageMaxMonths: 132, eu: '140', uk: '9-10y', us: '10', ageGroupSlugs: ['big-kids'] },
  { code: '11-12y', label: '11–12 years', ageLabel: '10–13 years', sortOrder: 150, storefrontVisible: true, heightMinCm: 146, heightMaxCm: 158, chestMinCm: 72, chestMaxCm: 78, waistMinCm: 64, waistMaxCm: 68, ageMinMonths: 132, ageMaxMonths: 156, eu: '152', uk: '11-12y', us: '12', ageGroupSlugs: ['big-kids'] },
  { code: '13-14y', label: '13–14 years', ageLabel: '12–14 years', sortOrder: 160, storefrontVisible: false, heightMinCm: 158, heightMaxCm: 164, chestMinCm: 78, chestMaxCm: 84, waistMinCm: 66, waistMaxCm: 72, ageMinMonths: 144, ageMaxMonths: 168, eu: '158', uk: '13-14y', us: '14', ageGroupSlugs: ['pre-teen'] },
  { code: '14-16y', label: '14–16 years', ageLabel: '14–16 years', sortOrder: 170, storefrontVisible: false, heightMinCm: 164, heightMaxCm: 176, chestMinCm: 84, chestMaxCm: 90, waistMinCm: 70, waistMaxCm: 76, ageMinMonths: 168, ageMaxMonths: 192, eu: '164', uk: '14-16y', us: '16', ageGroupSlugs: ['teen'] },
]

export const ACCESSORY_CATEGORIES = [
  { name: 'Baby & Kids Accessories', slug: 'baby-kids-accessories', description: 'Caps, socks, bibs, and little extras that finish a look.' },
  { name: 'Kids Footwear', slug: 'kids-footwear', description: 'Soft steps for tiny feet and growing ones.' },
]

export const DEFAULT_FOOTWEAR_SIZES: SizeRecord[] = [
  { code: 'eu-16', label: 'EU 16', ageLabel: 'Newborn–3 months', sortOrder: 200, storefrontVisible: true, kind: 'footwear', footLengthCm: 9.5, ageMinMonths: 0, ageMaxMonths: 3, eu: '16', uk: '0', us: '1', pk: '16', ageGroupSlugs: ['newborn'] },
  { code: 'eu-18', label: 'EU 18', ageLabel: '3–12 months', sortOrder: 210, storefrontVisible: true, kind: 'footwear', footLengthCm: 11, ageMinMonths: 3, ageMaxMonths: 12, eu: '18', uk: '2', us: '3', pk: '18', ageGroupSlugs: ['baby'] },
  { code: 'eu-20', label: 'EU 20', ageLabel: '1–2 years', sortOrder: 220, storefrontVisible: true, kind: 'footwear', footLengthCm: 12.5, ageMinMonths: 12, ageMaxMonths: 24, eu: '20', uk: '4', us: '5', pk: '20', ageGroupSlugs: ['toddler'] },
  { code: 'eu-22', label: 'EU 22', ageLabel: '2–3 years', sortOrder: 230, storefrontVisible: true, kind: 'footwear', footLengthCm: 13.5, ageMinMonths: 24, ageMaxMonths: 36, eu: '22', uk: '5', us: '6', pk: '22', ageGroupSlugs: ['toddler'] },
  { code: 'eu-24', label: 'EU 24', ageLabel: '3–5 years', sortOrder: 240, storefrontVisible: true, kind: 'footwear', footLengthCm: 15, ageMinMonths: 36, ageMaxMonths: 60, eu: '24', uk: '7', us: '8', pk: '24', ageGroupSlugs: ['little-kids'] },
  { code: 'eu-26', label: 'EU 26', ageLabel: '5–7 years', sortOrder: 250, storefrontVisible: true, kind: 'footwear', footLengthCm: 16.5, ageMinMonths: 60, ageMaxMonths: 84, eu: '26', uk: '8.5', us: '9.5', pk: '26', ageGroupSlugs: ['kids'] },
  { code: 'eu-28', label: 'EU 28', ageLabel: '6–8 years', sortOrder: 260, storefrontVisible: true, kind: 'footwear', footLengthCm: 17.5, ageMinMonths: 72, ageMaxMonths: 96, eu: '28', uk: '10', us: '11', pk: '28', ageGroupSlugs: ['kids'] },
  { code: 'eu-30', label: 'EU 30', ageLabel: '8–10 years', sortOrder: 270, storefrontVisible: true, kind: 'footwear', footLengthCm: 19, ageMinMonths: 96, ageMaxMonths: 120, eu: '30', uk: '11.5', us: '12.5', pk: '30', ageGroupSlugs: ['big-kids'] },
  { code: 'eu-32', label: 'EU 32', ageLabel: '10–12 years', sortOrder: 280, storefrontVisible: true, kind: 'footwear', footLengthCm: 20.5, ageMinMonths: 120, ageMaxMonths: 144, eu: '32', uk: '13', us: '1Y', pk: '32', ageGroupSlugs: ['big-kids'] },
]

export const DEFAULT_ONESIZE: SizeRecord = {
  code: 'onesize',
  label: 'One size',
  ageLabel: '',
  sortOrder: 900,
  storefrontVisible: true,
  kind: 'none',
  ageMinMonths: 0,
  ageMaxMonths: 192,
  ageGroupSlugs: [],
}

const LEGACY_AGE_SLUG: Record<string, string> = {
  newborn: 'newborn',
  infant: 'baby',
  baby: 'baby',
  toddler: 'toddler',
  kids: 'kids',
  'little-kids': 'little-kids',
  'big-kids': 'big-kids',
  'pre-teen': 'pre-teen',
  teen: 'teen',
}

export function mapLegacyAgeGroup(value: string | null | undefined) {
  if (!value) return 'kids'
  return LEGACY_AGE_SLUG[value] || value
}

export function sizeCode(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (typeof value === 'object' && 'code' in value && typeof (value as { code?: unknown }).code === 'string') {
    return (value as { code: string }).code
  }
  if (typeof value === 'object' && 'label' in value && typeof (value as { label?: unknown }).label === 'string') {
    return (value as { label: string }).label
  }
  return ''
}

export function formatProductSize(value: unknown) {
  const code = sizeCode(value)
  return DEFAULT_SIZES.find((size) => size.code === code)?.label || code
}

export function rangesOverlap(aMin: number, aMax: number, bMin: number, bMax: number) {
  return aMin <= bMax && bMin <= aMax
}

export function sizeFitsHeight(size: SizeRecord, heightCm: number) {
  if (size.kind === 'footwear' || size.kind === 'none') return false
  if (size.heightMinCm == null || size.heightMaxCm == null) return false
  return heightCm >= size.heightMinCm && heightCm <= size.heightMaxCm
}

export function sizeOverlapsHeightRange(size: SizeRecord, minCm: number, maxCm: number) {
  if (size.kind === 'footwear' || size.kind === 'none') return false
  if (size.heightMinCm == null || size.heightMaxCm == null) return false
  return rangesOverlap(size.heightMinCm, size.heightMaxCm, minCm, maxCm)
}

export function sizeCodesForHeightRange(sizes: SizeRecord[], minCm?: number, maxCm?: number, visibleOnly = true) {
  const pool = visibleOnly ? sizes.filter((size) => size.storefrontVisible) : sizes
  if (minCm == null && maxCm == null) return pool.map((size) => size.code)
  const low = minCm ?? 0
  const high = maxCm ?? 300
  return pool.filter((size) => sizeOverlapsHeightRange(size, low, high)).map((size) => size.code)
}

export function sizeCodesForAgeGroup(sizes: SizeRecord[], group: AgeGroupRecord, visibleOnly = true) {
  const bySlug = sizes.filter((size) => size.ageGroupSlugs.includes(group.slug))
  const pool = (bySlug.length > 0 ? bySlug : sizes).filter((size) => (visibleOnly ? size.storefrontVisible : true))
  const byHeight = pool.filter((size) => sizeOverlapsHeightRange(size, group.heightMinCm, group.heightMaxCm))
  return (byHeight.length > 0 ? byHeight : pool).map((size) => size.code)
}

export type SizeRecommendation = {
  size: SizeRecord
  reason: string
}

export function recommendSize(input: {
  heightCm: number
  ageYears?: number
  sizes?: SizeRecord[]
}): SizeRecommendation | null {
  const heightCm = input.heightCm
  if (!Number.isFinite(heightCm) || heightCm < 40 || heightCm > 200) return null

  const sizes = (input.sizes || DEFAULT_SIZES).filter((size) => size.storefrontVisible)
  const ageMonths =
    input.ageYears != null && Number.isFinite(input.ageYears) ? Math.round(input.ageYears * 12) : null

  const byHeight = sizes.filter((size) => sizeFitsHeight(size, heightCm))
  const pool = byHeight.length > 0 ? byHeight : sizes
  const scored = pool.map((size) => {
    const mid =
      size.heightMinCm != null && size.heightMaxCm != null ? (size.heightMinCm + size.heightMaxCm) / 2 : heightCm
    const heightScore = Math.abs(heightCm - mid)
    const ageScore =
      ageMonths == null
        ? 0
        : ageMonths < size.ageMinMonths
          ? size.ageMinMonths - ageMonths
          : ageMonths > size.ageMaxMonths
            ? ageMonths - size.ageMaxMonths
            : 0
    return { size, score: heightScore * 10 + ageScore }
  })
  scored.sort((a, b) => a.score - b.score || a.size.sortOrder - b.size.sortOrder)
  const winner = scored[0]
  if (!winner) return null

  const reason =
    byHeight.length > 0
      ? `Closest height fit for ${heightCm} cm${ageMonths != null ? ` (age about ${input.ageYears} years)` : ''}.`
      : `No exact height band — nearest size for ${heightCm} cm.`

  return { size: winner.size, reason }
}

export function shopSizeOptions(sizes: SizeRecord[] = DEFAULT_SIZES, kind?: SizeRecord['kind']) {
  return sizes
    .filter((size) => size.storefrontVisible)
    .filter((size) => !kind || (size.kind || 'clothing') === kind)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((size) => ({
      label: size.label,
      value: size.code,
      height: size.footLengthCm
        ? `${size.footLengthCm} cm foot`
        : size.heightMinCm != null && size.heightMaxCm != null
          ? `${size.heightMinCm}–${size.heightMaxCm} cm`
          : '',
    }))
}

export function shopAgeOptions(groups: AgeGroupRecord[] = DEFAULT_AGE_GROUPS) {
  return groups
    .filter((group) => group.storefrontVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((group) => ({ label: group.name, value: group.slug }))
}

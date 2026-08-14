export type FilterFlags = {
  gender: boolean
  age: boolean
  size: boolean
  height: boolean
  color: boolean
  brand: boolean
  bagType: boolean
  productKind: boolean
  skinType: boolean
  material: boolean
  pattern: boolean
  finish: boolean
  skinTone: boolean
  skinConcern: boolean
  fragranceFamily: boolean
  fragranceType: boolean
  volume: boolean
  spf: boolean
}

export const GLOBAL_SHOP_FILTERS: FilterFlags = {
  gender: false,
  age: false,
  size: false,
  height: false,
  color: false,
  brand: false,
  bagType: false,
  productKind: false,
  skinType: false,
  material: false,
  pattern: false,
  finish: false,
  skinTone: false,
  skinConcern: false,
  fragranceFamily: false,
  fragranceType: false,
  volume: false,
  spf: false,
}

export const DEFAULT_KIDS_FILTERS: FilterFlags = {
  gender: true,
  age: true,
  size: true,
  height: true,
  color: true,
  brand: false,
  bagType: false,
  productKind: false,
  skinType: false,
  material: false,
  pattern: false,
  finish: false,
  skinTone: false,
  skinConcern: false,
  fragranceFamily: false,
  fragranceType: false,
  volume: false,
  spf: false,
}

export const CUSTOMER_GENDER_OPTIONS = [
  { label: 'Boys', value: 'boys' },
  { label: 'Girls', value: 'girls' },
] as const

export const SHOP_GENDER_NAV = [
  { href: '/shop/boys', label: 'Boys' },
  { href: '/shop/girls', label: 'Girls' },
]

export const STOREFRONT_NAV = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop/kids-wear', label: 'Kids Wear' },
  ...SHOP_GENDER_NAV,
  { href: '/shop/baby-kids-accessories', label: 'Accessories' },
  { href: '/shop/kids-footwear', label: 'Footwear' },
  { href: '/shop/womens', label: "Women's" },
  { href: '/size-finder', label: 'Find size' },
  { href: '/track', label: 'Track order' },
]

export const SHOP_DEPARTMENT_OPTIONS = [
  { slug: 'kids-wear', label: 'Kids Wear' },
  { slug: 'baby-kids-accessories', label: 'Baby & Kids Accessories' },
  { slug: 'kids-footwear', label: 'Kids Footwear' },
  { slug: 'womens', label: "Women's" },
] as const

export const SHOP_DEPARTMENT_SLUGS = new Set<string>(SHOP_DEPARTMENT_OPTIONS.map((item) => item.slug))

export const WOMEN_SHOP_LINKS = [
  { href: '/shop/handbags', slug: 'handbags', label: 'Handbags', copy: 'Shoulder bags, totes, crossbody, and clutches' },
  { href: '/shop/beauty-care', slug: 'beauty-care', label: 'Beauty & Personal Care', copy: 'Makeup, skincare, and perfumes' },
]

export const WOMEN_BEAUTY_LINKS = [
  { href: '/shop/beauty', slug: 'beauty', label: 'Makeup', copy: 'Lips, eyes, face, and palettes' },
  { href: '/shop/skincare', slug: 'skincare', label: 'Skincare', copy: 'Cleansers, serums, and creams' },
  { href: '/shop/perfumes', slug: 'perfumes', label: 'Perfumes', copy: 'Eau de parfum, mists, and oils' },
]

export const WOMEN_LEAF_SLUGS = [
  'handbags',
  'beauty',
  'skincare',
  'perfumes',
  'hair-care',
  'body-care',
  'beauty-tools',
] as const

/** Saleable shop sections, in merchandising order. Used on /shop and for featured sort. */
export const SHOP_FACET_CATEGORIES = [
  { slug: 'boys', label: 'Boys wear', department: 'kids-wear' },
  { slug: 'girls', label: 'Girls wear', department: 'kids-wear' },
  { slug: 'newborn', label: 'Newborn', department: 'kids-wear' },
  { slug: 'baby-kids-accessories', label: 'Kids accessories', department: 'baby-kids-accessories' },
  { slug: 'kids-footwear', label: 'Kids footwear', department: 'kids-footwear' },
  { slug: 'handbags', label: 'Handbags', department: 'womens-handbags' },
  { slug: 'beauty-care', label: 'Beauty & Personal Care', department: 'womens' },
  { slug: 'beauty', label: 'Makeup', department: 'womens-beauty' },
  { slug: 'skincare', label: 'Skincare', department: 'womens-skincare' },
  { slug: 'perfumes', label: 'Perfumes', department: 'womens-perfumes' },
] as const

export function shopFacetLabel(slug: string, fallback?: string) {
  return SHOP_FACET_CATEGORIES.find((item) => item.slug === slug)?.label || fallback || slug
}

export function catalogSectionIndex(categorySlug?: string | null) {
  const index = SHOP_FACET_CATEGORIES.findIndex((item) => item.slug === categorySlug)
  return index === -1 ? SHOP_FACET_CATEGORIES.length : index
}

export function shopFacetSlugsForQuery(query?: {
  department?: string
  category?: string
  audience?: 'kids' | 'women'
  gender?: string
}) {
  const womenScope = new Set<string>(['womens', 'beauty-care', ...WOMEN_LEAF_SLUGS])
  if (
    query?.department === 'womens' ||
    query?.audience === 'women' ||
    (query?.category && womenScope.has(query.category))
  ) {
    return [...WOMEN_LEAF_SLUGS]
  }
  if (
    query?.department === 'kids-wear' ||
    query?.department === 'baby-kids-accessories' ||
    query?.department === 'kids-footwear'
  ) {
    return [] as string[]
  }
  return SHOP_DEPARTMENT_OPTIONS.map((item) => item.slug)
}

export function flagsForShopQuery(query?: {
  department?: string
  category?: string
  audience?: 'kids' | 'women'
  gender?: string
}): FilterFlags {
  const fromCategory = SHOP_FACET_CATEGORIES.find((item) => item.slug === query?.category)
  const departmentSlug = fromCategory?.department || query?.department
  if (!departmentSlug && !query?.audience && !query?.gender) {
    return { ...GLOBAL_SHOP_FILTERS }
  }
  const department = DEFAULT_DEPARTMENTS.find((item) => item.slug === departmentSlug)
  if (department) {
    const flags = flagsFromDepartment(department)
    flags.material = query?.category === 'handbags' || department.slug === 'womens-handbags'
    flags.pattern = flags.material
    if (query?.category === 'beauty' || department.slug === 'womens-beauty') {
      flags.finish = true
      flags.skinTone = true
      flags.color = true
      flags.brand = true
      flags.productKind = true
    }
    if (query?.category === 'skincare' || department.slug === 'womens-skincare') {
      flags.skinConcern = true
      flags.spf = true
    }
    if (query?.category === 'perfumes' || department.slug === 'womens-perfumes') {
      flags.fragranceFamily = true
      flags.fragranceType = true
      flags.volume = true
      flags.brand = true
      flags.age = false
      flags.gender = false
      flags.size = false
    }
    if (
      query?.category === 'boys' ||
      query?.category === 'girls' ||
      query?.gender === 'boys' ||
      query?.gender === 'girls'
    ) {
      flags.gender = false
    }
    return flags
  }
  if (query?.audience === 'women') {
    return flagsFromDepartment(DEFAULT_DEPARTMENTS.find((item) => item.slug === 'womens') || null)
  }
  return { ...DEFAULT_KIDS_FILTERS }
}

export const SHOP_ALIASES: Record<string, string> = {
  unisex: '/shop',
  footwear: '/shop/kids-footwear',
  'baby-accessories': '/shop/baby-kids-accessories',
  'kids-accessories': '/shop/baby-kids-accessories',
  bags: '/shop/baby-kids-accessories',
  makeup: '/shop/beauty',
}

export const DEFAULT_DEPARTMENTS = [
  {
    name: 'Kids Wear',
    slug: 'kids-wear',
    description: 'Boys and girls clothing from newborn to 12 years.',
    audience: 'kids' as const,
    sizeKind: 'clothing' as const,
    usesGender: true,
    usesAge: true,
    usesSize: true,
    usesHeight: true,
    usesColor: true,
    usesBrand: false,
    usesBagType: false,
    usesProductKind: false,
    usesSkinType: false,
    showInNavigation: true,
    storefrontVisible: true,
    sortOrder: 10,
  },
  {
    name: 'Baby & Kids Accessories',
    slug: 'baby-kids-accessories',
    description: 'Caps, socks, bibs, bags, and everyday extras. Newborn to 12 years.',
    audience: 'kids' as const,
    sizeKind: 'clothing' as const,
    usesGender: true,
    usesAge: true,
    usesSize: false,
    usesHeight: false,
    usesColor: true,
    usesBrand: false,
    usesBagType: false,
    usesProductKind: false,
    usesSkinType: false,
    showInNavigation: true,
    storefrontVisible: true,
    sortOrder: 20,
  },
  {
    name: 'Kids Footwear',
    slug: 'kids-footwear',
    description: 'Baby shoes, sandals, sneakers, and school shoes. Newborn to 12 years.',
    audience: 'kids' as const,
    sizeKind: 'footwear' as const,
    usesGender: true,
    usesAge: true,
    usesSize: true,
    usesHeight: false,
    usesColor: true,
    usesBrand: false,
    usesBagType: false,
    usesProductKind: false,
    usesSkinType: false,
    showInNavigation: true,
    storefrontVisible: true,
    sortOrder: 30,
  },
  {
    name: "Women's",
    slug: 'womens',
    description: 'Handbags, makeup, skincare, and perfumes for women.',
    audience: 'women' as const,
    sizeKind: 'none' as const,
    usesGender: false,
    usesAge: false,
    usesSize: false,
    usesHeight: false,
    usesColor: true,
    usesBrand: true,
    usesBagType: false,
    usesProductKind: false,
    usesSkinType: false,
    showInNavigation: true,
    storefrontVisible: true,
    sortOrder: 35,
  },
  {
    name: "Women's Handbags",
    slug: 'womens-handbags',
    description: 'Handbags for women. Cash on delivery across Pakistan.',
    audience: 'women' as const,
    sizeKind: 'none' as const,
    usesGender: false,
    usesAge: false,
    usesSize: false,
    usesHeight: false,
    usesColor: true,
    usesBrand: true,
    usesBagType: true,
    usesProductKind: false,
    usesSkinType: false,
    showInNavigation: false,
    storefrontVisible: true,
    sortOrder: 40,
  },
  {
    name: "Women's Beauty",
    slug: 'womens-beauty',
    description: 'Makeup for women. Cash on delivery across Pakistan.',
    audience: 'women' as const,
    sizeKind: 'none' as const,
    usesGender: false,
    usesAge: false,
    usesSize: false,
    usesHeight: false,
    usesColor: true,
    usesBrand: true,
    usesBagType: false,
    usesProductKind: true,
    usesSkinType: false,
    showInNavigation: false,
    storefrontVisible: true,
    sortOrder: 50,
  },
  {
    name: "Women's Skincare",
    slug: 'womens-skincare',
    description: 'Skincare for women. Cash on delivery across Pakistan.',
    audience: 'women' as const,
    sizeKind: 'none' as const,
    usesGender: false,
    usesAge: false,
    usesSize: false,
    usesHeight: false,
    usesColor: false,
    usesBrand: true,
    usesBagType: false,
    usesProductKind: true,
    usesSkinType: true,
    showInNavigation: false,
    storefrontVisible: true,
    sortOrder: 60,
  },
  {
    name: "Women's Perfumes",
    slug: 'womens-perfumes',
    description: 'Perfumes and mists for women. Cash on delivery across Pakistan.',
    audience: 'women' as const,
    sizeKind: 'none' as const,
    usesGender: false,
    usesAge: false,
    usesSize: false,
    usesHeight: false,
    usesColor: false,
    usesBrand: true,
    usesBagType: false,
    usesProductKind: true,
    usesSkinType: false,
    showInNavigation: false,
    storefrontVisible: true,
    sortOrder: 70,
  },
]

export const DEFAULT_TAXONOMY_CATEGORIES = [
  {
    name: "Women's",
    slug: 'womens',
    description: 'Handbags, makeup, skincare, and perfumes. Cash on delivery across Pakistan.',
    department: 'womens',
    showInNavigation: true,
    sortOrder: 40,
    active: true,
  },
  {
    name: 'Handbags',
    slug: 'handbags',
    description: 'Handbags, totes, crossbody bags, and clutches for women.',
    department: 'womens-handbags',
    parent: 'womens',
    showInNavigation: false,
    sortOrder: 41,
    active: true,
  },
  {
    name: 'Beauty & Personal Care',
    slug: 'beauty-care',
    description: 'Makeup, skincare, and perfumes for women.',
    department: 'womens',
    parent: 'womens',
    showInNavigation: false,
    sortOrder: 42,
    active: true,
  },
  {
    name: 'Makeup',
    slug: 'beauty',
    description: 'Makeup for women. Existing /shop/beauty URLs stay the same.',
    department: 'womens-beauty',
    parent: 'beauty-care',
    showInNavigation: false,
    sortOrder: 43,
    active: true,
  },
  {
    name: 'Skincare',
    slug: 'skincare',
    description: 'Skincare for women.',
    department: 'womens-skincare',
    parent: 'beauty-care',
    showInNavigation: false,
    sortOrder: 44,
    active: true,
  },
  {
    name: 'Perfumes',
    slug: 'perfumes',
    description: 'Perfumes, mists, and fragrance oils for women.',
    department: 'womens-perfumes',
    parent: 'beauty-care',
    showInNavigation: false,
    sortOrder: 45,
    active: true,
  },
  {
    name: 'Hair Care',
    slug: 'hair-care',
    description: 'Shampoo, oils, and styling. Hidden until you tick Active.',
    department: 'womens-beauty',
    parent: 'beauty-care',
    showInNavigation: false,
    sortOrder: 46,
    active: false,
  },
  {
    name: 'Body Care',
    slug: 'body-care',
    description: 'Body lotion, wash, and scrubs. Hidden until you tick Active.',
    department: 'womens-skincare',
    parent: 'beauty-care',
    showInNavigation: false,
    sortOrder: 47,
    active: false,
  },
  {
    name: 'Beauty Tools',
    slug: 'beauty-tools',
    description: 'Brushes and tools. Hidden until you tick Active.',
    department: 'womens-beauty',
    parent: 'beauty-care',
    showInNavigation: false,
    sortOrder: 48,
    active: false,
  },
  {
    name: 'Baby & Kids Accessories',
    slug: 'baby-kids-accessories',
    description: 'Caps, hats, socks, hair extras, bibs, and little bags. Cash on delivery across Pakistan.',
    department: 'baby-kids-accessories',
    showInNavigation: true,
    sortOrder: 20,
    active: true,
  },
  {
    name: 'Kids Footwear',
    slug: 'kids-footwear',
    description: 'Soft shoes and sandals for little feet. Cash on delivery across Pakistan.',
    department: 'kids-footwear',
    showInNavigation: true,
    sortOrder: 30,
    active: true,
  },
]

export function mentionsUnisex(value?: string | null) {
  return Boolean(value && /unisex/i.test(value))
}

export function stripUnisexCopy(value?: string | null) {
  if (!value) return value || ''
  return value
    .replace(/\s*[·•|,/\-]\s*Unisex\b/gi, '')
    .replace(/\bUnisex\s*[·•|,/\-]\s*/gi, '')
    .replace(/\bUnisex\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+·\s+·/g, ' · ')
    .trim()
}

export function isUnisexPublicItem(item: { title?: string | null; name?: string | null; href?: string | null; slug?: string | null; label?: string | null }) {
  const slug = item.slug || ''
  const href = item.href || ''
  return (
    slug === 'unisex' ||
    href.includes('/unisex') ||
    mentionsUnisex(item.title) ||
    mentionsUnisex(item.name) ||
    mentionsUnisex(item.label)
  )
}

export function publicGenderLabel(value?: string | null) {
  if (value === 'boys') return 'Boys'
  if (value === 'girls') return 'Girls'
  return null
}

export function genderMatchesQuery(productGender: string | null | undefined, queryGender?: string) {
  if (!queryGender) return true
  if (productGender === queryGender) return true
  if (queryGender === 'boys' || queryGender === 'girls') return productGender === 'unisex'
  return false
}

export function flagsFromDepartment(doc: {
  usesGender?: boolean | null
  usesAge?: boolean | null
  usesSize?: boolean | null
  usesHeight?: boolean | null
  usesColor?: boolean | null
  usesBrand?: boolean | null
  usesBagType?: boolean | null
  usesProductKind?: boolean | null
  usesSkinType?: boolean | null
} | null): FilterFlags {
  if (!doc) return DEFAULT_KIDS_FILTERS
  return {
    gender: Boolean(doc.usesGender),
    age: Boolean(doc.usesAge),
    size: Boolean(doc.usesSize),
    height: Boolean(doc.usesHeight),
    color: Boolean(doc.usesColor),
    brand: Boolean(doc.usesBrand),
    bagType: Boolean(doc.usesBagType),
    productKind: Boolean(doc.usesProductKind),
    skinType: Boolean(doc.usesSkinType),
    material: Boolean(doc.usesBagType),
    pattern: false,
    finish: false,
    skinTone: false,
    skinConcern: false,
    fragranceFamily: false,
    fragranceType: false,
    volume: false,
    spf: false,
  }
}

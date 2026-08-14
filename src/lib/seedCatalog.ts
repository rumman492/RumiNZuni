import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'
import { seedSizingAndAccessories } from '@/lib/seedSizing'
import { extraSamplesByCategory, MIN_SAMPLE_PRODUCTS } from '@/lib/seedSamples'

const seedMediaDir = path.resolve(process.cwd(), 'seed/media')

function numericId(id: string | number) {
  return typeof id === 'number' ? id : Number(id)
}

async function resolveSeedImage(filename: string) {
  const preferred = path.join(seedMediaDir, filename)
  if (fs.existsSync(preferred)) return filename
  const fallbacks = [
    'womens-sage-tote.jpg',
    'womens-coral-crossbody.jpg',
    'womens-blush-clutch.jpg',
    'womens-lipstick-compact.jpg',
    'womens-mascara-brush.jpg',
    'womens-kohl-gloss.jpg',
    'womens-face-cream.jpg',
    'womens-cleanser.jpg',
    'womens-serum.jpg',
  ]
  for (const name of fallbacks) {
    if (fs.existsSync(path.join(seedMediaDir, name))) return name
  }
  throw new Error(`Missing seed image: ${preferred}`)
}

async function upsertMedia(payload: Payload, filename: string, alt: string) {
  const file = await resolveSeedImage(filename)
  const found = await payload.find({
    collection: 'media',
    where: { filename: { equals: file } },
    limit: 1,
  })
  if (found.docs[0]) return numericId(found.docs[0].id)

  const filePath = path.join(seedMediaDir, file)
  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    filePath,
    overrideAccess: true,
  })
  payload.logger.info(`Uploaded ${file}`)
  return numericId(doc.id)
}

function hasImages(product: { images?: Array<{ image?: unknown }> | null }) {
  return Boolean(product.images?.some((row) => row.image))
}

type SeedProduct = {
  title: string
  slug: string
  description: string
  category: number
  gender?: 'boys' | 'girls' | 'unisex'
  ageGroup?: number
  department?: number
  brand?: string
  bagType?: string
  productKind?: string
  skinType?: string
  ingredients?: string
  volume?: string
  fragranceType?: string
  fragranceFamily?: string
  dimensions?: string
  featured?: boolean
  material?: string
  careInstructions?: string
  sortPriority?: number
  tags?: number[]
  sizeGuide?: number
  seo?: { title?: string; description?: string }
  imageFile: string
  imageAlt: string
  variants: Array<{
    sku: string
    size: string
    color: string
    price: number
    compareAtPrice?: number
    stock: number
  }>
}

async function upsertSeedProducts(payload: Payload, products: SeedProduct[]) {
  const productIds: number[] = []
  const featuredIds: number[] = []

  for (const product of products) {
    try {
    const { imageFile, imageAlt, ...data } = product
    if (!product.category) continue
    const imageId = await upsertMedia(payload, imageFile, imageAlt)
    const images = [{ image: imageId }]
    const found = await payload.find({
      collection: 'products',
      where: { slug: { equals: product.slug } },
      limit: 1,
      overrideAccess: true,
      draft: true,
    })

    if (found.totalDocs === 0) {
      const created = await payload.create({
        collection: 'products',
        data: {
          ...data,
          images,
          _status: 'published',
        } as never,
        draft: false,
        overrideAccess: true,
      })
      productIds.push(numericId(created.id))
      if (product.featured) featuredIds.push(numericId(created.id))
      payload.logger.info(`Created product ${product.title}`)
      continue
    }

    const existing = found.docs[0]
    productIds.push(numericId(existing.id))
    if (product.featured) featuredIds.push(numericId(existing.id))

    if (!hasImages(existing) || existing._status !== 'published') {
      await payload.update({
        collection: 'products',
        id: existing.id,
        data: {
          ...(hasImages(existing) ? {} : { images }),
          _status: 'published',
        },
        draft: false,
        overrideAccess: true,
      })
      payload.logger.info(`Updated sample ${product.title}`)
    }
    } catch (error) {
      payload.logger.error(
        error instanceof Error ? `Sample ${product.slug}: ${error.message}` : `Sample ${product.slug} failed.`,
      )
    }
  }

  return { productIds, featuredIds }
}

const PLACEHOLDER =
  'Sample placeholder — replace this with your own product, photos, and price in Admin → Products.'

function accessorySampleProducts(
  categories: Record<string, number>,
  ageGroupIds: Record<string, number>,
  tags: Record<string, number>,
): SeedProduct[] {
  const extras = [tags.everyday].filter(Boolean)
  return [
    {
      title: 'Cotton bib & hat set',
      slug: 'cotton-bib-hat-set',
      description: `Soft cotton bib with a matching knotted hat for milky days and sunny walks. ${PLACEHOLDER}`,
      category: categories['baby-kids-accessories'],
      ageGroup: ageGroupIds.baby,
      material: 'Cotton jersey',
      careInstructions: 'Machine wash cold. Do not bleach. Dry in shade.',
      sortPriority: 10,
      tags: extras,
      imageFile: 'cotton-baby-bib-set.jpg',
      imageAlt: 'Cream and sage cotton baby bib with knotted hat',
      seo: {
        title: 'Cotton bib and hat set for babies',
        description: 'Sample baby accessory set. Cash on delivery across Pakistan. Replace in admin when your stock is ready.',
      },
      variants: [
        { sku: 'RNZ-BIB-03-CRM', size: '0-3m', color: 'Cream', price: 890, stock: 12 },
        { sku: 'RNZ-BIB-36-SGE', size: '3-6m', color: 'Sage', price: 890, stock: 10 },
        { sku: 'RNZ-BIB-69-CRM', size: '6-9m', color: 'Cream', price: 990, stock: 8 },
      ],
    },
    {
      title: 'Mitts & burp cloth',
      slug: 'mitts-burp-cloth',
      description: `Scratch mitts plus a muslin burp cloth for newborn days. ${PLACEHOLDER}`,
      category: categories['baby-kids-accessories'],
      ageGroup: ageGroupIds.newborn,
      material: 'Cotton muslin',
      sortPriority: 8,
      tags: extras,
      imageFile: 'baby-mitts-burp-cloth.jpg',
      imageAlt: 'Ivory baby mitts and blush muslin burp cloth',
      variants: [
        { sku: 'RNZ-MTS-NB-IVR', size: 'newborn', color: 'Ivory', price: 690, stock: 14 },
        { sku: 'RNZ-MTS-03-BSH', size: '0-3m', color: 'Blush', price: 690, stock: 12 },
      ],
    },
    {
      title: 'Hair bow set',
      slug: 'kids-hair-bow-set',
      description: `Soft fabric bows and a scrunchie for school and Eid. ${PLACEHOLDER}`,
      category: categories['baby-kids-accessories'],
      gender: 'girls',
      ageGroup: ageGroupIds['little-kids'],
      sortPriority: 10,
      tags: extras,
      imageFile: 'kids-hair-bow-set.jpg',
      imageAlt: 'Coral hair bow and sage scrunchie for kids',
      variants: [
        { sku: 'RNZ-BOW-3Y-CRL', size: '3y', color: 'Coral', price: 590, stock: 16 },
        { sku: 'RNZ-BOW-5Y-SGE', size: '5y', color: 'Sage', price: 590, stock: 14 },
      ],
    },
    {
      title: 'Kids sun hat',
      slug: 'kids-sun-hat',
      description: `Light brim hat for park days and school pickup. ${PLACEHOLDER}`,
      category: categories['baby-kids-accessories'],
      ageGroup: ageGroupIds.kids,
      sortPriority: 8,
      tags: extras,
      imageFile: 'kids-sun-hat.jpg',
      imageAlt: 'Navy and cream kids sun hat',
      variants: [
        { sku: 'RNZ-HAT-4Y-NVY', size: '4y', color: 'Navy', price: 1290, stock: 9 },
        { sku: 'RNZ-HAT-6Y-CRM', size: '6y', color: 'Cream', price: 1290, stock: 8 },
        { sku: 'RNZ-HAT-78-NVY', size: '7-8y', color: 'Navy', price: 1390, stock: 6 },
      ],
    },
    {
      title: 'Canvas sneakers',
      slug: 'kids-canvas-sneakers',
      description: `Everyday canvas shoes with an easy strap. ${PLACEHOLDER}`,
      category: categories['kids-footwear'],
      ageGroup: ageGroupIds['little-kids'],
      sortPriority: 10,
      tags: extras,
      imageFile: 'kids-canvas-sneakers.jpg',
      imageAlt: 'Coral and cream kids canvas sneakers',
      variants: [
        { sku: 'RNZ-SNK-4Y-CRL', size: 'eu-24', color: 'Coral', price: 2190, stock: 8 },
        { sku: 'RNZ-SNK-5Y-CRM', size: 'eu-26', color: 'Cream', price: 2190, stock: 8 },
        { sku: 'RNZ-SNK-6Y-CRL', size: 'eu-28', color: 'Coral', price: 2290, stock: 6 },
      ],
    },
    {
      title: 'Soft sandals',
      slug: 'kids-soft-sandals',
      description: `Breathable sandals for warm Pakistani weather. ${PLACEHOLDER}`,
      category: categories['kids-footwear'],
      ageGroup: ageGroupIds.toddler,
      sortPriority: 8,
      tags: extras,
      imageFile: 'kids-soft-sandals.jpg',
      imageAlt: 'Sage kids sandals on a cream background',
      variants: [
        { sku: 'RNZ-SND-2Y-SGE', size: 'eu-20', color: 'Sage', price: 1890, stock: 10 },
        { sku: 'RNZ-SND-3Y-SGE', size: 'eu-22', color: 'Sage', price: 1890, stock: 9 },
        { sku: 'RNZ-SND-4Y-CRM', size: 'eu-24', color: 'Cream', price: 1990, stock: 7 },
      ],
    },
    {
      title: 'School backpack',
      slug: 'kids-school-backpack',
      description: `Small backpack for books, water, and snacks. ${PLACEHOLDER}`,
      category: categories['baby-kids-accessories'],
      ageGroup: ageGroupIds.kids,
      sortPriority: 10,
      tags: extras,
      imageFile: 'kids-school-backpack.jpg',
      imageAlt: 'Navy kids school backpack with coral zipper',
      variants: [
        { sku: 'RNZ-BAG-5Y-NVY', size: '5y', color: 'Navy', price: 2490, stock: 7 },
        { sku: 'RNZ-BAG-78-NVY', size: '7-8y', color: 'Navy', price: 2690, stock: 6 },
      ],
    },
    {
      title: 'Canvas tote',
      slug: 'kids-canvas-tote',
      description: `Little tote for daycare extras and weekend outings. ${PLACEHOLDER}`,
      category: categories['baby-kids-accessories'],
      gender: 'girls',
      ageGroup: ageGroupIds['little-kids'],
      sortPriority: 8,
      tags: extras,
      imageFile: 'kids-canvas-tote.jpg',
      imageAlt: 'Blush canvas kids tote with sage straps',
      variants: [
        { sku: 'RNZ-TOT-3Y-BSH', size: '3y', color: 'Blush', price: 1590, stock: 8 },
        { sku: 'RNZ-TOT-5Y-BSH', size: '5y', color: 'Blush', price: 1590, stock: 7 },
      ],
    },
    {
      title: 'Gentle baby lotion set',
      slug: 'gentle-baby-lotion-set',
      description: `Mild lotion and soap for after-bath care. ${PLACEHOLDER}`,
      category: categories['baby-kids-accessories'],
      ageGroup: ageGroupIds.baby,
      material: 'Fragrance-light care (sample)',
      careInstructions: 'For external use. Patch-test first. Keep out of eyes.',
      sortPriority: 10,
      tags: extras,
      imageFile: 'gentle-baby-lotion-set.jpg',
      imageAlt: 'Gentle baby lotion bottle and soap bar sample',
      variants: [
        { sku: 'RNZ-LOT-BB-CRM', size: '3-6m', color: 'Cream', price: 990, stock: 12 },
        { sku: 'RNZ-LOT-BB-SGE', size: '9-12m', color: 'Sage', price: 990, stock: 10 },
      ],
    },
    {
      title: 'Kids lip balm & brush',
      slug: 'kids-lip-balm-brush',
      description: `A small lip balm tin and a soft hairbrush. ${PLACEHOLDER}`,
      category: categories['baby-kids-accessories'],
      ageGroup: ageGroupIds['little-kids'],
      sortPriority: 8,
      tags: extras,
      imageFile: 'kids-lip-balm-brush.jpg',
      imageAlt: 'Kids lip balm tin and wooden hairbrush',
      variants: [
        { sku: 'RNZ-BLM-3Y-PNK', size: '3y', color: 'Blush', price: 790, stock: 14 },
        { sku: 'RNZ-BLM-6Y-CRM', size: '6y', color: 'Cream', price: 790, stock: 12 },
      ],
    },
  ].filter((product) => Boolean(product.category)) as SeedProduct[]
}

export async function seedMissingAccessoryProducts(payload: Payload) {
  if (!fs.existsSync(seedMediaDir)) {
    throw new Error(`Seed photos folder is missing: ${seedMediaDir}`)
  }

  const ageGroupIds = await seedSizingAndAccessories(payload)
  const accessorySlugs = ['baby-kids-accessories', 'kids-footwear']
  const categories: Record<string, number> = {}
  for (const slug of accessorySlugs) {
    const found = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (found.docs[0]) categories[slug] = numericId(found.docs[0].id)
  }

  const tags: Record<string, number> = {}
  const foundTag = await payload.find({
    collection: 'tags',
    where: { slug: { equals: 'everyday' } },
    limit: 1,
    overrideAccess: true,
  })
  if (foundTag.docs[0]) tags.everyday = numericId(foundTag.docs[0].id)

  const products = accessorySampleProducts(categories, ageGroupIds, tags)
  const { productIds } = await upsertSeedProducts(payload, products)
  payload.logger.info(`Accessory samples ready. ${productIds.length} products in extras, footwear, bags, and beauty.`)
}

async function loadSeedContext(payload: Payload) {
  const ageGroupIds = await seedSizingAndAccessories(payload)
  const slugs = [
    'boys',
    'girls',
    'newborn',
    'baby-kids-accessories',
    'kids-footwear',
    'handbags',
    'beauty',
    'skincare',
    'perfumes',
  ]
  const categories: Record<string, number> = {}
  for (const slug of slugs) {
    const found = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (found.docs[0]) categories[slug] = numericId(found.docs[0].id)
  }
  const tags: Record<string, number> = {}
  const foundTag = await payload.find({
    collection: 'tags',
    where: { slug: { equals: 'everyday' } },
    limit: 1,
    overrideAccess: true,
  })
  if (foundTag.docs[0]) tags.everyday = numericId(foundTag.docs[0].id)
  const departments: Record<string, number> = {}
  const foundDepartments = await payload.find({
    collection: 'departments',
    limit: 20,
    overrideAccess: true,
  })
  for (const doc of foundDepartments.docs) {
    departments[doc.slug] = numericId(doc.id)
  }
  return { categories, ageGroupIds, tags, departments }
}

export async function seedMissingCategorySamples(payload: Payload) {
  if (!fs.existsSync(seedMediaDir)) {
    throw new Error(`Seed photos folder is missing: ${seedMediaDir}`)
  }
  const ctx = await loadSeedContext(payload)
  const pools = extraSamplesByCategory(ctx)
  const alwaysFill = new Set(['handbags', 'beauty', 'skincare', 'perfumes'])
  for (const [slug, extras] of Object.entries(pools)) {
    const categoryId = ctx.categories[slug]
    if (!categoryId) continue
    const existing = await payload.find({
      collection: 'products',
      where: { category: { equals: categoryId } },
      limit: 0,
      overrideAccess: true,
    })
    const fillAll = alwaysFill.has(slug)
    if (!fillAll && existing.totalDocs >= MIN_SAMPLE_PRODUCTS) {
      payload.logger.info(`${slug} already has ${existing.totalDocs} products — skipping samples.`)
      continue
    }
    let need = fillAll ? extras.length : MIN_SAMPLE_PRODUCTS - existing.totalDocs
    const toCreate = []
    for (const item of extras) {
      if (need <= 0) break
      if (!item.category) continue
      const found = await payload.find({
        collection: 'products',
        where: { slug: { equals: item.slug } },
        limit: 1,
        overrideAccess: true,
        draft: true,
      })
      if (found.totalDocs > 0) continue
      toCreate.push(item)
      need -= 1
    }
    if (toCreate.length === 0) continue
    await upsertSeedProducts(payload, toCreate as SeedProduct[])
    payload.logger.info(`Added ${toCreate.length} sample products to ${slug}.`)
  }
  await attachMissingCategoryImages(payload, ctx.categories)
}

const WOMEN_SAMPLE_CATEGORIES = ['handbags', 'beauty', 'skincare', 'perfumes'] as const

/** Always safe to call. Creates missing Women’s sample SKUs with photos; does not delete or republish staff edits. */
export async function seedWomensPicturedSamples(payload: Payload) {
  if (!fs.existsSync(seedMediaDir)) {
    payload.logger.error(`Seed photos folder is missing: ${seedMediaDir}`)
    return
  }
  const ctx = await loadSeedContext(payload)
  const pools = extraSamplesByCategory(ctx)
  for (const slug of WOMEN_SAMPLE_CATEGORIES) {
    const extras = pools[slug] || []
    const categoryId = ctx.categories[slug]
    if (!categoryId || extras.length === 0) {
      payload.logger.error(`Women’s samples skipped for ${slug}: category missing.`)
      continue
    }
    const toCreate = extras.filter((item) => item.category)
    await upsertSeedProducts(payload, toCreate as SeedProduct[])
  }
  const womenCats = Object.fromEntries(WOMEN_SAMPLE_CATEGORIES.map((slug) => [slug, ctx.categories[slug]]).filter(([, id]) => id))
  await attachMissingCategoryImages(payload, womenCats)
  payload.logger.info('Women’s pictured samples are ready.')
}

const CATEGORY_PLACEHOLDER_IMAGES: Record<string, Array<{ file: string; alt: string }>> = {
  handbags: [
    { file: 'womens-sage-tote.jpg', alt: 'Sage tote bag' },
    { file: 'womens-coral-crossbody.jpg', alt: 'Coral crossbody bag' },
    { file: 'womens-blush-clutch.jpg', alt: 'Blush clutch bag' },
    { file: 'womens-navy-satchel.jpg', alt: 'Navy satchel bag' },
    { file: 'womens-mini-backpack.jpg', alt: 'Mini backpack bag' },
    { file: 'womens-ivory-shoulder.jpg', alt: 'Ivory shoulder bag' },
  ],
  beauty: [
    { file: 'womens-lipstick-compact.jpg', alt: 'Lipstick and compact' },
    { file: 'womens-mascara-brush.jpg', alt: 'Mascara and brush' },
    { file: 'womens-kohl-gloss.jpg', alt: 'Kohl and lip gloss' },
  ],
  skincare: [
    { file: 'womens-face-cream.jpg', alt: 'Face cream' },
    { file: 'womens-cleanser.jpg', alt: 'Cleanser bottle' },
    { file: 'womens-serum.jpg', alt: 'Serum bottle' },
  ],
  perfumes: [
    { file: 'womens-floral-edp.jpg', alt: 'Floral eau de parfum' },
    { file: 'womens-citrus-mist.jpg', alt: 'Citrus body mist' },
    { file: 'womens-amber-oil.jpg', alt: 'Amber perfume oil' },
    { file: 'womens-woody-edt.jpg', alt: 'Woody eau de toilette' },
    { file: 'womens-musk-edp.jpg', alt: 'Musk eau de parfum' },
    { file: 'womens-rose-mist.jpg', alt: 'Rose body mist' },
  ],
}

async function attachMissingCategoryImages(payload: Payload, categories: Record<string, number>) {
  for (const [slug, files] of Object.entries(CATEGORY_PLACEHOLDER_IMAGES)) {
    const categoryId = categories[slug]
    if (!categoryId) continue
    const products = await payload.find({
      collection: 'products',
      where: { category: { equals: categoryId } },
      limit: 50,
      overrideAccess: true,
      draft: true,
    })
    let index = 0
    for (const product of products.docs) {
      if (hasImages(product)) continue
      const pick = files[index % files.length]
      const imageId = await upsertMedia(payload, pick.file, pick.alt)
      await payload.update({
        collection: 'products',
        id: product.id,
        data: { images: [{ image: imageId }] },
        overrideAccess: true,
      })
      payload.logger.info(`Added sample photo to ${product.title}`)
      index += 1
    }
  }
}

export async function seedCatalogIfEmpty(payload: Payload) {
  await seedSizingAndAccessories(payload)
  const existing = await payload.find({
    collection: 'products',
    limit: 1,
    overrideAccess: true,
  })
  if (existing.totalDocs > 0) {
    payload.logger.info('Catalog already has products — filling shop categories that have fewer than 9 items.')
    await seedMissingAccessoryProducts(payload)
    await seedMissingCategorySamples(payload)
    return
  }
  await seedCatalog(payload)
  await seedMissingCategorySamples(payload)
}

export async function seedCatalog(payload: Payload) {
  if (!fs.existsSync(seedMediaDir)) {
    throw new Error(`Seed photos folder is missing: ${seedMediaDir}`)
  }

  const ageGroupIds = await seedSizingAndAccessories(payload)

  const categoryData = [
    { name: 'Boys', slug: 'boys', description: 'Everyday wear for boys' },
    { name: 'Girls', slug: 'girls', description: 'Frocks, sets, and play outfits' },
    { name: 'Newborn', slug: 'newborn', description: 'First outfits and sleepsuits' },
    { name: 'Unisex', slug: 'unisex', description: 'Legacy category — hidden from the shop. Existing products stay here until you recategorise them.' },
  ]

  const categories: Record<string, number> = {}
  for (const item of categoryData) {
    const found = await payload.find({
      collection: 'categories',
      where: { slug: { equals: item.slug } },
      limit: 1,
      overrideAccess: true,
    })
    const doc =
      found.docs[0] ||
      (await payload.create({
        collection: 'categories',
        data: item,
        overrideAccess: true,
      }))
    categories[item.slug] = numericId(doc.id)
  }
  for (const slug of ['baby-kids-accessories', 'kids-footwear', 'womens', 'handbags', 'beauty', 'skincare', 'perfumes', 'beauty-care']) {
    const found = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (found.docs[0]) categories[slug] = numericId(found.docs[0].id)
  }

  const courierData = [
    { name: 'Shop rider', slug: 'rider', provider: 'rider' as const, active: true },
    { name: 'TCS', slug: 'tcs', provider: 'tcs' as const, active: true },
    { name: 'Leopards', slug: 'leopard', provider: 'leopard' as const, active: true },
    { name: 'Trax', slug: 'trax', provider: 'trax' as const, active: true },
    { name: 'PostEx', slug: 'postex', provider: 'postex' as const, active: true },
  ]

  for (const courier of courierData) {
    const found = await payload.find({
      collection: 'couriers',
      where: { slug: { equals: courier.slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (found.totalDocs === 0) {
      await payload.create({
        collection: 'couriers',
        data: courier,
        overrideAccess: true,
      })
      payload.logger.info(`Created courier ${courier.name}`)
    }
  }

  const tagData = [
    { name: 'Cotton', slug: 'cotton' },
    { name: 'Everyday', slug: 'everyday' },
    { name: 'Eid', slug: 'eid' },
    { name: 'Newborn', slug: 'newborn' },
  ]
  const tags: Record<string, number> = {}
  for (const tag of tagData) {
    const found = await payload.find({
      collection: 'tags',
      where: { slug: { equals: tag.slug } },
      limit: 1,
      overrideAccess: true,
    })
    const doc =
      found.docs[0] ||
      (await payload.create({
        collection: 'tags',
        data: { ...tag, active: true },
        overrideAccess: true,
      }))
    tags[tag.slug] = numericId(doc.id)
    if (found.totalDocs === 0) payload.logger.info(`Created tag ${tag.name}`)
  }

  const foundGuide = await payload.find({
    collection: 'size-guides',
    where: { slug: { equals: 'newborn-infant' } },
    limit: 1,
    overrideAccess: true,
  })
  const newbornGuide =
    foundGuide.docs[0] ||
    (await payload.create({
      collection: 'size-guides',
      data: {
        title: 'Newborn & infant',
        slug: 'newborn-infant',
        description: 'Measure chest around the fullest part. If between sizes, choose the larger one.',
        measurements: [
          { size: 'newborn', age: 'Newborn', chest: '40 cm', length: '48 cm' },
          { size: '0-3m', age: '0–3 months', chest: '42 cm', length: '52 cm' },
          { size: '3-6m', age: '3–6 months', chest: '44 cm', length: '56 cm' },
          { size: '6-9m', age: '6–9 months', chest: '46 cm', length: '60 cm' },
        ],
        notes: 'Cotton knits relax slightly after the first wash.',
      },
      overrideAccess: true,
    }))
  if (foundGuide.totalDocs === 0) payload.logger.info('Created size guide Newborn & infant')

  const products: SeedProduct[] = [
    {
      title: 'Cotton romper set',
      slug: 'cotton-romper-set',
      description: 'Two-piece cotton romper with envelope neck — easy changes for newborns.',
      category: categories.newborn,
      ageGroup: ageGroupIds.newborn,
      featured: true,
      material: '100% cotton jersey',
      careInstructions: 'Machine wash cold. Do not bleach. Dry in shade.',
      sortPriority: 20,
      tags: [tags.cotton, tags.newborn],
      sizeGuide: numericId(newbornGuide.id),
      imageFile: 'cotton-romper-set.jpg',
      imageAlt: 'Cream and sage cotton romper set for newborns',
      seo: {
        title: 'Cotton romper set for newborns',
        description: 'Soft cotton romper set for easy newborn changes. Cash on delivery across Pakistan.',
      },
      variants: [
        { sku: 'RNZ-RMP-NB-CRM', size: 'newborn', color: 'Cream', price: 1890, compareAtPrice: 2190, stock: 12 },
        { sku: 'RNZ-RMP-03-CRM', size: '0-3m', color: 'Cream', price: 1890, stock: 10 },
        { sku: 'RNZ-RMP-36-SGE', size: '3-6m', color: 'Sage', price: 1990, stock: 8 },
      ],
    },
    {
      title: 'Printed lawn frock',
      slug: 'printed-lawn-frock',
      description: 'Airy lawn frock with a soft lining. Made for warm days and Eid mornings.',
      category: categories.girls,
      gender: 'girls' as const,
      ageGroup: ageGroupIds['little-kids'],
      sortPriority: 18,
      tags: [tags.eid, tags.everyday],
      imageFile: 'printed-lawn-frock.jpg',
      imageAlt: 'Blush printed lawn frock for girls',
      variants: [
        { sku: 'RNZ-FRK-3Y-PNK', size: '3y', color: 'Blush', price: 2490, compareAtPrice: 2890, stock: 9 },
        { sku: 'RNZ-FRK-4Y-PNK', size: '4y', color: 'Blush', price: 2490, stock: 7 },
        { sku: 'RNZ-FRK-5Y-BLU', size: '5y', color: 'Sky', price: 2690, stock: 6 },
      ],
    },
    {
      title: 'Pique polo shirt',
      slug: 'pique-polo-shirt',
      description: 'Classic polo in breathable pique cotton. Pair with shorts for school and play.',
      category: categories.boys,
      gender: 'boys' as const,
      ageGroup: ageGroupIds['little-kids'],
      sortPriority: 16,
      tags: [tags.cotton, tags.everyday],
      imageFile: 'pique-polo-shirt.jpg',
      imageAlt: 'Navy cotton pique polo shirt for boys',
      variants: [
        { sku: 'RNZ-PLO-4Y-NVY', size: '4y', color: 'Navy', price: 1690, stock: 14 },
        { sku: 'RNZ-PLO-5Y-NVY', size: '5y', color: 'Navy', price: 1690, stock: 11 },
        { sku: 'RNZ-PLO-6Y-WHT', size: '6y', color: 'White', price: 1690, stock: 9 },
      ],
    },
    {
      title: 'Knit hoodie',
      slug: 'knit-hoodie',
      description: 'Light hoodie for AC rooms and winter mornings. Soft fleece inside.',
      category: categories.unisex,
      ageGroup: ageGroupIds.kids,
      imageFile: 'knit-hoodie.jpg',
      imageAlt: 'Heather grey kids knit hoodie',
      variants: [
        { sku: 'RNZ-HOD-3Y-GRY', size: '3y', color: 'Heather grey', price: 2290, stock: 8 },
        { sku: 'RNZ-HOD-5Y-GRY', size: '5y', color: 'Heather grey', price: 2490, stock: 8 },
        { sku: 'RNZ-HOD-7Y-CRL', size: '7-8y', color: 'Coral', price: 2690, stock: 5 },
      ],
    },
    {
      title: 'Two-piece linen suit',
      slug: 'two-piece-linen-suit',
      description: 'Shirt and trouser set in airy linen-look fabric. Smart enough for family dinners.',
      category: categories.boys,
      gender: 'boys' as const,
      ageGroup: ageGroupIds.toddler,
      imageFile: 'two-piece-linen-suit.jpg',
      imageAlt: 'Beige two-piece linen-look suit for boys',
      variants: [
        { sku: 'RNZ-SUT-2Y-BGE', size: '2y', color: 'Beige', price: 3290, stock: 6 },
        { sku: 'RNZ-SUT-3Y-BGE', size: '3y', color: 'Beige', price: 3290, stock: 6 },
        { sku: 'RNZ-SUT-4Y-OLV', size: '4y', color: 'Olive', price: 3490, stock: 4 },
      ],
    },
    {
      title: 'Zip sleepsuit',
      slug: 'zip-sleepsuit',
      description: 'Full-zip sleepsuit so you are not fumbling with snaps at 3am.',
      category: categories.newborn,
      ageGroup: ageGroupIds.baby,
      featured: false,
      imageFile: 'zip-sleepsuit.jpg',
      imageAlt: 'Ivory full-zip sleepsuit for infants',
      variants: [
        { sku: 'RNZ-SLP-03-IVR', size: '0-3m', color: 'Ivory', price: 1590, stock: 15 },
        { sku: 'RNZ-SLP-36-IVR', size: '3-6m', color: 'Ivory', price: 1590, stock: 12 },
        { sku: 'RNZ-SLP-69-MNT', size: '6-9m', color: 'Mint', price: 1690, stock: 7 },
      ],
    },
    {
      title: 'Girls cotton play set',
      slug: 'girls-cotton-play-set',
      description: 'Matching top and shorts for warm days. Sample placeholder — replace with your own girls styles later.',
      category: categories.girls,
      gender: 'girls' as const,
      ageGroup: ageGroupIds.toddler,
      featured: false,
      material: 'Cotton jersey',
      sortPriority: 14,
      tags: [tags.cotton, tags.everyday],
      imageFile: 'girls-play-set.jpg',
      imageAlt: 'Blush cotton two-piece play set for girls',
      variants: [
        { sku: 'RNZ-PLY-2Y-PNK', size: '2y', color: 'Blush', price: 2190, stock: 8 },
        { sku: 'RNZ-PLY-3Y-PNK', size: '3y', color: 'Blush', price: 2190, stock: 8 },
        { sku: 'RNZ-PLY-4Y-COR', size: '4y', color: 'Coral', price: 2290, stock: 6 },
      ],
    },
    {
      title: 'Cotton jersey tee',
      slug: 'cotton-jersey-tee',
      description: 'Everyday crew-neck tee in breathable cotton. Sample placeholder — replace with your own unisex basics later.',
      category: categories.unisex,
      ageGroup: ageGroupIds['little-kids'],
      sortPriority: 12,
      tags: [tags.cotton, tags.everyday],
      imageFile: 'cotton-jersey-tee.jpg',
      imageAlt: 'Cream and sage unisex cotton jersey t-shirts',
      variants: [
        { sku: 'RNZ-TEE-3Y-CRM', size: '3y', color: 'Cream', price: 1290, stock: 12 },
        { sku: 'RNZ-TEE-5Y-SGE', size: '5y', color: 'Sage', price: 1290, stock: 10 },
        { sku: 'RNZ-TEE-78-CRM', size: '7-8y', color: 'Cream', price: 1390, stock: 8 },
      ],
    },
    ...accessorySampleProducts(categories, ageGroupIds, tags),
  ]

  const { productIds, featuredIds } = await upsertSeedProducts(payload, products)

  const settingsData: Record<string, unknown> = {
    storeName: 'Rumi & Zuni',
    tagline: 'Soft clothes for little explorers',
    announcement: 'Cash on delivery across Pakistan · Free shipping over Rs 3,000',
    freeShippingThreshold: 3000,
    defaultShippingFee: 250,
    codFee: 0,
    cityShipping: [
      { city: 'Karachi', fee: 150 },
      { city: 'Lahore', fee: 200 },
      { city: 'Islamabad', fee: 200 },
      { city: 'Rawalpindi', fee: 200 },
    ],
    heroEyebrow: 'Pakistan · Cash on delivery',
    heroTitle: 'Little outfits, made for everyday play',
    heroSubtitle:
      'Breathable kids wear for Pakistani weather. Order on cash on delivery — pay when it arrives.',
    heroCta: 'Shop new arrivals',
    heroCtaLink: '/shop',
    heroSecondaryCta: 'How COD works',
    heroSecondaryCtaLink: '/shipping',
    heroOverlayTitle: 'Ages newborn – 12',
    heroOverlaySubtitle: 'Boys · Girls',
    homeCollections: [
      { title: 'Boys', copy: 'Polos, sets, and play tees', href: '/shop/boys', category: categories.boys },
      { title: 'Girls', copy: 'Frocks, two-piece sets, everyday knits', href: '/shop/girls', category: categories.girls },
      { title: 'Accessories', copy: 'Hats, bibs, bags, and extras', href: '/shop/baby-kids-accessories', category: categories['baby-kids-accessories'] },
      { title: 'Footwear', copy: 'Soft shoes and sandals', href: '/shop/kids-footwear', category: categories['kids-footwear'] },
    ],
    featuredEyebrow: 'Featured',
    featuredHeading: 'Little bestsellers',
    featuredCta: 'View all',
    featuredCtaLink: '/shop',
    homeFeaturedProducts: featuredIds,
    homePromos: [
      {
        icon: 'cod',
        title: 'Cash on delivery',
        copy: 'Pay the rider in PKR when your parcel arrives. No card needed.',
      },
      {
        icon: 'shipping',
        title: 'Pakistan-wide',
        copy: 'We ship to major cities. Free delivery over the store threshold.',
      },
      {
        icon: 'returns',
        title: 'Easy exchanges',
        copy: 'Wrong size? Message us on WhatsApp within 3 days of delivery.',
      },
    ],
    homeStoryEyebrow: 'Our story',
    homeStoryTitle: 'Clothes for play, not fuss',
    homeStoryBody:
      'Rumi & Zuni is a Pakistan kids-wear shop. Soft cotton, easy everyday fits, and cash on delivery — pay the rider when the parcel arrives.',
    homeStoryCta: 'WhatsApp us',
    homeStoryCtaLink: '/contact',
  }

  if (process.env.SEED_WHATSAPP) settingsData.whatsapp = process.env.SEED_WHATSAPP
  if (process.env.SEED_PHONE) settingsData.phone = process.env.SEED_PHONE
  if (process.env.SEED_EMAIL) settingsData.email = process.env.SEED_EMAIL

  await payload.updateGlobal({
    slug: 'site-settings',
    data: settingsData,
    overrideAccess: true,
  })

  payload.logger.info(`Seed complete. ${productIds.length} sample products with photos.`)
}

import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'
import type { Product } from '@/payload-types'

type ProductCreateData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

const seedMediaDir = path.resolve(process.cwd(), 'seed/media')

function numericId(id: string | number) {
  return typeof id === 'number' ? id : Number(id)
}

async function upsertMedia(payload: Payload, filename: string, alt: string) {
  const found = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })
  if (found.docs[0]) return numericId(found.docs[0].id)

  const filePath = path.join(seedMediaDir, filename)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing seed image: ${filePath}`)
  }

  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    filePath,
    overrideAccess: true,
  })
  payload.logger.info(`Uploaded ${filename}`)
  return numericId(doc.id)
}

function hasImages(product: { images?: Array<{ image?: unknown }> | null }) {
  return Boolean(product.images?.some((row) => row.image))
}

export async function seedCatalogIfEmpty(payload: Payload) {
  const existing = await payload.find({
    collection: 'products',
    limit: 1,
    overrideAccess: true,
  })
  if (existing.totalDocs > 0) {
    payload.logger.info('Catalog already has products — skipping sample seed.')
    return
  }
  await seedCatalog(payload)
}

export async function seedCatalog(payload: Payload) {
  if (!fs.existsSync(seedMediaDir)) {
    throw new Error(`Seed photos folder is missing: ${seedMediaDir}`)
  }

  const categoryData = [
    { name: 'Boys', slug: 'boys', description: 'Everyday wear for boys' },
    { name: 'Girls', slug: 'girls', description: 'Frocks, sets, and play outfits' },
    { name: 'Newborn', slug: 'newborn', description: 'First outfits and sleepsuits' },
    { name: 'Unisex', slug: 'unisex', description: 'Soft basics for everyone' },
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

  const products = [
    {
      title: 'Cotton romper set',
      slug: 'cotton-romper-set',
      description: 'Two-piece cotton romper with envelope neck — easy changes for newborns.',
      category: categories.newborn,
      gender: 'unisex' as const,
      ageGroup: 'newborn' as const,
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
      ageGroup: 'kids' as const,
      featured: true,
      material: 'Printed lawn with cotton lining',
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
      ageGroup: 'kids' as const,
      featured: true,
      material: 'Cotton pique',
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
      gender: 'unisex' as const,
      ageGroup: 'kids' as const,
      featured: true,
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
      ageGroup: 'kids' as const,
      featured: false,
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
      gender: 'unisex' as const,
      ageGroup: 'infant' as const,
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
      ageGroup: 'toddler' as const,
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
      gender: 'unisex' as const,
      ageGroup: 'kids' as const,
      featured: false,
      material: '100% cotton jersey',
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
  ]

  const productIds: number[] = []
  const featuredIds: number[] = []

  for (const product of products) {
    const { imageFile, imageAlt, ...data } = product
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
        } as ProductCreateData,
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
      payload.logger.info(`Published ${product.title}`)
    }
  }

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
    heroOverlaySubtitle: 'Boys · Girls · Unisex',
    homeCollections: [
      { title: 'Boys', copy: 'Polos, sets, and play tees', href: '/shop/boys', category: categories.boys },
      { title: 'Girls', copy: 'Frocks, two-piece sets, everyday knits', href: '/shop/girls', category: categories.girls },
      { title: 'Newborn', copy: 'Rompers, sleepsuits, first outfits', href: '/shop/newborn', category: categories.newborn },
      { title: 'Unisex', copy: 'Soft basics for everyone', href: '/shop/unisex', category: categories.unisex },
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

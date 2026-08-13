import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'
import { assertStrongPassword } from './lib/env'

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('npm run seed is blocked in production. Create the admin user at /admin.')
  }

  const payload = await getPayload({ config })
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim()
  const adminPassword = process.env.SEED_ADMIN_PASSWORD
  const adminName = process.env.SEED_ADMIN_NAME?.trim() || 'Store admin'

  if (adminEmail && adminPassword) {
    assertStrongPassword(adminPassword)
    const existingAdmin = await payload.find({
      collection: 'users',
      where: { email: { equals: adminEmail } },
      limit: 1,
    })

    if (existingAdmin.totalDocs === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: adminEmail,
          password: adminPassword,
          name: adminName,
          role: 'admin',
        },
      })
      payload.logger.info(`Created admin user ${adminEmail}`)
    }
  } else {
    payload.logger.info('Skipping admin seed. Create a user at /admin or set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD.')
  }

  const categoryData = [
    { name: 'Boys', slug: 'boys', description: 'Everyday wear for boys' },
    { name: 'Girls', slug: 'girls', description: 'Frocks, sets, and play outfits' },
    { name: 'Newborn', slug: 'newborn', description: 'First outfits and sleepsuits' },
    { name: 'Unisex', slug: 'unisex', description: 'Soft basics for everyone' },
  ]

  const categories: Record<string, string | number> = {}
  for (const item of categoryData) {
    const found = await payload.find({
      collection: 'categories',
      where: { slug: { equals: item.slug } },
      limit: 1,
    })
    const doc =
      found.docs[0] ||
      (await payload.create({
        collection: 'categories',
        data: item,
      }))
    categories[item.slug] = doc.id
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
    })
    if (found.totalDocs === 0) {
      await payload.create({
        collection: 'couriers',
        data: courier,
      })
      payload.logger.info(`Created courier ${courier.name}`)
    }
  }

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      storeName: 'RumiNZuni',
      tagline: 'Soft clothes for little explorers',
      announcement: 'Cash on delivery across Pakistan · Free shipping over Rs 3,000',
      whatsapp: process.env.SEED_WHATSAPP || undefined,
      phone: process.env.SEED_PHONE || undefined,
      email: process.env.SEED_EMAIL || undefined,
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
      ],
      featuredEyebrow: 'Featured',
      featuredHeading: 'Little bestsellers',
      featuredCta: 'View all',
      featuredCtaLink: '/shop',
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
        'RumiNZuni is a Pakistan kids-wear shop. Soft cotton, easy everyday fits, and cash on delivery — pay the rider when the parcel arrives.',
      homeStoryCta: 'WhatsApp us',
      homeStoryCtaLink: '/contact',
    },
  })

  const tagData = [
    { name: 'Cotton', slug: 'cotton' },
    { name: 'Everyday', slug: 'everyday' },
    { name: 'Eid', slug: 'eid' },
    { name: 'Newborn', slug: 'newborn' },
  ]
  const tags: Record<string, string | number> = {}
  for (const tag of tagData) {
    const found = await payload.find({
      collection: 'tags',
      where: { slug: { equals: tag.slug } },
      limit: 1,
    })
    const doc =
      found.docs[0] ||
      (await payload.create({ collection: 'tags', data: { ...tag, active: true } }))
    tags[tag.slug] = doc.id
    if (found.totalDocs === 0) payload.logger.info(`Created tag ${tag.name}`)
  }

  const foundGuide = await payload.find({
    collection: 'size-guides',
    where: { slug: { equals: 'newborn-infant' } },
    limit: 1,
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
      sizeGuide: newbornGuide.id,
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
      variants: [
        { sku: 'RNZ-SLP-03-IVR', size: '0-3m', color: 'Ivory', price: 1590, stock: 15 },
        { sku: 'RNZ-SLP-36-IVR', size: '3-6m', color: 'Ivory', price: 1590, stock: 12 },
        { sku: 'RNZ-SLP-69-MNT', size: '6-9m', color: 'Mint', price: 1690, stock: 7 },
      ],
    },
  ]

  for (const product of products) {
    const found = await payload.find({
      collection: 'products',
      where: { slug: { equals: product.slug } },
      limit: 1,
    })
    if (found.totalDocs === 0) {
      await payload.create({
        collection: 'products',
        data: {
          ...product,
          _status: 'published',
        },
      })
      payload.logger.info(`Created product ${product.title}`)
    }
  }

  payload.logger.info('Seed complete. Create or use an admin user at /admin — credentials are never logged.')
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})

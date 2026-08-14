import type { Payload } from 'payload'

export const MIN_SAMPLE_PRODUCTS = 9

const PLACEHOLDER =
  'Sample placeholder — replace this with your own product, photos, and price in Admin → Products.'

export type SampleCtx = {
  categories: Record<string, number>
  ageGroupIds: Record<string, number>
  tags: Record<string, number>
  departments: Record<string, number>
}

type Sample = {
  title: string
  slug: string
  description: string
  category: number
  gender?: 'boys' | 'girls'
  ageGroup?: number
  department?: number
  featured?: boolean
  material?: string
  careInstructions?: string
  sortPriority?: number
  tags?: number[]
  brand?: string
  bagType?: string
  productKind?: string
  skinType?: string
  ingredients?: string
  volume?: string
  fragranceType?: string
  fragranceFamily?: string
  dimensions?: string
  imageFile: string
  imageAlt: string
  variants: Array<{ sku: string; size: string; color: string; price: number; compareAtPrice?: number; stock: number }>
}

function wear(
  ctx: SampleCtx,
  opts: {
    title: string
    slug: string
    category: 'boys' | 'girls' | 'newborn'
    gender?: 'boys' | 'girls'
    age: string
    image: string
    alt: string
    sku: string
    sizes: string[]
    color: string
    price: number
    material?: string
  },
): Sample {
  return {
    title: opts.title,
    slug: opts.slug,
    description: `${opts.title}. ${PLACEHOLDER}`,
    category: ctx.categories[opts.category],
    gender: opts.gender,
    ageGroup: ctx.ageGroupIds[opts.age],
    department: ctx.departments['kids-wear'],
    material: opts.material || 'Cotton',
    careInstructions: 'Machine wash cold. Dry in shade.',
    tags: [ctx.tags.everyday].filter(Boolean),
    imageFile: opts.image,
    imageAlt: opts.alt,
    variants: opts.sizes.map((size, index) => ({
      sku: `${opts.sku}-${index + 1}`,
      size,
      color: opts.color,
      price: opts.price + index * 100,
      stock: 8 - index,
    })),
  }
}

export function extraSamplesByCategory(ctx: SampleCtx): Record<string, Sample[]> {
  const acc = ctx.categories['baby-kids-accessories']
  const foot = ctx.categories['kids-footwear']
  const bags = ctx.categories.handbags
  const beauty = ctx.categories.beauty
  const skin = ctx.categories.skincare
  const perfume = ctx.categories.perfumes

  return {
    boys: [
      wear(ctx, { title: 'Boys linen shorts', slug: 'boys-linen-shorts', category: 'boys', gender: 'boys', age: 'toddler', image: 'two-piece-linen-suit.jpg', alt: 'Beige boys linen shorts', sku: 'RNZ-BSH', sizes: ['2y', '3y', '4y'], color: 'Beige', price: 1490 }),
      wear(ctx, { title: 'Boys everyday tee', slug: 'boys-everyday-tee', category: 'boys', gender: 'boys', age: 'little-kids', image: 'cotton-jersey-tee.jpg', alt: 'Boys cotton tee', sku: 'RNZ-BTE', sizes: ['3y', '5y', '7-8y'], color: 'Sage', price: 1290 }),
      wear(ctx, { title: 'Boys zip hoodie', slug: 'boys-zip-hoodie', category: 'boys', gender: 'boys', age: 'kids', image: 'knit-hoodie.jpg', alt: 'Boys knit hoodie', sku: 'RNZ-BHD', sizes: ['5y', '6y', '7-8y'], color: 'Navy', price: 2290 }),
      wear(ctx, { title: 'Boys kurta set', slug: 'boys-kurta-set', category: 'boys', gender: 'boys', age: 'little-kids', image: 'pique-polo-shirt.jpg', alt: 'Boys kurta set', sku: 'RNZ-BKR', sizes: ['3y', '4y', '5y'], color: 'Ivory', price: 2890, material: 'Cotton lawn' }),
      wear(ctx, { title: 'Boys cargo shorts', slug: 'boys-cargo-shorts', category: 'boys', gender: 'boys', age: 'kids', image: 'two-piece-linen-suit.jpg', alt: 'Boys cargo shorts', sku: 'RNZ-BCG', sizes: ['5y', '6y', '7-8y'], color: 'Olive', price: 1690 }),
      wear(ctx, { title: 'Boys night suit', slug: 'boys-night-suit', category: 'boys', gender: 'boys', age: 'little-kids', image: 'zip-sleepsuit.jpg', alt: 'Boys night suit', sku: 'RNZ-BNS', sizes: ['3y', '4y', '5y'], color: 'Ivory', price: 1890 }),
      wear(ctx, { title: 'Boys waistcoat set', slug: 'boys-waistcoat-set', category: 'boys', gender: 'boys', age: 'toddler', image: 'pique-polo-shirt.jpg', alt: 'Boys waistcoat set', sku: 'RNZ-BWV', sizes: ['2y', '3y', '4y'], color: 'Navy', price: 3190 }),
    ],
    girls: [
      wear(ctx, { title: 'Girls lawn shirt', slug: 'girls-lawn-shirt', category: 'girls', gender: 'girls', age: 'little-kids', image: 'printed-lawn-frock.jpg', alt: 'Girls lawn shirt', sku: 'RNZ-GLS', sizes: ['3y', '4y', '5y'], color: 'Blush', price: 1690, material: 'Lawn' }),
      wear(ctx, { title: 'Girls palazzo set', slug: 'girls-palazzo-set', category: 'girls', gender: 'girls', age: 'kids', image: 'girls-play-set.jpg', alt: 'Girls palazzo set', sku: 'RNZ-GPL', sizes: ['5y', '6y', '7-8y'], color: 'Coral', price: 2490 }),
      wear(ctx, { title: 'Girls party frock', slug: 'girls-party-frock', category: 'girls', gender: 'girls', age: 'little-kids', image: 'printed-lawn-frock.jpg', alt: 'Girls party frock', sku: 'RNZ-GPF', sizes: ['3y', '4y', '5y'], color: 'Blush', price: 3290 }),
      wear(ctx, { title: 'Girls knit cardigan', slug: 'girls-knit-cardigan', category: 'girls', gender: 'girls', age: 'kids', image: 'knit-hoodie.jpg', alt: 'Girls knit cardigan', sku: 'RNZ-GCD', sizes: ['4y', '6y', '7-8y'], color: 'Cream', price: 1990 }),
      wear(ctx, { title: 'Girls twirl skirt', slug: 'girls-twirl-skirt', category: 'girls', gender: 'girls', age: 'little-kids', image: 'girls-play-set.jpg', alt: 'Girls twirl skirt', sku: 'RNZ-GTK', sizes: ['3y', '4y', '5y'], color: 'Coral', price: 1490 }),
      wear(ctx, { title: 'Girls Eid two-piece', slug: 'girls-eid-two-piece', category: 'girls', gender: 'girls', age: 'kids', image: 'printed-lawn-frock.jpg', alt: 'Girls Eid two-piece', sku: 'RNZ-GED', sizes: ['5y', '6y', '7-8y'], color: 'Sage', price: 3490, material: 'Lawn' }),
      wear(ctx, { title: 'Girls sleep set', slug: 'girls-sleep-set', category: 'girls', gender: 'girls', age: 'toddler', image: 'zip-sleepsuit.jpg', alt: 'Girls sleep set', sku: 'RNZ-GSL', sizes: ['2y', '3y', '4y'], color: 'Ivory', price: 1790 }),
    ],
    newborn: [
      wear(ctx, { title: 'Newborn wrap set', slug: 'newborn-wrap-set', category: 'newborn', age: 'newborn', image: 'cotton-romper-set.jpg', alt: 'Newborn wrap set', sku: 'RNZ-NWP', sizes: ['newborn', '0-3m'], color: 'Cream', price: 1590 }),
      wear(ctx, { title: 'Newborn bodysuit pack', slug: 'newborn-bodysuit-pack', category: 'newborn', age: 'newborn', image: 'zip-sleepsuit.jpg', alt: 'Newborn bodysuits', sku: 'RNZ-NBD', sizes: ['newborn', '0-3m', '3-6m'], color: 'Ivory', price: 1890 }),
      wear(ctx, { title: 'Newborn cap & mittens', slug: 'newborn-cap-mittens', category: 'newborn', age: 'newborn', image: 'baby-mitts-burp-cloth.jpg', alt: 'Newborn cap and mittens', sku: 'RNZ-NCM', sizes: ['newborn', '0-3m'], color: 'Ivory', price: 790 }),
      wear(ctx, { title: 'Newborn muslin wrap', slug: 'newborn-muslin-wrap', category: 'newborn', age: 'newborn', image: 'cotton-romper-set.jpg', alt: 'Newborn muslin wrap', sku: 'RNZ-NMS', sizes: ['newborn', '0-3m'], color: 'Sage', price: 990, material: 'Muslin' }),
      wear(ctx, { title: 'Newborn pajama set', slug: 'newborn-pajama-set', category: 'newborn', age: 'baby', image: 'zip-sleepsuit.jpg', alt: 'Newborn pajama', sku: 'RNZ-NPJ', sizes: ['0-3m', '3-6m', '6-9m'], color: 'Mint', price: 1690 }),
      wear(ctx, { title: 'Newborn kimono shirt', slug: 'newborn-kimono-shirt', category: 'newborn', age: 'newborn', image: 'cotton-romper-set.jpg', alt: 'Newborn kimono shirt', sku: 'RNZ-NKM', sizes: ['newborn', '0-3m'], color: 'Cream', price: 1290 }),
      wear(ctx, { title: 'Newborn footed romper', slug: 'newborn-footed-romper', category: 'newborn', age: 'baby', image: 'zip-sleepsuit.jpg', alt: 'Footed romper', sku: 'RNZ-NFR', sizes: ['0-3m', '3-6m'], color: 'Ivory', price: 1790 }),
    ],
    'baby-kids-accessories': acc
      ? [
          {
            title: 'Kids cotton socks',
            slug: 'kids-cotton-socks',
            description: `Soft everyday socks for little feet. ${PLACEHOLDER}`,
            category: acc,
            ageGroup: ctx.ageGroupIds['little-kids'],
            department: ctx.departments['baby-kids-accessories'],
            imageFile: 'kids-cotton-socks.jpg',
            imageAlt: 'Navy kids cotton socks',
            variants: [
              { sku: 'RNZ-SCK-3Y-NVY', size: '3y', color: 'Navy', price: 490, stock: 16 },
              { sku: 'RNZ-SCK-5Y-NVY', size: '5y', color: 'Navy', price: 490, stock: 14 },
              { sku: 'RNZ-SCK-6Y-CRM', size: '6y', color: 'Cream', price: 490, stock: 12 },
            ],
          },
        ]
      : [],
    'kids-footwear': foot
      ? [
          shoe(ctx, foot, 'Baby knit booties', 'baby-knit-booties', 'baby-knit-booties.jpg', 'Cream baby knit booties', 'RNZ-BTI', ['eu-16', 'eu-18'], 'Cream', 1290, 'newborn'),
          shoe(ctx, foot, 'Kids house slippers', 'kids-house-slippers', 'kids-house-slippers.jpg', 'Blush kids slippers', 'RNZ-SLP2', ['eu-22', 'eu-24', 'eu-26'], 'Blush', 990, 'toddler'),
          shoe(ctx, foot, 'Kids school shoes', 'kids-school-shoes', 'kids-school-shoes.jpg', 'Black kids school shoes', 'RNZ-SCH', ['eu-26', 'eu-28', 'eu-30'], 'Black', 2490, 'kids'),
          shoe(ctx, foot, 'Kids party sneakers', 'kids-party-sneakers', 'kids-canvas-sneakers.jpg', 'Coral kids sneakers', 'RNZ-PSN', ['eu-24', 'eu-26', 'eu-28'], 'Coral', 2190, 'little-kids'),
          shoe(ctx, foot, 'Everyday sandals two', 'kids-everyday-sandals', 'kids-soft-sandals.jpg', 'Sage kids sandals', 'RNZ-SND2', ['eu-20', 'eu-22', 'eu-24'], 'Sage', 1790, 'toddler'),
          shoe(ctx, foot, 'First walker shoes', 'kids-first-walkers', 'baby-knit-booties.jpg', 'First walker booties', 'RNZ-WLK', ['eu-18', 'eu-20'], 'Cream', 1590, 'baby'),
          shoe(ctx, foot, 'Park play sneakers', 'kids-park-sneakers', 'kids-canvas-sneakers.jpg', 'Kids park sneakers', 'RNZ-PRK', ['eu-24', 'eu-26', 'eu-28'], 'Navy', 1990, 'little-kids'),
        ]
      : [],
    handbags: bags
      ? [
          bag(ctx, bags, 'Sage everyday tote', 'womens-sage-tote', 'womens-sage-tote.jpg', 'Sage tote bag', 'RNZ-TOT', 'Sage', 'tote', 3490),
          bag(ctx, bags, 'Coral crossbody', 'womens-coral-crossbody', 'womens-coral-crossbody.jpg', 'Coral crossbody bag', 'RNZ-CRS', 'Coral', 'crossbody', 2990),
          bag(ctx, bags, 'Blush evening clutch', 'womens-blush-clutch', 'womens-blush-clutch.jpg', 'Blush clutch', 'RNZ-CLT', 'Blush', 'clutch', 2490),
          bag(ctx, bags, 'Work tote sample', 'womens-work-tote', 'womens-sage-tote.jpg', 'Sage work tote', 'RNZ-WRK', 'Sage', 'tote', 3990),
          bag(ctx, bags, 'Mini crossbody sample', 'womens-mini-crossbody', 'womens-coral-crossbody.jpg', 'Mini crossbody', 'RNZ-MIN', 'Coral', 'crossbody', 2690),
          bag(ctx, bags, 'Party clutch sample', 'womens-party-clutch', 'womens-blush-clutch.jpg', 'Party clutch', 'RNZ-PTY', 'Blush', 'clutch', 2290),
          bag(ctx, bags, 'Market tote sample', 'womens-market-tote', 'womens-sage-tote.jpg', 'Market tote', 'RNZ-MKT', 'Olive', 'tote', 3190),
          bag(ctx, bags, 'City sling sample', 'womens-city-sling', 'womens-coral-crossbody.jpg', 'City sling', 'RNZ-SLG', 'Navy', 'sling', 2790),
          bag(ctx, bags, 'Foldover clutch sample', 'womens-foldover-clutch', 'womens-blush-clutch.jpg', 'Foldover clutch', 'RNZ-FLD', 'Ivory', 'clutch', 2190),
        ]
      : [],
    beauty: beauty
      ? [
          beautyItem(ctx, beauty, 'Lipstick & compact', 'womens-lipstick-compact', 'womens-lipstick-compact.jpg', 'Lipstick and compact', 'RNZ-LPC', 'lipstick', 1490),
          beautyItem(ctx, beauty, 'Mascara & brush', 'womens-mascara-brush', 'womens-mascara-brush.jpg', 'Mascara and brush', 'RNZ-MSC', 'mascara', 1290),
          beautyItem(ctx, beauty, 'Kohl & lip gloss', 'womens-kohl-gloss', 'womens-kohl-gloss.jpg', 'Kohl and lip gloss', 'RNZ-KHL', 'kohl', 990),
          beautyItem(ctx, beauty, 'Everyday lipstick sample', 'womens-everyday-lipstick', 'womens-lipstick-compact.jpg', 'Everyday lipstick', 'RNZ-LPS', 'lipstick', 890),
          beautyItem(ctx, beauty, 'Soft blush compact', 'womens-soft-blush', 'womens-lipstick-compact.jpg', 'Blush compact', 'RNZ-BSH2', 'blush', 1190),
          beautyItem(ctx, beauty, 'Length mascara sample', 'womens-length-mascara', 'womens-mascara-brush.jpg', 'Length mascara', 'RNZ-LMS', 'mascara', 1090),
          beautyItem(ctx, beauty, 'Brow pencil sample', 'womens-brow-pencil', 'womens-kohl-gloss.jpg', 'Brow pencil', 'RNZ-BRW', 'brow', 790),
          beautyItem(ctx, beauty, 'Nude gloss sample', 'womens-nude-gloss', 'womens-kohl-gloss.jpg', 'Nude lip gloss', 'RNZ-GLS2', 'gloss', 850),
          beautyItem(ctx, beauty, 'Mini makeup kit', 'womens-mini-makeup-kit', 'womens-mascara-brush.jpg', 'Mini makeup kit', 'RNZ-KIT', 'kit', 1990),
        ]
      : [],
    skincare: skin
      ? [
          skinItem(ctx, skin, 'Daily face cream', 'womens-face-cream', 'womens-face-cream.jpg', 'Daily face cream', 'RNZ-CRM', 'moisturizer', 'all', '50 ml', 1890),
          skinItem(ctx, skin, 'Gentle cleanser', 'womens-cleanser', 'womens-cleanser.jpg', 'Gentle cleanser', 'RNZ-CLN', 'cleanser', 'combination', '100 ml', 1590),
          skinItem(ctx, skin, 'Overnight serum', 'womens-serum', 'womens-serum.jpg', 'Overnight serum', 'RNZ-SRM', 'serum', 'dry', '30 ml', 2490),
          skinItem(ctx, skin, 'Day moisturizer sample', 'womens-day-moisturizer', 'womens-face-cream.jpg', 'Day moisturizer', 'RNZ-DAY', 'moisturizer', 'normal', '50 ml', 1790),
          skinItem(ctx, skin, 'Foam cleanser sample', 'womens-foam-cleanser', 'womens-cleanser.jpg', 'Foam cleanser', 'RNZ-FOM', 'cleanser', 'oily', '100 ml', 1490),
          skinItem(ctx, skin, 'Vitamin serum sample', 'womens-vitamin-serum', 'womens-serum.jpg', 'Vitamin serum', 'RNZ-VIT', 'serum', 'all', '30 ml', 2290),
          skinItem(ctx, skin, 'Night cream sample', 'womens-night-cream', 'womens-face-cream.jpg', 'Night cream', 'RNZ-NCR', 'moisturizer', 'dry', '50 ml', 1990),
          skinItem(ctx, skin, 'Micellar water sample', 'womens-micellar-water', 'womens-cleanser.jpg', 'Micellar water', 'RNZ-MIC', 'cleanser', 'sensitive', '200 ml', 1290),
          skinItem(ctx, skin, 'Eye serum sample', 'womens-eye-serum', 'womens-serum.jpg', 'Eye serum', 'RNZ-EYE', 'serum', 'all', '15 ml', 2190),
        ]
      : [],
    perfumes: perfume
      ? [
          perfumeItem(ctx, perfume, 'Floral eau de parfum', 'womens-floral-edp', 'womens-serum.jpg', 'Floral perfume bottle', 'RNZ-EDP', 'Eau de Parfum', 'Floral', 3490),
          perfumeItem(ctx, perfume, 'Citrus body mist', 'womens-citrus-mist', 'womens-cleanser.jpg', 'Citrus body mist', 'RNZ-MST', 'Body Mist', 'Citrus', 1490),
          perfumeItem(ctx, perfume, 'Amber perfume oil', 'womens-amber-oil', 'womens-face-cream.jpg', 'Amber perfume oil', 'RNZ-OIL', 'Perfume Oil', 'Amber', 1990),
        ]
      : [],
  }
}

function shoe(
  ctx: SampleCtx,
  category: number,
  title: string,
  slug: string,
  image: string,
  alt: string,
  sku: string,
  sizes: string[],
  color: string,
  price: number,
  age: string,
): Sample {
  return {
    title,
    slug,
    description: `${title}. ${PLACEHOLDER}`,
    category,
    ageGroup: ctx.ageGroupIds[age],
    department: ctx.departments['kids-footwear'],
    imageFile: image,
    imageAlt: alt,
    variants: sizes.map((size, index) => ({
      sku: `${sku}-${index + 1}`,
      size,
      color,
      price,
      stock: 8,
    })),
  }
}

function bag(
  ctx: SampleCtx,
  category: number,
  title: string,
  slug: string,
  image: string,
  alt: string,
  sku: string,
  color: string,
  bagType: string,
  price: number,
): Sample {
  return {
    title,
    slug,
    description: `${title}. ${PLACEHOLDER}`,
    category,
    department: ctx.departments['womens-handbags'],
    bagType,
    material: 'Sample vegan leather',
    dimensions: '30 × 22 × 10 cm',
    imageFile: image,
    imageAlt: alt,
    variants: [{ sku: `${sku}-OS`, size: 'onesize', color, price, stock: 6 }],
  }
}

function beautyItem(
  ctx: SampleCtx,
  category: number,
  title: string,
  slug: string,
  image: string,
  alt: string,
  sku: string,
  productKind: string,
  price: number,
): Sample {
  return {
    title,
    slug,
    description: `${title}. ${PLACEHOLDER}`,
    category,
    department: ctx.departments['womens-beauty'],
    brand: 'Sample',
    productKind,
    imageFile: image,
    imageAlt: alt,
    variants: [
      { sku: `${sku}-NDE`, size: 'onesize', color: 'Nude', price, stock: 10 },
      { sku: `${sku}-RSE`, size: 'onesize', color: 'Rose', price, stock: 8 },
    ],
  }
}

function skinItem(
  ctx: SampleCtx,
  category: number,
  title: string,
  slug: string,
  image: string,
  alt: string,
  sku: string,
  productKind: string,
  skinType: string,
  volume: string,
  price: number,
): Sample {
  return {
    title,
    slug,
    description: `${title}. ${PLACEHOLDER}`,
    category,
    department: ctx.departments['womens-skincare'],
    brand: 'Sample',
    productKind,
    skinType,
    volume,
    ingredients: 'Sample formula — replace with your own INCI list.',
    imageFile: image,
    imageAlt: alt,
    variants: [{ sku: `${sku}-OS`, size: 'onesize', color: 'None', price, stock: 8 }],
  }
}

function perfumeItem(
  ctx: SampleCtx,
  category: number,
  title: string,
  slug: string,
  image: string,
  alt: string,
  sku: string,
  fragranceType: string,
  fragranceFamily: string,
  price: number,
): Sample {
  return {
    title,
    slug,
    description: `${title}. ${PLACEHOLDER}`,
    category,
    department: ctx.departments['womens-perfumes'],
    brand: 'Sample',
    productKind: fragranceType,
    fragranceType,
    fragranceFamily,
    imageFile: image,
    imageAlt: alt,
    variants: [
      { sku: `${sku}-50`, size: '50ml', color: 'None', price, stock: 6 },
      { sku: `${sku}-100`, size: '100ml', color: 'None', price: price + 800, stock: 4 },
    ],
  }
}

export async function countCategoryProducts(payload: Payload, categoryId: number) {
  const result = await payload.find({
    collection: 'products',
    where: { category: { equals: categoryId } },
    limit: 0,
    overrideAccess: true,
  })
  return result.totalDocs
}

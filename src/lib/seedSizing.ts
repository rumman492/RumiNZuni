import type { Payload } from 'payload'
import {
  DEFAULT_AGE_GROUPS,
  DEFAULT_FOOTWEAR_SIZES,
  DEFAULT_ONESIZE,
  DEFAULT_SIZES,
} from '@/lib/sizing'
import { slugify } from '@/lib/slug'
import { DEFAULT_DEPARTMENTS, DEFAULT_TAXONOMY_CATEGORIES, isUnisexPublicItem, stripUnisexCopy } from '@/lib/taxonomy'
import type { CatalogOption } from '@/payload-types'

function numericId(id: string | number) {
  return typeof id === 'number' ? id : Number(id)
}

async function upsertBySlug(
  payload: Payload,
  collection: 'departments' | 'categories' | 'age-groups',
  slug: string,
  data: Record<string, unknown>,
) {
  const found = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })
  if (found.docs[0]) return numericId(found.docs[0].id)
  const created = await payload.create({
    collection,
    data: data as never,
    overrideAccess: true,
  })
  payload.logger.info(`Created ${collection} ${slug}`)
  return numericId(created.id)
}

export async function seedSizingAndAccessories(payload: Payload) {
  const ageGroupIds: Record<string, number> = {}

  for (const group of DEFAULT_AGE_GROUPS) {
    ageGroupIds[group.slug] = await upsertBySlug(payload, 'age-groups', group.slug, group)
  }

  const departmentIds: Record<string, number> = {}
  for (const department of DEFAULT_DEPARTMENTS) {
    departmentIds[department.slug] = await upsertBySlug(payload, 'departments', department.slug, department)
  }

  const clothingSizes = [...DEFAULT_SIZES, ...DEFAULT_FOOTWEAR_SIZES, DEFAULT_ONESIZE]
  for (const size of clothingSizes) {
    const found = await payload.find({
      collection: 'sizes',
      where: { code: { equals: size.code } },
      limit: 1,
      overrideAccess: true,
    })
    const { ageGroupSlugs, ...data } = size
    const ageGroups = ageGroupSlugs.map((slug) => ageGroupIds[slug]).filter(Boolean)
    if (found.totalDocs === 0) {
      await payload.create({
        collection: 'sizes',
        data: { ...data, kind: size.kind || 'clothing', ageGroups },
        overrideAccess: true,
      })
      payload.logger.info(`Created size ${size.label}`)
    }
  }

  const categoryIds: Record<string, number> = {}
  for (const item of DEFAULT_TAXONOMY_CATEGORIES) {
    const { department, parent, ...rest } = item
    const found = await payload.find({
      collection: 'categories',
      where: { slug: { equals: item.slug } },
      limit: 1,
      overrideAccess: true,
    })
    const data = { ...rest, department: departmentIds[department] }
    if (found.docs[0]) {
      categoryIds[item.slug] = numericId(found.docs[0].id)
      await payload.update({
        collection: 'categories',
        id: found.docs[0].id,
        data: {
          name: rest.name,
          description: rest.description,
          showInNavigation: rest.showInNavigation,
          sortOrder: rest.sortOrder,
          department: departmentIds[department],
        },
        overrideAccess: true,
      })
    } else {
      categoryIds[item.slug] = await upsertBySlug(payload, 'categories', item.slug, data)
    }
  }
  for (const item of DEFAULT_TAXONOMY_CATEGORIES) {
    if (!item.parent || !categoryIds[item.slug] || !categoryIds[item.parent]) continue
    await payload.update({
      collection: 'categories',
      id: categoryIds[item.slug],
      data: { parent: categoryIds[item.parent] },
      overrideAccess: true,
    })
  }

  const hide = ['unisex', 'baby-accessories', 'kids-accessories', 'bags', 'footwear']
  for (const slug of hide) {
    const found = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (found.docs[0]) {
      await payload.update({
        collection: 'categories',
        id: found.docs[0].id,
        data: { showInNavigation: false, active: slug !== 'unisex' },
        overrideAccess: true,
      })
    }
  }

  const accessoryId = categoryIds['baby-kids-accessories']
  const footwearId = categoryIds['kids-footwear']
  const kidsWearId = departmentIds['kids-wear']
  const accessoryDept = departmentIds['baby-kids-accessories']
  const footwearDept = departmentIds['kids-footwear']

  const reassign: Array<{ from: string; category: number; department: number }> = []
  if (accessoryId && accessoryDept) {
    reassign.push(
      { from: 'baby-accessories', category: accessoryId, department: accessoryDept },
      { from: 'kids-accessories', category: accessoryId, department: accessoryDept },
      { from: 'bags', category: accessoryId, department: accessoryDept },
    )
  }
  if (footwearId && footwearDept) {
    reassign.push({ from: 'footwear', category: footwearId, department: footwearDept })
  }

  for (const map of reassign) {
    const from = await payload.find({
      collection: 'categories',
      where: { slug: { equals: map.from } },
      limit: 1,
      overrideAccess: true,
    })
    if (!from.docs[0]) continue
    const products = await payload.find({
      collection: 'products',
      where: { category: { equals: from.docs[0].id } },
      limit: 100,
      overrideAccess: true,
      draft: true,
    })
    for (const product of products.docs) {
      await payload.update({
        collection: 'products',
        id: product.id,
        data: { category: map.category, department: map.department },
        overrideAccess: true,
      })
    }
  }

  if (accessoryId && accessoryDept) {
    for (const slug of ['gentle-baby-lotion-set', 'kids-lip-balm-brush']) {
      const found = await payload.find({
        collection: 'products',
        where: { slug: { equals: slug } },
        limit: 1,
        overrideAccess: true,
        draft: true,
      })
      if (found.docs[0]) {
        await payload.update({
          collection: 'products',
          id: found.docs[0].id,
          data: { category: accessoryId, department: accessoryDept },
          overrideAccess: true,
        })
      }
    }
  }

  if (kidsWearId) {
    const clothing = await payload.find({
      collection: 'products',
      where: { department: { exists: false } },
      limit: 200,
      overrideAccess: true,
      draft: true,
    })
    for (const product of clothing.docs) {
      await payload.update({
        collection: 'products',
        id: product.id,
        data: { department: kidsWearId },
        overrideAccess: true,
      })
    }
  }

  for (const item of DEFAULT_TAXONOMY_CATEGORIES) {
    if (!categoryIds[item.slug]) continue
    await payload.update({
      collection: 'categories',
      id: categoryIds[item.slug],
      data: {
        name: item.name,
        description: item.description,
        department: departmentIds[item.department],
        parent: item.parent ? categoryIds[item.parent] : null,
        showInNavigation: item.showInNavigation,
        sortOrder: item.sortOrder,
      },
      overrideAccess: true,
    })
  }

  await hideUnisexFromStorefront(payload)
  return ageGroupIds
}

export async function hideUnisexFromStorefront(payload: Payload) {
  const unisex = await payload.find({
    collection: 'categories',
    where: { slug: { equals: 'unisex' } },
    limit: 1,
    overrideAccess: true,
  })
  if (unisex.docs[0]) {
    await payload.update({
      collection: 'categories',
      id: unisex.docs[0].id,
      data: { showInNavigation: false, active: false },
      overrideAccess: true,
    })
  }

  const optionSeeds: Array<{ kind: CatalogOption['kind']; name: string }> = [
    { kind: 'skin-type', name: 'All Skin Types' },
    { kind: 'skin-type', name: 'Normal' },
    { kind: 'skin-type', name: 'Dry' },
    { kind: 'skin-type', name: 'Oily' },
    { kind: 'skin-type', name: 'Combination' },
    { kind: 'skin-type', name: 'Sensitive' },
    { kind: 'skin-concern', name: 'Acne' },
    { kind: 'skin-concern', name: 'Dryness' },
    { kind: 'skin-concern', name: 'Oil Control' },
    { kind: 'skin-concern', name: 'Hydration' },
    { kind: 'skin-concern', name: 'Dark Spots' },
    { kind: 'skin-concern', name: 'Uneven Tone' },
    { kind: 'skin-concern', name: 'Fine Lines' },
    { kind: 'skin-concern', name: 'Dullness' },
    { kind: 'skin-concern', name: 'Sun Protection' },
    { kind: 'fragrance-family', name: 'Floral' },
    { kind: 'fragrance-family', name: 'Fruity' },
    { kind: 'fragrance-family', name: 'Fresh' },
    { kind: 'fragrance-family', name: 'Citrus' },
    { kind: 'fragrance-family', name: 'Woody' },
    { kind: 'fragrance-family', name: 'Oriental' },
    { kind: 'fragrance-family', name: 'Amber' },
    { kind: 'fragrance-family', name: 'Gourmand' },
    { kind: 'fragrance-family', name: 'Musky' },
    { kind: 'fragrance-type', name: 'Eau de Parfum' },
    { kind: 'fragrance-type', name: 'Eau de Toilette' },
    { kind: 'fragrance-type', name: 'Eau de Cologne' },
    { kind: 'fragrance-type', name: 'Body Mist' },
    { kind: 'fragrance-type', name: 'Perfume Oil' },
    { kind: 'bag-type', name: 'Shoulder bag' },
    { kind: 'bag-type', name: 'Crossbody' },
    { kind: 'bag-type', name: 'Tote' },
    { kind: 'bag-type', name: 'Clutch' },
    { kind: 'bag-type', name: 'Mini bag' },
    { kind: 'finish', name: 'Matte' },
    { kind: 'finish', name: 'Dewy' },
    { kind: 'finish', name: 'Satin' },
  ]
  try {
    let order = 10
    for (const option of optionSeeds) {
      const slug = `${option.kind}-${slugify(option.name)}`
      const found = await payload.find({
        collection: 'catalog-options',
        where: { slug: { equals: slug } },
        limit: 1,
        overrideAccess: true,
      })
      if (!found.docs[0]) {
        await payload.create({
          collection: 'catalog-options',
          data: { ...option, slug, active: true, sortOrder: order },
          overrideAccess: true,
        })
      }
      order += 10
    }
  } catch (error) {
    payload.logger.error(error instanceof Error ? error.message : 'Catalog options seed skipped.')
  }

  try {
    const settings = await payload.findGlobal({ slug: 'site-settings', overrideAccess: true, depth: 1 })
    const collections = (settings.homeCollections || []).filter((item) => {
      const categorySlug = typeof item.category === 'object' && item.category ? item.category.slug : undefined
      return !isUnisexPublicItem({ title: item.title, href: item.href, slug: categorySlug })
    })
    const overlay = stripUnisexCopy(settings.heroOverlaySubtitle || '') || 'Boys · Girls'
    const overlayChanged = overlay !== (settings.heroOverlaySubtitle || '')
    const collectionsChanged = collections.length !== (settings.homeCollections || []).length
    if (!overlayChanged && !collectionsChanged) return

    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        heroOverlaySubtitle: overlay,
        homeCollections: collections.map((item) => ({
          id: item.id,
          title: item.title,
          copy: item.copy,
          href: item.href,
          category: typeof item.category === 'object' && item.category ? item.category.id : item.category,
          image: typeof item.image === 'object' && item.image ? item.image.id : item.image,
        })),
      },
      overrideAccess: true,
    })
    payload.logger.info('Removed Unisex from the storefront homepage and category list.')
  } catch (error) {
    payload.logger.error(error instanceof Error ? error.message : 'Could not clean Unisex from homepage settings.')
  }
}

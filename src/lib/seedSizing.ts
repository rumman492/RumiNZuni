import type { Payload } from 'payload'
import {
  DEFAULT_AGE_GROUPS,
  DEFAULT_FOOTWEAR_SIZES,
  DEFAULT_ONESIZE,
  DEFAULT_SIZES,
} from '@/lib/sizing'
import { DEFAULT_DEPARTMENTS, DEFAULT_TAXONOMY_CATEGORIES } from '@/lib/taxonomy'

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
        active: item.active,
      },
      overrideAccess: true,
    })
  }

  return ageGroupIds
}

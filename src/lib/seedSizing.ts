import type { Payload } from 'payload'
import { ACCESSORY_CATEGORIES, DEFAULT_AGE_GROUPS, DEFAULT_SIZES } from '@/lib/sizing'

function numericId(id: string | number) {
  return typeof id === 'number' ? id : Number(id)
}

export async function seedSizingAndAccessories(payload: Payload) {
  const ageGroupIds: Record<string, number> = {}

  for (const group of DEFAULT_AGE_GROUPS) {
    const found = await payload.find({
      collection: 'age-groups',
      where: { slug: { equals: group.slug } },
      limit: 1,
      overrideAccess: true,
    })
    const doc =
      found.docs[0] ||
      (await payload.create({
        collection: 'age-groups',
        data: group,
        overrideAccess: true,
      }))
    if (found.totalDocs === 0) payload.logger.info(`Created age group ${group.name}`)
    ageGroupIds[group.slug] = numericId(doc.id)
  }

  for (const size of DEFAULT_SIZES) {
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
        data: { ...data, ageGroups },
        overrideAccess: true,
      })
      payload.logger.info(`Created size ${size.label}`)
    }
  }

  for (const item of ACCESSORY_CATEGORIES) {
    const found = await payload.find({
      collection: 'categories',
      where: { slug: { equals: item.slug } },
      limit: 1,
      overrideAccess: true,
    })
    if (found.totalDocs === 0) {
      await payload.create({
        collection: 'categories',
        data: item,
        overrideAccess: true,
      })
      payload.logger.info(`Created category ${item.name}`)
    }
  }

  return ageGroupIds
}

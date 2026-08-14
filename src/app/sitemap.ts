import type { MetadataRoute } from 'next'
import { SHOP_PRESETS } from '@/lib/catalog-params'
import { getPayloadClient } from '@/lib/payload'
import { absoluteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

const STATIC_PATHS = [
  { path: '/', changeFrequency: 'daily' as const, priority: 1 },
  { path: '/shop', changeFrequency: 'daily' as const, priority: 0.9 },
  { path: '/shipping', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: '/returns', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: '/size-finder', changeFrequency: 'monthly' as const, priority: 0.6 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((item) => ({
    url: absoluteUrl(item.path),
    lastModified: new Date(),
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }))

  for (const slug of Object.keys(SHOP_PRESETS)) {
    entries.push({
      url: absoluteUrl(`/shop/${slug}`),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  try {
    const payload = await getPayloadClient()
    const [products, categories, ageGroups] = await Promise.all([
      payload.find({
        collection: 'products',
        where: { _status: { equals: 'published' } },
        limit: 500,
        depth: 0,
        select: { slug: true, updatedAt: true },
        sort: '-updatedAt',
      }),
      payload.find({
        collection: 'categories',
        where: { active: { not_equals: false } },
        limit: 50,
        depth: 0,
        select: { slug: true, updatedAt: true },
        sort: 'name',
      }),
      payload.find({
        collection: 'age-groups',
        where: { storefrontVisible: { equals: true } },
        limit: 50,
        depth: 0,
        select: { slug: true, updatedAt: true },
        sort: 'sortOrder',
      }),
    ])

    for (const group of ageGroups.docs) {
      if (SHOP_PRESETS[group.slug]) continue
      entries.push({
        url: absoluteUrl(`/shop/${group.slug}`),
        lastModified: new Date(group.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }

    for (const category of categories.docs) {
      if (SHOP_PRESETS[category.slug]) continue
      entries.push({
        url: absoluteUrl(`/shop/${category.slug}`),
        lastModified: new Date(category.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }

    for (const product of products.docs) {
      entries.push({
        url: absoluteUrl(`/product/${product.slug}`),
        lastModified: new Date(product.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  } catch {
    // CMS down: still return static URLs
  }

  return entries
}

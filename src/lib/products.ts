import type { Where } from 'payload'
import { mediaUrl } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'

type ProductDoc = {
  id: string | number
  title: string
  slug: string
  description?: string | null
  gender?: string | null
  ageGroup?: string | null
  featured?: boolean | null
  images?: Array<{ image?: { url?: string | null; filename?: string | null } | number | null }> | null
  variants?: Array<{
    sku: string
    size: string
    color: string
    price: number
    compareAtPrice?: number | null
    stock: number
  }> | null
  category?: { slug?: string; name?: string } | string | number | null
}

export function productCardData(product: ProductDoc) {
  const firstImage = product.images?.[0]?.image
  const image = typeof firstImage === 'object' ? mediaUrl(firstImage) : null
  const firstVariant = product.variants?.[0]
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    image,
    price: firstVariant?.price || 0,
    compareAtPrice: firstVariant?.compareAtPrice || null,
    gender: product.gender || null,
  }
}

export async function getPublishedProducts(filters?: {
  categorySlug?: string
  gender?: string
  featured?: boolean
  ageGroup?: string
}) {
  const payload = await getPayloadClient()
  const and: Where[] = [{ _status: { equals: 'published' } }]

  if (filters?.featured) and.push({ featured: { equals: true } })
  if (filters?.gender) and.push({ gender: { equals: filters.gender } })
  if (filters?.ageGroup) and.push({ ageGroup: { equals: filters.ageGroup } })
  if (filters?.categorySlug) {
    and.push({ 'category.slug': { equals: filters.categorySlug } })
  }

  const result = await payload.find({
    collection: 'products',
    where: { and },
    depth: 2,
    limit: 48,
    sort: '-createdAt',
  })

  return result.docs as unknown as ProductDoc[]
}

export async function getProductBySlug(slug: string) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'products',
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
    depth: 2,
    limit: 1,
  })
  return (result.docs[0] as unknown as ProductDoc) || null
}

export async function getSettings() {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', depth: 1 })
}

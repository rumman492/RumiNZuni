import type { Where } from 'payload'
import { mediaUrl } from '@/lib/media'
import { samplePhotoForSlug } from '@/lib/samplePhotos'
import { getPayloadClient } from '@/lib/payload'

type MediaRef = { url?: string | null; filename?: string | null } | number | null

export type ProductDoc = {
  id: string | number
  title: string
  slug: string
  createdAt?: string | null
  description?: string | null
  gender?: string | null
  brand?: string | null
  bagType?: string | null
  productKind?: string | null
  skinType?: string | null
  ingredients?: string | null
  volume?: string | null
  dimensions?: string | null
  pattern?: string | null
  strapType?: string | null
  closureType?: string | null
  compartments?: string | null
  shade?: string | null
  finish?: string | null
  skinTone?: string | null
  formulation?: string | null
  skinConcern?: string | null
  keyIngredients?: string | null
  spf?: string | null
  fragranceType?: string | null
  fragranceFamily?: string | null
  topNotes?: string | null
  middleNotes?: string | null
  baseNotes?: string | null
  longevity?: string | null
  usageInstructions?: string | null
  warnings?: string | null
  manufacturer?: string | null
  countryOfOrigin?: string | null
  batchExpiry?: string | null
  ageGroup?: { name?: string | null; slug?: string | null } | string | number | null
  featured?: boolean | null
  material?: string | null
  careInstructions?: string | null
  sortPriority?: number | null
  seo?: { title?: string | null; description?: string | null } | null
  tags?: Array<{ name?: string | null; slug?: string | null } | string | number> | null
  sizeGuide?:
    | {
        title?: string | null
        description?: string | null
        notes?: string | null
        measurements?: Array<{
          size?: string | null
          age?: string | null
          chest?: string | null
          length?: string | null
          waist?: string | null
        }> | null
      }
    | string
    | number
    | null
  relatedProducts?: ProductDoc[] | Array<string | number> | null
  images?: Array<{ image?: MediaRef }> | null
  variants?: Array<{
    sku: string
    size: string
    color: string
    price: number
    compareAtPrice?: number | null
    stock: number
    shadeCode?: string | null
  }> | null
  category?: { slug?: string; name?: string } | string | number | null
  department?: { slug?: string; audience?: string | null } | string | number | null
}

export function productCardData(
  product: ProductDoc,
  variant?: NonNullable<ProductDoc['variants']>[number],
) {
  const firstImage = product.images?.[0]?.image
  const image = samplePhotoForSlug(product.slug) || (typeof firstImage === 'object' ? mediaUrl(firstImage) : null)
  const chosen = variant || product.variants?.[0]
  const soldOut = (product.variants || []).every((item) => item.stock < 1)
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    image,
    price: chosen?.price || 0,
    compareAtPrice: chosen?.compareAtPrice || null,
    gender: product.gender === 'boys' || product.gender === 'girls' ? product.gender : null,
    soldOut,
    featured: Boolean(product.featured),
    isNew: Boolean(product.createdAt && Date.now() - Date.parse(String(product.createdAt)) < 1000 * 60 * 60 * 24 * 30),
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
  if (filters?.ageGroup) and.push({ 'ageGroup.slug': { equals: filters.ageGroup } })
  if (filters?.categorySlug) {
    and.push({ 'category.slug': { equals: filters.categorySlug } })
  }

  const result = await payload.find({
    collection: 'products',
    where: { and },
    depth: 2,
    limit: 48,
    sort: ['-sortPriority', '-createdAt'],
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
    depth: 3,
    limit: 1,
  })
  return (result.docs[0] as unknown as ProductDoc) || null
}

export async function getSettings() {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', depth: 3 })
}

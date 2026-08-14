import { getPayloadClient } from '@/lib/payload'

export async function getCmsPage(slug: string) {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    return result.docs[0] || null
  } catch {
    return null
  }
}

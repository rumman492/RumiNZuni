import { getPayload } from 'payload'
import { seedWomensPicturedSamples } from '@/lib/seedCatalog'

let womenSeed: Promise<void> | null = null

export async function getPayloadClient() {
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })
  if (!womenSeed) {
    womenSeed = seedWomensPicturedSamples(payload).catch((error) => {
      payload.logger.error(
        error instanceof Error ? error.message : 'Women’s pictured samples failed to load.',
      )
    })
  }
  await womenSeed
  return payload
}

import { getPayload } from 'payload'

export async function getPayloadClient() {
  const { default: config } = await import('@payload-config')
  return getPayload({ config })
}

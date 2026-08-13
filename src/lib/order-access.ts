import { createHmac, timingSafeEqual } from 'crypto'
import { productionPayloadSecret } from '@/lib/env'
function secret() {
  return productionPayloadSecret()
}

export function createOrderAccessToken(orderNumber: string) {
  return createHmac('sha256', secret()).update(`order:${orderNumber}`).digest('base64url').slice(0, 24)
}

export function verifyOrderAccessToken(orderNumber: string, token?: string | null) {
  if (!token || token.length < 16 || token.length > 64) return false
  const expected = createOrderAccessToken(orderNumber)
  const left = Buffer.from(expected)
  const right = Buffer.from(token)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

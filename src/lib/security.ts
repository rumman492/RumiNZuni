import { siteOrigin } from '@/lib/site'

const CHECKOUT_MAX_BYTES = 24 * 1024
const buckets = new Map<string, { count: number; resetAt: number }>()

export const RATE_LIMITS = {
  checkoutIp: { limit: 8, windowMs: 15 * 60 * 1000 },
  checkoutPhone: { limit: 5, windowMs: 60 * 60 * 1000 },
  trackIp: { limit: 30, windowMs: 15 * 60 * 1000 },
} as const

function pruneBuckets(now: number) {
  if (buckets.size < 2000) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

type HeaderSource = { headers: Headers }

export function clientIp(req: HeaderSource) {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const ip = forwarded.split(',')[0]?.trim()
    if (ip) return ip.slice(0, 64)
  }
  return req.headers.get('x-real-ip')?.trim().slice(0, 64) || 'unknown'
}

export function allowedOrigins() {
  const origins = new Set([siteOrigin()])
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000')
    origins.add('http://127.0.0.1:3000')
  }
  return origins
}

export function isSameOrigin(req: HeaderSource) {
  const allowed = allowedOrigins()
  const origin = req.headers.get('origin')?.replace(/\/$/, '')
  if (origin) return allowed.has(origin)
  const referer = req.headers.get('referer')
  if (referer) {
    try {
      const url = new URL(referer)
      return allowed.has(`${url.protocol}//${url.host}`)
    } catch {
      return false
    }
  }
  return process.env.NODE_ENV !== 'production'
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  pruneBuckets(now)
  const current = buckets.get(key)
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true as const, remaining: limit - 1 }
  }
  if (current.count >= limit) {
    return { ok: false as const, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) }
  }
  current.count += 1
  return { ok: true as const, remaining: limit - current.count }
}

export function rateLimitedResponse(retryAfter: number) {
  return Response.json(
    { error: 'Too many attempts. Please wait a minute and try again.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'Cache-Control': 'no-store',
      },
    },
  )
}

export function publicError(message: string, status = 400) {
  return Response.json(
    { error: message },
    {
      status,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}

export function safePublicError(error: unknown, logger?: { error: (value: unknown) => void }) {
  logger?.error({ err: error, msg: 'Public endpoint failed.' })
  return publicError('Something went wrong. Please try again.', 500)
}

export function rejectOversizedJson(req: HeaderSource) {
  const length = Number(req.headers.get('content-length') || 0)
  if (Number.isFinite(length) && length > CHECKOUT_MAX_BYTES) {
    return publicError('Request is too large.', 413)
  }
  return null
}

export function requireJsonPost(req: HeaderSource) {
  const contentType = req.headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    return publicError('Invalid request.')
  }
  return null
}

export function publicHttpUrl(value?: string | null) {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.toString()
  } catch {
    return null
  }
  return null
}

export const ORDER_NUMBER_PATTERN = /^RNZ-\d{8}-\d{6}$/
export const SKU_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,39}$/

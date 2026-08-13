/** Production canonical origin. www is redirected here by Caddy. */
export const CANONICAL_PRODUCTION_ORIGIN = 'https://ruminzuni.com'

/** Public storefront name. Domain and repo stay ruminzuni.com. */
export const STORE_NAME = 'Rumi & Zuni'

export function siteOrigin() {
  const raw = (process.env.NEXT_PUBLIC_SERVER_URL || process.env.SITE_URL || '').trim().replace(/\/$/, '')
  if (raw) {
    try {
      const url = new URL(raw)
      if (url.hostname === 'www.ruminzuni.com' || url.hostname === 'ruminzuni.com') {
        return CANONICAL_PRODUCTION_ORIGIN
      }
      return `${url.protocol}//${url.host}`
    } catch {
      // fall through to defaults
    }
  }
  if (process.env.NODE_ENV === 'production') return CANONICAL_PRODUCTION_ORIGIN
  return 'http://localhost:3000'
}

export function absoluteUrl(path = '/') {
  const origin = siteOrigin()
  if (!path || path === '/') return origin
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${origin}${normalized}`
}

export function absoluteMediaUrl(path: string | null | undefined) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  return absoluteUrl(path)
}

export function socialProfileUrl(value: string | null | undefined, network: 'facebook' | 'instagram') {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed)
      if (url.protocol === 'http:' || url.protocol === 'https:') return url.toString()
    } catch {
      return null
    }
    return null
  }
  const handle = trimmed.replace(/^@/, '').replace(/^\/+/, '')
  if (!handle) return null
  return network === 'instagram'
    ? `https://www.instagram.com/${handle}`
    : `https://www.facebook.com/${handle}`
}

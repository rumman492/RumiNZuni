import type { MetadataRoute } from 'next'
import { siteOrigin } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/cart', '/checkout', '/track', '/order', '/order/'],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin.replace(/^https?:\/\//, ''),
  }
}

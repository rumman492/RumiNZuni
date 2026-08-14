import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
]

const payloadStandaloneIncludes = [
  'graphql',
  'pino',
  'pino-pretty',
  'sharp',
  'payload',
  '@payloadcms/next',
  '@payloadcms/ui',
  '@payloadcms/db-postgres',
  '@payloadcms/drizzle',
  '@payloadcms/graphql',
  '@payloadcms/richtext-lexical',
]

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  outputFileTracingIncludes: {
    '**/*': payloadStandaloneIncludes,
  },
  images: {
    localPatterns: [{ pathname: '/api/media/file/**' }],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        source: '/admin',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/cart',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/checkout',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/track',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/order/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  async redirects() {
    return [
      { source: '/kids-wear', destination: '/shop/kids-wear', permanent: true },
      { source: '/kids-wear/boys', destination: '/shop/boys', permanent: true },
      { source: '/kids-wear/girls', destination: '/shop/girls', permanent: true },
      { source: '/baby-kids-accessories', destination: '/shop/baby-kids-accessories', permanent: true },
      { source: '/kids-footwear', destination: '/shop/kids-footwear', permanent: true },
      { source: '/womens', destination: '/shop/womens', permanent: true },
      { source: '/womens/handbags', destination: '/shop/handbags', permanent: true },
      { source: '/womens/beauty', destination: '/shop/beauty', permanent: true },
      { source: '/womens/skincare', destination: '/shop/skincare', permanent: true },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

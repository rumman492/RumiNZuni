import type { Metadata } from 'next'
import { mediaUrl } from '@/lib/media'
import { absoluteMediaUrl, absoluteUrl, siteOrigin, socialProfileUrl } from '@/lib/site'
import type { ProductDoc } from '@/lib/products'

export const DEFAULT_TITLE = 'RumiNZuni — Kids wear, cash on delivery'
export const DEFAULT_DESCRIPTION =
  'RumiNZuni sells kids wear across Pakistan on cash on delivery. Soft everyday outfits for newborn to 12 years.'

export const noIndexRobots = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false, noimageindex: true },
} as const

export function pageMeta(opts: {
  title: string
  description: string
  path: string
  image?: string | null
  index?: boolean
  follow?: boolean
  ogType?: 'website' | 'article'
}): Metadata {
  const url = absoluteUrl(opts.path)
  const index = opts.index !== false
  const follow = opts.follow !== false
  const image = opts.image || undefined

  return {
    title: opts.title,
    description: opts.description,
    alternates: index
      ? { canonical: url, languages: { 'en-PK': url, 'x-default': url } }
      : { canonical: url },
    robots: index
      ? { index: true, follow }
      : { index: false, follow, googleBot: { index: false, follow } },
    openGraph: {
      type: opts.ogType || 'website',
      locale: 'en_PK',
      url,
      siteName: 'RumiNZuni',
      title: opts.title,
      description: opts.description,
      images: image ? [{ url: image, alt: opts.title }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: opts.title,
      description: opts.description,
      images: image ? [image] : undefined,
    },
  }
}

export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export type BreadcrumbItem = { name: string; href: string }

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  }
}

type SettingsLike = {
  storeName?: string | null
  tagline?: string | null
  email?: string | null
  phone?: string | null
  instagram?: string | null
  facebook?: string | null
  logo?: { url?: string | null; filename?: string | null } | number | string | null
}

export function organizationJsonLd(settings?: SettingsLike | null) {
  const origin = siteOrigin()
  const logo =
    settings?.logo && typeof settings.logo === 'object' ? absoluteMediaUrl(mediaUrl(settings.logo)) : null
  const sameAs = [
    socialProfileUrl(settings?.instagram, 'instagram'),
    socialProfileUrl(settings?.facebook, 'facebook'),
  ].filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'OnlineStore'],
    name: settings?.storeName || 'RumiNZuni',
    alternateName: 'Rumi NZ uni',
    url: origin,
    description: settings?.tagline || DEFAULT_DESCRIPTION,
    logo: logo || undefined,
    email: settings?.email || undefined,
    telephone: settings?.phone || undefined,
    currenciesAccepted: 'PKR',
    paymentAccepted: 'Cash on delivery',
    areaServed: { '@type': 'Country', name: 'Pakistan' },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PK',
    },
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  }
}

export function websiteJsonLd(settings?: SettingsLike | null) {
  const origin = siteOrigin()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings?.storeName || 'RumiNZuni',
    url: origin,
    description: settings?.tagline || DEFAULT_DESCRIPTION,
    inLanguage: 'en-PK',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${origin}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function productJsonLd(product: ProductDoc) {
  const url = absoluteUrl(`/product/${product.slug}`)
  const images = (product.images || [])
    .map((entry) => (typeof entry.image === 'object' ? absoluteMediaUrl(mediaUrl(entry.image)) : null))
    .filter((src): src is string => Boolean(src))
  const variants = product.variants || []
  const prices = variants.map((variant) => variant.price).filter((price) => Number.isFinite(price))
  const inStock = variants.some((variant) => variant.stock > 0)
  const low = prices.length ? Math.min(...prices) : 0
  const high = prices.length ? Math.max(...prices) : 0
  const sku = variants[0]?.sku
  const brand = { '@type': 'Brand', name: 'RumiNZuni' }
  const category =
    typeof product.category === 'object' && product.category?.name ? product.category.name : undefined
  const seller = {
    '@type': 'Organization',
    name: 'RumiNZuni',
    url: siteOrigin(),
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': url,
    name: product.seo?.title || product.title,
    description: product.seo?.description || product.description || undefined,
    image: images.length > 0 ? images : undefined,
    sku,
    brand,
    category,
    material: product.material || undefined,
    url,
    offers: {
      '@type': 'AggregateOffer',
      url,
      priceCurrency: 'PKR',
      lowPrice: low,
      highPrice: high,
      offerCount: variants.length || 1,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller,
      offers: variants.map((variant) => ({
        '@type': 'Offer',
        sku: variant.sku,
        url,
        priceCurrency: 'PKR',
        price: variant.price,
        availability: variant.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller,
      })),
    },
  }
}

import { HandCoins, RotateCcw, Sparkles, Truck, type LucideIcon } from 'lucide-react'
import { storefrontHref } from '@/lib/links'
import { mediaUrl } from '@/lib/media'
import { getPublishedProducts, productCardData, type ProductDoc } from '@/lib/products'

type MediaRef = { url?: string | null; filename?: string | null } | number | null

type CategoryRef = { slug?: string | null; name?: string | null } | string | number | null

export type HomepageSettings = {
  heroEyebrow?: string | null
  heroTitle?: string | null
  heroSubtitle?: string | null
  heroImage?: MediaRef
  heroCta?: string | null
  heroCtaLink?: string | null
  heroSecondaryCta?: string | null
  heroSecondaryCtaLink?: string | null
  heroOverlayTitle?: string | null
  heroOverlaySubtitle?: string | null
  homeBannerTitle?: string | null
  homeBannerCopy?: string | null
  homeBannerCta?: string | null
  homeBannerCtaLink?: string | null
  homeCollections?: Array<{
    title: string
    copy?: string | null
    href?: string | null
    category?: CategoryRef
    image?: MediaRef
  }> | null
  featuredEyebrow?: string | null
  featuredHeading?: string | null
  featuredCta?: string | null
  featuredCtaLink?: string | null
  featuredEmptyMessage?: string | null
  homeFeaturedProducts?: ProductDoc[] | Array<string | number> | null
  homePromos?: Array<{
    icon?: string | null
    title: string
    copy: string
  }> | null
  homeStoryEyebrow?: string | null
  homeStoryTitle?: string | null
  homeStoryBody?: string | null
  homeStoryImage?: MediaRef
  homeStoryCta?: string | null
  homeStoryCtaLink?: string | null
}

export const DEFAULT_HOME_COLLECTIONS = [
  { title: 'Boys', copy: 'Polos, sets, and play tees', href: '/shop/boys' },
  { title: 'Girls', copy: 'Frocks, two-piece sets, everyday knits', href: '/shop/girls' },
  { title: 'Newborn', copy: 'Rompers, sleepsuits, first outfits', href: '/shop/newborn' },
  { title: 'Unisex', copy: 'Soft basics for everyone', href: '/shop/unisex' },
]

export const DEFAULT_HOME_PROMOS = [
  {
    icon: 'cod',
    title: 'Cash on delivery',
    copy: 'Pay the rider in PKR when your parcel arrives. No card needed.',
  },
  {
    icon: 'shipping',
    title: 'Pakistan-wide',
    copy: 'We ship to major cities. Free delivery over the store threshold.',
  },
  {
    icon: 'returns',
    title: 'Easy exchanges',
    copy: 'Wrong size? Message us on WhatsApp within 3 days of delivery.',
  },
]

const PROMO_ICONS: Record<string, LucideIcon> = {
  cod: HandCoins,
  shipping: Truck,
  returns: RotateCcw,
  sparkles: Sparkles,
}

function collectionHref(item: { href?: string | null; category?: CategoryRef }) {
  if (item.href) return storefrontHref(item.href, '/shop')
  if (typeof item.category === 'object' && item.category?.slug) {
    return `/shop/${item.category.slug}`
  }
  return '/shop'
}

export function homepageHero(settings: HomepageSettings | null) {
  const image = typeof settings?.heroImage === 'object' ? mediaUrl(settings.heroImage) : null
  return {
    eyebrow: settings?.heroEyebrow || 'Pakistan · Cash on delivery',
    title: settings?.heroTitle || 'Little outfits, made for everyday play',
    subtitle:
      settings?.heroSubtitle ||
      'Breathable kids wear for Pakistani weather. Order on cash on delivery — pay when it arrives.',
    image,
    cta: settings?.heroCta || 'Shop new arrivals',
    ctaLink: storefrontHref(settings?.heroCtaLink, '/shop'),
    secondaryCta: settings?.heroSecondaryCta || 'How COD works',
    secondaryCtaLink: storefrontHref(settings?.heroSecondaryCtaLink, '/shipping'),
    overlayTitle: settings?.heroOverlayTitle || 'Ages newborn – 12',
    overlaySubtitle: settings?.heroOverlaySubtitle || 'Boys · Girls · Unisex',
  }
}

export function homepageBanner(settings: HomepageSettings | null) {
  if (!settings?.homeBannerTitle) return null
  return {
    title: settings.homeBannerTitle,
    copy: settings.homeBannerCopy || null,
    cta: settings.homeBannerCta || null,
    ctaLink: storefrontHref(settings.homeBannerCtaLink, '/shop'),
  }
}

export function homepageCollections(settings: HomepageSettings | null) {
  const rows = settings?.homeCollections?.filter((item) => item.title) || []
  const source = rows.length > 0 ? rows : DEFAULT_HOME_COLLECTIONS
  return source.map((item) => ({
    title: item.title,
    copy: item.copy || '',
    href: collectionHref(item),
    image: 'image' in item && typeof item.image === 'object' ? mediaUrl(item.image) : null,
  }))
}

export function homepagePromos(settings: HomepageSettings | null) {
  const rows = settings?.homePromos?.filter((item) => item.title && item.copy) || []
  const source = rows.length > 0 ? rows : DEFAULT_HOME_PROMOS
  return source.map((item) => ({
    title: item.title,
    copy: item.copy,
    Icon: PROMO_ICONS[item.icon || 'cod'] || HandCoins,
  }))
}

export function homepageStory(settings: HomepageSettings | null) {
  if (!settings?.homeStoryTitle) return null
  return {
    eyebrow: settings.homeStoryEyebrow || null,
    title: settings.homeStoryTitle,
    body: settings.homeStoryBody || null,
    image: typeof settings.homeStoryImage === 'object' ? mediaUrl(settings.homeStoryImage) : null,
    cta: settings.homeStoryCta || null,
    ctaLink: storefrontHref(settings.homeStoryCtaLink, '/contact'),
  }
}

export function homepageFeaturedCopy(settings: HomepageSettings | null) {
  return {
    eyebrow: settings?.featuredEyebrow || 'Featured',
    heading: settings?.featuredHeading || 'Little bestsellers',
    cta: settings?.featuredCta || 'View all',
    ctaLink: storefrontHref(settings?.featuredCtaLink, '/shop'),
    emptyMessage:
      settings?.featuredEmptyMessage ||
      'Products will appear here after you seed the catalog or add items in the admin panel.',
  }
}

export async function homepageFeaturedCards(settings: HomepageSettings | null) {
  const picked = (settings?.homeFeaturedProducts || []).filter(
    (item): item is ProductDoc => typeof item === 'object' && item !== null && 'slug' in item,
  )
  if (picked.length > 0) {
    return picked.slice(0, 8).map((product) => productCardData(product))
  }

  let featured = await getPublishedProducts({ featured: true })
  if (featured.length === 0) featured = await getPublishedProducts()
  return featured.slice(0, 8).map((product) => productCardData(product))
}

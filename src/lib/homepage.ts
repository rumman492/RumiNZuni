import { HandCoins, RotateCcw, Sparkles, Truck, type LucideIcon } from 'lucide-react'
import { FEATURED, HERO, HOME_BANNER, HOME_COLLECTIONS, HOME_PROMOS, HOME_STORY, HOME_WOMEN_COLLECTIONS } from '@/lib/brandCopy'
import { storefrontHref } from '@/lib/links'
import { mediaUrl } from '@/lib/media'
import { getPublishedProducts, productCardData, type ProductDoc } from '@/lib/products'
import { isUnisexPublicItem, stripUnisexCopy } from '@/lib/taxonomy'

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

export const DEFAULT_HOME_COLLECTIONS = HOME_COLLECTIONS

export const DEFAULT_HOME_PROMOS = HOME_PROMOS

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
    eyebrow: settings?.heroEyebrow || HERO.eyebrow,
    title: settings?.heroTitle || HERO.title,
    subtitle: settings?.heroSubtitle || HERO.subtitle,
    image,
    cta: settings?.heroCta || HERO.cta,
    ctaLink: storefrontHref(settings?.heroCtaLink, HERO.ctaLink),
    secondaryCta: settings?.heroSecondaryCta || HERO.secondaryCta,
    secondaryCtaLink: storefrontHref(settings?.heroSecondaryCtaLink, HERO.secondaryCtaLink),
    overlayTitle: settings?.heroOverlayTitle || HERO.overlayTitle,
    overlaySubtitle: stripUnisexCopy(settings?.heroOverlaySubtitle || HERO.overlaySubtitle) || HERO.overlaySubtitle,
  }
}

export function homepageBanner(settings: HomepageSettings | null) {
  return {
    title: settings?.homeBannerTitle || HOME_BANNER.title,
    copy: settings?.homeBannerCopy || HOME_BANNER.copy,
    cta: settings?.homeBannerCta || HOME_BANNER.cta,
    ctaLink: storefrontHref(settings?.homeBannerCtaLink, HOME_BANNER.ctaLink),
  }
}

function isWomenCollectionHref(href: string) {
  return /\/shop\/(womens|handbags|beauty-care|beauty|skincare|perfumes)(\?|$)/.test(href)
}

export function homepageCollections(settings: HomepageSettings | null) {
  const rows = settings?.homeCollections?.filter((item) => item.title) || []
  const source = rows.length > 0 ? [...rows] : [...DEFAULT_HOME_COLLECTIONS]
  const mapped = source
    .filter((item) => {
      const category = 'category' in item ? item.category : undefined
      const slug = typeof category === 'object' && category ? category.slug : undefined
      return !isUnisexPublicItem({ title: item.title, href: collectionHref(item), slug })
    })
    .map((item) => ({
      title: item.title,
      copy: item.copy || '',
      href: collectionHref(item),
      image: 'image' in item && typeof item.image === 'object' ? mediaUrl(item.image) : null,
    }))

  const hasWomen = mapped.some((item) => isWomenCollectionHref(item.href))
  if (!hasWomen) {
    mapped.push(
      ...HOME_WOMEN_COLLECTIONS.map((item) => ({
        title: item.title,
        copy: item.copy,
        href: item.href,
        image: null as string | null,
      })),
    )
  }
  return mapped
}

export function splitHomeCollections(items: ReturnType<typeof homepageCollections>) {
  const kids: typeof items = []
  const women: typeof items = []
  for (const item of items) {
    if (isWomenCollectionHref(item.href)) women.push(item)
    else kids.push(item)
  }
  return { kids, women }
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
  return {
    eyebrow: settings?.homeStoryEyebrow || HOME_STORY.eyebrow,
    title: settings?.homeStoryTitle || HOME_STORY.title,
    body: settings?.homeStoryBody || HOME_STORY.body,
    image: typeof settings?.homeStoryImage === 'object' ? mediaUrl(settings.homeStoryImage) : null,
    cta: settings?.homeStoryCta || HOME_STORY.cta,
    ctaLink: storefrontHref(settings?.homeStoryCtaLink, HOME_STORY.ctaLink),
  }
}

export function homepageFeaturedCopy(settings: HomepageSettings | null) {
  return {
    eyebrow: settings?.featuredEyebrow || FEATURED.eyebrow,
    heading: settings?.featuredHeading || FEATURED.heading,
    cta: settings?.featuredCta || FEATURED.cta,
    ctaLink: storefrontHref(settings?.featuredCtaLink, FEATURED.ctaLink),
    emptyMessage: settings?.featuredEmptyMessage || FEATURED.emptyMessage,
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

export const SAMPLE_PRODUCT_PHOTOS: Record<string, string> = {
  'womens-sage-tote': '/samples/womens-sage-tote.jpg',
  'womens-coral-crossbody': '/samples/womens-coral-crossbody.jpg',
  'womens-blush-clutch': '/samples/womens-blush-clutch.jpg',
  'womens-navy-satchel': '/samples/womens-navy-satchel.jpg',
  'womens-mini-backpack': '/samples/womens-mini-backpack.jpg',
  'womens-ivory-shoulder': '/samples/womens-ivory-shoulder.jpg',
  'womens-market-tote': '/samples/womens-sage-tote.jpg',
  'womens-city-sling': '/samples/womens-coral-crossbody.jpg',
  'womens-foldover-clutch': '/samples/womens-blush-clutch.jpg',
  'womens-lipstick-compact': '/samples/womens-lipstick-compact.jpg',
  'womens-mascara-brush': '/samples/womens-mascara-brush.jpg',
  'womens-kohl-gloss': '/samples/womens-kohl-gloss.jpg',
  'womens-everyday-lipstick': '/samples/womens-lipstick-compact.jpg',
  'womens-soft-blush': '/samples/womens-lipstick-compact.jpg',
  'womens-length-mascara': '/samples/womens-mascara-brush.jpg',
  'womens-brow-pencil': '/samples/womens-kohl-gloss.jpg',
  'womens-nude-gloss': '/samples/womens-kohl-gloss.jpg',
  'womens-mini-makeup-kit': '/samples/womens-mascara-brush.jpg',
  'womens-face-cream': '/samples/womens-face-cream.jpg',
  'womens-cleanser': '/samples/womens-cleanser.jpg',
  'womens-serum': '/samples/womens-serum.jpg',
  'womens-day-moisturizer': '/samples/womens-face-cream.jpg',
  'womens-foam-cleanser': '/samples/womens-cleanser.jpg',
  'womens-vitamin-serum': '/samples/womens-serum.jpg',
  'womens-night-cream': '/samples/womens-face-cream.jpg',
  'womens-micellar-water': '/samples/womens-cleanser.jpg',
  'womens-eye-serum': '/samples/womens-serum.jpg',
  'womens-floral-edp': '/samples/womens-floral-edp.jpg',
  'womens-citrus-mist': '/samples/womens-citrus-mist.jpg',
  'womens-amber-oil': '/samples/womens-amber-oil.jpg',
  'womens-woody-edt': '/samples/womens-woody-edt.jpg',
  'womens-musk-edp': '/samples/womens-musk-edp.jpg',
  'womens-rose-mist': '/samples/womens-rose-mist.jpg',
  'womens-fresh-edc': '/samples/womens-citrus-mist.jpg',
  'womens-gourmand-oil': '/samples/womens-amber-oil.jpg',
  'womens-fragrance-set': '/samples/womens-floral-edp.jpg',
}

export const WOMEN_HUB_PHOTOS: Record<string, string> = {
  handbags: '/samples/womens-sage-tote.jpg',
  'beauty-care': '/samples/womens-lipstick-compact.jpg',
  beauty: '/samples/womens-lipstick-compact.jpg',
  skincare: '/samples/womens-face-cream.jpg',
  perfumes: '/samples/womens-floral-edp.jpg',
}

export function samplePhotoForSlug(slug?: string | null) {
  if (!slug) return null
  return SAMPLE_PRODUCT_PHOTOS[slug] || null
}

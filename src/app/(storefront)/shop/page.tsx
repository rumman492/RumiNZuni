import type { Metadata } from 'next'
import { ShopListing } from '@/components/ShopListing'
import { catalogMetadata, parseCatalogSearchParams, type CatalogSearchParams } from '@/lib/catalog'

type Props = { searchParams: Promise<CatalogSearchParams> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = parseCatalogSearchParams(await searchParams)
  return catalogMetadata(query, {
    basePath: '/shop',
    heading: 'Shop kids wear',
    description:
      'Shop kids wear at Rumi & Zuni. Filter by category, gender, age, size, colour, and price. Cash on delivery across Pakistan.',
  })
}

export default async function ShopPage({ searchParams }: Props) {
  const query = parseCatalogSearchParams(await searchParams)
  return (
    <ShopListing
      title="Shop kids wear"
      description="Everyday outfits with cash on delivery. Filter by size, colour, and age — you can confirm on WhatsApp after ordering."
      basePath="/shop"
      query={query}
      breadcrumbs={[
        { name: 'Home', href: '/' },
        { name: 'Shop', href: '/shop' },
      ]}
    />
  )
}

import type { Metadata } from 'next'
import { ShopListing } from '@/components/ShopListing'
import { catalogMetadata, parseCatalogSearchParams, type CatalogSearchParams } from '@/lib/catalog'

type Props = { searchParams: Promise<CatalogSearchParams> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = parseCatalogSearchParams(await searchParams)
  return catalogMetadata(query, {
    basePath: '/shop',
    heading: 'Shop',
    description:
      'Kids clothing in Pakistan for newborn to 12 years — boys, girls, accessories, and footwear. Cash on delivery.',
  })
}

export default async function ShopPage({ searchParams }: Props) {
  const query = parseCatalogSearchParams(await searchParams)
  return (
    <ShopListing
      title="Shop"
      description="Kids wear from newborn to 12 years, plus accessories and footwear. Women’s handbags and beauty live in their own corner of the shop."
      basePath="/shop"
      query={query}
      breadcrumbs={[
        { name: 'Home', href: '/' },
        { name: 'Shop', href: '/shop' },
      ]}
    />
  )
}

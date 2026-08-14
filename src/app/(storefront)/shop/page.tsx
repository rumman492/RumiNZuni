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
      'Boys and girls wear from newborn to 12 years, kids accessories, footwear, and women’s bags, beauty, and skincare. Cash on delivery across Pakistan.',
  })
}

export default async function ShopPage({ searchParams }: Props) {
  const query = parseCatalogSearchParams(await searchParams)
  return (
    <ShopListing
      title="Shop"
      description="Boys and girls wear from newborn to 12 years, plus kids accessories, footwear, and women’s bags, beauty, and skincare. Cash on delivery across Pakistan."
      basePath="/shop"
      query={query}
      breadcrumbs={[
        { name: 'Home', href: '/' },
        { name: 'Shop', href: '/shop' },
      ]}
    />
  )
}

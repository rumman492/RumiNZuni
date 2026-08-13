import { ProductCard } from '@/components/ProductCard'
import { getPublishedProducts, productCardData } from '@/lib/products'

export const metadata = { title: 'Shop' }

export default async function ShopPage() {
  let products: Awaited<ReturnType<typeof getPublishedProducts>> = []
  try {
    products = await getPublishedProducts()
  } catch {
    products = []
  }

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-wide text-coral">Catalog</p>
      <h1 className="display mt-2 text-5xl">Shop kids wear</h1>
      <p className="mt-3 max-w-2xl text-ink-soft">
        Everyday outfits with cash on delivery. Choose size by age — you can confirm on WhatsApp after ordering.
      </p>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} {...productCardData(product)} />
        ))}
      </div>
      {products.length === 0 ? (
        <p className="mt-8 rounded-3xl bg-white p-8 text-ink-soft">No products yet. Add them from /admin.</p>
      ) : null}
    </div>
  )
}

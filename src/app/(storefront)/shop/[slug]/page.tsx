import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/ProductCard'
import { getPublishedProducts, productCardData } from '@/lib/products'

const presets: Record<string, { title: string; gender?: string; ageGroup?: string }> = {
  boys: { title: 'Boys', gender: 'boys' },
  girls: { title: 'Girls', gender: 'girls' },
  newborn: { title: 'Newborn', ageGroup: 'newborn' },
  unisex: { title: 'Unisex', gender: 'unisex' },
}

export default async function ShopSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const preset = presets[slug]
  let products: Awaited<ReturnType<typeof getPublishedProducts>> = []

  try {
    products = preset
      ? await getPublishedProducts({ gender: preset.gender, ageGroup: preset.ageGroup })
      : await getPublishedProducts({ categorySlug: slug })
  } catch {
    products = []
  }

  if (!preset && products.length === 0) notFound()

  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-wide text-coral">Shop</p>
      <h1 className="display mt-2 text-5xl">{preset?.title || slug}</h1>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} {...productCardData(product)} />
        ))}
      </div>
      {products.length === 0 ? <p className="mt-8 text-ink-soft">Nothing in this collection yet.</p> : null}
    </div>
  )
}

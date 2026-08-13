import { notFound } from 'next/navigation'
import { AddToCart } from '@/components/AddToCart'
import { mediaUrl } from '@/lib/media'
import { getProductBySlug } from '@/lib/products'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug).catch(() => null)
  if (!product) notFound()

  const images =
    product.images
      ?.map((entry) => (typeof entry.image === 'object' ? mediaUrl(entry.image) : null))
      .filter(Boolean) || []

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="grid gap-4">
        {images.length > 0 ? (
          images.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src || ''} alt={product.title} className="w-full rounded-[2rem] bg-sand object-cover" />
          ))
        ) : (
          <div className="grid aspect-[4/5] place-items-center rounded-[2rem] bg-sand text-ink-soft">
            Photo coming soon
          </div>
        )}
      </div>
      <div>
        <p className="text-sm uppercase tracking-wide text-ink-soft">
          {product.gender} · {product.ageGroup}
        </p>
        <h1 className="display mt-2 text-5xl">{product.title}</h1>
        <p className="mt-4 max-w-xl text-ink-soft">{product.description}</p>
        <div className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm">
          <AddToCart
            productId={product.id}
            slug={product.slug}
            title={product.title}
            image={images[0]}
            variants={product.variants || []}
          />
        </div>
      </div>
    </div>
  )
}

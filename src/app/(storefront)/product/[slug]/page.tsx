import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AddToCart } from '@/components/AddToCart'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { JsonLd } from '@/components/JsonLd'
import { ProductCard } from '@/components/ProductCard'
import { mediaUrl } from '@/lib/media'
import { samplePhotoForSlug } from '@/lib/samplePhotos'
import { formatProductSize } from '@/lib/sizing'
import { publicGenderLabel } from '@/lib/taxonomy'
import { getProductBySlug, productCardData, type ProductDoc } from '@/lib/products'
import { pageMeta, productJsonLd } from '@/lib/seo'
import { absoluteMediaUrl } from '@/lib/site'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug).catch(() => null)
  if (!product) return { title: 'Product', robots: { index: false, follow: true } }
  const firstImage = product.images?.[0]?.image
  const image = typeof firstImage === 'object' ? absoluteMediaUrl(mediaUrl(firstImage)) : null
  const prices = (product.variants || []).map((variant) => variant.price).filter((price) => Number.isFinite(price))
  const inStock = (product.variants || []).some((variant) => variant.stock > 0)
  return {
    ...pageMeta({
      title: product.seo?.title || product.title,
      description:
        product.seo?.description ||
        product.description ||
        `Buy ${product.title} from Rumi & Zuni. Cash on delivery across Pakistan.`,
      path: `/product/${product.slug}`,
      image,
    }),
    other: {
      'product:availability': inStock ? 'in stock' : 'out of stock',
      'product:condition': 'new',
      'product:price:amount': String(prices.length ? Math.min(...prices) : 0),
      'product:price:currency': 'PKR',
    },
  }
}

function WomenSpecs({ product }: { product: ProductDoc }) {
  const rows: Array<[string, string]> = [
    ['Brand', product.brand],
    ['Product type', product.productKind],
    ['Bag type', product.bagType],
    ['Material', product.material],
    ['Pattern', product.pattern],
    ['Strap', product.strapType],
    ['Closure', product.closureType],
    ['Compartments', product.compartments],
    ['Dimensions', product.dimensions],
    ['Shade', product.shade],
    ['Finish', product.finish],
    ['Skin tone', product.skinTone],
    ['Formulation', product.formulation],
    ['Skin type', product.skinType],
    ['Skin concern', product.skinConcern],
    ['Key ingredients', product.keyIngredients],
    ['SPF', product.spf],
    ['Volume', product.volume],
    ['Fragrance type', product.fragranceType],
    ['Fragrance family', product.fragranceFamily],
    ['Top notes', product.topNotes],
    ['Heart notes', product.middleNotes],
    ['Base notes', product.baseNotes],
    ['Longevity', product.longevity],
    ['Ingredients', product.ingredients],
    ['How to use', product.usageInstructions],
    ['Warnings', product.warnings],
    ['Manufacturer', product.manufacturer],
    ['Country of origin', product.countryOfOrigin],
    ['Batch / expiry', product.batchExpiry],
  ].flatMap(([label, value]) => (value ? [[label, value] as [string, string]] : []))

  if (rows.length === 0) return null
  return (
    <dl className="mt-6 grid gap-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="font-bold">{label}</dt>
          <dd className="whitespace-pre-line text-ink-soft">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function relatedCards(product: ProductDoc) {
  return (product.relatedProducts || [])
    .filter((item): item is ProductDoc => typeof item === 'object' && item !== null && 'slug' in item)
    .map((item) => productCardData(item))
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug).catch(() => null)
  if (!product) notFound()

  const images: string[] =
    product.images
      ?.map((entry) => (typeof entry.image === 'object' ? mediaUrl(entry.image) : null))
      .filter((src): src is string => Boolean(src)) || []
  const fallback = samplePhotoForSlug(product.slug)
  if (fallback && !images.includes(fallback)) images.push(fallback)

  const tags = (product.tags || []).flatMap((tag) =>
    typeof tag === 'object' && tag?.name ? [tag.name] : [],
  )
  const sizeGuide = typeof product.sizeGuide === 'object' ? product.sizeGuide : null
  const related = relatedCards(product)
  const category =
    typeof product.category === 'object' && product.category?.slug && product.category.name && product.category.slug !== 'unisex'
      ? { name: product.category.name, slug: product.category.slug }
      : null

  return (
    <div className="space-y-16">
      <JsonLd data={productJsonLd(product)} />
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Shop', href: '/shop' },
          ...(category ? [{ name: category.name, href: `/shop/${category.slug}` }] : []),
          { name: product.title, href: `/product/${product.slug}` },
        ]}
      />
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
            {typeof product.department === 'object' && product.department?.audience === 'women'
              ? [typeof product.category === 'object' ? product.category?.name : null, product.brand].filter(Boolean).join(' · ')
              : [publicGenderLabel(product.gender), typeof product.ageGroup === 'object' && product.ageGroup?.name]
                  .filter(Boolean)
                  .join(' · ')}
          </p>
          <h1 className="display mt-2 text-5xl">{product.title}</h1>
          {tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-sand px-3 py-1 text-xs font-bold">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <p className="mt-4 max-w-xl text-ink-soft">{product.description}</p>
          <WomenSpecs product={product} />
          {product.material ? (
            <p className="mt-3 text-sm">
              <span className="font-bold">Material:</span> {product.material}
            </p>
          ) : null}
          <div className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm">
            <AddToCart
              productId={product.id}
              slug={product.slug}
              title={product.title}
              image={images[0]}
              variants={product.variants || []}
            />
          </div>
          {product.careInstructions ? (
            <div className="mt-8">
              <h2 className="display text-2xl">Care</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">{product.careInstructions}</p>
            </div>
          ) : null}
        </div>
      </div>

      {sizeGuide && (sizeGuide.measurements?.length || sizeGuide.description || sizeGuide.notes) ? (
        <section className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
          <h2 className="display text-3xl">{sizeGuide.title || 'Size guide'}</h2>
          {sizeGuide.description ? <p className="mt-2 text-sm text-ink-soft">{sizeGuide.description}</p> : null}
          {sizeGuide.measurements && sizeGuide.measurements.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-sand text-ink-soft">
                    <th className="py-2 pr-4 font-semibold">Size</th>
                    <th className="py-2 pr-4 font-semibold">Age</th>
                    <th className="py-2 pr-4 font-semibold">Chest</th>
                    <th className="py-2 pr-4 font-semibold">Length</th>
                    <th className="py-2 font-semibold">Waist</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeGuide.measurements.map((row, index) => (
                    <tr key={`${row.size}-${index}`} className="border-b border-sand/70">
                      <td className="py-2 pr-4 font-medium">{formatProductSize(row.size)}</td>
                      <td className="py-2 pr-4">{row.age || '—'}</td>
                      <td className="py-2 pr-4">{row.chest || '—'}</td>
                      <td className="py-2 pr-4">{row.length || '—'}</td>
                      <td className="py-2">{row.waist || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {sizeGuide.notes ? <p className="mt-4 text-sm text-ink-soft">{sizeGuide.notes}</p> : null}
        </section>
      ) : null}

      {related.length > 0 ? (
        <section>
          <h2 className="display text-3xl">You may also like</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((card) => (
              <ProductCard key={card.slug} {...card} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

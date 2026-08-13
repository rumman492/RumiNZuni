import Link from 'next/link'
import { formatPkr } from '@/lib/pakistan'

type ProductCardProps = {
  title: string
  slug: string
  image?: string | null
  price: number
  compareAtPrice?: number | null
  gender?: string | null
}

export function ProductCard({ title, slug, image, price, compareAtPrice, gender }: ProductCardProps) {
  const onSale = Boolean(compareAtPrice && compareAtPrice > price)

  return (
    <Link href={`/product/${slug}`} className="group block">
      <div className="relative overflow-hidden rounded-3xl bg-sand">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid aspect-[4/5] place-items-center text-sm text-ink-soft">Photo coming soon</div>
        )}
        {onSale ? (
          <span className="absolute left-3 top-3 rounded-full bg-coral px-3 py-1 text-xs font-bold text-white">
            Sale
          </span>
        ) : null}
      </div>
      <div className="mt-3">
        {gender ? <p className="text-xs uppercase tracking-wide text-ink-soft">{gender}</p> : null}
        <h3 className="mt-1 font-semibold leading-snug">{title}</h3>
        <p className="mt-1 text-sm">
          <span className="font-bold">{formatPkr(price)}</span>
          {onSale ? (
            <span className="ml-2 text-ink-soft line-through">{formatPkr(compareAtPrice || 0)}</span>
          ) : null}
        </p>
      </div>
    </Link>
  )
}

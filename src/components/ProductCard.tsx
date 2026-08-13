import Link from 'next/link'
import { formatPkr } from '@/lib/pakistan'

type ProductCardProps = {
  title: string
  slug: string
  image?: string | null
  price: number
  compareAtPrice?: number | null
  gender?: string | null
  soldOut?: boolean
}

export function ProductCard({ title, slug, image, price, compareAtPrice, gender, soldOut }: ProductCardProps) {
  const onSale = Boolean(compareAtPrice && compareAtPrice > price)

  return (
    <Link href={`/product/${slug}`} className="play-pop group block rounded-[1.75rem] bg-white p-2 shadow-sm">
      <div className="relative overflow-hidden rounded-[1.4rem] bg-sand">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="grid aspect-[4/5] place-items-center bg-lemon/70 text-sm font-semibold text-ink-soft">
            Photo coming soon
          </div>
        )}
        {soldOut ? (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs font-bold text-white">
            Sold out
          </span>
        ) : onSale ? (
          <span className="absolute left-3 top-3 rounded-full bg-coral px-3 py-1 text-xs font-bold text-white shadow-sm">
            Sale
          </span>
        ) : null}
        <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-coral opacity-0 shadow-sm transition group-hover:opacity-100">
          Shop
        </span>
      </div>
      <div className="px-2 pb-2 pt-3">
        {gender ? <p className="text-xs font-bold uppercase tracking-wide text-sage">{gender}</p> : null}
        <h3 className="mt-1 font-semibold leading-snug">{title}</h3>
        <p className="mt-1 text-sm">
          <span className="font-bold text-coral">{formatPkr(price)}</span>
          {onSale ? (
            <span className="ml-2 text-ink-soft line-through">{formatPkr(compareAtPrice || 0)}</span>
          ) : null}
        </p>
      </div>
    </Link>
  )
}

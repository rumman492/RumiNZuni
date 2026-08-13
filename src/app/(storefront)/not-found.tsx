import Link from 'next/link'
import { pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'Page not found',
  description: 'That page is not on Rumi & Zuni. Continue shopping kids wear with cash on delivery.',
  path: '/',
  index: false,
  follow: true,
})

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="display text-5xl">Page not found</h1>
      <Link href="/shop" className="mt-6 inline-block font-bold text-coral">
        Back to shop
      </Link>
    </div>
  )
}

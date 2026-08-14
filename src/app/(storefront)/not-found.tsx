import Link from 'next/link'
import { pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'Page not found',
  description: 'That page wandered off. Come back to Rumi & Zuni kids wear.',
  path: '/',
  index: false,
  follow: true,
})

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="display text-5xl">Oops — this little page wandered off.</h1>
      <p className="mx-auto mt-4 max-w-md text-ink-soft">Let’s get you back to something you’ll love.</p>
      <Link href="/shop" className="mt-6 inline-flex rounded-full bg-coral px-6 py-3 text-sm font-bold text-white">
        Back to Shop
      </Link>
    </div>
  )
}

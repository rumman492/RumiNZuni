import Link from 'next/link'

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

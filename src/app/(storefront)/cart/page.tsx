import { CartView } from '@/components/CartView'
import { pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'Cart',
  description: 'Your Rumi & Zuni shopping bag. Continue to checkout and pay cash on delivery in PKR.',
  path: '/cart',
  index: false,
  follow: false,
})

export default function CartPage() {
  return <CartView />
}

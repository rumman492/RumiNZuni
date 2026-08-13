import { CartView } from '@/components/CartView'
import { pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'Cart',
  description: 'Your Rumi & Zuni cart. Checkout with cash on delivery across Pakistan.',
  path: '/cart',
  index: false,
  follow: false,
})

export default function CartPage() {
  return <CartView />
}

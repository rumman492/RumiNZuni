export type CartItem = {
  productId: string | number
  slug: string
  title: string
  sku: string
  size: string
  sizeLabel: string
  color: string
  price: number
  qty: number
  image?: string | null
}

export const CART_KEY = 'ruminzuni-cart'

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
}

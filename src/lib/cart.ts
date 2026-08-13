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

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0)
}

export function addCartItem(items: CartItem[], incoming: Omit<CartItem, 'qty'> & { qty?: number }): CartItem[] {
  const qty = incoming.qty && incoming.qty > 0 ? Math.floor(incoming.qty) : 1
  const existing = items.find((item) => item.sku === incoming.sku)
  if (existing) {
    return items.map((item) => (item.sku === incoming.sku ? { ...item, qty: item.qty + qty } : item))
  }
  return [...items, { ...incoming, qty }]
}

export function updateCartQty(items: CartItem[], sku: string, qty: number): CartItem[] {
  const nextQty = Math.floor(qty)
  return nextQty < 1
    ? items.filter((item) => item.sku !== sku)
    : items.map((item) => (item.sku === sku ? { ...item, qty: nextQty } : item))
}

export function removeCartItem(items: CartItem[], sku: string): CartItem[] {
  return items.filter((item) => item.sku !== sku)
}

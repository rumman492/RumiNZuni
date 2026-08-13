'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { addCartItem, CART_KEY, cartCount, cartTotal, removeCartItem, updateCartQty, type CartItem } from '@/lib/cart'

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void
  updateQty: (sku: string, qty: number) => void
  removeItem: (sku: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY)
      if (raw) setItems(JSON.parse(raw) as CartItem[])
    } catch {
      setItems([])
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items, ready])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: cartCount(items),
      subtotal: cartTotal(items),
      addItem: (incoming) => {
        setItems((current) => addCartItem(current, incoming))
      },
      updateQty: (sku, qty) => {
        setItems((current) => updateCartQty(current, sku, qty))
      },
      removeItem: (sku) => setItems((current) => removeCartItem(current, sku)),
      clear: () => setItems([]),
    }),
    [items],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}

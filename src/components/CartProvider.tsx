'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { CART_KEY, cartTotal, type CartItem } from '@/lib/cart'

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
      count: items.reduce((sum, item) => sum + item.qty, 0),
      subtotal: cartTotal(items),
      addItem: (incoming) => {
        setItems((current) => {
          const qty = incoming.qty || 1
          const existing = current.find((item) => item.sku === incoming.sku)
          if (existing) {
            return current.map((item) =>
              item.sku === incoming.sku ? { ...item, qty: item.qty + qty } : item,
            )
          }
          return [...current, { ...incoming, qty }]
        })
      },
      updateQty: (sku, qty) => {
        setItems((current) =>
          qty < 1 ? current.filter((item) => item.sku !== sku) : current.map((item) => (item.sku === sku ? { ...item, qty } : item)),
        )
      },
      removeItem: (sku) => setItems((current) => current.filter((item) => item.sku !== sku)),
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

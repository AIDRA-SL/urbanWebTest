import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  variantId?: string
  name: string
  price: number
  imageUrl: string
  size?: string
  quantity: number
  slug: string
  maxStock?: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  add: (item: CartItem) => void
  remove: (productId: string, variantId?: string) => void
  updateQty: (productId: string, variantId: string | undefined, qty: number) => void
  clear: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

const itemKey = (productId: string, variantId?: string) =>
  variantId ? `${productId}:${variantId}` : productId

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      add: (item) => {
        set((state) => {
          const key = itemKey(item.productId, item.variantId)
          const existing = state.items.find((i) => itemKey(i.productId, i.variantId) === key)
          if (existing) {
            const max = item.maxStock ?? existing.maxStock
            const newQty = max !== undefined
              ? Math.min(existing.quantity + item.quantity, max)
              : existing.quantity + item.quantity
            return {
              items: state.items.map((i) =>
                itemKey(i.productId, i.variantId) === key
                  ? { ...i, quantity: newQty, maxStock: max }
                  : i
              ),
              isOpen: true,
            }
          }
          return { items: [...state.items, item], isOpen: true }
        })
      },

      remove: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => itemKey(i.productId, i.variantId) !== itemKey(productId, variantId)
          ),
        }))
      },

      updateQty: (productId, variantId, qty) => {
        if (qty <= 0) {
          get().remove(productId, variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            itemKey(i.productId, i.variantId) === itemKey(productId, variantId)
              ? { ...i, quantity: qty }
              : i
          ),
        }))
      },

      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'urbanstore-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)

'use client'

import { useEffect, useRef } from 'react'
import { useCartStore } from '@/store/cart'

export function useCartAbandonment() {
  const items = useCartStore((s) => s.items)
  const itemsRef = useRef(items)
  itemsRef.current = items

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && itemsRef.current.length > 0) {
        const cartData = JSON.stringify(itemsRef.current)
        const totalValue = itemsRef.current.reduce((sum, i) => sum + i.price * i.quantity, 0)

        navigator.sendBeacon(
          '/api/cart',
          new Blob(
            [JSON.stringify({ cartData, itemCount: itemsRef.current.length, totalValue })],
            { type: 'application/json' }
          )
        )
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])
}

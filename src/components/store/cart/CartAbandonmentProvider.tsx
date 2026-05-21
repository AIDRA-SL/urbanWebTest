'use client'

import { useCartAbandonment } from '@/hooks/useCartAbandonment'

export function CartAbandonmentProvider() {
  useCartAbandonment()
  return null
}

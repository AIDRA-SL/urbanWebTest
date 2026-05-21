import type { Metadata } from 'next'
import { Suspense } from 'react'
import { CartPageClient } from './CartPageClient'

export const metadata: Metadata = {
  title: 'Carrito',
  robots: { index: false, follow: false },
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <CartPageClient />
    </Suspense>
  )
}

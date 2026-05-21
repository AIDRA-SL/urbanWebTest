'use client'

import { useState, useEffect } from 'react'
import { SizeSelector } from '@/components/store/product/SizeSelector'
import { AddToCartButton } from '@/components/store/product/AddToCartButton'
import { trackEvent } from '@/lib/analytics'

interface Variant {
  id: string
  size: string | null
  color: string | null
  stock: number
}

interface Props {
  product: {
    id: string
    name: string
    slug: string
    price: number
    variants: Variant[]
    images: { url: string; isPrimary: boolean }[]
  }
}

export function ProductDetailClient({ product }: Props) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  useEffect(() => {
    trackEvent({ type: 'PRODUCT_VIEW', productId: product.id })
  }, [product.id])

  const primaryImg = product.images.find((i) => i.isPrimary) ?? product.images[0]

  return (
    <>
      <SizeSelector
        variants={product.variants}
        selected={selectedVariantId ?? null}
        onSelect={(variantId, size) => {
          setSelectedVariantId(variantId)
          setSelectedSize(size)
        }}
      />
      <AddToCartButton
        productId={product.id}
        productName={product.name}
        price={product.price}
        imageUrl={primaryImg?.url ?? '/placeholder.jpg'}
        slug={product.slug}
        variants={product.variants}
        selectedSize={selectedSize}
        selectedVariantId={selectedVariantId}
      />
    </>
  )
}

'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/Button'
import { trackEvent } from '@/lib/analytics'

interface Variant {
  id: string
  size: string | null
  color: string | null
  stock: number
}

interface Props {
  productId: string
  productName: string
  price: number
  imageUrl: string
  slug: string
  variants: Variant[]
  selectedSize: string | null
  selectedVariantId: string | undefined
  quantity?: number
}

export function AddToCartButton({
  productId,
  productName,
  price,
  imageUrl,
  slug,
  variants,
  selectedSize,
  selectedVariantId,
  quantity = 1,
}: Props) {
  const add = useCartStore((s) => s.add)
  const [added, setAdded] = useState(false)

  const selectedVariant = selectedVariantId ? variants.find((v) => v.id === selectedVariantId) : null
  const outOfStock = selectedVariant ? selectedVariant.stock <= 0 : variants.length === 0 || variants.every((v) => v.stock <= 0)
  const needsSize = variants.some((v) => v.size) && !selectedVariantId && variants.length > 0
  const maxStock = selectedVariant
    ? selectedVariant.stock
    : variants.reduce((sum, v) => sum + v.stock, 0)

  const handleAdd = () => {
    if (needsSize || outOfStock) return

    add({
      productId,
      variantId: selectedVariantId,
      name: productName,
      price,
      imageUrl,
      size: selectedSize ?? undefined,
      quantity,
      slug,
      maxStock,
    })

    trackEvent({ type: 'ADD_TO_CART', productId })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (outOfStock) {
    return (
      <Button disabled className="w-full" size="lg">
        Sin stock
      </Button>
    )
  }

  if (needsSize) {
    return (
      <Button variant="outline" className="w-full" size="lg" onClick={() => {}}>
        Selecciona una talla
      </Button>
    )
  }

  return (
    <Button onClick={handleAdd} className="w-full" size="lg">
      {added ? '¡Añadido al carrito!' : 'Añadir al carrito'}
    </Button>
  )
}

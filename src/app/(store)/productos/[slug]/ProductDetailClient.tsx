'use client'

import { useState, useEffect } from 'react'
import { SizeSelector } from '@/components/store/product/SizeSelector'
import { AddToCartButton } from '@/components/store/product/AddToCartButton'
import { trackEvent } from '@/lib/analytics'
import { Minus, Plus } from 'lucide-react'

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
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    trackEvent({ type: 'PRODUCT_VIEW', productId: product.id })
  }, [product.id])

  const primaryImg = product.images.find((i) => i.isPrimary) ?? product.images[0]

  const selectedVariant = selectedVariantId
    ? product.variants.find((v) => v.id === selectedVariantId)
    : null

  // For products with no sizes, use the single variant or check all variants
  const effectiveVariant =
    selectedVariant ??
    (product.variants.length === 1 ? product.variants[0] : null)

  const availableStock = effectiveVariant?.stock ?? 0
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
  const hasSizes = product.variants.some((v) => v.size)

  // Stock label to show
  const stockLabel = (() => {
    if (hasSizes && !selectedVariantId) return null
    const stock = effectiveVariant?.stock ?? totalStock
    if (stock <= 0) return null
    if (stock <= 3) return { text: `¡Solo quedan ${stock} unidades!`, color: 'text-red-600' }
    if (stock <= 10) return { text: `${stock} unidades disponibles`, color: 'text-amber-600' }
    return { text: 'En stock', color: 'text-green-600' }
  })()

  const maxQty = hasSizes ? (selectedVariant?.stock ?? 0) : totalStock
  const clampedQty = Math.min(quantity, maxQty || 1)

  function changeQty(delta: number) {
    setQuantity((q) => Math.max(1, Math.min(q + delta, maxQty || 99)))
  }

  // Reset quantity when variant changes
  useEffect(() => {
    setQuantity(1)
  }, [selectedVariantId])

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

      {/* Stock info */}
      {stockLabel && (
        <p className={`text-sm font-medium ${stockLabel.color}`}>
          {stockLabel.text}
        </p>
      )}

      {/* Quantity selector */}
      {(maxQty > 0 || !hasSizes) && (
        <div className="flex items-center gap-4">
          <span className="text-xs uppercase tracking-wider text-gray-500">Cantidad</span>
          <div className="flex items-center border border-gray-200">
            <button
              onClick={() => changeQty(-1)}
              disabled={clampedQty <= 1}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors"
              aria-label="Disminuir cantidad"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 h-10 flex items-center justify-center text-sm font-medium select-none">
              {clampedQty}
            </span>
            <button
              onClick={() => changeQty(1)}
              disabled={maxQty > 0 && clampedQty >= maxQty}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}

      <AddToCartButton
        productId={product.id}
        productName={product.name}
        price={product.price}
        imageUrl={primaryImg?.url ?? '/placeholder.jpg'}
        slug={product.slug}
        variants={product.variants}
        selectedSize={selectedSize}
        selectedVariantId={selectedVariantId}
        quantity={clampedQty}
      />
    </>
  )
}

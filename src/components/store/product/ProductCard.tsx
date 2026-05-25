'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { useCartStore } from '@/store/cart'
import { trackEvent } from '@/lib/analytics'
import type { ProductCard as ProductCardType } from '@/types/product'

interface Props {
  product: ProductCardType
  badges?: { label: string; color: string }[]
  priority?: boolean
}

export function ProductCard({ product, badges, priority = false }: Props) {
  const router = useRouter()
  const add = useCartStore((s) => s.add)

  const primaryImg = product.images.find((i) => i.isPrimary) ?? product.images[0]
  const hasDiscount = product.comparePrice && product.comparePrice > product.price

  const variants = product.variants ?? []
  const hasSizes = variants.some((v) => v.size !== null)
  const availableSizes = hasSizes ? variants.filter((v) => v.size !== null && v.stock > 0) : []
  const singleVariant = !hasSizes && variants.length === 1 ? variants[0] : null
  const isTotallyOutOfStock = variants.length > 0 && variants.every((v) => v.stock <= 0)

  const [isHovered, setIsHovered] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<{ id: string; size: string | null } | null>(null)
  const [added, setAdded] = useState(false)

  const handleCardClick = () => {
    router.push(`/productos/${product.slug}`)
  }

  const handleSizeClick = (e: React.MouseEvent, variant: { id: string; size: string | null }) => {
    e.stopPropagation()
    add({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      price: product.price,
      imageUrl: primaryImg?.url ?? '',
      size: variant.size ?? undefined,
      quantity: 1,
      slug: product.slug,
    })
    trackEvent({ type: 'ADD_TO_CART', productId: product.id })
    setSelectedVariant(variant)
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      setSelectedVariant(null)
    }, 2000)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    add({
      productId: product.id,
      variantId: singleVariant?.id,
      name: product.name,
      price: product.price,
      imageUrl: primaryImg?.url ?? '',
      quantity: 1,
      slug: product.slug,
    })
    trackEvent({ type: 'ADD_TO_CART', productId: product.id })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const showOverlay = isHovered && !isTotallyOutOfStock
  const showSizes = showOverlay && hasSizes && availableSizes.length > 0
  const showDirectAdd = showOverlay && !hasSizes && singleVariant && singleVariant.stock > 0

  return (
    <div
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setSelectedVariant(null); setAdded(false) }}
    >
      {/* Image container */}
      <div
        className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3 cursor-pointer"
        onClick={handleCardClick}
      >
        {primaryImg ? (
          <>
            <Image
              src={primaryImg.url}
              alt={primaryImg.altText ?? product.name}
              fill
              className="object-contain transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
              priority={priority}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Sin imagen</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {badges?.map((b, i) => <Badge key={i} color={b.color}>{b.label}</Badge>)}
          {hasDiscount && !badges?.length && <Badge color="#000">Oferta</Badge>}
        </div>

        {/* Out of stock */}
        {isTotallyOutOfStock && isHovered && (
          <div className="absolute inset-x-0 bottom-0 bg-black/70 py-2 text-center text-xs text-white uppercase tracking-wider">
            Sin stock
          </div>
        )}

        {/* Size selector + add to cart panel */}
        {(showSizes || showDirectAdd) && (
          <div
            className="card-hover-overlay absolute inset-x-0 bottom-0 bg-white/50 backdrop-blur-sm p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Size chips */}
            {showSizes && (
              <>
                <div className="flex flex-wrap gap-1 justify-center mb-1.5">
                  {availableSizes.map((v) => (
                    <button
                      key={v.id}
                      onClick={(e) => handleSizeClick(e, v)}
                      className={`px-2 py-0.5 text-xs border transition-colors ${
                        selectedVariant?.id === v.id
                          ? 'bg-black text-white border-black'
                          : 'bg-white/70 text-black border-gray-300 hover:border-black'
                      }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
                {added && (
                  <p className="text-center text-xs font-medium text-black">¡Añadido!</p>
                )}
              </>
            )}

            {/* Add to cart button — solo para producto sin tallas */}
            {showDirectAdd && (
              <button
                onClick={handleAddToCart}
                className="w-full bg-black text-white text-xs uppercase tracking-wider py-2 hover:bg-gray-900 transition-colors"
              >
                {added ? '¡Añadido!' : 'Añadir al carrito'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-0.5 cursor-pointer" onClick={handleCardClick}>
        <p className="text-sm font-medium leading-snug group-hover:underline truncate">{product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.comparePrice!)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

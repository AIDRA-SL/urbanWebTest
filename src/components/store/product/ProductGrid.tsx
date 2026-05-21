import { ProductCard } from './ProductCard'
import type { ProductCard as ProductCardType } from '@/types/product'

interface Props {
  products: ProductCardType[]
  badges?: Record<string, { label: string; color: string }[]>
}

export function ProductGrid({ products, badges }: Props) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-gray-400 uppercase tracking-widest">No hay productos disponibles</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8">
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          badges={badges?.[product.id]}
          priority={i < 4}
        />
      ))}
    </div>
  )
}

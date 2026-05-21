import Link from 'next/link'
import { ProductGrid } from '@/components/store/product/ProductGrid'
import type { ProductCard } from '@/types/product'

interface Props {
  products: ProductCard[]
  title?: string
}

export function FeaturedProducts({ products, title = 'Novedades' }: Props) {
  if (products.length === 0) return null

  return (
    <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-tight uppercase">{title}</h2>
        <Link
          href="/categoria/novedades"
          className="text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
        >
          Ver todo →
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  )
}

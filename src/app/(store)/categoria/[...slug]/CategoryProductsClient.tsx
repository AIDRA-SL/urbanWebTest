'use client'

import { useState } from 'react'
import { ProductGrid } from '@/components/store/product/ProductGrid'

interface ProductWithImages {
  id: string
  name: string
  slug: string
  price: number
  comparePrice: number | null
  isActive: boolean
  isFeatured: boolean
  images: { id: string; url: string; altText: string | null; isPrimary: boolean; sortOrder: number }[]
  variants?: { id: string; size: string | null; stock: number }[]
  [key: string]: unknown
}

interface Props {
  initialProducts: ProductWithImages[]
  totalCount: number
  categorySlug: string
}

const PAGE_SIZE = 24

export function CategoryProductsClient({ initialProducts, totalCount, categorySlug }: Props) {
  const [products, setProducts] = useState(initialProducts)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const hasMore = products.length < totalCount

  const loadMore = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/products?category=${categorySlug}&page=${page + 1}&pageSize=${PAGE_SIZE}`
      )
      const data = await res.json()
      setProducts((prev) => [...prev, ...data.data])
      setPage((p) => p + 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ProductGrid products={products} />
      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 border border-black text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cargando...' : `Ver más (${totalCount - products.length} productos más)`}
          </button>
        </div>
      )}
    </>
  )
}

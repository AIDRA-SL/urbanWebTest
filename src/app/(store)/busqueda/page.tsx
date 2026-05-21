import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { ProductGrid } from '@/components/store/product/ProductGrid'
import type { Metadata } from 'next'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Búsqueda: "${q}"` : 'Buscar productos',
    robots: { index: false, follow: false },
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim()

  const products = query && query.length >= 2
    ? await unstable_cache(
        () =>
          prisma.product.findMany({
            where: {
              isActive: true,
              OR: [
                { name: { contains: query } },
                { description: { contains: query } },
                { sku: { contains: query } },
              ],
            },
            include: {
              images: { orderBy: { sortOrder: 'asc' } },
              variants: { select: { id: true, size: true, stock: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 40,
          }),
        [`search-${query.toLowerCase()}`],
        { revalidate: 60, tags: ['products'] }
      )()
    : []

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        {query ? (
          <>
            <h1 className="text-2xl font-bold tracking-tight">
              Resultados para &ldquo;{query}&rdquo;
            </h1>
            <p className="text-sm text-gray-400 mt-1">{products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}</p>
          </>
        ) : (
          <h1 className="text-2xl font-bold tracking-tight">Buscar productos</h1>
        )}
      </div>
      <ProductGrid products={products} />
    </div>
  )
}

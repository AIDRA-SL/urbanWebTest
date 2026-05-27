import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marcas',
  description: 'Descubre todas las marcas disponibles en nuestra tienda.',
}

const getBrands = unstable_cache(
  () => prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, slug: true },
  }),
  ['brands-public'],
  { revalidate: 300, tags: ['brands'] }
)

export default async function MarcasPage() {
  const brands = await getBrands()

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 pb-24">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Tienda</p>
        <h1 className="text-3xl font-bold tracking-tight uppercase">Marcas</h1>
        <p className="text-sm text-gray-400 mt-1">
          {brands.length} marca{brands.length !== 1 ? 's' : ''} disponibles
        </p>
      </div>

      {brands.length === 0 ? (
        <p className="text-sm text-gray-400">No hay marcas disponibles.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-px bg-gray-100 border border-gray-100">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/marcas/${brand.slug ?? brand.id}`}
              className="bg-white px-6 py-5 flex items-center hover:bg-gray-50 transition-colors group"
            >
              <span className="text-sm font-medium uppercase tracking-wider group-hover:text-gray-500 transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

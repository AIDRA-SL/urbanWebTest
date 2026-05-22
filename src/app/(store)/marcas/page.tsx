import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marcas',
  description: 'Descubre todas las marcas disponibles en nuestra tienda.',
}

const getBrands = unstable_cache(
  () => prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
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
        <p className="text-sm text-gray-400 mt-1">{brands.length} marca{brands.length !== 1 ? 's' : ''} disponibles</p>
      </div>

      {brands.length === 0 ? (
        <p className="text-sm text-gray-400">No hay marcas disponibles.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="flex flex-col items-center justify-center gap-3 p-6 border border-gray-100 hover:border-gray-300 transition-colors"
            >
              {brand.logoUrl ? (
                <div className="relative w-20 h-12">
                  <Image
                    src={brand.logoUrl}
                    alt={brand.name}
                    fill
                    className="object-contain"
                    sizes="80px"
                  />
                </div>
              ) : (
                <div className="w-20 h-12 flex items-center justify-center">
                  <span className="text-sm font-semibold uppercase tracking-wider text-gray-700">{brand.name}</span>
                </div>
              )}
              <p className="text-[11px] uppercase tracking-widest text-gray-400">{brand.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

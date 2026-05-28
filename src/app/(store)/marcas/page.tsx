import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
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
    select: { id: true, name: true, slug: true, logoUrl: true },
  }),
  ['brands-public'],
  { revalidate: 300, tags: ['brands'] }
)

export default async function MarcasPage() {
  const brands = await getBrands()

  return (
    <div className="-mb-24">
      <div className="w-full bg-zinc-900 relative">
        {/* Top glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-64 pointer-events-none bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(255,255,255,0.06)_0%,transparent_100%)]" />

        <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 pt-12 pb-16">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Tienda</p>
            <h1 className="text-3xl font-bold tracking-tight uppercase text-white">Marcas</h1>
            <p className="text-sm text-gray-400 mt-1">
              {brands.length} marca{brands.length !== 1 ? 's' : ''} disponibles
            </p>
          </div>

          {brands.length === 0 ? (
            <p className="text-sm text-gray-400">No hay marcas disponibles.</p>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/marcas/${brand.slug ?? brand.id}`}
                  className="opacity-60 hover:opacity-100 transition-opacity duration-300"
                >
                  {brand.logoUrl ? (
                    <div className="relative h-20 w-44">
                      <Image
                        src={brand.logoUrl}
                        alt={brand.name}
                        fill
                        unoptimized
                        className="object-contain p-2"
                      />
                    </div>
                  ) : (
                    <div className="h-20 w-44 flex items-center justify-center">
                      <span className="text-sm font-medium uppercase tracking-wider text-white text-center">
                        {brand.name}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bottom gradient — blends into footer's from-gray-900 */}
        <div className="h-32 bg-gradient-to-b from-zinc-900 to-gray-900" />
      </div>
    </div>
  )
}

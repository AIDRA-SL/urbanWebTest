import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marcas',
  description: 'Descubre todas las marcas disponibles en nuestra tienda.',
}

const getData = unstable_cache(
  async () => {
    const [brands, categories] = await Promise.all([
      prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, slug: true },
      }),
      prisma.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, slug: true },
      }),
    ])
    return { brands, categories }
  },
  ['marcas-with-categories'],
  { revalidate: 300, tags: ['brands', 'categories'] }
)

export default async function MarcasPage() {
  const { brands, categories } = await getData()

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
        <div className="space-y-0 divide-y divide-gray-100">
          {brands.map((brand) => {
            const brandSlug = brand.slug ?? brand.id
            return (
              <div key={brand.id} className="py-6">
                <Link
                  href={`/marcas/${brandSlug}`}
                  className="inline-block text-xl font-bold uppercase tracking-wider hover:text-gray-500 transition-colors mb-4"
                >
                  {brand.name}
                </Link>
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/marcas/${brandSlug}/${cat.slug}`}
                        className="px-3 py-1 text-xs uppercase tracking-widest border border-gray-200 text-gray-500 hover:border-black hover:bg-black hover:text-white transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

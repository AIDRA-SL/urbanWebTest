import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { ProductGrid } from '@/components/store/product/ProductGrid'
import type { Metadata } from 'next'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Ofertas',
  description: 'Las mejores ofertas y descuentos en UrbanStore Oviedo.',
}

const getActiveOffers = unstable_cache(
  () => {
    const now = new Date()
    return prisma.promotion.findMany({
      where: {
        isActive: true,
        product: { isActive: true },
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            variants: { select: { id: true, size: true, stock: true } },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })
  },
  ['offers-active'],
  { revalidate: 300, tags: ['promotions'] }
)

export default async function OfertasPage() {
  const promotions = await getActiveOffers()

  const products = promotions.map((p) => p.product)
  const badges = Object.fromEntries(
    promotions.map((p) => {
      const bs: { label: string; color: string }[] = []
      if (p.label) bs.push({ label: p.label, color: p.badgeColor ?? '#000000' })
      if (p.discountPct) bs.push({ label: `-${p.discountPct}%`, color: '#dc2626' })
      if (!bs.length) bs.push({ label: 'Oferta', color: p.badgeColor ?? '#000000' })
      return [p.product.id, bs]
    })
  )

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">UrbanStore</p>
        <h1 className="text-3xl font-bold tracking-tight uppercase">Ofertas</h1>
        <p className="text-sm text-gray-400 mt-1">{products.length} producto{products.length !== 1 ? 's' : ''} en oferta</p>
      </div>
      <ProductGrid products={products} badges={badges} />
    </div>
  )
}

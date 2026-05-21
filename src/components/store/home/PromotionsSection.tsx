import Link from 'next/link'
import { ProductCard } from '@/components/store/product/ProductCard'
import type { ProductCard as ProductCardType } from '@/types/product'

interface PromotionItem {
  id: string
  label: string | null
  badgeColor: string | null
  discountPct: number | null
  product: ProductCardType
}

interface Props {
  promotions: PromotionItem[]
}

export function PromotionsSection({ promotions }: Props) {
  if (promotions.length === 0) return null

  return (
    <section className="max-w-screen-xl mx-auto px-4 sm:px-6 py-16">
      <div className="flex items-baseline justify-between mb-8">
        <h2 className="text-2xl font-bold tracking-tight uppercase">Ofertas destacadas</h2>
        <Link
          href="/ofertas"
          className="text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
        >
          Ver todo →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {promotions.map((promo, i) => {
          const badges: { label: string; color: string }[] = []
          if (promo.label) badges.push({ label: promo.label, color: promo.badgeColor ?? '#000000' })
          if (promo.discountPct) badges.push({ label: `-${promo.discountPct}%`, color: '#dc2626' })
          if (!badges.length) badges.push({ label: 'Oferta', color: promo.badgeColor ?? '#000000' })

          return (
            <ProductCard
              key={promo.id}
              product={promo.product}
              badges={badges}
              priority={i < 4}
            />
          )
        })}
      </div>
    </section>
  )
}

import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { PromotionsClient } from './PromotionsClient'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Promociones' }
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ adminPath: string }>
}

export default async function PromotionsPage({ params }: Props) {
  await params

  const [promotions, products] = await Promise.all([
    prisma.promotion.findMany({
      include: {
        product: {
          include: { images: { where: { isPrimary: true }, take: 1 } },
        },
      },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, price: true, images: { where: { isPrimary: true }, take: 1 } },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <>
      <AdminHeader
        title="Promociones y ofertas"
        subtitle="Los productos promocionados aparecen destacados en la homepage"
      />
      <PromotionsClient promotions={promotions} products={products} />
    </>
  )
}

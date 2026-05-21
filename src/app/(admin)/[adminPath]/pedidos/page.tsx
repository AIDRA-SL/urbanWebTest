import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { OrdersClient } from './OrdersClient'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pedidos' }
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ adminPath: string }>
}

export default async function OrdersPage({ params }: Props) {
  await params

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <>
      <AdminHeader title="Pedidos" subtitle={`${orders.length} pedidos recientes`} />
      <OrdersClient orders={orders} />
    </>
  )
}

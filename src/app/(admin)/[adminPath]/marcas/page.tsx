import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { BrandsClient } from './BrandsClient'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Marcas' }
export const dynamic = 'force-dynamic'

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <>
      <AdminHeader title="Marcas" subtitle="Logos de marcas colaboradoras que aparecen en la landing page" />
      <BrandsClient brands={brands} />
    </>
  )
}

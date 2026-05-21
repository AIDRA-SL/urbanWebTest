import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { ProductFormClient } from '../ProductFormClient'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nuevo producto' }

interface Props {
  params: Promise<{ adminPath: string }>
}

export default async function NewProductPage({ params }: Props) {
  const { adminPath } = await params
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, parentId: true },
  })

  return (
    <>
      <AdminHeader title="Nuevo producto" />
      <ProductFormClient categories={categories} adminPath={adminPath} />
    </>
  )
}

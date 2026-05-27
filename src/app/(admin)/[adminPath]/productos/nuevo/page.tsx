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
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, parentId: true },
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  return (
    <>
      <AdminHeader title="Nuevo producto" />
      <ProductFormClient categories={categories} brands={brands} adminPath={adminPath} />
    </>
  )
}

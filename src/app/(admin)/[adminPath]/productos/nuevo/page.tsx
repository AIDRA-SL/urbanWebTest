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
  const [rawCategories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true, NOT: { slug: { startsWith: 'marcas' } } },
      select: { id: true, name: true, slug: true, parentId: true },
    }),
    prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])
  const roots = rawCategories.filter(c => !c.parentId).sort((a, b) => a.name.localeCompare(b.name, 'es'))
  const children = rawCategories.filter(c => c.parentId)
  const categories = roots.flatMap(r => [r, ...children.filter(c => c.parentId === r.id).sort((a, b) => a.name.localeCompare(b.name, 'es'))])

  return (
    <>
      <AdminHeader title="Nuevo producto" />
      <ProductFormClient categories={categories} brands={brands} adminPath={adminPath} />
    </>
  )
}

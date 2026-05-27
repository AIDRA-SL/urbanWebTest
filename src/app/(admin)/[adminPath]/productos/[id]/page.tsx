import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { ProductFormClient } from '../ProductFormClient'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Editar producto' }

interface Props {
  params: Promise<{ adminPath: string; id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { adminPath, id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      videos: { orderBy: { sortOrder: 'asc' } },
      variants: true,
      categories: { select: { id: true, name: true, slug: true } },
    },
  })

  if (!product) notFound()

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
      <AdminHeader title="Editar producto" subtitle={product.name} />
      <ProductFormClient product={product} categories={categories} brands={brands} adminPath={adminPath} />
    </>
  )
}

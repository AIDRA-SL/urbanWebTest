import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { ProductsTableClient } from './ProductsTableClient'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Productos' }
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ adminPath: string }>
}

export default async function AdminProductsPage({ params }: Props) {
  const { adminPath } = await params

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        categories: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, parentId: true },
    }),
  ])

  return (
    <>
      <AdminHeader
        title="Productos"
        subtitle={`${products.length} productos`}
        action={
          <Link href={`/${adminPath}/productos/nuevo`}>
            <Button size="sm">+ Nuevo producto</Button>
          </Link>
        }
      />
      <ProductsTableClient products={products} categories={categories} adminPath={adminPath} />
    </>
  )
}

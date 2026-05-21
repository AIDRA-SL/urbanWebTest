import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { CategoriesClient } from './CategoriesClient'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Categorías' }
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ adminPath: string }>
}

export default async function CategoriesPage({ params }: Props) {
  const { adminPath } = await params

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  return (
    <>
      <AdminHeader title="Categorías" subtitle="Gestiona la jerarquía de categorías" />
      <CategoriesClient categories={categories} adminPath={adminPath} />
    </>
  )
}

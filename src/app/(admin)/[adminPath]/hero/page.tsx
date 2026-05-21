import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { HeroAdminClient } from './HeroAdminClient'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Hero / Banner' }
export const dynamic = 'force-dynamic'

export default async function HeroPage() {
  const slides = await prisma.heroSlide.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <>
      <AdminHeader title="Hero / Banner" subtitle="Slides del carrusel principal de la homepage" />
      <HeroAdminClient slides={slides} />
    </>
  )
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ data: [] })

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { sku: { contains: q } },
      ],
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      categories: { select: { id: true, name: true, slug: true } },
    },
    take: 20,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: products })
}

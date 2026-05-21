import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, isAdminSession } from '@/lib/auth'
import { revalidateTag } from 'next/cache'

const INCLUDE_PRODUCT = {
  product: {
    include: {
      images: { where: { isPrimary: true }, take: 1 },
    },
  },
}

export async function GET() {
  const now = new Date()
  const promotions = await prisma.promotion.findMany({
    where: {
      isActive: true,
      OR: [
        { startsAt: null },
        { startsAt: { lte: now } },
      ],
      AND: [
        {
          OR: [
            { endsAt: null },
            { endsAt: { gte: now } },
          ],
        },
      ],
    },
    include: INCLUDE_PRODUCT,
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json({ data: promotions })
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { productId, label, badgeColor, discountPct, sortOrder, startsAt, endsAt } = body

  const promotion = await prisma.promotion.create({
    data: {
      productId,
      label: label ?? null,
      badgeColor: badgeColor ?? '#000000',
      discountPct: discountPct ?? null,
      sortOrder: sortOrder ?? 0,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
    },
    include: INCLUDE_PRODUCT,
  })

  revalidateTag('promotions')
  revalidateTag('homepage')

  return NextResponse.json({ data: promotion }, { status: 201 })
}

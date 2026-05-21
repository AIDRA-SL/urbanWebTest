import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, isAdminSession } from '@/lib/auth'
import { revalidateTag } from 'next/cache'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await request.json()

  const promotion = await prisma.promotion.update({
    where: { id },
    data: {
      label: body.label ?? null,
      badgeColor: body.badgeColor ?? '#000000',
      discountPct: body.discountPct ?? null,
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive ?? true,
      startsAt: body.startsAt ? new Date(body.startsAt) : null,
      endsAt: body.endsAt ? new Date(body.endsAt) : null,
    },
  })

  revalidateTag('promotions')
  revalidateTag('homepage')

  return NextResponse.json({ data: promotion })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await prisma.promotion.delete({ where: { id } })

  revalidateTag('promotions')
  revalidateTag('homepage')

  return NextResponse.json({ ok: true })
}

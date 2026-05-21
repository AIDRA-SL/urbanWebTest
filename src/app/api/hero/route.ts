import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, isAdminSession } from '@/lib/auth'
import { revalidateTag } from 'next/cache'

export async function GET() {
  const slides = await prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json({ data: slides })
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const slide = await prisma.heroSlide.create({
    data: {
      imageUrl: body.imageUrl,
      mobileImageUrl: body.mobileImageUrl ?? null,
      headline: body.headline ?? null,
      subheadline: body.subheadline ?? null,
      ctaText: body.ctaText ?? null,
      ctaLink: body.ctaLink ?? null,
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive ?? true,
    },
  })

  revalidateTag('hero')
  revalidateTag('homepage')

  return NextResponse.json({ data: slide }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { id, ...data } = body

  const slide = await prisma.heroSlide.update({
    where: { id },
    data: {
      imageUrl: data.imageUrl,
      mobileImageUrl: data.mobileImageUrl ?? null,
      headline: data.headline ?? null,
      subheadline: data.subheadline ?? null,
      ctaText: data.ctaText ?? null,
      ctaLink: data.ctaLink ?? null,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
  })

  revalidateTag('hero')
  revalidateTag('homepage')

  return NextResponse.json({ data: slide })
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await request.json()
  await prisma.heroSlide.delete({ where: { id } })

  revalidateTag('hero')
  revalidateTag('homepage')

  return NextResponse.json({ ok: true })
}

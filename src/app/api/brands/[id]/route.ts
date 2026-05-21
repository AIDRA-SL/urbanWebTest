import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, isAdminSession } from '@/lib/auth'
import { revalidateTag } from 'next/cache'

interface Props {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: Props) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await request.json()
  const { name, logoUrl, sortOrder, isActive } = body

  const brand = await prisma.brand.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  revalidateTag('brands')
  return NextResponse.json({ data: brand })
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await prisma.brand.delete({ where: { id } })

  revalidateTag('brands')
  return NextResponse.json({ success: true })
}

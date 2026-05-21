import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, isAdminSession } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import { revalidateTag } from 'next/cache'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await request.json()
  const { name, description, imageUrl, parentId, sortOrder, isActive } = body

  const category = await prisma.category.update({
    where: { id },
    data: {
      name,
      slug: slugify(name),
      description: description ?? null,
      imageUrl: imageUrl ?? null,
      parentId: parentId || null,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
    },
  })

  revalidateTag('categories')
  revalidateTag('homepage')

  return NextResponse.json({ data: category })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  const productCount = await prisma.product.count({
    where: { categories: { some: { id } } },
  })
  if (productCount > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: tiene ${productCount} productos asociados` },
      { status: 409 }
    )
  }

  const childCount = await prisma.category.count({ where: { parentId: id } })
  if (childCount > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: tiene ${childCount} subcategorías` },
      { status: 409 }
    )
  }

  await prisma.category.delete({ where: { id } })

  revalidateTag('categories')
  revalidateTag('homepage')

  return NextResponse.json({ ok: true })
}

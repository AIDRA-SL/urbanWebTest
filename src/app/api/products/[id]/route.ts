import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, isAdminSession } from '@/lib/auth'
import { revalidateTag, revalidatePath } from 'next/cache'

const INCLUDE_FULL = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  videos: { orderBy: { sortOrder: 'asc' as const } },
  variants: true,
  categories: { select: { id: true, name: true, slug: true } },
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: INCLUDE_FULL,
  })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ data: product })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await request.json()
  const { name, description, price, comparePrice, sku, isActive, isFeatured, categoryIds, images, videos, variants } = body

  // Get slug before update for revalidatePath
  const existing = await prisma.product.findUnique({ where: { id }, select: { slug: true } })

  // Delete and recreate images/videos/variants so the form state is the source of truth
  await prisma.productImage.deleteMany({ where: { productId: id } })
  await prisma.productVideo.deleteMany({ where: { productId: id } })
  await prisma.productVariant.deleteMany({ where: { productId: id } })

  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      description: description ?? null,
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : null,
      sku: sku || null,
      isActive,
      isFeatured,
      categories: {
        set: (categoryIds as string[])?.map((cid) => ({ id: cid })) ?? [],
      },
      images: {
        create: (images as { url: string; altText?: string }[])?.map((img, i) => ({
          url: img.url,
          altText: img.altText ?? null,
          sortOrder: i,
          isPrimary: i === 0,
        })) ?? [],
      },
      videos: {
        create: (videos as { url: string }[])?.map((v, i) => ({
          url: v.url,
          sortOrder: i,
        })) ?? [],
      },
      variants: {
        create: (variants as { size?: string; color?: string; stock?: number }[])?.map((v) => ({
          size: v.size ?? null,
          color: v.color ?? null,
          stock: v.stock ?? 0,
        })) ?? [],
      },
    },
    include: INCLUDE_FULL,
  })

  revalidateTag('products')
  revalidateTag('promotions')
  if (existing?.slug) {
    revalidateTag(`product-${existing.slug}`)
  }
  revalidatePath('/', 'layout')

  return NextResponse.json({ data: product })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await request.json()

  const data: Record<string, unknown> = {}
  if (body.isActive !== undefined) data.isActive = body.isActive
  if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured

  const existing = await prisma.product.findUnique({ where: { id }, select: { slug: true } })
  const product = await prisma.product.update({ where: { id }, data })

  revalidateTag('products')
  if (existing?.slug) revalidateTag(`product-${existing.slug}`)
  revalidatePath('/', 'layout')

  return NextResponse.json({ data: product })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await prisma.product.delete({ where: { id } })

  revalidateTag('products')
  revalidatePath('/', 'layout')

  return NextResponse.json({ ok: true })
}

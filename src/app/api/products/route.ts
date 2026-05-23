import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, isAdminSession } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import { revalidateTag, revalidatePath } from 'next/cache'

const INCLUDE_FULL = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  videos: { orderBy: { sortOrder: 'asc' as const } },
  variants: true,
  categories: { select: { id: true, name: true, slug: true } },
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const isAdmin = searchParams.get('admin') === 'true'
  const page = Number(searchParams.get('page') ?? 1)
  const pageSize = Number(searchParams.get('pageSize') ?? 24)
  const category = searchParams.get('category') ?? undefined
  const featured = searchParams.get('featured') === 'true'

  const where: Record<string, unknown> = {}
  if (!isAdmin) where.isActive = true
  if (featured) where.isFeatured = true
  if (category) {
    where.categories = { some: { slug: category } }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: INCLUDE_FULL,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({
    data: products,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await request.json()
    const { name, description, price, comparePrice, sku, isActive, isFeatured, categoryIds, images, videos, variants } = body

    const slug = slugify(name)

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description ?? null,
        price: Number(price),
        comparePrice: comparePrice ? Number(comparePrice) : null,
        sku: sku || null,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        categories: {
          connect: (categoryIds as string[])?.map((id) => ({ id })) ?? [],
        },
        images: {
          create: (images as { url: string; altText?: string; isPrimary?: boolean }[])?.map((img, i) => ({
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
    revalidatePath('/', 'layout')

    return NextResponse.json({ data: product }, { status: 201 })
  } catch (error) {
    console.error('[products POST]', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

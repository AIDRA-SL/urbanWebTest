import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, isAdminSession } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import { revalidateTag } from 'next/cache'

export async function GET() {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json({ data: brands })
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { name, logoUrl, sortOrder } = body

  const base = slugify(name)
  let slug = base
  let i = 2
  while (await prisma.brand.findFirst({ where: { slug } })) {
    slug = `${base}-${i++}`
  }

  const brand = await prisma.brand.create({
    data: { name, slug, logoUrl, sortOrder: sortOrder ?? 0 },
  })

  revalidateTag('brands')
  return NextResponse.json({ data: brand }, { status: 201 })
}

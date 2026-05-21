import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth, isAdminSession } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import { revalidateTag } from 'next/cache'
import type { CategoryTree } from '@/types/category'

function buildTree(categories: CategoryTree[]): CategoryTree[] {
  const map = new Map<string, CategoryTree>()
  const roots: CategoryTree[] = []

  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] })
  }

  for (const cat of map.values()) {
    if (cat.parentId) {
      map.get(cat.parentId)?.children.push(cat)
    } else {
      roots.push(cat)
    }
  }

  return roots
}

export async function GET(request: NextRequest) {
  const flat = request.nextUrl.searchParams.get('flat') === 'true'
  const activeOnly = request.nextUrl.searchParams.get('active') !== 'false'

  const categories = await prisma.category.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  if (flat) return NextResponse.json({ data: categories })

  const tree = buildTree(categories as CategoryTree[])
  return NextResponse.json({ data: tree })
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { name, description, imageUrl, parentId, sortOrder } = body

  const slug = slugify(name)

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description: description ?? null,
      imageUrl: imageUrl ?? null,
      parentId: parentId || null,
      sortOrder: sortOrder ?? 0,
    },
  })

  revalidateTag('categories')
  revalidateTag('homepage')

  return NextResponse.json({ data: category }, { status: 201 })
}

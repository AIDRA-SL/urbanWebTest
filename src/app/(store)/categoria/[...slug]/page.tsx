import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { CategoryProductsClient } from './CategoryProductsClient'

interface Props {
  params: Promise<{ slug: string[] }>
}

function getCategoryBySlugPath(slugPath: string[]) {
  const leafSlug = slugPath[slugPath.length - 1]
  return unstable_cache(
    () =>
      prisma.category.findUnique({
        where: { slug: leafSlug },
        include: { children: { where: { isActive: true } } },
      }),
    [`category-${leafSlug}`],
    { revalidate: 600, tags: ['categories', `category-${leafSlug}`] }
  )()
}

function getInitialCategoryProducts(categoryIds: string[]) {
  const key = categoryIds.slice().sort().join(',')
  return unstable_cache(
    () =>
      prisma.product.findMany({
        where: {
          isActive: true,
          categories: { some: { id: { in: categoryIds } } },
        },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          variants: { select: { id: true, size: true, stock: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 24,
      }),
    [`category-products-${key}`],
    { revalidate: 300, tags: ['products'] }
  )()
}

function getCategoryProductCount(categoryIds: string[]) {
  const key = categoryIds.slice().sort().join(',')
  return unstable_cache(
    () =>
      prisma.product.count({
        where: {
          isActive: true,
          categories: { some: { id: { in: categoryIds } } },
        },
      }),
    [`category-count-${key}`],
    { revalidate: 300, tags: ['products'] }
  )()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const cat = await getCategoryBySlugPath(slug)
  if (!cat) return {}
  return {
    title: cat.name,
    description: cat.description ?? `Explora ${cat.name} en UrbanStore Oviedo`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug: slugPath } = await params
  const category = await getCategoryBySlugPath(slugPath)
  if (!category || !category.isActive) notFound()

  const childIds = category.children.map((c) => c.id)
  const categoryIds = [category.id, ...childIds]
  const leafSlug = slugPath[slugPath.length - 1]

  const [products, totalCount] = await Promise.all([
    getInitialCategoryProducts(categoryIds),
    getCategoryProductCount(categoryIds),
  ])

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-black">Inicio</Link>
        {slugPath.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <span>/</span>
            <Link
              href={`/categoria/${slugPath.slice(0, i + 1).join('/')}`}
              className={`hover:text-black capitalize ${i === slugPath.length - 1 ? 'text-black' : ''}`}
            >
              {s}
            </Link>
          </span>
        ))}
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight uppercase">{category.name}</h1>
        {category.description && (
          <p className="text-sm text-gray-500 mt-2">{category.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">{totalCount} productos</p>
      </div>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/categoria/${slugPath.join('/')}/${child.slug}`}
              className="px-4 py-1.5 text-xs uppercase tracking-wider border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

      <CategoryProductsClient
        initialProducts={products}
        totalCount={totalCount}
        categorySlug={leafSlug}
      />
    </div>
  )
}

import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ProductGrid } from '@/components/store/product/ProductGrid'

interface Props {
  params: Promise<{ brandSlug: string; categorySlug: string }>
}

function getBrand(slug: string) {
  return unstable_cache(
    () => prisma.brand.findFirst({
      where: { slug, isActive: true },
      select: { id: true, name: true, slug: true },
    }),
    [`brand-${slug}`],
    { revalidate: 300, tags: ['brands'] }
  )()
}

function getCategory(slug: string) {
  return unstable_cache(
    () => prisma.category.findUnique({
      where: { slug },
      include: { children: { where: { isActive: true } } },
    }),
    [`category-${slug}`],
    { revalidate: 600, tags: ['categories'] }
  )()
}

function getCategories() {
  return unstable_cache(
    () => prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
    ['categories-top'],
    { revalidate: 600, tags: ['categories'] }
  )()
}

function getBrandCategoryProducts(brandId: string, categoryIds: string[]) {
  const key = `${brandId}-${categoryIds.slice().sort().join(',')}`
  return unstable_cache(
    () => prisma.product.findMany({
      where: {
        isActive: true,
        brandId,
        categories: { some: { id: { in: categoryIds } } },
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { select: { id: true, size: true, stock: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 48,
    }),
    [`brand-cat-products-${key}`],
    { revalidate: 300, tags: ['products'] }
  )()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug, categorySlug } = await params
  const [brand, category] = await Promise.all([getBrand(brandSlug), getCategory(categorySlug)])
  if (!brand || !category) return {}
  return {
    title: `${brand.name} · ${category.name}`,
    description: `${category.name} de ${brand.name} en nuestra tienda.`,
  }
}

export default async function BrandCategoryPage({ params }: Props) {
  const { brandSlug, categorySlug } = await params

  const [brand, category] = await Promise.all([getBrand(brandSlug), getCategory(categorySlug)])
  if (!brand || !category || !category.isActive) notFound()

  const childIds = category.children.map((c) => c.id)
  const categoryIds = [category.id, ...childIds]

  const [allCategories, products] = await Promise.all([
    getCategories(),
    getBrandCategoryProducts(brand.id, categoryIds),
  ])

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-black">Inicio</Link>
        <span>/</span>
        <Link href="/marcas" className="hover:text-black">Marcas</Link>
        <span>/</span>
        <Link href={`/marcas/${brandSlug}`} className="hover:text-black">{brand.name}</Link>
        <span>/</span>
        <span className="text-black">{category.name}</span>
      </nav>

      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">{brand.name}</p>
        <h1 className="text-3xl font-bold tracking-tight uppercase">{category.name}</h1>
        <p className="text-xs text-gray-400 mt-1">{products.length} producto{products.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Subcategories nav */}
      {allCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href={`/marcas/${brandSlug}`}
            className="px-4 py-1.5 text-xs uppercase tracking-widest border border-gray-200 text-gray-500 hover:border-black hover:text-black transition-colors"
          >
            Todo
          </Link>
          {allCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/marcas/${brandSlug}/${cat.slug}`}
              className={`px-4 py-1.5 text-xs uppercase tracking-widest border transition-colors ${
                cat.slug === categorySlug
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 text-gray-500 hover:border-black hover:text-black'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      <ProductGrid products={products} />
    </div>
  )
}

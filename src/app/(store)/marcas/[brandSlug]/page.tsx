import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ProductGrid } from '@/components/store/product/ProductGrid'

interface Props {
  params: Promise<{ brandSlug: string }>
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

function getBrandProducts(brandId: string) {
  return unstable_cache(
    () => prisma.product.findMany({
      where: { isActive: true, brandId },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { select: { id: true, size: true, stock: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    [`brand-products-${brandId}`],
    { revalidate: 300, tags: ['products'] }
  )()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug } = await params
  const brand = await getBrand(brandSlug)
  if (!brand) return {}
  return {
    title: brand.name,
    description: `Descubre todos los productos de ${brand.name} en nuestra tienda.`,
  }
}

export default async function BrandPage({ params }: Props) {
  const { brandSlug } = await params
  const brand = await getBrand(brandSlug)
  if (!brand) notFound()

  const products = await getBrandProducts(brand.id)

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 pb-24">
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-black">Inicio</Link>
        <span>/</span>
        <Link href="/marcas" className="hover:text-black">Marcas</Link>
        <span>/</span>
        <span className="text-black">{brand.name}</span>
      </nav>

      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Marca</p>
        <h1 className="text-3xl font-bold tracking-tight uppercase">{brand.name}</h1>
        <p className="text-xs text-gray-400 mt-1">
          {products.length} producto{products.length !== 1 ? 's' : ''}
        </p>
      </div>

      <ProductGrid products={products} />
    </div>
  )
}

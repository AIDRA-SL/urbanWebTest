import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { ProductGrid } from '@/components/store/product/ProductGrid'
import type { Metadata } from 'next'
import { ProductDetailClient } from './ProductDetailClient'
import { ProductImageGallery } from '@/components/store/product/ProductImageGallery'
import { ShieldCheck, Lock, Truck, RotateCcw } from 'lucide-react'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

function getProduct(slug: string) {
  return unstable_cache(
    () =>
      prisma.product.findUnique({
        where: { slug },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          videos: { orderBy: { sortOrder: 'asc' } },
          variants: true,
          categories: { select: { id: true, name: true, slug: true } },
        },
      }),
    [`product-${slug}`],
    { revalidate: 3600, tags: ['products', `product-${slug}`] }
  )()
}

function getRelatedProducts(productId: string, categoryIds: string[]) {
  return unstable_cache(
    () =>
      prisma.product.findMany({
        where: {
          isActive: true,
          id: { not: productId },
          categories: { some: { id: { in: categoryIds } } },
        },
        include: { images: { orderBy: { sortOrder: 'asc' } } },
        take: 4,
      }),
    [`related-${productId}`],
    { revalidate: 3600, tags: ['products'] }
  )()
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  })
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.description ?? `Compra ${product.name} en UrbanStore Oviedo`,
    openGraph: {
      images: product.images[0] ? [{ url: product.images[0].url }] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product || !product.isActive) notFound()

  const categoryIds = product.categories.map((c) => c.id)
  const relatedProducts = await getRelatedProducts(product.id, categoryIds)

  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : null

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <Link href="/" className="hover:text-black transition-colors">Inicio</Link>
        {product.categories[0] && (
          <>
            <span>/</span>
            <Link href={`/categoria/${product.categories[0].slug}`} className="hover:text-black transition-colors capitalize">
              {product.categories[0].name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-black">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images + Videos */}
        <ProductImageGallery images={product.images} videos={product.videos} productName={product.name} />

        {/* Info */}
        <div className="flex flex-col gap-6">
          {product.categories.length > 0 && (
            <p className="text-xs uppercase tracking-widest text-gray-400">
              {product.categories.map((c) => c.name).join(', ')}
            </p>
          )}

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">{product.name}</h1>
            <div className="flex items-center gap-3">
              <span className="text-xl font-semibold">{formatPrice(product.price)}</span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-gray-400 line-through">{formatPrice(product.comparePrice!)}</span>
                  <span className="text-sm text-red-600 font-medium">-{discountPct}%</span>
                </>
              )}
            </div>
          </div>

          {/* Interactive client part */}
          <ProductDetailClient product={product} />

          {product.description && (
            <div className="border-t border-gray-100 pt-6">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Descripción</p>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {product.sku && (
            <p className="text-xs text-gray-400">Ref: {product.sku}</p>
          )}

          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-6">
            {[
              { icon: ShieldCheck, label: 'Autenticidad garantizada' },
              { icon: Lock, label: 'Pago seguro' },
              { icon: Truck, label: 'Envío rápido 24/48h' },
              { icon: RotateCcw, label: 'Envíos y devoluciones gratis +60€' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 bg-gray-50 rounded px-3 py-2.5">
                <Icon size={16} strokeWidth={1.5} className="shrink-0 text-gray-700" />
                <span className="text-xs text-gray-600 leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>


{/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h2 className="text-lg font-bold uppercase tracking-tight mb-8">También te puede gustar</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  )
}

import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { HeroCarousel } from '@/components/store/home/HeroCarousel'
import { PromotionsSection } from '@/components/store/home/PromotionsSection'
import { FeaturedProducts } from '@/components/store/home/FeaturedProducts'
import { CategoryBanner } from '@/components/store/home/CategoryBanner'
import { ReviewsCarousel } from '@/components/store/home/ReviewsCarousel'
import { TrustSection } from '@/components/store/home/TrustSection'
import { BrandsSection } from '@/components/store/home/BrandsSection'
import type { CategoryTree } from '@/types/category'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UrbanStore — Moda en Oviedo',
  description: 'Descubre las últimas tendencias en UrbanStore. Ropa urbana y casual en el centro de Oviedo.',
}

const getHeroSlides = unstable_cache(
  () => prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  }),
  ['hero-slides'],
  { revalidate: 30, tags: ['hero'] }
)

const getActivePromotions = unstable_cache(
  () => {
    const now = new Date()
    return prisma.promotion.findMany({
      where: {
        isActive: true,
        product: { isActive: true },
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      include: {
        product: {
          include: {
            images: { orderBy: { sortOrder: 'asc' } },
            variants: { select: { id: true, size: true, stock: true } },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
      take: 8,
    })
  },
  ['home-promotions'],
  { revalidate: 30, tags: ['promotions'] }
)

const getFeaturedProducts = unstable_cache(
  () => prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      variants: { select: { id: true, size: true, stock: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 8,
  }),
  ['featured-products'],
  { revalidate: 30, tags: ['products'] }
)

const getActiveBrands = unstable_cache(
  () => prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, logoUrl: true },
  }),
  ['active-brands'],
  { revalidate: 60, tags: ['brands'] }
)

const getTopCategories = unstable_cache(
  async (): Promise<CategoryTree[]> => {
    const cats = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: 'asc' },
      take: 4,
    })
    return cats.map((c) => ({ ...c, children: [] }))
  },
  ['top-categories'],
  { revalidate: 60, tags: ['categories'] }
)

export default async function HomePage() {
  const [heroSlides, promotions, featuredProducts, categories, brands] = await Promise.all([
    getHeroSlides(),
    getActivePromotions(),
    getFeaturedProducts(),
    getTopCategories(),
    getActiveBrands(),
  ])

  return (
    <>
      <HeroCarousel slides={heroSlides} />
      <PromotionsSection promotions={promotions} />
      <CategoryBanner categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <ReviewsCarousel />
      <TrustSection />
      <BrandsSection brands={brands} />
    </>
  )
}

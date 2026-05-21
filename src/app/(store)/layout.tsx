import { Navbar } from '@/components/store/layout/Navbar'
import { Footer } from '@/components/store/layout/Footer'
import { CartDrawer } from '@/components/store/cart/CartDrawer'
import { CartAbandonmentProvider } from '@/components/store/cart/CartAbandonmentProvider'
import { WhatsAppButton } from '@/components/store/layout/WhatsAppButton'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import type { CategoryTree } from '@/types/category'

const getNavCategories = unstable_cache(
  async (): Promise<CategoryTree[]> => {
    const cats = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })

    const map = new Map<string, CategoryTree>()
    const roots: CategoryTree[] = []

    for (const cat of cats) {
      map.set(cat.id, { ...cat, children: [] } as CategoryTree)
    }

    for (const cat of map.values()) {
      if (cat.parentId) {
        map.get(cat.parentId)?.children.push(cat)
      } else {
        roots.push(cat)
      }
    }

    return roots
  },
  ['nav-categories'],
  { revalidate: 60, tags: ['categories'] }
)

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getNavCategories()

  return (
    <>
      <Navbar categories={categories} />
      <CartDrawer />
      <CartAbandonmentProvider />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}

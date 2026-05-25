import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaLibSql({ url: process.env.DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN })
  })

  // Find empty categories whose children (if any) also have no products
  // Safe to delete: empty categories where NO child has products
  const all = await prisma.category.findMany({
    select: { id: true, slug: true, parentId: true, _count: { select: { products: true } } }
  })

  const withProducts = new Set(all.filter(c => c._count.products > 0).map(c => c.id))

  // An empty category is safe to delete if none of its children have products
  const toDelete = all.filter(c => {
    if (c._count.products > 0) return false
    const hasProductChild = all.some(child => child.parentId === c.id && withProducts.has(child.id))
    return !hasProductChild
  })

  console.log(`Borrando ${toDelete.length} categorías vacías:`)
  toDelete.forEach(c => console.log(' -', c.slug))

  const result = await prisma.category.deleteMany({
    where: { id: { in: toDelete.map(c => c.id) } }
  })

  console.log(`\n✓ ${result.count} categorías borradas`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })

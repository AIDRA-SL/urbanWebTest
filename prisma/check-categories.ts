import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaLibSql({ url: process.env.DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN })
  })

  const cats = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
    orderBy: { slug: 'asc' }
  })

  console.log('\nCategorías con productos:')
  cats.filter(c => c._count.products > 0).forEach(c => console.log(`  ${String(c._count.products).padStart(3)}  ${c.slug}`))
  console.log('\nCategorías SIN productos:')
  cats.filter(c => c._count.products === 0).forEach(c => console.log(`    0  ${c.slug}`))
  console.log(`\nTotal: ${cats.length} | Con productos: ${cats.filter(c=>c._count.products>0).length} | Vacías: ${cats.filter(c=>c._count.products===0).length}`)

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })

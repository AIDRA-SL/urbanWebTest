import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })
import { PrismaClient } from '../generated/prisma'
import { PrismaLibSql } from '@prisma/adapter-libsql'

function createPrisma() {
  const dbUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
  const adapter = new PrismaLibSql({ url: dbUrl })
  return new PrismaClient({ adapter })
}

async function main() {
  const prisma = createPrisma()
  console.log('🧹 Reseteando stats a cero...')

  await prisma.analyticsEvent.deleteMany({})
  console.log('✅ AnalyticsEvents borrados')

  await prisma.cartSession.deleteMany({})
  console.log('✅ CartSessions borrados')

  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  console.log('✅ Orders e items borrados')

  await prisma.$disconnect()
  console.log('\n✨ Stats a cero. Productos, categorías y admin intactos.')
}

main().catch((e) => { console.error(e); process.exit(1) })

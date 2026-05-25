import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

function createPrisma() {
  const dbUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
  const authToken = process.env.TURSO_AUTH_TOKEN
  const adapter = new PrismaLibSql({ url: dbUrl, authToken })
  return new PrismaClient({ adapter })
}

async function main() {
  const prisma = createPrisma()
  const deleted = await prisma.product.deleteMany({})
  console.log(`✓ ${deleted.count} productos borrados`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })

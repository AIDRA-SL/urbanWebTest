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

const brands = [
  { name: 'La Sal',              logoUrl: '/uploads/brands/la-sal.png' },
  { name: 'My Brand',            logoUrl: '/uploads/brands/my-brand.png' },
  { name: 'Mod Wave Movement',   logoUrl: '/uploads/brands/mod-wave-movement.png' },
  { name: 'Redhouse',            logoUrl: '/uploads/brands/redhouse.png' },
  { name: 'Relish',              logoUrl: '/uploads/brands/relish.png' },
  { name: 'G2 Firenze',         logoUrl: '/uploads/brands/g2-firenze.png' },
  { name: 'Frilivin',            logoUrl: '/uploads/brands/frilivin.jpg' },
  { name: 'Run Of',              logoUrl: '/uploads/brands/run-of.png' },
  { name: 'Karl Lagerfeld',      logoUrl: '/uploads/brands/karl-lagerfeld.png' },
  { name: 'Rue Madam',           logoUrl: '/uploads/brands/rue-madam.png' },
  { name: 'Dsquared2',           logoUrl: '/uploads/brands/dsquared2.png' },
  { name: 'Another Trend',       logoUrl: '/uploads/brands/another-trend.png' },
  { name: 'Antony Morato',       logoUrl: '/uploads/brands/antony-morato.png' },
  { name: 'Alpe',                logoUrl: '/uploads/brands/alpe.png' },
  { name: 'Alexander McQueen',   logoUrl: '/uploads/brands/alexander-mcqueen.png' },
  { name: 'AM Couture',          logoUrl: '/uploads/brands/amcouture.png' },
  { name: 'Versace Jeans Couture', logoUrl: '/uploads/brands/versace-jeans.png' },
  { name: 'Guess',               logoUrl: '/uploads/brands/guess.webp' },
  { name: 'Imperial',            logoUrl: '/uploads/brands/imperial.png' },
  { name: 'Please',              logoUrl: '/uploads/brands/please.png' },
  { name: 'Sprayground',         logoUrl: '/uploads/brands/sprayground.png' },
  { name: 'No Name',             logoUrl: '/uploads/brands/no-name.png' },
  { name: 'SikSilk',             logoUrl: '/uploads/brands/siksilk.png' },
]

async function main() {
  const prisma = createPrisma()

  console.log('Eliminando marcas existentes...')
  await prisma.brand.deleteMany({})

  console.log(`Insertando ${brands.length} marcas...`)
  await prisma.brand.createMany({
    data: brands.map((b, i) => ({
      name: b.name,
      logoUrl: b.logoUrl,
      sortOrder: i,
      isActive: true,
    })),
  })

  const count = await prisma.brand.count()
  console.log(`✓ ${count} marcas insertadas correctamente`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })

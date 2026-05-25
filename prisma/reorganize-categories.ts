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

  // Verificar que existe la categoría raíz "calzado"
  const calzado = await prisma.category.findUnique({ where: { slug: 'calzado' } })
  if (!calzado) {
    console.error('No se encontró la categoría "calzado". Ejecuta el seed primero.')
    process.exit(1)
  }
  console.log(`✓ Categoría raíz: calzado (${calzado.id})`)

  // Crear subcategorías bajo calzado si no existen
  const calzadoHombre = await prisma.category.upsert({
    where: { slug: 'calzado-hombre' },
    update: { parentId: calzado.id, isActive: true },
    create: {
      name: 'Zapatillas Hombre',
      slug: 'calzado-hombre',
      parentId: calzado.id,
      sortOrder: 0,
      isActive: true,
    },
  })
  console.log(`✓ Subcategoría: calzado-hombre (${calzadoHombre.id})`)

  const calzadoMujer = await prisma.category.upsert({
    where: { slug: 'calzado-mujer' },
    update: { parentId: calzado.id, isActive: true },
    create: {
      name: 'Zapatillas Mujer',
      slug: 'calzado-mujer',
      parentId: calzado.id,
      sortOrder: 1,
      isActive: true,
    },
  })
  console.log(`✓ Subcategoría: calzado-mujer (${calzadoMujer.id})`)

  // Buscar categorías de zapatillas por género
  const hombreZapatillas = await prisma.category.findUnique({ where: { slug: 'hombre-zapatillas' } })
  const mujerZapatillas = await prisma.category.findUnique({ where: { slug: 'mujer-zapatillas' } })

  let updated = 0

  // Enlazar productos de hombre-zapatillas a calzado-hombre y calzado
  if (hombreZapatillas) {
    const products = await prisma.product.findMany({
      where: { categories: { some: { id: hombreZapatillas.id } } },
      select: { id: true, name: true },
    })
    console.log(`\nProductos en hombre-zapatillas: ${products.length}`)
    for (const product of products) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          categories: {
            connect: [{ id: calzadoHombre.id }, { id: calzado.id }],
          },
        },
      })
      console.log(`  ✓ ${product.name} → calzado-hombre, calzado`)
      updated++
    }
  } else {
    console.log('\nNo se encontró hombre-zapatillas, omitiendo.')
  }

  // Enlazar productos de mujer-zapatillas a calzado-mujer y calzado
  if (mujerZapatillas) {
    const products = await prisma.product.findMany({
      where: { categories: { some: { id: mujerZapatillas.id } } },
      select: { id: true, name: true },
    })
    console.log(`\nProductos en mujer-zapatillas: ${products.length}`)
    for (const product of products) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          categories: {
            connect: [{ id: calzadoMujer.id }, { id: calzado.id }],
          },
        },
      })
      console.log(`  ✓ ${product.name} → calzado-mujer, calzado`)
      updated++
    }
  } else {
    console.log('\nNo se encontró mujer-zapatillas, omitiendo.')
  }

  console.log(`\n━━ Reorganización completa ━━`)
  console.log(`Subcategorías: calzado-hombre, calzado-mujer bajo calzado`)
  console.log(`Productos actualizados: ${updated}`)

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })

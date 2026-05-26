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

  const complementos = await prisma.category.findUnique({ where: { slug: 'complementos' } })
  if (!complementos) {
    console.error('No se encontró la categoría "complementos". Ejecuta el seed primero.')
    process.exit(1)
  }
  console.log(`✓ Categoría raíz: complementos (${complementos.id})`)

  // Crear subcategoría "Otros" bajo complementos
  const otros = await prisma.category.upsert({
    where: { slug: 'complementos-otros' },
    update: { parentId: complementos.id, isActive: true },
    create: {
      name: 'Otros',
      slug: 'complementos-otros',
      parentId: complementos.id,
      sortOrder: 2,
      isActive: true,
    },
  })
  console.log(`✓ Subcategoría "Otros" creada/actualizada (${otros.id})`)

  // Obtener subcategorías existentes de complementos (bolsos, cinturones)
  const subCats = await prisma.category.findMany({
    where: { parentId: complementos.id, slug: { not: 'complementos-otros' } },
    select: { id: true, slug: true },
  })
  const subCatIds = subCats.map(c => c.id)
  console.log(`Subcategorías excluidas: ${subCats.map(c => c.slug).join(', ')}`)

  // Encontrar productos que están en "complementos" pero NO en ninguna subcategoría
  const productosComplementos = await prisma.product.findMany({
    where: { categories: { some: { id: complementos.id } } },
    include: { categories: { select: { id: true, slug: true } } },
  })

  const sinSubcategoria = productosComplementos.filter(p => {
    const catIds = p.categories.map(c => c.id)
    return !subCatIds.some(id => catIds.includes(id))
  })

  console.log(`\nProductos en complementos sin subcategoría: ${sinSubcategoria.length}`)
  for (const p of sinSubcategoria) {
    console.log(`  - ${p.name}`)
  }

  // Asignar esos productos a "Otros"
  if (sinSubcategoria.length > 0) {
    for (const p of sinSubcategoria) {
      await prisma.product.update({
        where: { id: p.id },
        data: { categories: { connect: { id: otros.id } } },
      })
    }
    console.log(`\n✓ ${sinSubcategoria.length} productos asignados a "Otros"`)
  } else {
    console.log('\n⚠ No se encontraron productos para asignar (puede que ya estén asignados)')
  }

  console.log('\nMigración completada.')
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

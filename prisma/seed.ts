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
  console.log('🌱 Seeding database...')

  // ── Admin user via Better Auth API ──────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@urbanstore.es'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123'

  // Check if admin exists
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existing) {
    // Use Better Auth's internal API to create user with hashed password
    const { auth } = await import('../src/lib/auth')
    await auth.api.signUpEmail({
      body: { email: adminEmail, password: adminPassword, name: 'Admin' },
    })
    console.log(`✅ Admin user created: ${adminEmail}`)
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`)
  }

  // ── Categories ───────────────────────────────────────────────────────
  const ropa = await prisma.category.upsert({
    where: { slug: 'ropa' },
    update: {},
    create: { name: 'Ropa', slug: 'ropa', sortOrder: 0 },
  })
  const calzado = await prisma.category.upsert({
    where: { slug: 'calzado' },
    update: {},
    create: { name: 'Calzado', slug: 'calzado', sortOrder: 1 },
  })
  const accesorios = await prisma.category.upsert({
    where: { slug: 'accesorios' },
    update: {},
    create: { name: 'Accesorios', slug: 'accesorios', sortOrder: 2 },
  })
  const novedades = await prisma.category.upsert({
    where: { slug: 'novedades' },
    update: {},
    create: { name: 'Novedades', slug: 'novedades', sortOrder: 3 },
  })

  // Subcategories
  const camisetas = await prisma.category.upsert({
    where: { slug: 'camisetas' },
    update: {},
    create: { name: 'Camisetas', slug: 'camisetas', parentId: ropa.id, sortOrder: 0 },
  })
  const sudaderas = await prisma.category.upsert({
    where: { slug: 'sudaderas' },
    update: {},
    create: { name: 'Sudaderas', slug: 'sudaderas', parentId: ropa.id, sortOrder: 1 },
  })
  const pantalones = await prisma.category.upsert({
    where: { slug: 'pantalones' },
    update: {},
    create: { name: 'Pantalones', slug: 'pantalones', parentId: ropa.id, sortOrder: 2 },
  })
  const zapatillas = await prisma.category.upsert({
    where: { slug: 'zapatillas' },
    update: {},
    create: { name: 'Zapatillas', slug: 'zapatillas', parentId: calzado.id, sortOrder: 0 },
  })
  const gorras = await prisma.category.upsert({
    where: { slug: 'gorras' },
    update: {},
    create: { name: 'Gorras', slug: 'gorras', parentId: accesorios.id, sortOrder: 0 },
  })

  console.log('✅ Categories created')

  // ── Sample products (with placeholder images) ─────────────────────
  const sampleProducts = [
    {
      name: 'Camiseta Básica Blanca',
      slug: 'camiseta-basica-blanca',
      description: 'Camiseta de algodón 100% orgánico. Corte regular, cuello redondo.',
      price: 29.95,
      comparePrice: null,
      isFeatured: true,
      categories: [camisetas.id, ropa.id, novedades.id],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
    },
    {
      name: 'Sudadera Urban Classic',
      slug: 'sudadera-urban-classic',
      description: 'Sudadera con capucha. Interior afelpado, bolsillo canguro.',
      price: 59.95,
      comparePrice: 79.95,
      isFeatured: true,
      categories: [sudaderas.id, ropa.id, novedades.id],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    },
    {
      name: 'Pantalón Cargo Beige',
      slug: 'pantalon-cargo-beige',
      description: 'Pantalón cargo con múltiples bolsillos. Tela resistente y cómoda.',
      price: 79.95,
      comparePrice: null,
      isFeatured: true,
      categories: [pantalones.id, ropa.id],
      sizes: ['S', 'M', 'L', 'XL'],
    },
    {
      name: 'Camiseta Oversize Negro',
      slug: 'camiseta-oversize-negro',
      description: 'Camiseta oversize de algodón pesado. Perfecta para el día a día.',
      price: 34.95,
      comparePrice: null,
      isFeatured: false,
      categories: [camisetas.id, ropa.id],
      sizes: ['S', 'M', 'L', 'XL'],
    },
    {
      name: 'Zapatillas Runner Pro',
      slug: 'zapatillas-runner-pro',
      description: 'Zapatillas para correr y uso casual. Suela amortiguadora.',
      price: 89.95,
      comparePrice: 119.95,
      isFeatured: true,
      categories: [zapatillas.id, calzado.id, novedades.id],
      sizes: ['40', '41', '42', '43', '44', '45'],
    },
    {
      name: 'Gorra Urban Snapback',
      slug: 'gorra-urban-snapback',
      description: 'Gorra con visera plana y cierre ajustable. 100% algodón.',
      price: 24.95,
      comparePrice: null,
      isFeatured: false,
      categories: [gorras.id, accesorios.id],
      sizes: [],
    },
    {
      name: 'Sudadera Crewneck Gris',
      slug: 'sudadera-crewneck-gris',
      description: 'Sudadera sin capucha, cuello redondo. Algodón con elastano.',
      price: 49.95,
      comparePrice: 64.95,
      isFeatured: true,
      categories: [sudaderas.id, ropa.id],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
    },
    {
      name: 'Pantalón Jogger Slim',
      slug: 'pantalon-jogger-slim',
      description: 'Pantalón jogger de corte slim. Cintura elástica y puños tobilleros.',
      price: 54.95,
      comparePrice: null,
      isFeatured: false,
      categories: [pantalones.id, ropa.id],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
    },
  ]

  for (const p of sampleProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } })
    if (!existing) {
      await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          comparePrice: p.comparePrice,
          isFeatured: p.isFeatured,
          isActive: true,
          categories: { connect: p.categories.map((id) => ({ id })) },
          variants: {
            create: p.sizes.map((size, i) => ({ size, stock: 10 + i * 2 })),
          },
        },
      })
    }
  }

  console.log('✅ Sample products created')

  // ── Hero slide placeholder ─────────────────────────────────────────
  const heroCount = await prisma.heroSlide.count()
  if (heroCount === 0) {
    await prisma.heroSlide.create({
      data: {
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80',
        headline: 'Nueva Colección 2026',
        subheadline: 'Moda urbana para Oviedo',
        ctaText: 'Explorar',
        ctaLink: '/categoria/novedades',
        sortOrder: 0,
        isActive: true,
      },
    })
    await prisma.heroSlide.create({
      data: {
        imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80',
        headline: 'Ofertas especiales',
        subheadline: 'Hasta -30% en selección',
        ctaText: 'Ver ofertas',
        ctaLink: '/ofertas',
        sortOrder: 1,
        isActive: true,
      },
    })
    console.log('✅ Hero slides created')
  }

  // ── Promotions ────────────────────────────────────────────────────
  const promoCount = await prisma.promotion.count()
  if (promoCount === 0) {
    const sudaderaProduct = await prisma.product.findUnique({ where: { slug: 'sudadera-urban-classic' } })
    const zapatillasProduct = await prisma.product.findUnique({ where: { slug: 'zapatillas-runner-pro' } })
    const crewneckProduct = await prisma.product.findUnique({ where: { slug: 'sudadera-crewneck-gris' } })

    if (sudaderaProduct) {
      await prisma.promotion.create({
        data: { productId: sudaderaProduct.id, label: 'OFERTA', badgeColor: '#000000', discountPct: 25, sortOrder: 0 },
      })
    }
    if (zapatillasProduct) {
      await prisma.promotion.create({
        data: { productId: zapatillasProduct.id, label: 'DESTACADO', badgeColor: '#1d4ed8', discountPct: 25, sortOrder: 1 },
      })
    }
    if (crewneckProduct) {
      await prisma.promotion.create({
        data: { productId: crewneckProduct.id, label: 'SALE', badgeColor: '#dc2626', discountPct: 23, sortOrder: 2 },
      })
    }
    console.log('✅ Promotions created')
  }

  console.log('✨ Seed complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })

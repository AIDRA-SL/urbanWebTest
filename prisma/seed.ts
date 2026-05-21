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

const U = (id: string, w = 800) => `https://images.unsplash.com/${id}?w=${w}&q=80`

const PRODUCTS = [
  { name: 'Camiseta Basica Blanca', slug: 'camiseta-basica-blanca', description: 'Camiseta de algodon 100% organico. Corte regular, cuello redondo.', price: 29.95, comparePrice: null, isFeatured: true, categories: ['camisetas','ropa','novedades'], sizes: ['XS','S','M','L','XL'], images: [U('photo-1521572163474-6864f9cf17ab'), U('photo-1527719327859-c945e18ce8d1')] },
  { name: 'Sudadera Urban Classic', slug: 'sudadera-urban-classic', description: 'Sudadera con capucha de algodon premium. Interior afelpado, bolsillo canguro.', price: 59.95, comparePrice: 79.95, isFeatured: true, categories: ['sudaderas','ropa','novedades'], sizes: ['S','M','L','XL','XXL'], images: [U('photo-1556821840-3a63f95609a7'), U('photo-1509942774463-acf339cf87d5')] },
  { name: 'Pantalon Cargo Beige', slug: 'pantalon-cargo-beige', description: 'Pantalon cargo con multiples bolsillos. Tela resistente y comoda.', price: 79.95, comparePrice: null, isFeatured: true, categories: ['pantalones','ropa'], sizes: ['S','M','L','XL'], images: [U('photo-1624378441864-6359e1b2c94e'), U('photo-1606107557195-0e29a4b5b4aa')] },
  { name: 'Camiseta Oversize Negro', slug: 'camiseta-oversize-negro', description: 'Camiseta oversize de algodon pesado 220g. Corte holgado moderno.', price: 34.95, comparePrice: null, isFeatured: false, categories: ['camisetas','ropa'], sizes: ['S','M','L','XL'], images: [U('photo-1503342394128-c104d54dba01'), U('photo-1583743814966-8936f5b7be1a')] },
  { name: 'Zapatillas Runner Pro', slug: 'zapatillas-runner-pro', description: 'Zapatillas para running y uso casual. Suela amortiguadora.', price: 89.95, comparePrice: 119.95, isFeatured: true, categories: ['zapatillas','calzado','novedades'], sizes: ['40','41','42','43','44','45'], images: [U('photo-1542291026-7eec264c27ff'), U('photo-1606107557195-0e29a4b5b4aa')] },
  { name: 'Gorra Urban Snapback', slug: 'gorra-urban-snapback', description: 'Gorra con visera plana y cierre snapback. 100% algodon estructurado.', price: 24.95, comparePrice: null, isFeatured: false, categories: ['gorras','accesorios'], sizes: [], images: [U('photo-1588850561407-ed78c282e89b'), U('photo-1521369909029-2afed882baaa')] },
  { name: 'Sudadera Crewneck Gris', slug: 'sudadera-crewneck-gris', description: 'Sudadera sin capucha de cuello redondo. Algodon con elastano.', price: 49.95, comparePrice: 64.95, isFeatured: true, categories: ['sudaderas','ropa'], sizes: ['XS','S','M','L','XL'], images: [U('photo-1517263904808-5dc91e3e7044'), U('photo-1512327428940-c54e1e4b7fb8')] },
  { name: 'Pantalon Jogger Slim', slug: 'pantalon-jogger-slim', description: 'Pantalon jogger de corte slim. Cintura elastica y punos tobilleros.', price: 54.95, comparePrice: null, isFeatured: false, categories: ['pantalones','ropa'], sizes: ['XS','S','M','L','XL'], images: [U('photo-1617196034183-421b4040ed20'), U('photo-1598033129183-c4f50c736f10')] },
  { name: 'Chaqueta Bomber Negra', slug: 'chaqueta-bomber-negra', description: 'Chaqueta bomber de nylon con forro interior. Punos y cintura en punto elastico.', price: 99.95, comparePrice: 129.95, isFeatured: true, categories: ['chaquetas','ropa','novedades'], sizes: ['S','M','L','XL'], images: [U('photo-1611312449408-fcece27cdbb7'), U('photo-1591047139829-d91aecb6caea')] },
  { name: 'Chaqueta Vaquera Azul', slug: 'chaqueta-vaquera-azul', description: 'Chaqueta vaquera clasica de denim 100%. Corte recto, botones metalicos.', price: 74.95, comparePrice: null, isFeatured: false, categories: ['chaquetas','ropa'], sizes: ['S','M','L','XL','XXL'], images: [U('photo-1576995853123-5a10305d93c0'), U('photo-1598033129183-c4f50c736f10')] },
  { name: 'Shorts Cargo Kaki', slug: 'shorts-cargo-kaki', description: 'Shorts cargo de tela resistente con bolsillos laterales. Perfectos para verano.', price: 44.95, comparePrice: null, isFeatured: false, categories: ['shorts','ropa','novedades'], sizes: ['S','M','L','XL'], images: [U('photo-1565084888279-aca607ecce0c'), U('photo-1591195853828-11db59a44f43')] },
  { name: 'Camiseta Rayas Marinera', slug: 'camiseta-rayas-marinera', description: 'Camiseta de punto con rayas horizontales. Tejido suave, corte regular.', price: 32.95, comparePrice: null, isFeatured: false, categories: ['camisetas','ropa'], sizes: ['XS','S','M','L','XL'], images: [U('photo-1516762689617-e1cffcef479d'), U('photo-1523381294911-8d3cead13475')] },
  { name: 'Sudadera Zip Full Negro', slug: 'sudadera-zip-full-negro', description: 'Sudadera con cremallera completa y capucha. Forro polar interior.', price: 69.95, comparePrice: 89.95, isFeatured: true, categories: ['sudaderas','ropa'], sizes: ['S','M','L','XL','XXL'], images: [U('photo-1547194935-b61cf4ba0ea5'), U('photo-1509942774463-acf339cf87d5')] },
  { name: 'Parka Invierno Negra', slug: 'parka-invierno-negra', description: 'Parka larga impermeable con relleno acolchado. Capucha desmontable.', price: 149.95, comparePrice: 199.95, isFeatured: true, categories: ['chaquetas','ropa'], sizes: ['S','M','L','XL'], images: [U('photo-1544923246-77307dd654cb'), U('photo-1578681994506-b8f463449011')] },
  { name: 'Polo Pique Blanco', slug: 'polo-pique-blanco', description: 'Polo de pique 100% algodon. Cuello con dos botones, corte slim.', price: 39.95, comparePrice: null, isFeatured: false, categories: ['camisetas','ropa'], sizes: ['S','M','L','XL','XXL'], images: [U('photo-1598522325074-042db73aa4e6'), U('photo-1527719327859-c945e18ce8d1')] },
  { name: 'Tote Bag Canvas Negro', slug: 'tote-bag-canvas-negro', description: 'Bolsa tote de lona reforzada. Asas largas, capacidad 15L.', price: 19.95, comparePrice: null, isFeatured: false, categories: ['bolsas','accesorios'], sizes: [], images: [U('photo-1491637639811-60e2756cc1c7'), U('photo-1553062407-98eeb64c6a62')] },
  { name: 'Gorro Beanie Gris', slug: 'gorro-beanie-gris', description: 'Gorro de punto fino en acrilico. Dobladillo doble, comodo y abrigado.', price: 17.95, comparePrice: null, isFeatured: false, categories: ['gorros','accesorios'], sizes: [], images: [U('photo-1576566588028-4147f3842f27')] },
  { name: 'Calcetines Pack x3', slug: 'calcetines-pack-3', description: 'Pack de 3 pares de calcetines de algodon. Cana media, refuerzo en talon.', price: 12.95, comparePrice: null, isFeatured: false, categories: ['accesorios'], sizes: ['36-40','41-46'], images: [U('photo-1516762689617-e1cffcef479d')] },
]

const BRANDS = [
  { name: 'Nike', logoUrl: 'https://logo.clearbit.com/nike.com', sortOrder: 0 },
  { name: 'Adidas', logoUrl: 'https://logo.clearbit.com/adidas.com', sortOrder: 1 },
  { name: 'New Balance', logoUrl: 'https://logo.clearbit.com/newbalance.com', sortOrder: 2 },
  { name: 'Vans', logoUrl: 'https://logo.clearbit.com/vans.com', sortOrder: 3 },
  { name: 'The North Face', logoUrl: 'https://logo.clearbit.com/thenorthface.com', sortOrder: 4 },
  { name: 'Carhartt', logoUrl: 'https://logo.clearbit.com/carhartt.com', sortOrder: 5 },
]

async function main() {
  const prisma = createPrisma()
  console.log('Seeding...')

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@urbanstore.es'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123'
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    const { auth } = await import('../src/lib/auth')
    await auth.api.signUpEmail({ body: { email: adminEmail, password: adminPassword, name: 'Admin' } })
    console.log('Admin creado')
  }

  const catMap: Record<string, { id: string }> = {}
  const rootCats = [
    { name: 'Ropa', slug: 'ropa', sortOrder: 0, imageUrl: U('photo-1445205170230-053b83016050') },
    { name: 'Calzado', slug: 'calzado', sortOrder: 1, imageUrl: U('photo-1542291026-7eec264c27ff') },
    { name: 'Accesorios', slug: 'accesorios', sortOrder: 2, imageUrl: U('photo-1553062407-98eeb64c6a62') },
    { name: 'Novedades', slug: 'novedades', sortOrder: 3, imageUrl: U('photo-1483985988355-763728e1935b') },
  ]
  for (const c of rootCats) {
    catMap[c.slug] = await prisma.category.upsert({ where: { slug: c.slug }, update: { imageUrl: c.imageUrl }, create: c })
  }
  const subCats = [
    { name: 'Camisetas', slug: 'camisetas', p: 'ropa', o: 0 }, { name: 'Sudaderas', slug: 'sudaderas', p: 'ropa', o: 1 },
    { name: 'Pantalones', slug: 'pantalones', p: 'ropa', o: 2 }, { name: 'Chaquetas', slug: 'chaquetas', p: 'ropa', o: 3 },
    { name: 'Shorts', slug: 'shorts', p: 'ropa', o: 4 }, { name: 'Zapatillas', slug: 'zapatillas', p: 'calzado', o: 0 },
    { name: 'Gorras', slug: 'gorras', p: 'accesorios', o: 0 }, { name: 'Bolsas', slug: 'bolsas', p: 'accesorios', o: 1 },
    { name: 'Gorros', slug: 'gorros', p: 'accesorios', o: 2 },
  ]
  for (const sc of subCats) {
    catMap[sc.slug] = await prisma.category.upsert({ where: { slug: sc.slug }, update: {}, create: { name: sc.name, slug: sc.slug, parentId: catMap[sc.p].id, sortOrder: sc.o } })
  }
  console.log('Categorias OK')

  for (const p of PRODUCTS) {
    let product = await prisma.product.findUnique({ where: { slug: p.slug } })
    if (!product) {
      product = await prisma.product.create({
        data: {
          name: p.name, slug: p.slug, description: p.description, price: p.price,
          comparePrice: p.comparePrice, isFeatured: p.isFeatured, isActive: true,
          categories: { connect: p.categories.filter(s => catMap[s]).map(s => ({ id: catMap[s].id })) },
          variants: { create: p.sizes.map((size, i) => ({ size, stock: 10 + i * 3 })) },
        },
      })
    }
    const imgCount = await prisma.productImage.count({ where: { productId: product.id } })
    if (imgCount === 0) {
      await prisma.productImage.createMany({
        data: p.images.map((url, i) => ({ productId: product!.id, url, altText: p.name, sortOrder: i, isPrimary: i === 0 })),
      })
    }
  }
  console.log(`${PRODUCTS.length} productos OK`)

  const heroCount = await prisma.heroSlide.count()
  if (heroCount === 0) {
    await prisma.heroSlide.createMany({ data: [
      { imageUrl: U('photo-1441986300917-64674bd600d8', 1920), headline: 'Nueva Coleccion 2026', subheadline: 'Moda urbana para Oviedo', ctaText: 'Explorar', ctaLink: '/categoria/novedades', sortOrder: 0, isActive: true },
      { imageUrl: U('photo-1490481651871-ab68de25d43d', 1920), headline: 'Ofertas Especiales', subheadline: 'Hasta -30% en seleccion', ctaText: 'Ver ofertas', ctaLink: '/ofertas', sortOrder: 1, isActive: true },
      { imageUrl: U('photo-1483985988355-763728e1935b', 1920), headline: 'Streetwear Autentico', subheadline: 'Las mejores marcas en un solo lugar', ctaText: 'Ver todo', ctaLink: '/categoria/ropa', sortOrder: 2, isActive: true },
    ]})
    console.log('Hero slides OK')
  }

  const promoCount = await prisma.promotion.count()
  if (promoCount === 0) {
    const promos = [
      { slug: 'sudadera-urban-classic', label: 'OFERTA', color: '#000000', pct: 25 },
      { slug: 'zapatillas-runner-pro', label: 'DESTACADO', color: '#1d4ed8', pct: 25 },
      { slug: 'sudadera-crewneck-gris', label: 'SALE', color: '#dc2626', pct: 23 },
      { slug: 'chaqueta-bomber-negra', label: 'NUEVO', color: '#16a34a', pct: 23 },
      { slug: 'parka-invierno-negra', label: 'OUTLET', color: '#7c3aed', pct: 25 },
    ]
    for (let i = 0; i < promos.length; i++) {
      const prod = await prisma.product.findUnique({ where: { slug: promos[i].slug } })
      if (prod) await prisma.promotion.create({ data: { productId: prod.id, label: promos[i].label, badgeColor: promos[i].color, discountPct: promos[i].pct, sortOrder: i, isActive: true } })
    }
    console.log('Promociones OK')
  }

  for (const b of BRANDS) {
    const exists = await prisma.brand.findFirst({ where: { name: b.name } })
    if (!exists) await prisma.brand.create({ data: { ...b, isActive: true } })
  }
  console.log(`${BRANDS.length} marcas OK`)

  console.log('Seed completo!')
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
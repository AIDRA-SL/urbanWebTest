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
  { name: 'Camiseta Basica Blanca', slug: 'camiseta-basica-blanca', description: 'Camiseta de algodon 100% organico. Corte regular, cuello redondo.', price: 29.95, comparePrice: null, isFeatured: true, categories: ['hombre-camisetas','hombre'], sizes: ['XS','S','M','L','XL'], images: [U('photo-1521572163474-6864f9cf17ab'), U('photo-1527719327859-c945e18ce8d1')] },
  { name: 'Sudadera Urban Classic', slug: 'sudadera-urban-classic', description: 'Sudadera con capucha de algodon premium. Interior afelpado, bolsillo canguro.', price: 59.95, comparePrice: 79.95, isFeatured: true, categories: ['hombre-sudaderas','hombre'], sizes: ['S','M','L','XL','XXL'], images: [U('photo-1556821840-3a63f95609a7'), U('photo-1509942774463-acf339cf87d5')] },
  { name: 'Pantalon Cargo Beige', slug: 'pantalon-cargo-beige', description: 'Pantalon cargo con multiples bolsillos. Tela resistente y comoda.', price: 79.95, comparePrice: null, isFeatured: true, categories: ['hombre-pantalones','hombre'], sizes: ['S','M','L','XL'], images: [U('photo-1624378441864-6359e1b2c94e'), U('photo-1606107557195-0e29a4b5b4aa')] },
  { name: 'Camiseta Oversize Negro', slug: 'camiseta-oversize-negro', description: 'Camiseta oversize de algodon pesado 220g. Corte holgado moderno.', price: 34.95, comparePrice: null, isFeatured: false, categories: ['hombre-camisetas','hombre'], sizes: ['S','M','L','XL'], images: [U('photo-1503342394128-c104d54dba01'), U('photo-1583743814966-8936f5b7be1a')] },
  { name: 'Zapatillas Runner Pro', slug: 'zapatillas-runner-pro', description: 'Zapatillas para running y uso casual. Suela amortiguadora.', price: 89.95, comparePrice: 119.95, isFeatured: true, categories: ['hombre-zapatillas','hombre','calzado'], sizes: ['40','41','42','43','44','45'], images: [U('photo-1542291026-7eec264c27ff'), U('photo-1606107557195-0e29a4b5b4aa')] },
  { name: 'Gorra Urban Snapback', slug: 'gorra-urban-snapback', description: 'Gorra con visera plana y cierre snapback. 100% algodon estructurado.', price: 24.95, comparePrice: null, isFeatured: false, categories: ['complementos'], sizes: [], images: [U('photo-1588850561407-ed78c282e89b'), U('photo-1521369909029-2afed882baaa')] },
  { name: 'Sudadera Crewneck Gris', slug: 'sudadera-crewneck-gris', description: 'Sudadera sin capucha de cuello redondo. Algodon con elastano.', price: 49.95, comparePrice: 64.95, isFeatured: true, categories: ['hombre-sudaderas','hombre'], sizes: ['XS','S','M','L','XL'], images: [U('photo-1517263904808-5dc91e3e7044'), U('photo-1512327428940-c54e1e4b7fb8')] },
  { name: 'Pantalon Jogger Slim', slug: 'pantalon-jogger-slim', description: 'Pantalon jogger de corte slim. Cintura elastica y punos tobilleros.', price: 54.95, comparePrice: null, isFeatured: false, categories: ['hombre-joggers','hombre'], sizes: ['XS','S','M','L','XL'], images: [U('photo-1617196034183-421b4040ed20'), U('photo-1598033129183-c4f50c736f10')] },
  { name: 'Chaqueta Bomber Negra', slug: 'chaqueta-bomber-negra', description: 'Chaqueta bomber de nylon con forro interior. Punos y cintura en punto elastico.', price: 99.95, comparePrice: 129.95, isFeatured: true, categories: ['hombre-chaquetas','hombre'], sizes: ['S','M','L','XL'], images: [U('photo-1611312449408-fcece27cdbb7'), U('photo-1591047139829-d91aecb6caea')] },
  { name: 'Chaqueta Vaquera Azul', slug: 'chaqueta-vaquera-azul', description: 'Chaqueta vaquera clasica de denim 100%. Corte recto, botones metalicos.', price: 74.95, comparePrice: null, isFeatured: false, categories: ['hombre-chaquetas','hombre'], sizes: ['S','M','L','XL','XXL'], images: [U('photo-1576995853123-5a10305d93c0'), U('photo-1598033129183-c4f50c736f10')] },
  { name: 'Shorts Cargo Kaki', slug: 'shorts-cargo-kaki', description: 'Shorts cargo de tela resistente con bolsillos laterales. Perfectos para verano.', price: 44.95, comparePrice: null, isFeatured: false, categories: ['hombre-sport','hombre'], sizes: ['S','M','L','XL'], images: [U('photo-1565084888279-aca607ecce0c'), U('photo-1591195853828-11db59a44f43')] },
  { name: 'Camiseta Rayas Marinera', slug: 'camiseta-rayas-marinera', description: 'Camiseta de punto con rayas horizontales. Tejido suave, corte regular.', price: 32.95, comparePrice: null, isFeatured: false, categories: ['mujer-camisetas','mujer'], sizes: ['XS','S','M','L','XL'], images: [U('photo-1516762689617-e1cffcef479d'), U('photo-1523381294911-8d3cead13475')] },
  { name: 'Sudadera Zip Full Negro', slug: 'sudadera-zip-full-negro', description: 'Sudadera con cremallera completa y capucha. Forro polar interior.', price: 69.95, comparePrice: 89.95, isFeatured: true, categories: ['hombre-sudaderas','hombre'], sizes: ['S','M','L','XL','XXL'], images: [U('photo-1547194935-b61cf4ba0ea5'), U('photo-1509942774463-acf339cf87d5')] },
  { name: 'Parka Invierno Negra', slug: 'parka-invierno-negra', description: 'Parka larga impermeable con relleno acolchado. Capucha desmontable.', price: 149.95, comparePrice: 199.95, isFeatured: true, categories: ['hombre-chaquetas','hombre'], sizes: ['S','M','L','XL'], images: [U('photo-1544923246-77307dd654cb'), U('photo-1578681994506-b8f463449011')] },
  { name: 'Polo Pique Blanco', slug: 'polo-pique-blanco', description: 'Polo de pique 100% algodon. Cuello con dos botones, corte slim.', price: 39.95, comparePrice: null, isFeatured: false, categories: ['hombre-camisetas','hombre'], sizes: ['S','M','L','XL','XXL'], images: [U('photo-1598522325074-042db73aa4e6'), U('photo-1527719327859-c945e18ce8d1')] },
  { name: 'Tote Bag Canvas Negro', slug: 'tote-bag-canvas-negro', description: 'Bolsa tote de lona reforzada. Asas largas, capacidad 15L.', price: 19.95, comparePrice: null, isFeatured: false, categories: ['bolsos','complementos'], sizes: [], images: [U('photo-1491637639811-60e2756cc1c7'), U('photo-1553062407-98eeb64c6a62')] },
  { name: 'Gorro Beanie Gris', slug: 'gorro-beanie-gris', description: 'Gorro de punto fino en acrilico. Dobladillo doble, comodo y abrigado.', price: 17.95, comparePrice: null, isFeatured: false, categories: ['complementos'], sizes: [], images: [U('photo-1576566588028-4147f3842f27')] },
  { name: 'Calcetines Pack x3', slug: 'calcetines-pack-3', description: 'Pack de 3 pares de calcetines de algodon. Cana media, refuerzo en talon.', price: 12.95, comparePrice: null, isFeatured: false, categories: ['complementos'], sizes: ['36-40','41-46'], images: [U('photo-1516762689617-e1cffcef479d')] },
]

const BLOB = 'https://hxt0axncza6kcpgs.public.blob.vercel-storage.com/brands'
const BRANDS = [
  { name: 'La Sal', logoUrl: `${BLOB}/la-sal.png`, sortOrder: 0 },
  { name: 'My Brand', logoUrl: `${BLOB}/my-brand.png`, sortOrder: 1 },
  { name: 'Mod Wave Movement', logoUrl: `${BLOB}/mod-wave-movement.png`, sortOrder: 2 },
  { name: 'Redhouse', logoUrl: `${BLOB}/redhouse.png`, sortOrder: 3 },
  { name: 'Relish', logoUrl: `${BLOB}/relish.png`, sortOrder: 4 },
  { name: 'G2 Firenze', logoUrl: `${BLOB}/g2-firenze.png`, sortOrder: 5 },
  { name: 'Frilivin', logoUrl: `${BLOB}/frilivin.jpg`, sortOrder: 6 },
  { name: 'Run Of', logoUrl: `${BLOB}/run-of.png`, sortOrder: 7 },
  { name: 'Karl Lagerfeld', logoUrl: `${BLOB}/karl-lagerfeld.png`, sortOrder: 8 },
  { name: 'Rue Madam', logoUrl: `${BLOB}/rue-madam.png`, sortOrder: 9 },
  { name: 'Dsquared2', logoUrl: `${BLOB}/dsquared2.png`, sortOrder: 10 },
  { name: 'Another Trend', logoUrl: `${BLOB}/another-trend.png`, sortOrder: 11 },
  { name: 'Antony Morato', logoUrl: `${BLOB}/antony-morato.png`, sortOrder: 12 },
  { name: 'Alpe', logoUrl: `${BLOB}/alpe.png`, sortOrder: 13 },
  { name: 'Alexander McQueen', logoUrl: `${BLOB}/alexander-mcqueen.png`, sortOrder: 14 },
  { name: 'AM Couture', logoUrl: `${BLOB}/am-couture.png`, sortOrder: 15 },
  { name: 'Versace Jeans Couture', logoUrl: `${BLOB}/versace-jeans.png`, sortOrder: 16 },
  { name: 'Guess', logoUrl: `${BLOB}/guess.webp`, sortOrder: 17 },
  { name: 'Imperial', logoUrl: `${BLOB}/imperial.png`, sortOrder: 18 },
  { name: 'Please', logoUrl: `${BLOB}/please.png`, sortOrder: 19 },
  { name: 'Sprayground', logoUrl: `${BLOB}/sprayground.png`, sortOrder: 20 },
  { name: 'No Name', logoUrl: `${BLOB}/no-name.png`, sortOrder: 21 },
  { name: 'SikSilk', logoUrl: `${BLOB}/siksilk.png`, sortOrder: 22 },
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
    { name: 'Hombre', slug: 'hombre', sortOrder: 0, imageUrl: U('photo-1521572163474-6864f9cf17ab') },
    { name: 'Mujer', slug: 'mujer', sortOrder: 1, imageUrl: U('photo-1483985988355-763728e1935b') },
    { name: 'Complementos', slug: 'complementos', sortOrder: 2, imageUrl: U('photo-1553062407-98eeb64c6a62') },
    { name: 'Calzado', slug: 'calzado', sortOrder: 3, imageUrl: U('photo-1542291026-7eec264c27ff') },
    { name: 'Rebajas', slug: 'rebajas', sortOrder: 4, imageUrl: U('photo-1607082348824-0a96f2a4b9da') },
    { name: 'Marcas', slug: 'marcas', sortOrder: 5, imageUrl: U('photo-1441986300917-64674bd600d8') },
  ]
  for (const c of rootCats) {
    catMap[c.slug] = await prisma.category.upsert({ where: { slug: c.slug }, update: { imageUrl: c.imageUrl }, create: c })
  }
  const subCats = [
    { name: 'Sudaderas', slug: 'hombre-sudaderas', p: 'hombre', o: 0 },
    { name: 'Camisetas', slug: 'hombre-camisetas', p: 'hombre', o: 1 },
    { name: 'Camisas', slug: 'hombre-camisas', p: 'hombre', o: 2 },
    { name: 'Chaquetas', slug: 'hombre-chaquetas', p: 'hombre', o: 3 },
    { name: 'Pantalones', slug: 'hombre-pantalones', p: 'hombre', o: 4 },
    { name: 'Jeans', slug: 'hombre-jeans', p: 'hombre', o: 5 },
    { name: 'Joggers', slug: 'hombre-joggers', p: 'hombre', o: 6 },
    { name: 'Bañadores', slug: 'hombre-banadores', p: 'hombre', o: 7 },
    { name: 'Sport', slug: 'hombre-sport', p: 'hombre', o: 8 },
    { name: 'Zapatillas', slug: 'hombre-zapatillas', p: 'hombre', o: 9 },
    { name: 'Jerseys', slug: 'hombre-jerseys', p: 'hombre', o: 10 },
    { name: 'Sudaderas', slug: 'mujer-sudaderas', p: 'mujer', o: 0 },
    { name: 'Camisetas', slug: 'mujer-camisetas', p: 'mujer', o: 1 },
    { name: 'Camisas', slug: 'mujer-camisas', p: 'mujer', o: 2 },
    { name: 'Chaquetas', slug: 'mujer-chaquetas', p: 'mujer', o: 3 },
    { name: 'Pantalones', slug: 'mujer-pantalones', p: 'mujer', o: 4 },
    { name: 'Jeans', slug: 'mujer-jeans', p: 'mujer', o: 5 },
    { name: 'Joggers', slug: 'mujer-joggers', p: 'mujer', o: 6 },
    { name: 'Bañadores', slug: 'mujer-banadores', p: 'mujer', o: 7 },
    { name: 'Vestidos', slug: 'mujer-vestidos', p: 'mujer', o: 8 },
    { name: 'Sport', slug: 'mujer-sport', p: 'mujer', o: 9 },
    { name: 'Zapatillas', slug: 'mujer-zapatillas', p: 'mujer', o: 10 },
    { name: 'Jerseys', slug: 'mujer-jerseys', p: 'mujer', o: 11 },
    { name: 'Bolsos', slug: 'bolsos', p: 'complementos', o: 0 },
    { name: 'Cinturones', slug: 'cinturones', p: 'complementos', o: 1 },
    { name: 'Otros', slug: 'complementos-otros', p: 'complementos', o: 2 },
    { name: 'Hombre', slug: 'rebajas-hombre', p: 'rebajas', o: 0 },
    { name: 'Mujer', slug: 'rebajas-mujer', p: 'rebajas', o: 1 },
    { name: 'La Sal', slug: 'marcas-la-sal', p: 'marcas', o: 0, imageUrl: `${BLOB}/la-sal.png` },
    { name: 'My Brand', slug: 'marcas-my-brand', p: 'marcas', o: 1, imageUrl: `${BLOB}/my-brand.png` },
    { name: 'Mod Wave Movement', slug: 'marcas-mod-wave-movement', p: 'marcas', o: 2, imageUrl: `${BLOB}/mod-wave-movement.png` },
    { name: 'Redhouse', slug: 'marcas-redhouse', p: 'marcas', o: 3, imageUrl: `${BLOB}/redhouse.png` },
    { name: 'Relish', slug: 'marcas-relish', p: 'marcas', o: 4, imageUrl: `${BLOB}/relish.png` },
    { name: 'G2 Firenze', slug: 'marcas-g2-firenze', p: 'marcas', o: 5, imageUrl: `${BLOB}/g2-firenze.png` },
    { name: 'Frilivin', slug: 'marcas-frilivin', p: 'marcas', o: 6, imageUrl: `${BLOB}/frilivin.jpg` },
    { name: 'Run Of', slug: 'marcas-run-of', p: 'marcas', o: 7, imageUrl: `${BLOB}/run-of.png` },
    { name: 'Karl Lagerfeld', slug: 'marcas-karl-lagerfeld', p: 'marcas', o: 8, imageUrl: `${BLOB}/karl-lagerfeld.png` },
    { name: 'Rue Madam', slug: 'marcas-rue-madam', p: 'marcas', o: 9, imageUrl: `${BLOB}/rue-madam.png` },
    { name: 'Dsquared2', slug: 'marcas-dsquared2', p: 'marcas', o: 10, imageUrl: `${BLOB}/dsquared2.png` },
    { name: 'Another Trend', slug: 'marcas-another-trend', p: 'marcas', o: 11, imageUrl: `${BLOB}/another-trend.png` },
    { name: 'Antony Morato', slug: 'marcas-antony-morato', p: 'marcas', o: 12, imageUrl: `${BLOB}/antony-morato.png` },
    { name: 'Alpe', slug: 'marcas-alpe', p: 'marcas', o: 13, imageUrl: `${BLOB}/alpe.png` },
    { name: 'Alexander McQueen', slug: 'marcas-alexander-mcqueen', p: 'marcas', o: 14, imageUrl: `${BLOB}/alexander-mcqueen.png` },
    { name: 'AM Couture', slug: 'marcas-am-couture', p: 'marcas', o: 15, imageUrl: `${BLOB}/am-couture.png` },
    { name: 'Versace Jeans Couture', slug: 'marcas-versace-jeans-couture', p: 'marcas', o: 16, imageUrl: `${BLOB}/versace-jeans.png` },
    { name: 'Guess', slug: 'marcas-guess', p: 'marcas', o: 17, imageUrl: `${BLOB}/guess.webp` },
    { name: 'Imperial', slug: 'marcas-imperial', p: 'marcas', o: 18, imageUrl: `${BLOB}/imperial.png` },
    { name: 'Please', slug: 'marcas-please', p: 'marcas', o: 19, imageUrl: `${BLOB}/please.png` },
    { name: 'Sprayground', slug: 'marcas-sprayground', p: 'marcas', o: 20, imageUrl: `${BLOB}/sprayground.png` },
    { name: 'No Name', slug: 'marcas-no-name', p: 'marcas', o: 21, imageUrl: `${BLOB}/no-name.png` },
    { name: 'SikSilk', slug: 'marcas-siksilk', p: 'marcas', o: 22, imageUrl: `${BLOB}/siksilk.png` },
  ]
  for (const sc of subCats) {
    const scData = sc as typeof sc & { imageUrl?: string }
    catMap[sc.slug] = await prisma.category.upsert({
      where: { slug: sc.slug },
      update: scData.imageUrl ? { imageUrl: scData.imageUrl } : {},
      create: { name: sc.name, slug: sc.slug, parentId: catMap[sc.p].id, sortOrder: sc.o, ...(scData.imageUrl ? { imageUrl: scData.imageUrl } : {}) },
    })
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

  // Remove old placeholder brands from previous seed
  await prisma.brand.deleteMany({ where: { name: { in: ['Nike', 'Adidas', 'New Balance', 'Vans', 'The North Face', 'Carhartt'] } } })
  for (const b of BRANDS) {
    const exists = await prisma.brand.findFirst({ where: { name: b.name } })
    if (exists) {
      await prisma.brand.update({ where: { id: exists.id }, data: { logoUrl: b.logoUrl, sortOrder: b.sortOrder } })
    } else {
      await prisma.brand.create({ data: { ...b, isActive: true } })
    }
  }
  console.log(`${BRANDS.length} marcas OK`)

  console.log('Seed completo!')
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
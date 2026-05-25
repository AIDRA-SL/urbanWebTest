import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: process.env.DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN })
})

// ─── Categorías a crear ───────────────────────────────────────────────────────

const MUJER_SUBCATS = [
  { slug: 'mujer-camisetas',  name: 'Camisetas y Tops',       sortOrder: 0 },
  { slug: 'mujer-pantalones', name: 'Pantalones y Shorts',    sortOrder: 1 },
  { slug: 'mujer-jeans',      name: 'Jeans y Denim',          sortOrder: 2 },
  { slug: 'mujer-chaquetas',  name: 'Chaquetas y Cazadoras',  sortOrder: 3 },
  { slug: 'mujer-blazers',    name: 'Blazers y Americanas',   sortOrder: 4 },
  { slug: 'mujer-vestidos',   name: 'Vestidos',               sortOrder: 5 },
  { slug: 'mujer-faldas',     name: 'Faldas',                 sortOrder: 6 },
  { slug: 'mujer-sudaderas',  name: 'Sudaderas',              sortOrder: 7 },
  { slug: 'mujer-jerseys',    name: 'Jerseys y Punto',        sortOrder: 8 },
  { slug: 'mujer-zapatillas', name: 'Zapatillas',             sortOrder: 9 },
  { slug: 'mujer-botas',      name: 'Botas y Botines',        sortOrder: 10 },
  { slug: 'mujer-sandalias',  name: 'Sandalias y Zuecos',     sortOrder: 11 },
]

const COMPLEMENTOS_SUBCATS = [
  { slug: 'complementos-gafas',       name: 'Gafas de Sol', sortOrder: 1 },
  { slug: 'complementos-accesorios',  name: 'Accesorios',   sortOrder: 2 },
]

// ─── Mapeo producto → subcategoría ───────────────────────────────────────────

const PRODUCT_SUBCATS: Record<string, string> = {
  // CAMISETAS Y TOPS
  'camiseta-de-tenis-para-mujer-beausejour-paris':                    'mujer-camisetas',
  'camiseta-perdida-en-roma-beausejour-paris-blanco':                 'mujer-camisetas',
  'camiseta-unisex-beausejour-paris-negro':                           'mujer-camisetas',
  'camiseta-de-mujer-lasal-to-be-kaki':                               'mujer-camisetas',
  'camiseta-de-mujer-lasal-chaos-gris':                               'mujer-camisetas',
  'camiseta-de-mujer-lasal-panther-blanco':                           'mujer-camisetas',
  'camiseta-de-mujer-lasal-bad-pink-blanco':                          'mujer-camisetas',
  'camiseta-micke-teddy-mwm-unisex':                                  'mujer-camisetas',
  'camiseta-de-mujer-lasal-patch-blanco':                             'mujer-camisetas',
  'camiseta-mujer-lasal-amy-negro':                                   'mujer-camisetas',
  'camiseta-unisex-bl3seed-snoop-tee-blanco':                         'mujer-camisetas',
  'camiseta-mujer-relish-cuello-acanalado-detalle-anillas-color-beige-y-negro': 'mujer-camisetas',
  'body-relish-fabricia-con-detalle-de-anilla-dorada-en-el-hombro':  'mujer-camisetas',
  'la-sal-camiseta-limited-negro':                                    'mujer-camisetas',
  'camiseta-mujer-la-sal-ciao-blanco':                                'mujer-camisetas',

  // PANTALONES Y SHORTS
  'denim-tiro-alto-anchos-nina-carter-blanco':                        'mujer-pantalones',
  'pantalon-de-mujer-lasal-end-negro':                                'mujer-pantalones',
  'denim-nina-carter-asimetrico-azul':                                'mujer-pantalones',
  'short-denim-deshilachados-nina-carter-en-elastico-acampanado':     'mujer-pantalones',
  'cargo-relish-con-puno-y-bolsos-laterales-verde':                   'mujer-pantalones',
  'pantalon-cintura-alta-relish-bolsos-franceses':                    'mujer-pantalones',
  'pantalon-lasal-mujer-bups-negro':                                  'mujer-pantalones',
  'pantalon-de-mujer-relish-blanco':                                  'mujer-pantalones',
  'pantalones-mujer-relish-palazzo-cintura-alta':                     'mujer-pantalones',

  // JEANS Y DENIM
  'denim-extra-globo-azul-analucy-paris':                             'mujer-jeans',
  'jeans-globo-mujer-nina-carter-azul':                               'mujer-jeans',

  // CHAQUETAS Y CAZADORAS
  'reservacazadora-perfecto-lasal-de-mujer-xxx-negro':                'mujer-chaquetas',
  'reserva-sahariana-de-mujer-lasal-guards-rosa':                     'mujer-chaquetas',
  'cazadora-denim-mujer-lasal-negro-reserva':                         'mujer-chaquetas',
  'chaqueta-piel-relish-sin-solapa-cinturon-negro':                   'mujer-chaquetas',
  'chaqueta-mujer-relish-con-detalle-metalico-color-negro':           'mujer-chaquetas',
  'chaqueta-mujer-relish-colada-solapada-y-cordones-en-la-espalda':   'mujer-chaquetas',

  // BLAZERS Y AMERICANAS
  'chaqueta-corta-cruzada-relish-en-cuadro-solapada':                 'mujer-blazers',
  'americana-de-mujer-lasal-young-negro':                             'mujer-blazers',
  'blazer-corte-silm-relish-negra-con-cinturon':                      'mujer-blazers',

  // VESTIDOS
  'vestido-midi-relish-con-cinturon-y-abertura-negro':                'mujer-vestidos',
  'vestido-de-mujer-vaquero-dua-alma-rockera':                        'mujer-vestidos',
  'vestido-cuadro-relish-falda-plisada':                              'mujer-vestidos',

  // FALDAS
  'flada-satinada-lasal-slow-rosa':                                   'mujer-faldas',
  'minifalda-denim-mujer-lasal-summer-azul':                          'mujer-faldas',

  // SUDADERAS
  'sudadera-con-capucha-azul-marino-saint-tropez-beausejour-paris-azul': 'mujer-sudaderas',
  'reserva-sudadera-de-mujer-lasal-on-rosa':                          'mujer-sudaderas',

  // JERSEYS Y PUNTO
  'jersey-cuello-alto-relish-con-detalle-de-ajustes-en-piel':         'mujer-jerseys',

  // ZAPATILLAS
  'zapatillas-another-trrend-athletic-bufalo-blanco':                 'mujer-zapatillas',
  'zapatillas-bajas-another-trend-white-mostaza':                     'mujer-zapatillas',
  'no-name-carter-2-0-runner-victoria':                               'mujer-zapatillas',
  'another-trend-iconic-ii-leopardo':                                 'mujer-zapatillas',

  // BOTAS Y BOTINES
  'bota-alpe-agnes-piel-becerro':                                     'mujer-botas',
  'bota-alpe-agnes-piel-negra':                                       'mujer-botas',
  'alpe-botin-mujer-modelo-holly':                                    'mujer-botas',
  'alpe-bota-mujer-modelo-holly':                                     'mujer-botas',

  // SANDALIAS Y ZUECOS
  'sanadalia-alpe-woman-isabela':                                     'mujer-sandalias',
  'zueco-alpe-alive-black':                                           'mujer-sandalias',
  'sandalia-no-name-sandy-slap-w-apricot':                            'mujer-sandalias',
  'sandalia-cuir-piel-alpe':                                          'mujer-sandalias',

  // GAFAS DE SOL (en complementos)
  'seba-gafas-unisex-meller-negro-con-lentes-naranja':                'complementos-gafas',
  'nayah-meller-negro-con-lentes-naranjas':                           'complementos-gafas',
  'gafas-meller-de-sol-kessie-negras-con-lentes-naranjas':            'complementos-gafas',
  'gamal-meller-all-black-gafas-de-sol-cristal-azul':                 'complementos-gafas',
  'gafas-metal-emin-dorado-cristal-verde':                            'complementos-gafas',

  // ACCESORIOS (en complementos)
  'accesorio-rue-madam-paris-teddy-charm-green':                      'complementos-accesorios',
  'accesorio-rue-madam-paris-teddy-charm-camel':                      'complementos-accesorios',
  'toalla-rue-madam-paris-jellystone':                                'complementos-accesorios',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function upsertCategory(slug: string, name: string, parentId: string, sortOrder: number) {
  return prisma.category.upsert({
    where: { slug },
    create: { slug, name, parentId, sortOrder, isActive: true },
    update: { name, parentId, sortOrder, isActive: true },
  })
}

async function assignSubcat(productId: string, subcatId: string) {
  await prisma.product.update({
    where: { id: productId },
    data: { categories: { connect: { id: subcatId } } },
  })
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n── Buscando categorías padre ───────────────────────────────')
  const mujer = await prisma.category.findUniqueOrThrow({ where: { slug: 'mujer' } })
  const complementos = await prisma.category.findUniqueOrThrow({ where: { slug: 'complementos' } })
  console.log(`✓ mujer (${mujer.id})`)
  console.log(`✓ complementos (${complementos.id})`)

  // ── Crear subcategorías de Mujer ──────────────────────────────────────────
  console.log('\n── Creando subcategorías de Mujer ──────────────────────────')
  const mujerCatMap: Record<string, string> = {}
  for (const cat of MUJER_SUBCATS) {
    const created = await upsertCategory(cat.slug, cat.name, mujer.id, cat.sortOrder)
    mujerCatMap[cat.slug] = created.id
    console.log(`  ✓ ${cat.slug}`)
  }

  // ── Crear subcategorías de Complementos ──────────────────────────────────
  console.log('\n── Creando subcategorías de Complementos ───────────────────')
  const compCatMap: Record<string, string> = {}
  for (const cat of COMPLEMENTOS_SUBCATS) {
    const created = await upsertCategory(cat.slug, cat.name, complementos.id, cat.sortOrder)
    compCatMap[cat.slug] = created.id
    console.log(`  ✓ ${cat.slug}`)
  }

  const allCatMap = { ...mujerCatMap, ...compCatMap }

  // ── Asignar productos ─────────────────────────────────────────────────────
  console.log('\n── Asignando productos a subcategorías ─────────────────────')

  let assigned = 0
  let notFound = 0
  const noMapping: string[] = []

  for (const [slug, subcatSlug] of Object.entries(PRODUCT_SUBCATS)) {
    const product = await prisma.product.findUnique({ where: { slug } })
    if (!product) {
      notFound++
      console.log(`  ✗ producto no encontrado: ${slug}`)
      continue
    }

    const subcatId = allCatMap[subcatSlug]
    if (!subcatId) {
      console.log(`  ✗ subcategoría no encontrada: ${subcatSlug}`)
      continue
    }

    await assignSubcat(product.id, subcatId)
    console.log(`  ✓ ${slug.substring(0, 50).padEnd(50)} → ${subcatSlug}`)
    assigned++
  }

  // ── Productos de mujer sin mapeo explícito ────────────────────────────────
  const mappedSlugs = new Set(Object.keys(PRODUCT_SUBCATS))
  const allMujerProducts = await prisma.product.findMany({
    where: { categories: { some: { slug: 'mujer' } } },
    select: { slug: true, name: true },
  })
  allMujerProducts.forEach(p => {
    if (!mappedSlugs.has(p.slug)) noMapping.push(p.slug)
  })

  // ── Resumen ───────────────────────────────────────────────────────────────
  console.log('\n── Resumen ─────────────────────────────────────────────────')
  console.log(`  Productos asignados:      ${assigned}`)
  console.log(`  Productos no encontrados: ${notFound}`)
  if (noMapping.length) {
    console.log(`\n  ⚠ Productos de mujer SIN subcategoría asignada (${noMapping.length}):`)
    noMapping.forEach(s => console.log(`    - ${s}`))
  } else {
    console.log('  ✓ Todos los productos de mujer tienen subcategoría')
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })
import { PrismaClient } from '../generated/prisma'
import { PrismaLibSql } from '@prisma/adapter-libsql'

function createPrisma() {
  const dbUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
  const adapter = new PrismaLibSql({ url: dbUrl, authToken: process.env.TURSO_AUTH_TOKEN })
  return new PrismaClient({ adapter })
}

function daysAgo(d: number, hour = 12, minuteOffset = 0): Date {
  const dt = new Date()
  dt.setDate(dt.getDate() - d)
  dt.setHours(hour, minuteOffset, 0, 0)
  return dt
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function sessionId() {
  return Math.random().toString(36).slice(2, 18)
}

async function main() {
  const prisma = createPrisma()

  // ── Limpieza de datos de simulación previos ─────────────────────────
  console.log('🧹 Limpiando datos de analytics anteriores...')
  await prisma.analyticsEvent.deleteMany({})
  await prisma.cartSession.deleteMany({})
  // Solo órdenes de simulación (sin tocar usuarios reales)
  await prisma.orderItem.deleteMany({})
  await prisma.order.deleteMany({})
  console.log('✅ Limpieza completa')

  // ── Obtener productos existentes ────────────────────────────────────
  const products = await prisma.product.findMany({ select: { id: true, name: true, price: true } })
  if (products.length === 0) {
    console.error('❌ No hay productos. Ejecuta primero: npm run db:seed')
    process.exit(1)
  }
  console.log(`📦 Usando ${products.length} productos existentes`)

  const utmSources = ['instagram', 'google', 'tiktok', 'facebook', null, null, null]
  const utmMediums = ['social', 'cpc', 'organic', null]
  const devices = ['mobile', 'mobile', 'mobile', 'desktop', 'desktop', 'tablet']
  const cities = [
    { city: 'Madrid', country: 'ES' },
    { city: 'Barcelona', country: 'ES' },
    { city: 'Valencia', country: 'ES' },
    { city: 'Sevilla', country: 'ES' },
    { city: 'Bilbao', country: 'ES' },
    { city: 'Oviedo', country: 'ES' },
    { city: 'Zaragoza', country: 'ES' },
    { city: 'Málaga', country: 'ES' },
  ]
  const searchQueries = [
    'camiseta blanca', 'sudadera', 'pantalon cargo', 'zapatillas', 'gorra',
    'ropa urbana', 'oferta', 'jogger', 'oversize', 'camiseta negra',
  ]
  const orderStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

  // ── Horas pico realistas: mañana 10-12h, tarde 17-20h ─────────────
  const trafficHours = [
    9, 9, 10, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12,
    13, 14, 15, 16, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19,
    20, 20, 21, 22, 0, 1, 2, 7, 8,
  ]

  const analyticsEvents: Parameters<typeof prisma.analyticsEvent.create>[0]['data'][] = []

  // ── PAGE_VIEW: ~350 eventos en 30 días ─────────────────────────────
  console.log('📊 Generando PAGE_VIEWs...')
  for (let day = 0; day < 30; day++) {
    const visitsThisDay = rand(5, 25)
    for (let v = 0; v < visitsThisDay; v++) {
      const hour = pick(trafficHours)
      const src = pick(utmSources)
      const geo = pick(cities)
      analyticsEvents.push({
        type: 'PAGE_VIEW',
        sessionId: sessionId(),
        utmSource: src,
        utmMedium: src ? pick(utmMediums) : null,
        deviceType: pick(devices),
        ipCity: geo.city,
        ipCountry: geo.country,
        pageUrl: pick(['/', '/categoria/ropa', '/categoria/calzado', '/novedades', '/ofertas']),
        createdAt: daysAgo(day, hour, rand(0, 59)),
      })
    }
  }

  // ── PRODUCT_VIEW: ~60% de PAGE_VIEWs tienen vista de producto ─────
  console.log('📊 Generando PRODUCT_VIEWs...')
  for (let day = 0; day < 30; day++) {
    const views = rand(3, 15)
    for (let v = 0; v < views; v++) {
      const product = pick(products)
      const hour = pick(trafficHours)
      analyticsEvents.push({
        type: 'PRODUCT_VIEW',
        sessionId: sessionId(),
        productId: product.id,
        utmSource: pick(utmSources),
        deviceType: pick(devices),
        pageUrl: `/producto/${product.name.toLowerCase().replace(/ /g, '-')}`,
        createdAt: daysAgo(day, hour, rand(0, 59)),
      })
    }
  }

  // ── ADD_TO_CART: ~25% del total ────────────────────────────────────
  console.log('📊 Generando ADD_TO_CARTs...')
  for (let day = 0; day < 30; day++) {
    const adds = rand(1, 8)
    for (let a = 0; a < adds; a++) {
      const product = pick(products)
      analyticsEvents.push({
        type: 'ADD_TO_CART',
        sessionId: sessionId(),
        productId: product.id,
        deviceType: pick(devices),
        createdAt: daysAgo(day, pick(trafficHours), rand(0, 59)),
      })
    }
  }

  // ── CHECKOUT_START: ~10% del total ─────────────────────────────────
  console.log('📊 Generando CHECKOUT_STARTs...')
  for (let day = 0; day < 30; day++) {
    if (rand(0, 2) === 0) continue
    const starts = rand(1, 4)
    for (let s = 0; s < starts; s++) {
      analyticsEvents.push({
        type: 'CHECKOUT_START',
        sessionId: sessionId(),
        deviceType: pick(devices),
        createdAt: daysAgo(day, pick(trafficHours), rand(0, 59)),
      })
    }
  }

  // ── ORDER_PLACED: ~5% del total ────────────────────────────────────
  console.log('📊 Generando ORDER_PLACEDs...')
  for (let day = 0; day < 30; day++) {
    if (rand(0, 3) !== 0) continue
    analyticsEvents.push({
      type: 'ORDER_PLACED',
      sessionId: sessionId(),
      deviceType: pick(devices),
      createdAt: daysAgo(day, pick(trafficHours), rand(0, 59)),
    })
  }

  // ── SEARCH: ~40 búsquedas ──────────────────────────────────────────
  console.log('📊 Generando SEARCHes...')
  for (let i = 0; i < 40; i++) {
    const day = rand(0, 29)
    analyticsEvents.push({
      type: 'SEARCH',
      sessionId: sessionId(),
      searchQuery: pick(searchQueries),
      deviceType: pick(devices),
      createdAt: daysAgo(day, pick(trafficHours), rand(0, 59)),
    })
  }

  // ── Insertar todos los eventos ─────────────────────────────────────
  console.log(`💾 Insertando ${analyticsEvents.length} eventos de analytics...`)
  for (const ev of analyticsEvents) {
    await prisma.analyticsEvent.create({ data: ev as never })
  }
  console.log('✅ Eventos insertados')

  // ── CART SESSIONS ──────────────────────────────────────────────────
  console.log('🛒 Generando CartSessions...')
  for (let i = 0; i < 45; i++) {
    const day = rand(0, 29)
    const product = pick(products)
    const isConverted = rand(0, 4) === 0
    const isAbandoned = !isConverted && rand(0, 1) === 0
    await prisma.cartSession.create({
      data: {
        sessionId: sessionId(),
        cartData: JSON.stringify([{ productId: product.id, quantity: rand(1, 3) }]),
        itemCount: rand(1, 4),
        totalValue: parseFloat((product.price * rand(1, 3)).toFixed(2)),
        isAbandoned,
        isConverted,
        utmSource: pick(utmSources),
        ipCity: pick(cities).city,
        ipCountry: 'ES',
        createdAt: daysAgo(day, pick(trafficHours), rand(0, 59)),
        lastSeenAt: daysAgo(day, pick(trafficHours), rand(0, 59)),
      },
    })
  }
  console.log('✅ CartSessions creados')

  // ── ORDERS con OrderItems ──────────────────────────────────────────
  console.log('📦 Generando Órdenes...')
  const orderCountByStatus: Record<string, number> = {
    DELIVERED: 8, SHIPPED: 5, CONFIRMED: 4, PENDING: 4, CANCELLED: 2,
  }
  let orderIdx = 1
  for (const [status, count] of Object.entries(orderCountByStatus)) {
    for (let i = 0; i < count; i++) {
      const day = rand(0, 29)
      const numItems = rand(1, 3)
      const selectedProducts = Array.from({ length: numItems }, () => pick(products))
      const items = selectedProducts.map((p) => ({
        productId: p.id,
        productName: p.name,
        quantity: rand(1, 2),
        unitPrice: p.price,
      }))
      const total = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0)
      const orderDate = daysAgo(day, pick(trafficHours), rand(0, 59))

      await prisma.order.create({
        data: {
          orderNumber: `ORD-SIM-${String(orderIdx++).padStart(4, '0')}`,
          status,
          totalAmount: parseFloat(total.toFixed(2)),
          currency: 'EUR',
          customerName: pick(['Ana García', 'Carlos López', 'María Fernández', 'Luis Martín', 'Elena Sánchez']),
          customerEmail: `cliente${orderIdx}@ejemplo.com`,
          utmSource: pick(utmSources),
          sessionId: sessionId(),
          createdAt: orderDate,
          updatedAt: orderDate,
          items: { create: items },
        },
      })
    }
  }
  console.log('✅ Órdenes creadas')

  await prisma.$disconnect()
  console.log('\n✨ Simulación completa. Recarga el panel de analíticas.')
}

main().catch((e) => { console.error(e); process.exit(1) })

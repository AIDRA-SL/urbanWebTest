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
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  console.log('\n══════════════════════════════════════════')
  console.log('  VERIFICACIÓN DE GRÁFICAS')
  console.log('══════════════════════════════════════════\n')

  // ── 1. StatsCards ──────────────────────────────────────────────────
  const [ordersMonth, ordersToday, visitorsToday, visitorsMonth, totalCarts, abandonedCarts] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: startOfMonth } }, select: { totalAmount: true } }),
    prisma.order.findMany({ where: { createdAt: { gte: startOfDay } }, select: { totalAmount: true } }),
    prisma.analyticsEvent.count({ where: { type: 'PAGE_VIEW', createdAt: { gte: startOfDay } } }),
    prisma.analyticsEvent.count({ where: { type: 'PAGE_VIEW', createdAt: { gte: startOfMonth } } }),
    prisma.cartSession.count({ where: { itemCount: { gt: 0 }, createdAt: { gte: startOfMonth } } }),
    prisma.cartSession.count({ where: { isAbandoned: true, isConverted: false, createdAt: { gte: startOfMonth } } }),
  ])
  const revenueMonth = ordersMonth.reduce((s, o) => s + o.totalAmount, 0)
  console.log('📊 STATS CARDS:')
  console.log(`   Pedidos mes: ${ordersMonth.length} | Ingresos mes: ${revenueMonth.toFixed(2)}€`)
  console.log(`   Visitantes hoy: ${visitorsToday} | Visitantes mes: ${visitorsMonth}`)
  console.log(`   Carritos: ${totalCarts} | Abandonados: ${abandonedCarts}`)
  const ok1 = ordersMonth.length > 0 && visitorsMonth > 0
  console.log(`   ${ok1 ? '✅' : '❌'} StatsCards: ${ok1 ? 'OK' : 'SIN DATOS'}\n`)

  // ── 2. RevenueChart ────────────────────────────────────────────────
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since30 } },
    select: { totalAmount: true, createdAt: true },
  })
  const byDay: Record<string, number> = {}
  for (const o of orders) {
    const day = o.createdAt.toISOString().split('T')[0]
    byDay[day] = (byDay[day] ?? 0) + o.totalAmount
  }
  const revenueDays = Object.keys(byDay).length
  console.log('📊 REVENUE CHART:')
  console.log(`   Días con ingresos: ${revenueDays} | Total pedidos: ${orders.length}`)
  console.log(`   ${revenueDays > 0 ? '✅' : '❌'} RevenueChart: ${revenueDays > 0 ? 'OK' : 'SIN DATOS'}\n`)

  // ── 3. TrafficSourceChart ──────────────────────────────────────────
  const trafficEvents = await prisma.analyticsEvent.findMany({
    where: { type: 'PAGE_VIEW', createdAt: { gte: since30 } },
    select: { utmSource: true },
  })
  const srcCounts: Record<string, number> = {}
  for (const e of trafficEvents) {
    const s = e.utmSource ?? 'Directo'
    srcCounts[s] = (srcCounts[s] ?? 0) + 1
  }
  console.log('📊 TRAFFIC SOURCE CHART:')
  for (const [src, cnt] of Object.entries(srcCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${src}: ${cnt}`)
  }
  console.log(`   ${Object.keys(srcCounts).length > 0 ? '✅' : '❌'} TrafficSourceChart: ${Object.keys(srcCounts).length > 0 ? 'OK' : 'SIN DATOS'}\n`)

  // ── 4. ConversionFunnelChart ───────────────────────────────────────
  const funnelTypes = ['PAGE_VIEW', 'PRODUCT_VIEW', 'ADD_TO_CART', 'CHECKOUT_START', 'ORDER_PLACED']
  const funnelCounts = await Promise.all(
    funnelTypes.map((t) => prisma.analyticsEvent.count({ where: { type: t, createdAt: { gte: since30 } } }))
  )
  console.log('📊 CONVERSION FUNNEL:')
  const funnelLabels = ['Visitas', 'Vistas producto', 'Carrito', 'Inicio pago', 'Pedido completado']
  const top = funnelCounts[0] > 0 ? funnelCounts[0] : 1
  for (let i = 0; i < funnelTypes.length; i++) {
    const rate = funnelCounts[0] === 0 ? 0 : Math.min(100, i === 0 ? 100 : Math.round((funnelCounts[i] / funnelCounts[0]) * 100))
    const bar = '█'.repeat(Math.round(rate / 5))
    console.log(`   ${funnelLabels[i].padEnd(18)}: ${String(funnelCounts[i]).padStart(4)} eventos | ${String(rate).padStart(3)}% ${bar}`)
  }
  const funnelOk = funnelCounts[0] > 0 && funnelCounts[0] >= funnelCounts[1]
  console.log(`   ${funnelOk ? '✅' : '⚠️ '} ConversionFunnel: ${funnelOk ? 'OK (porcentajes correctos ≤100%)' : 'REVISAR'}\n`)

  // ── 5. TopProductsChart ────────────────────────────────────────────
  const orderItems = await prisma.orderItem.findMany({ select: { productName: true, quantity: true } })
  const byProduct: Record<string, number> = {}
  for (const it of orderItems) byProduct[it.productName] = (byProduct[it.productName] ?? 0) + it.quantity
  const topProds = Object.entries(byProduct).sort((a, b) => b[1] - a[1]).slice(0, 5)
  console.log('📊 TOP PRODUCTS CHART:')
  topProds.forEach(([name, qty]) => console.log(`   ${name.substring(0, 30).padEnd(30)}: ${qty} uds`))
  console.log(`   ${topProds.length > 0 ? '✅' : '❌'} TopProducts: ${topProds.length > 0 ? 'OK' : 'SIN DATOS'}\n`)

  // ── 6. OrderStatusChart ────────────────────────────────────────────
  const statuses = await prisma.order.groupBy({ by: ['status'], _count: { id: true } })
  console.log('📊 ORDER STATUS CHART:')
  statuses.forEach((s) => console.log(`   ${s.status}: ${s._count.id}`))
  console.log(`   ${statuses.length > 0 ? '✅' : '❌'} OrderStatus: ${statuses.length > 0 ? 'OK' : 'SIN DATOS'}\n`)

  // ── 7. HourlyTrafficChart ──────────────────────────────────────────
  const hourlyEvents = await prisma.analyticsEvent.findMany({
    where: { type: 'PAGE_VIEW', createdAt: { gte: since7 } },
    select: { createdAt: true },
  })
  const hourlyCounts: Record<number, number> = {}
  for (let h = 0; h < 24; h++) hourlyCounts[h] = 0
  for (const e of hourlyEvents) hourlyCounts[new Date(e.createdAt).getHours()] += 1
  const maxHourly = Math.max(...Object.values(hourlyCounts))
  const peakHour = Object.entries(hourlyCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0]
  console.log('📊 HOURLY TRAFFIC CHART (últimos 7 días):')
  console.log(`   Total PAGE_VIEWs 7 días: ${hourlyEvents.length}`)
  console.log(`   Hora pico: ${peakHour[0]}h con ${peakHour[1]} visitas | Máx eje Y: ${Math.max(maxHourly, 5)}`)
  // Show top 6 hours
  Object.entries(hourlyCounts)
    .filter(([, v]) => v > 0)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 6)
    .forEach(([h, v]) => console.log(`   ${String(h).padStart(2, '0')}h: ${'█'.repeat(Math.round((v / maxHourly) * 10))} (${v})`))
  const hourlyOk = hourlyEvents.length > 0 && maxHourly >= 1
  console.log(`   ${hourlyOk ? '✅' : '❌'} HourlyTraffic: ${hourlyOk ? `OK (eje Y irá hasta ${Math.max(maxHourly, 5)} mín)` : 'SIN DATOS'}\n`)

  // ── 8. DeviceChart ─────────────────────────────────────────────────
  const deviceEvents = await prisma.analyticsEvent.findMany({
    where: { type: 'PAGE_VIEW', createdAt: { gte: since30 } },
    select: { deviceType: true },
  })
  const devCounts: Record<string, number> = {}
  for (const e of deviceEvents) {
    const d = e.deviceType ?? 'unknown'
    devCounts[d] = (devCounts[d] ?? 0) + 1
  }
  console.log('📊 DEVICE CHART:')
  for (const [d, c] of Object.entries(devCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${d}: ${c}`)
  }
  console.log(`   ${Object.keys(devCounts).length > 0 ? '✅' : '❌'} DeviceChart: ${Object.keys(devCounts).length > 0 ? 'OK' : 'SIN DATOS'}\n`)

  // ── 9. TopSearchTerms ──────────────────────────────────────────────
  const searches = await prisma.analyticsEvent.findMany({
    where: { type: 'SEARCH', createdAt: { gte: since30 }, searchQuery: { not: null } },
    select: { searchQuery: true },
  })
  const queryCounts: Record<string, number> = {}
  for (const e of searches) {
    const q = e.searchQuery!.toLowerCase().trim()
    if (q) queryCounts[q] = (queryCounts[q] ?? 0) + 1
  }
  const topSearches = Object.entries(queryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  console.log('📊 TOP SEARCH TERMS:')
  topSearches.forEach(([q, c]) => console.log(`   "${q}": ${c} búsquedas`))
  console.log(`   ${topSearches.length > 0 ? '✅' : '❌'} SearchTerms: ${topSearches.length > 0 ? 'OK' : 'SIN DATOS'}\n`)

  // ── 10. Geographic ─────────────────────────────────────────────────
  const geoEvents = await prisma.analyticsEvent.findMany({
    where: { ipCity: { not: null } },
    select: { ipCity: true, ipCountry: true },
  })
  const geoCounts: Record<string, number> = {}
  for (const e of geoEvents) {
    const key = `${e.ipCity}, ${e.ipCountry}`
    geoCounts[key] = (geoCounts[key] ?? 0) + 1
  }
  const topGeo = Object.entries(geoCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  console.log('📊 GEOGRAPHIC:')
  topGeo.forEach(([loc, c]) => console.log(`   ${loc}: ${c}`))
  console.log(`   ${topGeo.length > 0 ? '✅' : '❌'} Geographic: ${topGeo.length > 0 ? 'OK' : 'SIN DATOS'}\n`)

  // ── Resumen final ──────────────────────────────────────────────────
  console.log('══════════════════════════════════════════')
  const allOk = ok1 && revenueDays > 0 && Object.keys(srcCounts).length > 0 && funnelOk && topProds.length > 0 && statuses.length > 0 && hourlyOk && Object.keys(devCounts).length > 0 && topSearches.length > 0 && topGeo.length > 0
  console.log(`  ${allOk ? '✅ TODAS LAS GRÁFICAS TIENEN DATOS CORRECTOS' : '⚠️  ALGUNAS GRÁFICAS NECESITAN REVISIÓN'}`)
  console.log('══════════════════════════════════════════\n')

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })

import { unstable_cache } from 'next/cache'
import { prisma } from './prisma'
import type {
  DashboardStats,
  DailyRevenue,
  TrafficSource,
  ConversionStep,
  TopProduct,
  OrderStatusCount,
  DeviceCount,
  SearchTerm,
  HourlyTraffic,
} from '@/types/analytics'

const CACHE_OPTS = { revalidate: 300, tags: ['analytics'] as string[] }

export const getDashboardStats = unstable_cache(
  async (): Promise<DashboardStats> => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      aggMonth,
      aggToday,
      visitorsToday,
      visitorsMonth,
      totalCarts,
      abandonedCarts,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfDay } },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.analyticsEvent.count({
        where: { type: 'PAGE_VIEW', createdAt: { gte: startOfDay } },
      }),
      prisma.analyticsEvent.count({
        where: { type: 'PAGE_VIEW', createdAt: { gte: startOfMonth } },
      }),
      prisma.cartSession.count({
        where: { itemCount: { gt: 0 }, createdAt: { gte: startOfMonth } },
      }),
      prisma.cartSession.count({
        where: { isAbandoned: true, isConverted: false, createdAt: { gte: startOfMonth } },
      }),
    ])

    const revenueMonth = aggMonth._sum.totalAmount ?? 0
    const totalOrdersMonth = aggMonth._count.id
    const revenueToday = aggToday._sum.totalAmount ?? 0
    const totalOrdersToday = aggToday._count.id

    return {
      totalOrdersMonth,
      revenueMonth,
      avgOrderValue: totalOrdersMonth > 0 ? revenueMonth / totalOrdersMonth : 0,
      totalOrdersToday,
      revenueToday,
      visitorsToday,
      visitorsMonth,
      cartAbandonRate: totalCarts > 0 ? Math.round((abandonedCarts / totalCarts) * 100) : 0,
      conversionRate: visitorsMonth > 0 ? parseFloat(((totalOrdersMonth / visitorsMonth) * 100).toFixed(1)) : 0,
    }
  },
  ['analytics-dashboard-stats'],
  CACHE_OPTS
)

export const getTrafficSources = unstable_cache(
  async (days = 30): Promise<TrafficSource[]> => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const where = { type: 'PAGE_VIEW', createdAt: { gte: since } } as const

    const [grouped, nullCount] = await Promise.all([
      prisma.analyticsEvent.groupBy({
        by: ['utmSource'],
        where: { ...where, utmSource: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.analyticsEvent.count({ where: { ...where, utmSource: null } }),
    ])

    const rows: Array<{ source: string; count: number }> = grouped.map((r) => ({
      source: r.utmSource!,
      count: r._count.id,
    }))

    if (nullCount > 0) rows.push({ source: 'Directo', count: nullCount })

    rows.sort((a, b) => b.count - a.count)
    const total = rows.reduce((s, r) => s + r.count, 0) || 1

    return rows.map((r) => ({
      ...r,
      percentage: Math.round((r.count / total) * 100),
    }))
  },
  ['analytics-traffic-sources'],
  CACHE_OPTS
)

export const getDailyRevenue = unstable_cache(
  async (days = 30): Promise<DailyRevenue[]> => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const byDay: Record<string, { revenue: number; orders: number }> = {}
    for (const order of orders) {
      const day = order.createdAt.toISOString().split('T')[0]
      if (!byDay[day]) byDay[day] = { revenue: 0, orders: 0 }
      byDay[day].revenue += order.totalAmount
      byDay[day].orders += 1
    }

    return Object.entries(byDay).map(([date, v]) => ({ date, ...v }))
  },
  ['analytics-daily-revenue'],
  CACHE_OPTS
)

export const getGeographicData = unstable_cache(
  async () => {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const grouped = await prisma.analyticsEvent.groupBy({
      by: ['ipCity', 'ipCountry'],
      where: { ipCity: { not: null }, createdAt: { gte: since } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })

    return grouped.map((r) => ({
      location: `${r.ipCity}, ${r.ipCountry}`,
      count: r._count.id,
    }))
  },
  ['analytics-geographic'],
  CACHE_OPTS
)

export const getConversionFunnel = unstable_cache(
  async (days = 30): Promise<ConversionStep[]> => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const steps = [
      { type: 'PAGE_VIEW', label: 'Visitas' },
      { type: 'PRODUCT_VIEW', label: 'Vistas de producto' },
      { type: 'ADD_TO_CART', label: 'Añadido al carrito' },
      { type: 'CHECKOUT_START', label: 'Inicio de pago' },
      { type: 'ORDER_PLACED', label: 'Pedido completado' },
    ]

    const counts = await Promise.all(
      steps.map((s) =>
        prisma.analyticsEvent.count({ where: { type: s.type, createdAt: { gte: since } } })
      )
    )

    return steps.map((s, i) => ({
      step: s.type,
      label: s.label,
      count: counts[i],
      rate:
        counts[0] === 0
          ? 0
          : Math.min(100, i === 0 ? 100 : Math.round((counts[i] / counts[0]) * 100)),
    }))
  },
  ['analytics-conversion-funnel'],
  CACHE_OPTS
)

export const getTopProducts = unstable_cache(
  async (limit = 8): Promise<TopProduct[]> => {
    const grouped = await prisma.orderItem.groupBy({
      by: ['productName'],
      _sum: { quantity: true, unitPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    })

    return grouped.map((r) => ({
      name: r.productName,
      quantity: r._sum.quantity ?? 0,
      revenue: r._sum.unitPrice ?? 0,
    }))
  },
  ['analytics-top-products'],
  CACHE_OPTS
)

export const getOrdersByStatus = unstable_cache(
  async (): Promise<OrderStatusCount[]> => {
    const statuses = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    })

    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmado',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregado',
      CANCELLED: 'Cancelado',
    }

    return statuses.map((s) => ({
      status: s.status,
      label: labels[s.status] ?? s.status,
      count: s._count.id,
    }))
  },
  ['analytics-orders-status'],
  CACHE_OPTS
)

export const getDeviceBreakdown = unstable_cache(
  async (days = 30): Promise<DeviceCount[]> => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const where = { type: 'PAGE_VIEW', createdAt: { gte: since } } as const

    const deviceLabels: Record<string, string> = {
      mobile: 'Móvil',
      desktop: 'Escritorio',
      tablet: 'Tablet',
      unknown: 'Desconocido',
    }

    const [grouped, nullCount] = await Promise.all([
      prisma.analyticsEvent.groupBy({
        by: ['deviceType'],
        where: { ...where, deviceType: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.analyticsEvent.count({ where: { ...where, deviceType: null } }),
    ])

    const rows: Array<{ device: string; count: number }> = grouped.map((r) => ({
      device: deviceLabels[r.deviceType!] ?? r.deviceType!,
      count: r._count.id,
    }))

    if (nullCount > 0) rows.push({ device: deviceLabels['unknown'], count: nullCount })

    rows.sort((a, b) => b.count - a.count)
    const total = rows.reduce((s, r) => s + r.count, 0) || 1

    return rows.map((r) => ({
      ...r,
      percentage: Math.round((r.count / total) * 100),
    }))
  },
  ['analytics-device-breakdown'],
  CACHE_OPTS
)

export const getTopSearchTerms = unstable_cache(
  async (days = 30, limit = 10): Promise<SearchTerm[]> => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const grouped = await prisma.analyticsEvent.groupBy({
      by: ['searchQuery'],
      where: { type: 'SEARCH', createdAt: { gte: since }, searchQuery: { not: null } },
      _count: { searchQuery: true },
      orderBy: { _count: { searchQuery: 'desc' } },
      take: limit,
    })

    return grouped.map((r) => ({
      query: r.searchQuery!.toLowerCase().trim(),
      count: r._count.searchQuery,
    }))
  },
  ['analytics-search-terms'],
  CACHE_OPTS
)

export const getHourlyTraffic = unstable_cache(
  async (days = 7): Promise<HourlyTraffic[]> => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const events = await prisma.analyticsEvent.findMany({
      where: { type: 'PAGE_VIEW', createdAt: { gte: since } },
      select: { createdAt: true },
    })

    const counts: Record<number, number> = {}
    for (let h = 0; h < 24; h++) counts[h] = 0
    for (const e of events) {
      counts[e.createdAt.getHours()] += 1
    }

    return Array.from({ length: 24 }, (_, h) => ({
      hour: `${h.toString().padStart(2, '0')}h`,
      count: counts[h],
    }))
  },
  ['analytics-hourly-traffic'],
  CACHE_OPTS
)

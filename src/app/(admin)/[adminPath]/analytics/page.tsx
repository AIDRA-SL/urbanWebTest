import { AdminHeader } from '@/components/admin/layout/AdminHeader'
import { StatsCards } from '@/components/admin/analytics/StatsCards'
import { RevenueChart } from '@/components/admin/analytics/RevenueChart'
import { TrafficSourceChart } from '@/components/admin/analytics/TrafficSourceChart'
import { ConversionFunnelChart } from '@/components/admin/analytics/ConversionFunnelChart'
import { TopProductsChart } from '@/components/admin/analytics/TopProductsChart'
import { OrderStatusChart } from '@/components/admin/analytics/OrderStatusChart'
import { HourlyTrafficChart } from '@/components/admin/analytics/HourlyTrafficChart'
import { DeviceChart } from '@/components/admin/analytics/DeviceChart'
import { TopSearchTerms } from '@/components/admin/analytics/TopSearchTerms'
import {
  getDashboardStats,
  getTrafficSources,
  getDailyRevenue,
  getGeographicData,
  getConversionFunnel,
  getTopProducts,
  getOrdersByStatus,
  getDeviceBreakdown,
  getTopSearchTerms,
  getHourlyTraffic,
} from '@/lib/analytics-server'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Analíticas' }

export default async function AnalyticsPage() {
  const [
    stats,
    traffic,
    revenue,
    geo,
    funnel,
    topProducts,
    orderStatuses,
    devices,
    searchTerms,
    hourlyTraffic,
  ] = await Promise.all([
    getDashboardStats(),
    getTrafficSources(30),
    getDailyRevenue(30),
    getGeographicData(),
    getConversionFunnel(30),
    getTopProducts(8),
    getOrdersByStatus(),
    getDeviceBreakdown(30),
    getTopSearchTerms(30, 10),
    getHourlyTraffic(7),
  ])

  return (
    <>
      <AdminHeader title="Analíticas" subtitle="Últimos 30 días" />

      <div className="space-y-6">
        {/* KPIs */}
        <StatsCards stats={stats} />

        {/* Ingresos + Fuentes de tráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart data={revenue} />
          </div>
          <TrafficSourceChart data={traffic} />
        </div>

        {/* Embudo de conversión + Estado de pedidos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ConversionFunnelChart data={funnel} />
          </div>
          <OrderStatusChart data={orderStatuses} />
        </div>

        {/* Top productos + Dispositivos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TopProductsChart data={topProducts} />
          </div>
          <DeviceChart data={devices} />
        </div>

        {/* Tráfico por hora */}
        <HourlyTrafficChart data={hourlyTraffic} />

        {/* Búsquedas populares + Origen geográfico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopSearchTerms data={searchTerms} />

          <div className="bg-white border border-gray-100 p-6">
            <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
              Origen geográfico
            </h3>
            {geo.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sin datos de ubicación aún</p>
            ) : (
              <div className="flex flex-col gap-1">
                {geo.map((item, i) => (
                  <div
                    key={item.location}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] text-gray-300 w-4 text-right">{i + 1}</span>
                      <span className="text-sm text-gray-700">{item.location}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500">{item.count} visitas</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* UTM tracking tip */}
        <div className="bg-blue-50 border border-blue-100 p-4 text-xs text-blue-700">
          <p className="font-medium mb-1">¿Cómo rastrear tráfico de redes sociales?</p>
          <p>Añade parámetros UTM a tus links de Instagram, TikTok y Facebook:</p>
          <code className="block mt-1 bg-white px-2 py-1 text-[11px] text-gray-600">
            https://tutienda.com/?utm_source=instagram&utm_medium=social&utm_campaign=verano26
          </code>
        </div>
      </div>
    </>
  )
}

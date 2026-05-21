import { formatPrice } from '@/lib/utils'
import type { DashboardStats } from '@/types/analytics'
import { TrendingUp, ShoppingBag, Users, BarChart2, ArrowUpRight, Target } from 'lucide-react'

interface Props {
  stats: DashboardStats
}

export function StatsCards({ stats }: Props) {
  const cards = [
    {
      label: 'Ingresos este mes',
      value: formatPrice(stats.revenueMonth),
      sub: `${stats.totalOrdersMonth} pedido${stats.totalOrdersMonth !== 1 ? 's' : ''}`,
      icon: TrendingUp,
    },
    {
      label: 'Valor medio pedido',
      value: formatPrice(stats.avgOrderValue),
      sub: 'ticket medio mensual',
      icon: ArrowUpRight,
    },
    {
      label: 'Visitantes este mes',
      value: stats.visitorsMonth.toLocaleString(),
      sub: `${stats.visitorsToday.toLocaleString()} hoy`,
      icon: Users,
    },
    {
      label: 'Tasa de conversión',
      value: `${stats.conversionRate}%`,
      sub: 'visitas → pedidos',
      icon: Target,
    },
    {
      label: 'Pedidos hoy',
      value: stats.totalOrdersToday.toString(),
      sub: formatPrice(stats.revenueToday),
      icon: ShoppingBag,
    },
    {
      label: 'Abandono carrito',
      value: `${stats.cartAbandonRate}%`,
      sub: 'este mes',
      icon: BarChart2,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map(({ label, value, sub, icon: Icon }) => (
        <div key={label} className="bg-white border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider leading-tight">{label}</p>
            <Icon size={15} strokeWidth={1.5} className="text-gray-300 shrink-0" />
          </div>
          <p className="text-xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </div>
      ))}
    </div>
  )
}

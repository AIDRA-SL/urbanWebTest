'use client'

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { DailyRevenue } from '@/types/analytics'
import { formatPrice } from '@/lib/utils'

interface Props {
  data: DailyRevenue[]
}

export function RevenueChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-100 p-6">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Ingresos y pedidos diarios</h3>
        <p className="text-sm text-gray-400 text-center py-10">Sin datos aún</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 p-6">
      <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Ingresos y pedidos diarios (30 días)</h3>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickFormatter={(v) => v.slice(5)}
          />
          <YAxis
            yAxisId="revenue"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickFormatter={(v) => `${v}€`}
            width={52}
          />
          <YAxis
            yAxisId="orders"
            orientation="right"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            width={28}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(value: unknown, name: unknown) => {
              const v = value as number
              return name === 'revenue'
                ? [formatPrice(v), 'Ingresos']
                : [`${v} pedido${v !== 1 ? 's' : ''}`, 'Pedidos']
            }}
            labelStyle={{ fontSize: 11 }}
            contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb' }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ fontSize: 11, color: '#6b7280' }}>
                {value === 'revenue' ? 'Ingresos' : 'Pedidos'}
              </span>
            )}
          />
          <Bar yAxisId="orders" dataKey="orders" fill="#e5e7eb" radius={[2, 2, 0, 0]} barSize={14} />
          <Line
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            stroke="#000"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

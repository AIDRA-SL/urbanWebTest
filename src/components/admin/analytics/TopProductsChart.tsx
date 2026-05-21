'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { TopProduct } from '@/types/analytics'
import { formatPrice } from '@/lib/utils'

interface Props {
  data: TopProduct[]
}

export function TopProductsChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-100 p-6">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
          Productos más vendidos
        </h3>
        <p className="text-sm text-gray-400 text-center py-10">Sin ventas registradas aún</p>
      </div>
    )
  }

  const chartData = data.map((p) => ({
    ...p,
    name: p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name,
    fullName: p.name,
  }))

  return (
    <div className="bg-white border border-gray-100 p-6">
      <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
        Productos más vendidos (histórico)
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10, fill: '#6b7280' }}
            width={120}
          />
          <Tooltip
            formatter={(value: unknown, name: unknown) => {
              const v = value as number
              return name === 'quantity'
                ? [`${v} uds.`, 'Unidades vendidas']
                : [formatPrice(v), 'Ingresos generados']
            }}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
            contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb' }}
          />
          <Bar dataKey="quantity" fill="#000" radius={[0, 2, 2, 0]} barSize={10} name="quantity" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

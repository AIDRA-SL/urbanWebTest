'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { OrderStatusCount } from '@/types/analytics'

const STATUS_COLORS: Record<string, string> = {
  Pendiente: '#d1d5db',
  Confirmado: '#9ca3af',
  Enviado: '#374151',
  Entregado: '#000000',
  Cancelado: '#fca5a5',
}

interface Props {
  data: OrderStatusCount[]
}

export function OrderStatusChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-100 p-6">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Estado de pedidos</h3>
        <p className="text-sm text-gray-400 text-center py-10">Sin pedidos registrados aún</p>
      </div>
    )
  }

  const chartData = data.map((d) => ({ name: d.label, value: d.count }))
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="bg-white border border-gray-100 p-6">
      <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Estado de pedidos</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} width={25} allowDecimals={false} />
          <Tooltip
            formatter={(value: unknown) => [`${value as number} pedidos`, 'Cantidad']}
            contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb' }}
          />
          <Bar dataKey="value" radius={[2, 2, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={STATUS_COLORS[entry.name] ?? '#9ca3af'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {data.map((d) => (
          <div key={d.status} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span
              className="w-2 h-2 rounded-sm inline-block"
              style={{ backgroundColor: STATUS_COLORS[d.label] ?? '#9ca3af' }}
            />
            {d.label}: <span className="font-medium">{Math.round((d.count / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

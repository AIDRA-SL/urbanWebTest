'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { TrafficSource } from '@/types/analytics'

const COLORS = ['#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db']

interface Props {
  data: TrafficSource[]
}

export function TrafficSourceChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-100 p-6">
        <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Fuentes de tráfico</h3>
        <p className="text-sm text-gray-400 text-center py-8">Sin datos aún</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 p-6">
      <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Fuentes de tráfico</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="source"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: unknown, name: unknown) => [`${value as number} visitas`, name as string]}
            contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb' }}
          />
          <Legend
            formatter={(value) => <span style={{ fontSize: 11, color: '#6b7280' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-3 flex flex-col gap-1.5">
        {data.map((item, i) => (
          <div key={item.source} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="capitalize text-gray-700">{item.source}</span>
            </div>
            <span className="text-gray-500">{item.percentage}% ({item.count})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

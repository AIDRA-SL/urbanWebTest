'use client'

import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { HourlyTraffic } from '@/types/analytics'

interface Props {
  data: HourlyTraffic[]
}

export function HourlyTrafficChart({ data }: Props) {
  const peak = data.length > 0 ? data.reduce((best, d) => (d.count > best.count ? d : best), data[0]) : null
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="bg-white border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xs uppercase tracking-widest text-gray-500">
          Tráfico por hora del día (últimos 7 días)
        </h3>
        {total > 0 && peak && (
          <div className="text-right shrink-0 ml-4">
            <p className="text-[10px] text-gray-400">Pico de tráfico</p>
            <p className="text-xs font-semibold text-gray-700">{peak.hour}</p>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 9, fill: '#9ca3af' }}
            interval={1}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            width={28}
            allowDecimals={false}
            domain={[0, (dataMax: number) => Math.max(dataMax, 5)]}
          />
          <Tooltip
            formatter={(value: unknown) => [`${value as number} visitas`, 'Visitas']}
            contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb' }}
          />
          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={peak && entry.hour === peak.hour ? '#000' : '#e5e7eb'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

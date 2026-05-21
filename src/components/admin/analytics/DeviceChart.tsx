import type { DeviceCount } from '@/types/analytics'

interface Props {
  data: DeviceCount[]
}

const COLORS = ['#000000', '#374151', '#9ca3af', '#d1d5db']

export function DeviceChart({ data }: Props) {
  return (
    <div className="bg-white border border-gray-100 p-6">
      <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-5">
        Dispositivos (30 días)
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Sin datos aún</p>
      ) : (
        <div className="space-y-4">
          {data.map((d, i) => (
            <div key={d.device}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-gray-700">{d.device}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{d.count.toLocaleString()}</span>
                  <span className="text-sm font-semibold w-10 text-right">{d.percentage}%</span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-300"
                  style={{
                    width: `${d.percentage}%`,
                    backgroundColor: COLORS[i % COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

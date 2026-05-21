import type { ConversionStep } from '@/types/analytics'

interface Props {
  data: ConversionStep[]
}

const STEP_COLORS = ['#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db']

export function ConversionFunnelChart({ data }: Props) {
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="bg-white border border-gray-100 p-6">
      <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-5">
        Embudo de conversión (30 días)
      </h3>
      <div className="space-y-4">
        {data.map((step, i) => (
          <div key={step.step}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-gray-600">{step.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{step.rate}%</span>
                <span className="text-sm font-semibold tabular-nums w-16 text-right">
                  {step.count.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-sm overflow-hidden">
              <div
                className="h-full rounded-sm transition-all duration-300"
                style={{
                  width: `${Math.max(1, (step.count / max) * 100)}%`,
                  backgroundColor: STEP_COLORS[i] ?? '#d1d5db',
                }}
              />
            </div>
            {i < data.length - 1 && step.count > 0 && data[i + 1].count > 0 && (
              <p className="text-right text-[10px] text-gray-400 mt-0.5">
                -{Math.round(100 - (data[i + 1].count / step.count) * 100)}% drop-off
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

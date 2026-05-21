import type { SearchTerm } from '@/types/analytics'
import { Search } from 'lucide-react'

interface Props {
  data: SearchTerm[]
}

export function TopSearchTerms({ data }: Props) {
  return (
    <div className="bg-white border border-gray-100 p-6">
      <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
        Búsquedas populares (30 días)
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">Sin búsquedas registradas aún</p>
      ) : (
        <div className="flex flex-col gap-1">
          {data.map((term, i) => (
            <div
              key={term.query}
              className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] text-gray-300 w-4 text-right shrink-0">{i + 1}</span>
                <Search size={11} className="text-gray-300 shrink-0" />
                <span className="text-sm text-gray-700 truncate">{term.query}</span>
              </div>
              <span className="text-xs font-medium text-gray-500 shrink-0 ml-3">
                {term.count}x
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

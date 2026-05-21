'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'
import type { ProductCard } from '@/types/product'

interface SearchBarProps {
  onClose?: () => void
}

export function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProductCard[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      return
    }
    const controller = new AbortController()
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setResults(data.data ?? [])
        trackEvent({ type: 'SEARCH', searchQuery: debouncedQuery })
      })
      .catch((e) => { if (e.name !== 'AbortError') console.error(e) })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [debouncedQuery])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/busqueda?q=${encodeURIComponent(query.trim())}`)
    onClose?.()
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 focus:outline-none focus:border-black transition-colors"
          />
        </div>
        {query && (
          <button type="button" onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-black">
            <X size={16} />
          </button>
        )}
      </form>

      {results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.map((product) => {
            const img = product.images.find((i) => i.isPrimary) ?? product.images[0]
            return (
              <a
                key={product.id}
                href={`/productos/${product.slug}`}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                {img && (
                  <div className="w-10 h-10 bg-gray-100 flex-shrink-0 overflow-hidden">
                    <Image
                      src={img.url}
                      alt={img.altText ?? product.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{formatPrice(product.price)}</p>
                </div>
              </a>
            )
          })}
        </div>
      )}

      {loading && (
        <div className="absolute right-0 top-full mt-1 px-4 py-3 text-xs text-gray-400">
          Buscando…
        </div>
      )}
    </div>
  )
}

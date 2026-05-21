'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { Trash2, Plus } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface Product {
  id: string
  name: string
  price: number
  images: { url: string }[]
}

interface Promotion {
  id: string
  label: string | null
  badgeColor: string | null
  discountPct: number | null
  isActive: boolean
  sortOrder: number
  product: Product
}

interface Props {
  promotions: Promotion[]
  products: Product[]
}

export function PromotionsClient({ promotions, products }: Props) {
  const router = useRouter()
  const [showPicker, setShowPicker] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState('')
  const [label, setLabel] = useState('OFERTA')
  const [badgeColor, setBadgeColor] = useState('#000000')
  const [discountPct, setDiscountPct] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async () => {
    if (!selectedProductId) return
    setSaving(true)
    await fetch('/api/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: selectedProductId,
        label: label || null,
        badgeColor,
        discountPct: discountPct ? parseInt(discountPct) : null,
        sortOrder: promotions.length,
      }),
    })
    setSaving(false)
    setShowPicker(false)
    setSelectedProductId('')
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta promoción?')) return
    await fetch(`/api/promotions/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  const handleToggle = async (promo: Promotion) => {
    await fetch(`/api/promotions/${promo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...promo, isActive: !promo.isActive }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Current promotions */}
      <div className="bg-white border border-gray-100">
        {promotions.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No hay promociones activas.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {promotions.map((promo) => (
              <div key={promo.id} className="flex items-center gap-4 px-4 py-3">
                {promo.product.images[0] && (
                  <div className="w-12 h-12 bg-gray-100 flex-shrink-0 overflow-hidden">
                    <Image src={promo.product.images[0].url} alt={promo.product.name} width={48} height={48} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{promo.product.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {promo.label && (
                      <span className="text-xs px-1.5 py-0.5 text-white" style={{ backgroundColor: promo.badgeColor ?? '#000' }}>
                        {promo.label}
                      </span>
                    )}
                    {promo.discountPct && (
                      <span className="text-xs text-red-600">-{promo.discountPct}%</span>
                    )}
                    <span className="text-xs text-gray-400">{formatPrice(promo.product.price)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(promo)}
                    className={`text-xs px-2 py-1 border ${promo.isActive ? 'border-green-200 text-green-600' : 'border-gray-200 text-gray-400'}`}
                  >
                    {promo.isActive ? 'Activa' : 'Inactiva'}
                  </button>
                  <button onClick={() => handleDelete(promo.id)} className="p-1 text-gray-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button onClick={() => setShowPicker(!showPicker)} variant="outline" size="sm">
        <Plus size={14} /> Añadir promoción
      </Button>

      {/* Product picker */}
      {showPicker && (
        <div className="bg-white border border-gray-100 p-6 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-gray-500">Configurar promoción</h3>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto…"
            className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
          />
          <div className="max-h-48 overflow-y-auto border border-gray-100 divide-y divide-gray-50">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProductId(p.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${selectedProductId === p.id ? 'bg-gray-100' : ''}`}
              >
                {p.images[0] && (
                  <Image src={p.images[0].url} alt={p.name} width={32} height={32} className="w-8 h-8 object-cover bg-gray-100" />
                )}
                <span className="text-sm flex-1 truncate">{p.name}</span>
                <span className="text-xs text-gray-400">{formatPrice(p.price)}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Etiqueta" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="OFERTA" />
            <Input label="% Descuento" type="number" min="1" max="99" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} placeholder="Ej: 20" />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wider text-gray-600">Color badge</label>
              <input type="color" value={badgeColor} onChange={(e) => setBadgeColor(e.target.value)} className="w-full h-10 border border-gray-200 cursor-pointer" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} loading={saving} size="sm" disabled={!selectedProductId}>
              Añadir
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowPicker(false)}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  )
}

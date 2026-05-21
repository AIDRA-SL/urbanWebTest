'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface DiscountCode {
  id: string
  code: string
  description: string | null
  discountPct: number
  isActive: boolean
  expiresAt: string | null
  maxUsages: number | null
  usageCount: number
  createdAt: string
}

const emptyForm = { code: '', description: '', discountPct: '', expiresAt: '', maxUsages: '' }

export function DiscountCodesClient() {
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/discount-codes')
      const data = await res.json()
      setCodes(data.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const set = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/admin/discount-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          description: form.description || null,
          discountPct: Number(form.discountPct),
          expiresAt: form.expiresAt || null,
          maxUsages: form.maxUsages ? Number(form.maxUsages) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al crear'); return }
      setShowForm(false)
      setForm(emptyForm)
      await load()
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/discount-codes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    setCodes((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !isActive } : c))
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/discount-codes/${id}`, { method: 'DELETE' })
    setCodes((prev) => prev.filter((c) => c.id !== id))
    setDeleteId(null)
  }

  const formatExpiry = (date: string | null) => {
    if (!date) return 'Sin límite'
    return new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Códigos de descuento</h1>
          <p className="text-sm text-gray-500 mt-1">Crea y gestiona los códigos que pueden usar tus clientes al comprar.</p>
        </div>
        <Button onClick={() => { setShowForm(true); setError('') }} className="flex items-center gap-2">
          <Plus size={16} />
          Nuevo código
        </Button>
      </div>

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-lg">Nuevo código de descuento</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <Input
                  label="Código *"
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="VERANO25"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">El cliente lo escribe en el carrito tal cual.</p>
              </div>
              <Input
                label="Descripción (interna, opcional)"
                value={form.description}
                onChange={set('description')}
                placeholder="Campaña verano 2026"
              />
              <Input
                label="Descuento (%) *"
                type="number"
                min={1}
                max={100}
                value={form.discountPct}
                onChange={set('discountPct')}
                placeholder="10"
                required
              />
              <Input
                label="Válido hasta (dejar vacío = sin límite)"
                type="date"
                value={form.expiresAt}
                onChange={set('expiresAt')}
              />
              <div>
                <Input
                  label="Máximo de usos (dejar vacío = ilimitado)"
                  type="number"
                  min={1}
                  value={form.maxUsages}
                  onChange={set('maxUsages')}
                  placeholder="100"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-3 mt-2">
                <Button type="submit" loading={saving} className="flex-1">Crear código</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
            <h2 className="font-semibold mb-2">¿Eliminar este código?</h2>
            <p className="text-sm text-gray-500 mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => handleDelete(deleteId)} className="bg-red-600 hover:bg-red-700">Eliminar</Button>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-sm text-gray-400 py-12 text-center">Cargando...</div>
      ) : codes.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-lg py-16 text-center">
          <p className="text-sm text-gray-400 mb-3">No hay códigos de descuento aún.</p>
          <Button variant="outline" onClick={() => setShowForm(true)}>Crear el primero</Button>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Código</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Dto.</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-gray-500 hidden md:table-cell">Usos</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-gray-500 hidden lg:table-cell">Expiración</th>
                <th className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wider text-gray-500">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {codes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-mono font-semibold tracking-wider">{c.code}</span>
                      {c.description && (
                        <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-green-600">{c.discountPct}%</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                    {c.usageCount}{c.maxUsages ? ` / ${c.maxUsages}` : ''}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                    {formatExpiry(c.expiresAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(c.id, c.isActive)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${c.isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {c.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      {c.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleteId(c.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

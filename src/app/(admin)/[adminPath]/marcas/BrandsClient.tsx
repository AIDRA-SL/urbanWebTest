'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ImageCropModal } from '@/components/ui/ImageCropModal'
import { Trash2, Plus, Upload, Eye, EyeOff } from 'lucide-react'

// 3:1 landscape ratio matches the brand logo display container (w-28 h-10)
const BRAND_LOGO_ASPECT = 3 / 1

interface Brand {
  id: string
  name: string
  logoUrl: string
  sortOrder: number
  isActive: boolean
}

interface Props {
  brands: Brand[]
}

export function BrandsClient({ brands }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropFile, setCropFile] = useState<File | null>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files?.[0]) return
    const file = files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setCropFile(file)
        setCropSrc(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const uploadBlob = async (blob: Blob) => {
    setUploading(true)
    const fd = new FormData()
    const filename = blob instanceof File ? blob.name : 'logo.png'
    fd.append('file', blob, filename)
    fd.append('subfolder', 'brands')
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) setLogoUrl(data.url)
    setUploading(false)
    setCropSrc(null)
    setCropFile(null)
  }

  const handleCreate = async () => {
    if (!name.trim() || !logoUrl) return
    setSaving(true)
    await fetch('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), logoUrl, sortOrder: brands.length }),
    })
    setSaving(false)
    setShowForm(false)
    setName('')
    setLogoUrl('')
    router.refresh()
  }

  const handleToggle = async (brand: Brand) => {
    await fetch(`/api/brands/${brand.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !brand.isActive }),
    })
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta marca?')) return
    await fetch(`/api/brands/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  const handleSortOrder = async (brand: Brand, value: string) => {
    const sortOrder = parseInt(value, 10)
    if (isNaN(sortOrder)) return
    await fetch(`/api/brands/${brand.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sortOrder }),
    })
    router.refresh()
  }

  return (
    <>
      {cropSrc && cropFile && (
        <ImageCropModal
          imageSrc={cropSrc}
          originalFile={cropFile}
          onConfirm={uploadBlob}
          onSkip={uploadBlob}
          onCancel={() => { setCropSrc(null); setCropFile(null) }}
          aspect={BRAND_LOGO_ASPECT}
          mimeType="image/png"
        />
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className={`bg-white border p-4 flex flex-col gap-3 ${brand.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}
            >
              <div className="relative h-20 w-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                <Image
                  src={brand.logoUrl}
                  alt={brand.name}
                  fill
                  unoptimized
                  className="object-contain p-3"
                />
              </div>
              <p className="text-sm font-medium text-center truncate">{brand.name}</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={brand.sortOrder}
                  onBlur={(e) => handleSortOrder(brand, e.target.value)}
                  className="w-14 border border-gray-200 text-xs text-center px-1 py-1"
                  title="Orden"
                />
                <button
                  onClick={() => handleToggle(brand)}
                  className={`flex-1 flex items-center justify-center gap-1 text-xs py-1 border transition-colors ${brand.isActive ? 'border-green-200 text-green-600' : 'border-gray-200 text-gray-400'}`}
                >
                  {brand.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                  {brand.isActive ? 'Visible' : 'Oculta'}
                </button>
                <button onClick={() => handleDelete(brand.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => setShowForm(true)}
            className="border-2 border-dashed border-gray-200 h-40 flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
          >
            <Plus size={20} className="text-gray-400 mb-1" />
            <span className="text-xs text-gray-400">Nueva marca</span>
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-gray-100 p-6 space-y-4 max-w-sm">
            <h3 className="text-xs uppercase tracking-widest text-gray-500">Nueva marca</h3>

            {logoUrl ? (
              <div className="relative h-24 bg-gray-50 overflow-hidden flex items-center justify-center">
                <Image src={logoUrl} alt="Preview" fill unoptimized className="object-contain p-2" />
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  className="absolute top-1 right-1 text-xs text-gray-400 hover:text-red-500 underline"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <label className="h-24 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                {uploading ? (
                  <span className="text-xs text-gray-400">Subiendo…</span>
                ) : (
                  <>
                    <Upload size={18} className="text-gray-400 mb-1" />
                    <span className="text-xs text-gray-400">Subir logo (PNG/WebP transparente)</span>
                    <span className="text-xs text-gray-300 mt-0.5">Formato 3:1 · Se recortará automáticamente</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { handleFileSelect(e.target.files); e.target.value = '' }} />
              </label>
            )}

            <Input
              label="Nombre de la marca"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nike, Adidas, The North Face…"
            />

            <div className="flex gap-2">
              <Button onClick={handleCreate} loading={saving} size="sm" disabled={!logoUrl || !name.trim()}>
                Añadir marca
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setLogoUrl('') }}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

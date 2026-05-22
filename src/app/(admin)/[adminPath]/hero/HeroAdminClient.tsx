'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ImageCropModal } from '@/components/ui/ImageCropModal'
import { Trash2, Plus, Upload } from 'lucide-react'

const HERO_ASPECT = 16 / 9

interface Slide {
  id: string
  imageUrl: string
  headline: string | null
  subheadline: string | null
  ctaText: string | null
  ctaLink: string | null
  sortOrder: number
  isActive: boolean
}

interface Props {
  slides: Slide[]
}

export function HeroAdminClient({ slides }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [headline, setHeadline] = useState('')
  const [subheadline, setSubheadline] = useState('')
  const [ctaText, setCtaText] = useState('')
  const [ctaLink, setCtaLink] = useState('')
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
    const filename = blob instanceof File ? blob.name : 'hero.jpg'
    fd.append('file', blob, filename)
    fd.append('subfolder', 'hero')
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) setImageUrl(data.url)
    setUploading(false)
    setCropSrc(null)
    setCropFile(null)
  }

  const handleCreate = async () => {
    if (!imageUrl) return
    setSaving(true)
    await fetch('/api/hero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl, headline: headline || null, subheadline: subheadline || null,
        ctaText: ctaText || null, ctaLink: ctaLink || null, sortOrder: slides.length,
      }),
    })
    setSaving(false)
    setShowForm(false)
    setImageUrl('')
    setHeadline('')
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este slide?')) return
    await fetch('/api/hero', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    router.refresh()
  }

  const handleToggle = async (slide: Slide) => {
    await fetch('/api/hero', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...slide, isActive: !slide.isActive }),
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
        aspect={HERO_ASPECT}
        mimeType="image/jpeg"
      />
    )}
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {slides.map((slide) => (
          <div key={slide.id} className={`bg-white border ${slide.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'} overflow-hidden`}>
            <div className="relative aspect-[16/9] bg-gray-100">
              <Image src={slide.imageUrl} alt={slide.headline ?? 'Slide'} fill className="object-cover" />
              {!slide.isActive && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Oculto</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium truncate">{slide.headline ?? 'Sin título'}</p>
              {slide.ctaText && <p className="text-xs text-gray-400">{slide.ctaText} → {slide.ctaLink}</p>}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleToggle(slide)}
                  className={`text-xs px-2 py-1 border ${slide.isActive ? 'border-green-200 text-green-600' : 'border-gray-200 text-gray-400'}`}
                >
                  {slide.isActive ? 'Activo' : 'Oculto'}
                </button>
                <button onClick={() => handleDelete(slide.id)} className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => setShowForm(true)}
          className="border-2 border-dashed border-gray-200 aspect-[16/9] flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
        >
          <Plus size={20} className="text-gray-400 mb-1" />
          <span className="text-xs text-gray-400">Nuevo slide</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-100 p-6 space-y-4 max-w-xl">
          <h3 className="text-xs uppercase tracking-widest text-gray-500">Nuevo slide</h3>

          {imageUrl ? (
            <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
              <Image src={imageUrl} alt="Preview" fill className="object-cover" />
            </div>
          ) : (
            <label className="aspect-[16/9] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
              {uploading ? <span className="text-xs text-gray-400">Subiendo…</span> : (
                <>
                  <Upload size={20} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">Subir imagen (recomendado: 1920×1080px)</span>
                  <span className="text-xs text-gray-300 mt-0.5">Formato 16:9 · Se recortará automáticamente</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { handleFileSelect(e.target.files); e.target.value = '' }} />
            </label>
          )}

          <Input label="Titular (opcional)" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Nueva colección 2026" />
          <Input label="Subtítulo (opcional)" value={subheadline} onChange={(e) => setSubheadline(e.target.value)} placeholder="Descubre los últimos estilos" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Texto del botón" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Ver productos" />
            <Input label="Link del botón" value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} placeholder="/categoria/novedades" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} loading={saving} size="sm" disabled={!imageUrl}>Crear slide</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

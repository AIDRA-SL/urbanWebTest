'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ImageCropModal } from '@/components/ui/ImageCropModal'
import { X, Upload, Video } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
}

interface Brand {
  id: string
  name: string
}

interface ProductData {
  id?: string
  name?: string
  description?: string | null
  price?: number
  comparePrice?: number | null
  sku?: string | null
  isActive?: boolean
  isFeatured?: boolean
  brandId?: string | null
  categories?: { id: string; slug: string }[]
  images?: { id: string; url: string; isPrimary: boolean }[]
  videos?: { id?: string; url: string }[]
  variants?: { id?: string; size?: string | null; color?: string | null; stock?: number }[]
}

interface Props {
  categories: Category[]
  brands: Brand[]
  adminPath: string
  product?: ProductData
}

type SizeMode = 'ropa' | 'calzado' | 'unica' | 'sin-talla'

const CLOTHING_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL']
const SHOE_SIZES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47']

function parseInitialVariants(productVariants?: ProductData['variants']): { size: string | null; stock: number }[] {
  if (!productVariants?.length) return []
  if (productVariants.length === 1 && !productVariants[0].size) {
    return [{ size: null, stock: productVariants[0].stock ?? 0 }]
  }
  return productVariants.filter((v) => v.size).map((v) => ({ size: v.size!, stock: v.stock ?? 0 }))
}

function detectSizeMode(
  selectedCats: string[],
  categories: Category[],
  variants: { size: string | null; stock: number }[]
): SizeMode {
  if (variants.length === 1 && variants[0].size === 'Única') return 'unica'
  if (variants.length === 0 || (variants.length === 1 && variants[0].size === null)) return 'sin-talla'
  const slugs = categories.filter(c => selectedCats.includes(c.id)).map(c => c.slug)
  const isShoes = slugs.some(s => s.includes('zapati') || s.includes('calzado'))
  return isShoes ? 'calzado' : 'ropa'
}

export function ProductFormClient({ categories, brands, adminPath, product }: Props) {
  const router = useRouter()
  const isEdit = !!product?.id

  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [comparePrice, setComparePrice] = useState(product?.comparePrice?.toString() ?? '')
  const [sku, setSku] = useState(product?.sku ?? '')
  const [isActive, setIsActive] = useState(product?.isActive ?? true)
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false)
  const [selectedBrand, setSelectedBrand] = useState<string>(product?.brandId ?? '')
  const [selectedCats, setSelectedCats] = useState<string[]>(product?.categories?.map((c) => c.id) ?? [])
  const [images, setImages] = useState<{ url: string; isPrimary: boolean }[]>(product?.images ?? [])
  const [variants, setVariants] = useState<{ size: string | null; stock: number }[]>(
    parseInitialVariants(product?.variants)
  )
  const [videos, setVideos] = useState<{ url: string }[]>(product?.videos?.map((v) => ({ url: v.url })) ?? [])
  const [videoInput, setVideoInput] = useState('')
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Size mode: auto-detect on mount, then user can override
  const [sizeMode, setSizeMode] = useState<SizeMode>(() =>
    detectSizeMode(
      product?.categories?.map(c => c.id) ?? [],
      categories,
      parseInitialVariants(product?.variants)
    )
  )

  // Auto-adjust mode when categories change (only if user hasn't manually chosen calzado/ropa)
  useEffect(() => {
    if (sizeMode === 'unica' || sizeMode === 'sin-talla') return
    const slugs = categories.filter(c => selectedCats.includes(c.id)).map(c => c.slug)
    const isShoes = slugs.some(s => s.includes('zapati') || s.includes('calzado'))
    setSizeMode(isShoes ? 'calzado' : 'ropa')
  }, [selectedCats]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSizeModeChange = (mode: SizeMode) => {
    setSizeMode(mode)
    if (mode === 'unica') {
      setVariants([{ size: 'Única', stock: 10 }])
    } else if (mode === 'sin-talla') {
      setVariants([{ size: null, stock: 0 }])
    } else {
      // Reset variants that don't belong to the new mode
      const validSizes = mode === 'calzado' ? SHOE_SIZES : CLOTHING_SIZES
      setVariants(prev => prev.filter(v => v.size !== null && validSizes.includes(v.size)))
    }
  }

  // Crop queue state
  const [cropQueue, setCropQueue] = useState<File[]>([])
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [cropOriginalTotal, setCropOriginalTotal] = useState(0)

  // Converts any image File to a JPEG Blob via canvas (same as the crop path)
  const fileToJpegBlob = (file: File): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const img = new window.Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) { URL.revokeObjectURL(url); reject(new Error('no ctx')); return }
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(blob => {
          URL.revokeObjectURL(url)
          blob ? resolve(blob) : reject(new Error('toBlob failed'))
        }, 'image/jpeg', 0.92)
      }
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('load failed')) }
      img.src = url
    })

  const uploadBlob = useCallback(async (blob: Blob): Promise<boolean> => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', new File([blob], 'product.jpg', { type: blob.type || 'image/jpeg' }))
      fd.append('subfolder', 'products')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        setImages((prev) => [...prev, { url: data.url, isPrimary: prev.length === 0 }])
        return true
      }
      return false
    } catch {
      return false
    } finally {
      setUploading(false)
    }
  }, [])

  const handleDirectUpload = async (files: FileList | null) => {
    if (!files?.length) return
    for (const file of Array.from(files)) {
      const blob = await fileToJpegBlob(file)
      await uploadBlob(blob)
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files?.length) return
    const arr = Array.from(files)
    setCropQueue(arr)
    setCropOriginalTotal(arr.length)
    setCropSrc(URL.createObjectURL(arr[0]))
  }

  const handleCropConfirm = async (blob: Blob) => {
    await uploadBlob(blob)
    const remaining = cropQueue.slice(1)
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropQueue(remaining)
    setCropSrc(remaining.length > 0 ? URL.createObjectURL(remaining[0]) : null)
  }

  const handleCropSkip = async (file: File) => {
    try {
      const blob = await fileToJpegBlob(file)
      const ok = await uploadBlob(blob)
      if (!ok) {
        setError('No se pudo subir la imagen')
      }
    } catch {
      const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (ALLOWED.includes(file.type)) {
        await uploadBlob(file)
      } else {
        setError('No se pudo procesar la imagen')
      }
    } finally {
      const remaining = cropQueue.slice(1)
      if (cropSrc) URL.revokeObjectURL(cropSrc)
      setCropQueue(remaining)
      setCropSrc(remaining.length > 0 ? URL.createObjectURL(remaining[0]) : null)
    }
  }

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setCropQueue([])
  }

  const toggleVariantSize = (size: string) => {
    setVariants((prev) => {
      const existing = prev.find((v) => v.size === size)
      if (existing) return prev.filter((v) => v.size !== size)
      return [...prev, { size, stock: 10 }]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price) { setError('Nombre y precio son obligatorios'); return }
    setSaving(true)
    setError('')

    try {
      const body = {
        name,
        description: description || null,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        sku: sku || null,
        isActive,
        isFeatured,
        brandId: selectedBrand || null,
        videos,
        categoryIds: selectedCats,
        images,
        variants,
      }

      const res = await fetch(
        isEdit ? `/api/products/${product!.id}` : '/api/products',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      )

      if (!res.ok) throw new Error('Error al guardar')
      router.push(`/${adminPath}/productos`)
      router.refresh()
    } catch {
      setError('Error al guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  const availableSizes = sizeMode === 'calzado' ? SHOE_SIZES : CLOTHING_SIZES

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main fields */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white border border-gray-100 p-6 space-y-4">
          <Input label="Nombre del producto *" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-600">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors resize-none"
              placeholder="Descripción del producto…"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Precio (€) *" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <Input label="Precio anterior (€)" type="number" step="0.01" min="0" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} placeholder="Opcional" />
          </div>
          <Input label="SKU / Referencia" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Ej: UR-CAM-001" />
        </div>

        {/* Images */}
        <div className="bg-white border border-gray-100 p-6">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-1">Imágenes</h3>
          <p className="text-[11px] text-gray-400 mb-4">Cualquier formato aceptado · Fondo blanco recomendado · Mínimo 800 px de ancho</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
            {images.map((img, i) => (
              <div key={i} className="relative bg-white border border-gray-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-auto block" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                >
                  <X size={10} />
                </button>
                {img.isPrimary && (
                  <span className="absolute bottom-1 left-1 bg-black text-white text-[9px] px-1">Principal</span>
                )}
              </div>
            ))}
            <div
              className="min-h-[80px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => (document.getElementById('img-upload-direct') as HTMLInputElement)?.click()}
            >
              <Upload size={16} className="text-gray-400 mb-1 pointer-events-none" />
              <span className="text-xs text-gray-400 pointer-events-none">Subir</span>
              <input
                id="img-upload-direct"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onClick={(e) => { e.stopPropagation(); (e.target as HTMLInputElement).value = '' }}
                onChange={(e) => handleDirectUpload(e.target.files)}
              />
              <label
                className="text-[10px] text-gray-300 cursor-pointer hover:text-gray-400 mt-0.5 underline underline-offset-2"
                onClick={(e) => e.stopPropagation()}
              >
                con recorte
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
              </label>
            </div>
          </div>
          {uploading && <p className="text-xs text-gray-400">Subiendo imagen…</p>}
        </div>

        {/* Videos */}
        <div className="bg-white border border-gray-100 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Video size={14} className="text-gray-400" />
            <h3 className="text-xs uppercase tracking-widest text-gray-500">Vídeos del producto</h3>
          </div>
          <p className="text-[11px] text-gray-400">Acepta enlaces de YouTube (recomendado), Instagram Reels y TikTok.</p>

          <div>
            <label className={`inline-flex items-center gap-2 px-3 py-2 border border-gray-200 text-xs cursor-pointer hover:border-gray-400 transition-colors ${uploadingVideo ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload size={12} className="text-gray-500" />
              {uploadingVideo ? 'Subiendo…' : 'Subir MP4 / MOV'}
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                className="hidden"
                disabled={uploadingVideo}
                onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setUploadingVideo(true)
                  try {
                    const fd = new FormData()
                    fd.append('file', file)
                    fd.append('subfolder', 'videos')
                    const res = await fetch('/api/upload', { method: 'POST', body: fd })
                    const data = await res.json()
                    if (data.url) setVideos((prev) => [...prev, { url: data.url }])
                  } finally {
                    setUploadingVideo(false)
                  }
                }}
              />
            </label>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const url = videoInput.trim()
                  if (url && (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('tiktok.com') || url.includes('instagram.com'))) {
                    setVideos((prev) => [...prev, { url }])
                    setVideoInput('')
                  }
                }
              }}
              placeholder="https://www.youtube.com/watch?v=… (recomendado)"
              className="flex-1 border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
            />
            <button
              type="button"
              onClick={() => {
                const url = videoInput.trim()
                if (url && (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('tiktok.com') || url.includes('instagram.com'))) {
                  setVideos((prev) => [...prev, { url }])
                  setVideoInput('')
                }
              }}
              className="px-3 py-2 bg-black text-white text-xs hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              Añadir
            </button>
          </div>

          {videos.length > 0 && (
            <div className="flex flex-col gap-2">
              {videos.map((v, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-2">
                  {v.url.includes('blob.vercel-storage.com') && (
                    <span className="shrink-0 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 font-medium">MP4</span>
                  )}
                  {(v.url.includes('youtube.com') || v.url.includes('youtu.be')) && (
                    <span className="shrink-0 bg-red-600 text-white text-[9px] px-1.5 py-0.5 font-medium">YouTube</span>
                  )}
                  {v.url.includes('tiktok.com') && (
                    <span className="shrink-0 bg-black text-white text-[9px] px-1.5 py-0.5 font-medium">TikTok</span>
                  )}
                  {v.url.includes('instagram.com') && (
                    <span className="shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] px-1.5 py-0.5 font-medium">Instagram</span>
                  )}
                  <span className="text-xs text-gray-500 flex-1 truncate">{v.url}</span>
                  <button
                    type="button"
                    onClick={() => setVideos((prev) => prev.filter((_, j) => j !== i))}
                    className="shrink-0 text-gray-400 hover:text-black transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Variants / Sizes */}
        <div className="bg-white border border-gray-100 p-6">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Tallas y stock</h3>

          {/* Mode selector */}
          <div className="flex items-center gap-3 mb-5">
            <label className="text-xs text-gray-500 uppercase tracking-wider whitespace-nowrap">
              Tipo de prenda
            </label>
            <select
              value={sizeMode}
              onChange={(e) => handleSizeModeChange(e.target.value as SizeMode)}
              className="border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-black transition-colors"
            >
              <option value="ropa">Ropa (XXS – XXL)</option>
              <option value="calzado">Calzado (35 – 47)</option>
              <option value="unica">Talla única</option>
              <option value="sin-talla">Sin talla / Accesorio</option>
            </select>
          </div>

          {/* Size grid */}
          {(sizeMode === 'ropa' || sizeMode === 'calzado') && (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {availableSizes.map((size) => {
                  const v = variants.find((x) => x.size === size)
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleVariantSize(size)}
                      className={`px-3 py-1.5 text-xs border transition-colors ${
                        v ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
              {variants.length > 0 && (
                <div className="flex flex-col gap-2">
                  {variants.map((v) => (
                    <div key={v.size} className="flex items-center gap-3">
                      <span className="text-xs font-medium w-12">{v.size}</span>
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => setVariants((prev) =>
                          prev.map((x) => x.size === v.size ? { ...x, stock: parseInt(e.target.value) || 0 } : x)
                        )}
                        className="w-20 border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:border-black"
                      />
                      <span className="text-xs text-gray-400">unidades</span>
                    </div>
                  ))}
                </div>
              )}
              {variants.length === 0 && (
                <p className="text-xs text-gray-400">Selecciona las tallas disponibles arriba.</p>
              )}
            </>
          )}

          {sizeMode === 'unica' && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium w-16 text-gray-700">Talla única</span>
              <input
                type="number"
                min="0"
                value={variants[0]?.stock ?? 10}
                onChange={(e) => setVariants([{ size: 'Única', stock: parseInt(e.target.value) || 0 }])}
                className="w-20 border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:border-black"
              />
              <span className="text-xs text-gray-400">unidades</span>
            </div>
          )}

          {sizeMode === 'sin-talla' && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 mb-3">El producto no tiene talla (accesorios, complementos…)</p>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium w-16 text-gray-700">Stock</span>
                <input
                  type="number"
                  min="0"
                  value={variants[0]?.stock ?? 0}
                  onChange={(e) => setVariants([{ size: null, stock: parseInt(e.target.value) || 0 }])}
                  className="w-20 border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:border-black"
                />
                <span className="text-xs text-gray-400">unidades</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 p-6 space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-gray-500">Estado</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm">Producto activo (visible en tienda)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm">Destacado en homepage</span>
          </label>
        </div>

        <div className="bg-white border border-gray-100 p-6">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Marca</h3>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors"
          >
            <option value="">Sin marca</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-white border border-gray-100 p-6">
          <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Categorías</h3>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCats.includes(cat.id)}
                  onChange={(e) => setSelectedCats((prev) =>
                    e.target.checked ? [...prev, cat.id] : prev.filter((id) => id !== cat.id)
                  )}
                  className="w-3.5 h-3.5"
                />
                <span className={`text-sm ${cat.parentId ? 'pl-3 text-gray-500 text-xs' : ''}`}>{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" loading={saving} className="w-full">
          {isEdit ? 'Guardar cambios' : 'Crear producto'}
        </Button>
        <button type="button" onClick={() => router.back()} className="w-full text-xs text-gray-400 hover:text-black text-center py-2">
          Cancelar
        </button>
      </div>

      {cropSrc && cropQueue.length > 0 && (
        <ImageCropModal
          imageSrc={cropSrc}
          originalFile={cropQueue[0]}
          onConfirm={handleCropConfirm}
          onSkip={handleCropSkip}
          onCancel={handleCropCancel}
          imageIndex={cropOriginalTotal - cropQueue.length}
          imageTotal={cropOriginalTotal}
        />
      )}
    </form>
  )
}

'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { X } from 'lucide-react'

const DEFAULT_ASPECT = 3 / 4

interface Props {
  imageSrc: string
  originalFile: File
  onConfirm: (blob: Blob) => void
  onSkip?: (file: File) => void
  onCancel: () => void
  imageIndex?: number
  imageTotal?: number
  aspect?: number
  mimeType?: string
}


export function ImageCropModal({
  imageSrc,
  originalFile,
  onConfirm,
  onSkip,
  onCancel,
  imageIndex,
  imageTotal,
  aspect,
  mimeType = 'image/jpeg',
}: Props) {
  const resolvedAspect = aspect ?? DEFAULT_ASPECT
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, resolvedAspect, w, h), w, h))
  }, [resolvedAspect])

  const handleConfirm = () => {
    const img = imgRef.current
    if (!img || !completedCrop) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scaleX = img.naturalWidth / img.width
    const scaleY = img.naturalHeight / img.height

    canvas.width = Math.floor(completedCrop.width * scaleX)
    canvas.height = Math.floor(completedCrop.height * scaleY)

    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    )

    canvas.toBlob((blob) => {
      if (blob) onConfirm(blob)
    }, mimeType, mimeType === 'image/png' ? undefined : 0.92)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="bg-white w-full max-w-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-widest">Recortar imagen</h2>
            {imageIndex !== undefined && imageTotal !== undefined && imageTotal > 1 && (
              <p className="text-xs text-gray-400 mt-0.5">
                {imageIndex + 1} de {imageTotal}
              </p>
            )}
          </div>
          <button type="button" onClick={onCancel} className="text-gray-400 hover:text-black">
            <X size={18} />
          </button>
        </div>

        {/* Crop area */}
        <div
          className="flex justify-center items-center bg-gray-50 overflow-auto p-4"
          style={{ maxHeight: '60vh' }}
        >
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={resolvedAspect}
            minWidth={20}
            minHeight={20}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageSrc}
              onLoad={onImageLoad}
              alt="Recortar"
              style={{ maxHeight: '55vh', maxWidth: '100%', objectFit: 'contain' }}
            />
          </ReactCrop>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          {onSkip ? (
            <button
              type="button"
              onClick={() => onSkip(originalFile)}
              className="text-xs text-gray-400 hover:text-black underline underline-offset-2 transition-colors"
            >
              Usar sin recortar
            </button>
          ) : <span />}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm border border-gray-200 hover:border-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!completedCrop?.width || !completedCrop?.height}
              className="px-4 py-2 text-sm bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-40"
            >
              Confirmar recorte
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

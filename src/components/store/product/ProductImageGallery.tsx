'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Play, X } from 'lucide-react'

interface ProductImage {
  id: string
  url: string
  altText: string | null
  isPrimary: boolean
}

interface ProductVideo {
  id: string
  url: string
}

interface Props {
  images: ProductImage[]
  videos?: ProductVideo[]
  productName: string
}

type MediaItem =
  | { kind: 'image'; data: ProductImage }
  | { kind: 'video'; data: ProductVideo }

function parsePlatform(url: string): 'tiktok' | 'instagram' | 'youtube' | null {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('instagram.com')) return 'instagram'
  return null
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /shorts\/([A-Za-z0-9_-]{11})/,
    /embed\/([A-Za-z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

function getEmbedUrl(url: string): string | null {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const id = getYouTubeId(url)
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null
  }
  if (url.includes('tiktok.com')) {
    const match = url.match(/video\/(\d+)/)
    return match ? `https://www.tiktok.com/embed/v2/${match[1]}` : null
  }
  if (url.includes('instagram.com')) {
    const match = url.match(/\/(reel|p)\/([A-Za-z0-9_-]+)/)
    return match ? `https://www.instagram.com/${match[1]}/${match[2]}/embed/` : null
  }
  return null
}

function getModalAspectRatio(url: string): string {
  if ((url.includes('youtube.com') || url.includes('youtu.be')) && !url.includes('shorts')) return '16/9'
  return '9/16'
}

export function ProductImageGallery({ images, videos = [], productName }: Props) {
  const mediaItems: MediaItem[] = [
    ...images.map((img) => ({ kind: 'image' as const, data: img })),
    ...videos.map((vid) => ({ kind: 'video' as const, data: vid })),
  ]

  const primaryIdx = images.findIndex((i) => i.isPrimary)
  const [activeIndex, setActiveIndex] = useState(primaryIdx >= 0 ? primaryIdx : 0)
  const [modalUrl, setModalUrl] = useState<string | null>(null)

  const hasMultiple = mediaItems.length > 1
  const activeItem = mediaItems[activeIndex]
  const activeImage = activeItem?.kind === 'image' ? activeItem.data : null

  // Close modal on ESC
  useEffect(() => {
    if (!modalUrl) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalUrl(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalUrl])

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = modalUrl ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalUrl])

  function prev() {
    setActiveIndex((i) => (i - 1 + mediaItems.length) % mediaItems.length)
  }
  function next() {
    setActiveIndex((i) => (i + 1) % mediaItems.length)
  }

  if (mediaItems.length === 0) {
    return (
      <div className="w-full aspect-[3/4] bg-gray-100 flex items-center justify-center">
        <span className="text-xs text-gray-400">Sin imagen</span>
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-3 w-full">
        {/* Thumbnails column */}
        <div className="w-14 shrink-0">
          {hasMultiple && (
            <div className="flex flex-col gap-2">
              {mediaItems.map((item, idx) => (
                <button
                  key={item.data.id}
                  onClick={() => {
                    if (item.kind === 'video') {
                      setModalUrl(item.data.url)
                    } else {
                      setActiveIndex(idx)
                    }
                  }}
                  className={`aspect-square overflow-hidden transition-all duration-200 ring-offset-0 ${
                    item.kind === 'image' && idx === activeIndex
                      ? 'ring-1 ring-black'
                      : 'ring-1 ring-transparent hover:ring-gray-300'
                  }`}
                >
                  {item.kind === 'image' ? (
                    <div className="w-full h-full bg-gray-100">
                      <Image
                        src={item.data.url}
                        alt={item.data.altText ?? productName}
                        width={56}
                        height={56}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center gap-0.5">
                      <Play size={14} className="text-white fill-white" />
                      <span className="text-[7px] text-white/60 font-bold tracking-wide leading-none">
                        {parsePlatform(item.data.url) === 'tiktok' ? 'TikTok' : parsePlatform(item.data.url) === 'youtube' ? 'YouTube' : 'IG Reel'}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main image area — only images, videos open modal */}
        <div className="relative flex-1 aspect-[3/4] bg-gray-100 overflow-hidden group">
          {activeImage ? (
            <Image
              src={activeImage.url}
              alt={activeImage.altText ?? productName}
              fill
              className="object-contain animate-fade-in"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
              priority={activeIndex === 0}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-gray-400">Sin imagen</span>
            </div>
          )}

          {/* Nav arrows */}
          {hasMultiple && images.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Imagen anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={next}
                aria-label="Imagen siguiente"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Video modal */}
      {modalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setModalUrl(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setModalUrl(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} className="text-white" />
          </button>

          {/* iframe container — stops click propagation so clicking iframe doesn't close modal */}
          <div
            className="relative w-full mx-4"
            style={{ aspectRatio: getModalAspectRatio(modalUrl), maxHeight: '90vh', maxWidth: getModalAspectRatio(modalUrl) === '16/9' ? '900px' : '384px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {getEmbedUrl(modalUrl) && (
              <iframe
                key={modalUrl}
                src={getEmbedUrl(modalUrl)!}
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                className="absolute inset-0 w-full h-full border-0 rounded-xl"
                title="Vídeo del producto"
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

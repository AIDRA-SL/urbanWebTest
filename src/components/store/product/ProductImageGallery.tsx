'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Play, Pause, Volume1, Volume2, VolumeX } from 'lucide-react'

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

function parsePlatform(url: string): 'tiktok' | 'instagram' | null {
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('instagram.com')) return 'instagram'
  return null
}

function getEmbedUrl(url: string): string | null {
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

export function ProductImageGallery({ images, videos = [], productName }: Props) {
  const mediaItems: MediaItem[] = [
    ...images.map((img) => ({ kind: 'image' as const, data: img })),
    ...videos.map((vid) => ({ kind: 'video' as const, data: vid })),
  ]

  const primaryIdx = images.findIndex((i) => i.isPrimary)
  const [activeIndex, setActiveIndex] = useState(primaryIdx >= 0 ? primaryIdx : 0)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(8)

  const hasMultiple = mediaItems.length > 1
  const activeItem = mediaItems[activeIndex]

  const handleSetActive = (idx: number) => {
    setActiveIndex(idx)
    setIsPlaying(true)
    setIsMuted(false)
    setVolume(8)
  }

  const prev = () => handleSetActive((activeIndex - 1 + mediaItems.length) % mediaItems.length)
  const next = () => handleSetActive((activeIndex + 1) % mediaItems.length)

  const postMsg = (data: Record<string, unknown>) => {
    try {
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify(data), '*')
    } catch {}
  }

  const togglePlay = () => { postMsg({ method: isPlaying ? 'pause' : 'play' }); setIsPlaying((v) => !v) }
  const toggleMute = () => { postMsg({ method: isMuted ? 'unmute' : 'mute' }); setIsMuted((v) => !v) }

  const volumeUp = () => {
    const next = Math.min(10, volume + 1)
    setVolume(next)
    if (next > 0) setIsMuted(false)
    postMsg({ method: 'setVolume', value: next / 10 })
  }

  const volumeDown = () => {
    const next = Math.max(0, volume - 1)
    setVolume(next)
    if (next === 0) setIsMuted(true)
    postMsg({ method: 'setVolume', value: next / 10 })
  }

  if (!activeItem) {
    return (
      <div className="w-full aspect-[3/4] bg-gray-100 flex items-center justify-center">
        <span className="text-xs text-gray-400">Sin imagen</span>
      </div>
    )
  }

  const isVideoActive = activeItem.kind === 'video'
  const embedUrl = isVideoActive ? getEmbedUrl(activeItem.data.url) : null

  return (
    <div className="flex gap-3 w-full">
      {/* Thumbnails column */}
      <div className="w-14 shrink-0">
        {hasMultiple && (
          <div className="flex flex-col gap-2">
            {mediaItems.map((item, idx) => (
              <button
                key={item.data.id}
                onClick={() => handleSetActive(idx)}
                className={`aspect-square overflow-hidden transition-all duration-200 ring-offset-0 ${
                  idx === activeIndex
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
                      {parsePlatform(item.data.url) === 'tiktok' ? 'TikTok' : 'IG Reel'}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main media area */}
      <div className="relative flex-1 aspect-[3/4] overflow-hidden group">
        {isVideoActive && embedUrl ? (
          /* VIDEO — iframe + controls bar, no overlay on iframe */
          <div className="absolute inset-0 bg-black flex flex-col">
            {/* iframe fills all available space */}
            <div className="flex-1 min-h-0 relative">
              <iframe
                key={activeItem.data.url}
                ref={iframeRef}
                src={embedUrl}
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                className="absolute inset-0 w-full h-full border-0"
                title="Vídeo del producto"
              />
            </div>

            {/* Controls bar — outside iframe so clicks register */}
            <div className="shrink-0 bg-black flex items-center justify-between px-3 py-2 gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>

              <div className="flex items-center gap-1 flex-1 justify-center">
                <button
                  type="button"
                  onClick={volumeDown}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors text-white"
                  aria-label="Bajar volumen"
                >
                  <Volume1 size={13} />
                </button>

                {/* Volume bars */}
                <div className="flex items-end gap-0.5 h-3.5 px-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      style={{ height: `${((i + 1) / 6) * 100}%` }}
                      className={`w-1 rounded-sm transition-colors ${
                        isMuted || i >= Math.ceil(volume * 6 / 10)
                          ? 'bg-white/25'
                          : 'bg-white'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={volumeUp}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors text-white"
                  aria-label="Subir volumen"
                >
                  <Volume2 size={13} />
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
                  aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                >
                  {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              </div>

              <span className="text-[9px] text-white/50 font-medium shrink-0">
                {parsePlatform(activeItem.data.url) === 'tiktok' ? 'TikTok' : 'Instagram'}
              </span>
            </div>
          </div>
        ) : (
          /* IMAGE */
          <>
            <div className="absolute inset-0 bg-gray-100">
              {activeItem.kind === 'image' && (
                <Image
                  src={activeItem.data.url}
                  alt={activeItem.data.altText ?? productName}
                  fill
                  className="object-contain animate-fade-in"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                  priority={activeIndex === 0}
                />
              )}
            </div>

            {/* Nav arrows — only usable over images (not over iframe) */}
            {hasMultiple && (
              <>
                <button
                  onClick={prev}
                  aria-label="Anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={next}
                  aria-label="Siguiente"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

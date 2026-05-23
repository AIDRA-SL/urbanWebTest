'use client'

import { useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Volume1, ExternalLink } from 'lucide-react'

type Platform = 'tiktok' | 'instagram' | null

function parsePlatform(url: string): Platform {
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('instagram.com')) return 'instagram'
  return null
}

function getEmbedUrl(url: string, platform: Platform): string | null {
  if (platform === 'tiktok') {
    const match = url.match(/video\/(\d+)/)
    if (match) return `https://www.tiktok.com/embed/v2/${match[1]}`
    return null
  }
  if (platform === 'instagram') {
    const match = url.match(/\/(reel|p)\/([A-Za-z0-9_-]+)/)
    if (match) return `https://www.instagram.com/${match[1]}/${match[2]}/embed/`
    return null
  }
  return null
}

export function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  const platform = parsePlatform(videoUrl)
  const embedUrl = getEmbedUrl(videoUrl, platform)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(8)

  if (!embedUrl || !platform) return null

  const postMsg = (data: Record<string, unknown>) => {
    try {
      const origin = platform === 'tiktok' ? 'https://www.tiktok.com' : 'https://www.instagram.com'
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify(data), origin)
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify(data), '*')
    } catch {}
  }

  const togglePlay = () => {
    postMsg({ method: isPlaying ? 'pause' : 'play' })
    setIsPlaying((v) => !v)
  }

  const toggleMute = () => {
    postMsg({ method: isMuted ? 'unmute' : 'mute' })
    setIsMuted((v) => !v)
  }

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

  const platformLabel = platform === 'tiktok' ? 'TikTok' : 'Instagram'

  return (
    <div className="w-full">
      <div className="relative w-full max-w-[360px] mx-auto">
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-black shadow-lg">
          <iframe
            ref={iframeRef}
            src={embedUrl}
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            className="absolute inset-0 w-full h-full border-0"
            title={`Vídeo de ${platformLabel}`}
          />
        </div>

        {/* Controls bar */}
        <div className="flex items-center justify-between mt-2 bg-black text-white px-3 py-2 rounded-xl">
          {/* Play / Pause */}
          <button
            type="button"
            onClick={togglePlay}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Volume controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={volumeDown}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Bajar volumen"
            >
              <Volume1 size={16} />
            </button>

            {/* Volume bar */}
            <div className="flex items-end gap-0.5 h-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  style={{ height: `${((i + 1) / 8) * 100}%` }}
                  className={`w-1 rounded-sm transition-colors ${
                    isMuted || i >= volume
                      ? 'bg-white/25'
                      : 'bg-white'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={volumeUp}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Subir volumen"
            >
              <Volume2 size={16} />
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>

          {/* External link */}
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            aria-label={`Ver en ${platformLabel}`}
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Slide {
  id: string
  imageUrl: string
  headline: string | null
  subheadline: string | null
  ctaText: string | null
  ctaLink: string | null
}

interface Props {
  slides: Slide[]
}

export function HeroCarousel({ slides }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  // Autoplay
  useEffect(() => {
    if (!emblaApi || slides.length <= 1) return
    const interval = setInterval(() => emblaApi.scrollNext(), 5000)
    return () => clearInterval(interval)
  }, [emblaApi, slides.length])

  if (slides.length === 0) {
    return (
      <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-gray-100 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-xs tracking-widest uppercase text-gray-400 mb-3">UrbanStore — Oviedo</p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">Nueva colección</h1>
          <Link
            href="/categoria/novedades"
            className="inline-block bg-black text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-gray-900 transition-colors"
          >
            Ver productos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {slides.map((slide, i) => (
          <div key={slide.id} className="flex-none w-full">
            <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-gray-100">
              <Image
                src={slide.imageUrl}
                alt={slide.headline ?? 'UrbanStore'}
                fill
                className="object-cover"
                priority={i === 0}
              />
              {(slide.headline || slide.ctaText) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white px-4">
                    {slide.headline && (
                      <h1
                        className="text-3xl sm:text-6xl font-bold tracking-tight drop-shadow-lg mb-3"
                        style={{ textShadow: '0 2px 16px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.7)' }}
                      >
                        {slide.headline}
                      </h1>
                    )}
                    {slide.subheadline && (
                      <p
                        className="text-sm sm:text-lg mb-6 drop-shadow opacity-90"
                        style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}
                      >
                        {slide.subheadline}
                      </p>
                    )}
                    {slide.ctaText && slide.ctaLink && (
                      <Link
                        href={slide.ctaLink}
                        className="inline-block bg-white text-black px-8 py-3 text-xs tracking-widest uppercase hover:bg-gray-100 transition-colors"
                      >
                        {slide.ctaText}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 hover:bg-white transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 hover:bg-white transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </>
      )}
    </div>
  )
}

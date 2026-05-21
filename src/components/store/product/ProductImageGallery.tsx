'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductImage {
  id: string
  url: string
  altText: string | null
  isPrimary: boolean
}

interface Props {
  images: ProductImage[]
  productName: string
}

export function ProductImageGallery({ images, productName }: Props) {
  const primaryIndex = images.findIndex((i) => i.isPrimary)
  const [activeIndex, setActiveIndex] = useState(primaryIndex >= 0 ? primaryIndex : 0)

  const hasMultiple = images.length > 1

  function prev() {
    setActiveIndex((i) => (i - 1 + images.length) % images.length)
  }

  function next() {
    setActiveIndex((i) => (i + 1) % images.length)
  }

  const activeImage = images[activeIndex]

  if (!activeImage) {
    return (
      <div className="w-full aspect-[3/4] bg-gray-100 flex items-center justify-center">
        <span className="text-xs text-gray-400">Sin imagen</span>
      </div>
    )
  }

  return (
    <div className="flex gap-3 w-full">
      {/* Thumbnails — always reserve this column so main image width stays consistent */}
      <div className="w-14 shrink-0">
        {hasMultiple && (
          <div className="flex flex-col gap-2">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(idx)}
                className={`aspect-square bg-gray-100 overflow-hidden transition-all duration-300 ring-offset-0 ${
                  idx === activeIndex
                    ? 'ring-1 ring-black'
                    : 'ring-1 ring-transparent hover:ring-gray-300'
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.altText ?? productName}
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main image */}
      <div className="relative flex-1 aspect-[3/4] bg-gray-100 overflow-hidden group">
        <Image
          src={activeImage.url}
          alt={activeImage.altText ?? productName}
          fill
          className="object-contain animate-fade-in"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
          priority={activeIndex === 0}
        />

        {/* Navigation arrows */}
        {hasMultiple && (
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
  )
}

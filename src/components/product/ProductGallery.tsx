'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { ProductImage } from '@/data/productDetail'

export default function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollThumbs = (dir: number) => {
    trackRef.current?.scrollBy({ left: dir * 100, behavior: 'smooth' })
  }

  const openLightbox = (i: number) => {
    setLightboxIndex(i)
    setLightboxOpen(true)
  }

  const showPrev = () => setLightboxIndex((i) => (i - 1 + images.length) % images.length)
  const showNext = () => setLightboxIndex((i) => (i + 1) % images.length)

  useEffect(() => {
    if (!lightboxOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft') showPrev()
      if (e.key === 'ArrowRight') showNext()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [lightboxOpen, images.length])

  return (
    <div className="p-4">
      <div
        onClick={() => openLightbox(active)}
        className="relative rounded-[35px] h-[320px] md:h-[400px] flex items-center justify-center bg-[#f5f5f7] border border-gray-100 overflow-hidden cursor-zoom-in"
      >
        <Image
          src={images[active].large}
          alt={name}
          width={500}
          height={500}
          className="max-w-full max-h-full object-contain p-2.5"
          priority
        />
      </div>

      <div className="flex items-center gap-1.5 mt-3">
        <button
          type="button"
          onClick={() => scrollThumbs(-1)}
          aria-label="Previous thumbnail"
          className="w-[38px] h-[38px] shrink-0 rounded-full bg-[#f5f5f7] flex items-center justify-center cursor-pointer"
        >
          <Image src="/images/promo-banner/left-arrow.svg" alt="" width={9} height={16} className="w-[9px] h-4" />
        </button>

        <div ref={trackRef} className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setActive(i)
                openLightbox(i)
              }}
              className={`w-16 h-16 shrink-0 rounded-lg border bg-[#fafbfe] flex items-center justify-center overflow-hidden transition-colors cursor-pointer ${
                i === active ? 'border-[#d92128]' : 'border-gray-200 hover:border-[#d92128]'
              }`}
            >
              <Image src={img.thumb} alt={name} width={64} height={64} className="w-full h-full object-contain p-1" />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollThumbs(1)}
          aria-label="Next thumbnail"
          className="w-[38px] h-[38px] shrink-0 rounded-full bg-[#f5f5f7] flex items-center justify-center cursor-pointer"
        >
          <Image src="/images/promo-banner/right-arrow.svg" alt="" width={9} height={16} className="w-[9px] h-4" />
        </button>
      </div>

      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[9999] bg-[#0d1828]/80 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-white rounded-lg shadow-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[#d32f2f] hover:bg-[#d32f2f] hover:text-white transition-colors cursor-pointer"
            >
              <span className="mi text-xl">close</span>
            </button>

            <div className="relative aspect-square flex items-center justify-center bg-white">
              <Image
                src={images[lightboxIndex].large}
                alt={name}
                width={700}
                height={700}
                className="max-w-full max-h-full object-contain p-4"
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrev}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#d32f2f] text-white flex items-center justify-center hover:bg-[#0d1828] transition-colors cursor-pointer"
                  >
                    <span className="mi text-2xl">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#d32f2f] text-white flex items-center justify-center hover:bg-[#0d1828] transition-colors cursor-pointer"
                  >
                    <span className="mi text-2xl">chevron_right</span>
                  </button>
                </>
              )}
            </div>

            <div className="bg-[#0d1828] text-white text-[13px] px-4 py-3 flex items-center justify-between gap-3">
              <span className="truncate">{name}</span>
              <span className="shrink-0 text-[#f3f4f6]">
                {lightboxIndex + 1} of {images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { ProductImage } from '@/data/productDetail'

const ZOOM_SCALE = 2

export default function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  const [supportsHover, setSupportsHover] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  // Touch devices don't get real hover, so they keep tap-to-zoom instead.
  useEffect(() => {
    setSupportsHover(window.matchMedia('(hover: hover)').matches)
  }, [])

  const scrollThumbs = (dir: number) => {
    trackRef.current?.scrollBy({ left: dir * 100, behavior: 'smooth' })
  }

  // Switching thumbnails always starts the new image un-zoomed.
  useEffect(() => {
    setZoomed(false)
    setOrigin('50% 50%')
  }, [active])

  // Point the zoom at wherever the pointer/finger is, so the whole image stays reachable.
  const setOriginFromPoint = (clientX: number, clientY: number) => {
    const rect = boxRef.current?.getBoundingClientRect()
    if (!rect) return
    const clamp = (v: number) => Math.min(100, Math.max(0, v))
    setOrigin(`${clamp(((clientX - rect.left) / rect.width) * 100)}% ${clamp(((clientY - rect.top) / rect.height) * 100)}%`)
  }

  // React registers touchmove passively, so panning has to be bound natively to be able to
  // preventDefault — otherwise dragging inside a zoomed image scrolls the page instead.
  useEffect(() => {
    const el = boxRef.current
    if (!el || !zoomed) return
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!touch) return
      e.preventDefault()
      setOriginFromPoint(touch.clientX, touch.clientY)
    }
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => el.removeEventListener('touchmove', onTouchMove)
  }, [zoomed])

  return (
    <div className="p-4">
      <div
        ref={boxRef}
        onClick={() => {
          if (!supportsHover) setZoomed((v) => !v)
        }}
        onMouseEnter={(e) => {
          if (supportsHover) {
            setZoomed(true)
            setOriginFromPoint(e.clientX, e.clientY)
          }
        }}
        onMouseMove={(e) => {
          if (zoomed) setOriginFromPoint(e.clientX, e.clientY)
        }}
        onMouseLeave={() => {
          setZoomed(false)
          setOrigin('50% 50%')
        }}
        onTouchStart={(e) => {
          const touch = e.touches[0]
          if (touch) setOriginFromPoint(touch.clientX, touch.clientY)
        }}
        className={`relative rounded-[35px] h-[320px] md:h-[400px] flex items-center justify-center bg-[#f5f5f7] border border-gray-100 overflow-hidden select-none ${
          zoomed ? 'touch-none' : ''
        } ${supportsHover ? 'cursor-zoom-in' : zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
      >
        <Image
          src={images[active].large}
          alt={name}
          width={500}
          height={500}
          className="max-w-full max-h-full object-contain p-2.5 transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomed ? ZOOM_SCALE : 1})`, transformOrigin: origin }}
          priority
        />
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-3">
        <button
          type="button"
          onClick={() => scrollThumbs(-1)}
          aria-label="Previous thumbnail"
          className="w-[38px] h-[38px] shrink-0 rounded-full bg-[#f5f5f7] flex items-center justify-center cursor-pointer"
        >
          <Image src="/images/promo-banner/left-arrow.svg" alt="" width={9} height={16} className="w-[9px] h-4" />
        </button>

        <div ref={trackRef} className="flex [justify-content:safe_center] gap-2 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                setActive(i)
                // Clicking the edge-most visible thumbnail slides the strip one
                // item further in that direction, so the next one is reachable.
                const track = trackRef.current
                const btn = e.currentTarget
                if (!track) return
                const trackRect = track.getBoundingClientRect()
                const btnRect = btn.getBoundingClientRect()
                const step = btn.offsetWidth + 8
                if (btnRect.right > trackRect.right - 1) {
                  track.scrollBy({ left: step, behavior: 'smooth' })
                } else if (btnRect.left < trackRect.left + 1) {
                  track.scrollBy({ left: -step, behavior: 'smooth' })
                }
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
    </div>
  )
}

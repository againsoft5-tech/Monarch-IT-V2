'use client'

import { useEffect, useRef, useState, type MouseEvent } from 'react'
import Image from 'next/image'
import type { ProductImage } from '@/data/productDetail'

const ZOOM_SCALE = 2

export default function ProductGallery({
  images,
  name,
  videoId,
}: {
  images: ProductImage[]
  name: string
  videoId?: string
}) {
  const hasVideo = Boolean(videoId)
  const slideCount = images.length + (hasVideo ? 1 : 0)
  // A single photo (and no video) has nothing to switch between, so the
  // thumbnail strip would just be an empty-feeling row of arrows.
  const showThumbnails = slideCount > 1
  // Slide 0 is the video (when present); image i lives at slide i + (hasVideo ? 1 : 0).
  const [active, setActive] = useState(0)
  const isVideoActive = hasVideo && active === 0
  const activeImage = images[hasVideo ? active - 1 : active]

  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  const [supportsHover, setSupportsHover] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  // `images` only changes reference when the selected option itself carries its
  // own image set (e.g. a color swatch) — picking an option with no images of
  // its own (like a size button) leaves it untouched. So this only fires for
  // options that actually have images, jumping off the video/whatever slide
  // was active onto that option's first photo. Skipped on mount so the video
  // still opens first.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setActive(hasVideo ? 1 : 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images])

  // Touch devices don't get real hover, so they keep tap-to-zoom instead.
  useEffect(() => {
    setSupportsHover(window.matchMedia('(hover: hover)').matches)
  }, [])

  const scrollThumbs = (dir: number) => {
    trackRef.current?.scrollBy({ left: dir * 100, behavior: 'smooth' })
  }

  // Switching slides always starts the new one un-zoomed.
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

  const selectSlide = (index: number, e: MouseEvent<HTMLButtonElement>) => {
    setActive(index)
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
  }

  return (
    <div className="p-4">
      <div
        ref={boxRef}
        onClick={() => {
          if (!isVideoActive && !supportsHover) setZoomed((v) => !v)
        }}
        onMouseEnter={(e) => {
          if (!isVideoActive && supportsHover) {
            setZoomed(true)
            setOriginFromPoint(e.clientX, e.clientY)
          }
        }}
        onMouseMove={(e) => {
          if (!isVideoActive && zoomed) setOriginFromPoint(e.clientX, e.clientY)
        }}
        onMouseLeave={() => {
          setZoomed(false)
          setOrigin('50% 50%')
        }}
        onTouchStart={(e) => {
          if (isVideoActive) return
          const touch = e.touches[0]
          if (touch) setOriginFromPoint(touch.clientX, touch.clientY)
        }}
        className={`relative rounded-[35px] h-[320px] md:h-[400px] flex items-center justify-center bg-[#f5f5f7] border border-gray-100 overflow-hidden select-none ${
          zoomed ? 'touch-none' : ''
        } ${isVideoActive ? 'cursor-default' : supportsHover ? 'cursor-zoom-in' : zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
      >
        {isVideoActive ? (
          <iframe
            key={videoId}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0`}
            title={`${name} video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <Image
            src={activeImage.large}
            alt={name}
            width={500}
            height={500}
            className="max-w-full max-h-full object-contain p-2.5 transition-transform duration-300 ease-out"
            style={{ transform: `scale(${zoomed ? ZOOM_SCALE : 1})`, transformOrigin: origin }}
            priority
          />
        )}
      </div>

      {showThumbnails && (
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
            {hasVideo && (
              <button
                type="button"
                onClick={(e) => selectSlide(0, e)}
                aria-label="Play video"
                className={`relative w-16 h-16 shrink-0 rounded-lg border bg-[#fafbfe] flex items-center justify-center overflow-hidden transition-colors cursor-pointer ${
                  active === 0 ? 'border-[#d92128]' : 'border-gray-200 hover:border-[#d92128]'
                }`}
              >
                <Image
                  src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                  alt=""
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <span className="mi text-white text-[26px] drop-shadow">play_circle</span>
                </span>
              </button>
            )}
            {images.map((img, i) => {
              const slideIndex = hasVideo ? i + 1 : i
              return (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => selectSlide(slideIndex, e)}
                  className={`w-16 h-16 shrink-0 rounded-lg border bg-[#fafbfe] flex items-center justify-center overflow-hidden transition-colors cursor-pointer ${
                    slideIndex === active ? 'border-[#d92128]' : 'border-gray-200 hover:border-[#d92128]'
                  }`}
                >
                  <Image src={img.thumb} alt={name} width={64} height={64} className="w-full h-full object-contain p-1" />
                </button>
              )
            })}
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
      )}
    </div>
  )
}

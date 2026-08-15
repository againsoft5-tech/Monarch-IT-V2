'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import HeroSlideContent, { DESKTOP_ASPECT, MOBILE_ASPECT } from './HeroSlideContent'
import { useHeroSliderStore, type Device, type HeroSlide, type HeroSliderDB } from '@/lib/heroSliderStore'

const AUTOPLAY_MS = 5000

function SlideLayer({
  slide,
  device,
  active,
}: {
  slide: HeroSlide
  device: Device
  active: boolean
}) {
  return (
    <Link
      href={slide.href || '/'}
      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
        active ? 'opacity-100 z-[2]' : 'opacity-0 z-[1] pointer-events-none'
      }`}
      aria-hidden={!active}
      tabIndex={active ? 0 : -1}
    >
      <HeroSlideContent slide={slide} device={device} />
    </Link>
  )
}

type Props = {
  /** When set (live-edit / CMS), skips localStorage and uses this payload. */
  data?: HeroSliderDB | null
}

export default function HeroSlider({ data }: Props = {}) {
  const store = useHeroSliderStore()
  const db = data ?? store.db
  const ready = data ? true : store.ready
  /**
   * The saved slider lives in localStorage, which the server cannot see, so the
   * first paint has nothing but the built-in seed. Painting that seed flashed
   * the wrong banner until hydration replaced it, so hold off until the real
   * data is read — the sized boxes below still reserve the space, so the page
   * does not jump.
   *
   * Slides switched off in the admin panel stay out of the rotation entirely.
   */
  const slides = ready ? db.slides.filter((s) => s.enabled !== false) : []
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  const start = useCallback(() => {
    stop()
    if (slides.length <= 1) return
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, AUTOPLAY_MS)
  }, [slides.length, stop])

  useEffect(() => {
    start()
    return stop
  }, [start, stop])

  // Keep the index valid when the admin removes slides.
  useEffect(() => {
    if (current >= slides.length) setCurrent(0)
  }, [current, slides.length])

  const changeSlide = (dir: number) => {
    setCurrent((c) => (c + dir + slides.length) % slides.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    stop()
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 40) changeSlide(diff > 0 ? 1 : -1)
    start()
  }

  const active = Math.min(current, Math.max(slides.length - 1, 0))
  // Held back with the slides so a customised background does not flash either.
  const bgDesktop = ready ? db.bgDesktop : ''
  const bgMobile = ready ? db.bgMobile || db.bgDesktop : ''

  // Turned off in the admin panel — the homepage simply starts at the next section.
  if (ready && !db.enabled) return null

  return (
    <div
      className="w-full"
      onMouseEnter={stop}
      onMouseLeave={start}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Desktop — original 1350x600 banner ratio */}
      <div
        className="relative hidden md:block w-full overflow-hidden bg-white"
        style={{ containerType: 'inline-size', aspectRatio: DESKTOP_ASPECT }}
      >
        {bgDesktop && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bgDesktop} alt="" className="absolute inset-0 w-full h-full object-cover object-center z-0" />
        )}

        {slides.map((slide, i) => (
          <SlideLayer key={slide.id} slide={slide} device="desktop" active={i === active} />
        ))}

        {slides.length > 1 && (
          <div className="absolute bottom-[3.5cqw] left-[9cqw] z-20 flex items-center gap-[1cqw]">
            <button
              type="button"
              onClick={() => changeSlide(-1)}
              aria-label="Previous slide"
              className="w-[3cqw] h-[3cqw] bg-[#f5f5f7] rounded-full flex items-center justify-center cursor-pointer hover:bg-white hover:scale-105 shadow-sm transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/promo-banner/left-arrow.svg" alt="" className="w-[0.7cqw]" />
            </button>
            <button
              type="button"
              onClick={() => changeSlide(1)}
              aria-label="Next slide"
              className="w-[3cqw] h-[3cqw] bg-[#f5f5f7] rounded-full flex items-center justify-center cursor-pointer hover:bg-white hover:scale-105 shadow-sm transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/promo-banner/right-arrow.svg" alt="" className="w-[0.7cqw]" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile — 1:1 square, its own layout numbers */}
      <div
        className="relative md:hidden w-full overflow-hidden bg-white"
        style={{ containerType: 'inline-size', aspectRatio: MOBILE_ASPECT }}
      >
        {bgMobile && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bgMobile} alt="" className="absolute inset-0 w-full h-full object-cover object-center z-0" />
        )}

        {slides.map((slide, i) => (
          <SlideLayer key={slide.id} slide={slide} device="mobile" active={i === active} />
        ))}

        {slides.length > 1 && (
          <div className="absolute bottom-[4cqw] left-0 right-0 z-20 flex items-center justify-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === active ? 'w-5 bg-[#bd2026]' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

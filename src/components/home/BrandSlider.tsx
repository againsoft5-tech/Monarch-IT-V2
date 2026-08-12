'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { brands } from '@/data/brands'

const loopBrands = [...brands, ...brands]

export default function BrandSlider() {
  const trackRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const pausedRef = useRef(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const step = () => {
      if (!pausedRef.current) {
        const half = track.scrollWidth / 2
        track.scrollLeft += 0.5
        if (track.scrollLeft >= half) track.scrollLeft -= half
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const pause = () => {
    pausedRef.current = true
  }
  const resume = () => {
    pausedRef.current = false
  }

  const scroll = (amount: number) => {
    trackRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <div className="relative py-10 bg-white">
      <div className="text-center mb-[15px]">
        <h2 className="m-0 mb-1 font-bold text-2xl md:text-[26px] text-[#333]">Brands We Distribute</h2>
        <p className="m-0 text-sm text-[#777]">Official distributor of trusted brands.</p>
      </div>

      <div className="relative w-full mx-auto py-5 bg-[#f5f5f7]">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-[40px] md:w-[280px]"
          style={{
            background:
              'linear-gradient(to right, #fff 0%, rgba(255,255,255,0.98) 18%, rgba(255,255,255,0.9) 34%, rgba(255,255,255,0.72) 50%, rgba(255,255,255,0.45) 66%, rgba(255,255,255,0.18) 84%, rgba(255,255,255,0) 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-[40px] md:w-[280px]"
          style={{
            background:
              'linear-gradient(to left, #fff 0%, rgba(255,255,255,0.98) 18%, rgba(255,255,255,0.9) 34%, rgba(255,255,255,0.72) 50%, rgba(255,255,255,0.45) 66%, rgba(255,255,255,0.18) 84%, rgba(255,255,255,0) 100%)',
          }}
        />

        <div
          className="relative mx-auto px-4 md:px-28"
          onMouseEnter={pause}
          onMouseLeave={resume}
          onTouchStart={pause}
          onTouchEnd={resume}
        >
          <button
            type="button"
            onClick={() => scroll(-300)}
            aria-label="Previous brand"
            className="hidden md:flex absolute left-4 md:left-28 top-1/2 -translate-y-1/2 z-10 w-[38px] h-[38px] rounded-full bg-[#f5f5f7] items-center justify-center cursor-pointer"
          >
            <Image src="/images/promo-banner/left-arrow.svg" alt="" width={9} height={16} className="w-[9px] h-4" />
          </button>

          <div
            ref={trackRef}
            className="flex gap-2.5 md:gap-[25px] overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {loopBrands.map((b, i) => (
              <a
                key={`${b.name}-${i}`}
                href={b.href}
                className="flex-none w-[calc((100%-30px)/4)] md:w-[calc((100%-75px)/4)] lg:w-[calc((100%-125px)/6)] bg-white border border-[#f0f0f0] rounded-xl md:rounded-2xl px-2 md:px-3 py-2 flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-[3px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
              >
                <Image
                  src={b.logo}
                  alt={b.name}
                  title={b.name}
                  width={160}
                  height={64}
                  className="h-9 md:h-16 w-auto max-w-full object-contain"
                  style={{ width: 'auto' }}
                />
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll(300)}
            aria-label="Next brand"
            className="hidden md:flex absolute right-4 md:right-28 top-1/2 -translate-y-1/2 z-10 w-[38px] h-[38px] rounded-full bg-[#f5f5f7] items-center justify-center cursor-pointer"
          >
            <Image src="/images/promo-banner/right-arrow.svg" alt="" width={9} height={16} className="w-[9px] h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

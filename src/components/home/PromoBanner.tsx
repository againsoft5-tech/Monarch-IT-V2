'use client'

import { useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { usePromoBannerStore, type PromoBannerDB, type PromoSlide } from '@/lib/promoBannerStore'

const REPEATS = 3

function SlideContent({ slide, linkWholeCard = false }: { slide: PromoSlide; linkWholeCard?: boolean }) {
  const wrapperClassName =
    'h-full w-full flex flex-col items-center justify-center px-4 py-6 min-[1200px]:py-10 max-[640px]:px-3 max-[640px]:py-4 max-[480px]:py-3'

  const inner = (
    <>
      <p className="text-[13px] text-gray-500 m-0 text-center max-[640px]:text-[11px] max-[480px]:text-[9px]">
        {slide.label}
      </p>
      <h3 className="text-[40px] max-[640px]:text-[26px] max-[480px]:text-[23px] font-extrabold text-[#4d4d4d] m-0 mt-0.5 text-center tracking-tight leading-tight">
        {slide.title}
      </h3>
      <p className="text-[18px] text-[#4d4d4d] m-0 mt-0.5 text-center max-[640px]:text-[14px] max-[480px]:text-[11px]">
        {slide.subtitle}
      </p>
      {!linkWholeCard && (
        <Link
          href={slide.buttonLink || '#'}
          className="mt-3 inline-flex items-center justify-center rounded-full border border-[#e22a28] text-[#e22a28] hover:bg-[#e22a28] hover:text-white text-[18px] font-medium px-[18px] py-[10px] transition-colors max-[640px]:mt-2 max-[640px]:text-[13px] max-[640px]:px-3.5 max-[640px]:py-2 max-[480px]:mt-1 max-[480px]:text-[11px] max-[480px]:px-3 max-[480px]:py-1.5"
        >
          {slide.buttonText || 'Buy'}
        </Link>
      )}
      <div className="w-full mt-4 flex items-center justify-center px-16 max-[640px]:mt-3 max-[640px]:px-9 max-[480px]:mt-2 max-[480px]:px-5">
        {slide.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slide.image}
            alt={slide.title}
            className="max-w-full max-h-[190px] object-contain max-[640px]:max-h-[140px] max-[480px]:max-h-[95px]"
          />
        )}
      </div>
    </>
  )

  if (linkWholeCard) {
    return (
      <Link href={slide.buttonLink || '#'} className={wrapperClassName}>
        {inner}
      </Link>
    )
  }

  return <div className={wrapperClassName}>{inner}</div>
}

function PromoColumn({ slides, trackRef }: { slides: PromoSlide[]; trackRef: React.RefObject<HTMLDivElement | null> }) {
  const loop = useMemo(() => (slides.length > 0 ? Array.from({ length: REPEATS }, () => slides).flat() : []), [slides])

  return (
    <div className="flex-1 w-1/2 relative overflow-hidden rounded-[35px] bg-[#f4f5f7] h-[380px] min-[1200px]:h-[420px]">
      {slides.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-[13px] text-gray-400">No product set</div>
      ) : (
        <div ref={trackRef} className="h-full overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loop.map((slide, i) => (
            <div key={`${slide.id}-${i}`} className="h-full w-full">
              <SlideContent slide={slide} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MobileCarousel({
  slides,
  trackRef,
  go,
}: {
  slides: PromoSlide[]
  trackRef: React.RefObject<HTMLDivElement | null>
  go: (dir: number) => void
}) {
  const loop = useMemo(() => (slides.length > 0 ? Array.from({ length: REPEATS }, () => slides).flat() : []), [slides])

  if (slides.length === 0) return null

  return (
    <div className="hidden max-[640px]:flex flex-col items-center w-full">
      <div className="relative z-[5] flex items-center justify-center -mb-[38px]">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous product"
          className="relative z-10 mr-[-14px] hover:scale-125 transition-transform cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/promo-banner/left-arrow.svg" alt="" className="w-2.5" />
        </button>
        <div className="relative w-[130px] shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/promo-banner/fire-icon-with-bg-mobile.svg" alt="" className="w-[130px]" />
          <Link
            href="/offers"
            aria-label="Hot products"
            className="absolute left-1/2 top-1/2 w-[46%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer"
          />
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next product"
          className="relative z-10 ml-[-14px] hover:scale-125 transition-transform cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/promo-banner/right-arrow.svg" alt="" className="w-2.5" />
        </button>
      </div>

      <div className="relative overflow-hidden rounded-[14px] bg-[#f4f5f7] w-full h-[300px]">
        <div ref={trackRef} className="flex h-full overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loop.map((slide, i) => (
            <div key={`${slide.id}-${i}`} className="h-full w-full shrink-0">
              <SlideContent slide={slide} linkWholeCard />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

type Props = {
  /** When set (live-edit / CMS), skips localStorage store. */
  data?: PromoBannerDB | null
}

export default function PromoBanner({ data }: Props) {
  const store = usePromoBannerStore()
  const db = data ?? store
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const mobileRef = useRef<HTMLDivElement>(null)
  const leftPos = useRef(0)
  const rightPos = useRef(0)
  const mobilePos = useRef(0)
  const busyRef = useRef(false)
  const mobileBusyRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const left = (db.left ?? []).filter((s) => !(s as { hidden?: boolean }).hidden)
  const right = (db.right ?? []).filter((s) => !(s as { hidden?: boolean }).hidden)
  const leftLen = left.length
  const rightLen = right.length
  const maxLen = Math.max(leftLen, rightLen)

  const mobileSlides = useMemo(() => [...left, ...right], [left, right])
  const mobileLen = mobileSlides.length

  useEffect(() => {
    const leftItemH = leftRef.current?.clientHeight || 0
    if (leftRef.current && leftLen > 0) {
      leftPos.current = leftLen
      leftRef.current.scrollTop = leftPos.current * leftItemH
    }
    const rightItemH = rightRef.current?.clientHeight || 0
    if (rightRef.current && rightLen > 0) {
      rightPos.current = rightLen
      rightRef.current.scrollTop = rightPos.current * rightItemH
    }
  }, [leftLen, rightLen])

  useEffect(() => {
    const itemW = mobileRef.current?.clientWidth || 0
    if (mobileRef.current && mobileLen > 0) {
      mobilePos.current = mobileLen
      mobileRef.current.scrollLeft = mobilePos.current * itemW
    }
  }, [mobileLen])

  const go = (dir: number) => {
    if (busyRef.current) return
    busyRef.current = true

    const leftItemH = leftRef.current?.clientHeight || 0
    const rightItemH = rightRef.current?.clientHeight || 0
    leftRef.current?.scrollBy({ top: dir * leftItemH, behavior: 'smooth' })
    rightRef.current?.scrollBy({ top: dir * rightItemH, behavior: 'smooth' })

    setTimeout(() => {
      if (leftLen > 0) {
        leftPos.current += dir
        if (leftPos.current <= 0 || leftPos.current >= leftLen * (REPEATS - 1)) {
          leftPos.current = (((leftPos.current % leftLen) + leftLen) % leftLen) + leftLen
          if (leftRef.current) leftRef.current.scrollTop = leftPos.current * leftItemH
        }
      }
      if (rightLen > 0) {
        rightPos.current += dir
        if (rightPos.current <= 0 || rightPos.current >= rightLen * (REPEATS - 1)) {
          rightPos.current = (((rightPos.current % rightLen) + rightLen) % rightLen) + rightLen
          if (rightRef.current) rightRef.current.scrollTop = rightPos.current * rightItemH
        }
      }
      busyRef.current = false
    }, 420)
  }

  const goMobile = (dir: number) => {
    if (mobileBusyRef.current || mobileLen === 0) return
    mobileBusyRef.current = true

    const itemW = mobileRef.current?.clientWidth || 0
    mobileRef.current?.scrollBy({ left: dir * itemW, behavior: 'smooth' })

    setTimeout(() => {
      mobilePos.current += dir
      if (mobilePos.current <= 0 || mobilePos.current >= mobileLen * (REPEATS - 1)) {
        mobilePos.current = (((mobilePos.current % mobileLen) + mobileLen) % mobileLen) + mobileLen
        if (mobileRef.current) mobileRef.current.scrollLeft = mobilePos.current * itemW
      }
      mobileBusyRef.current = false
    }, 420)
  }

  const start = () => {
    if (maxLen > 1) timerRef.current = setInterval(() => go(1), 4000)
  }
  const stop = () => {
    if (timerRef.current) clearInterval(timerRef.current)
  }

  useEffect(() => {
    start()
    return stop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxLen])

  useEffect(() => {
    if (mobileLen <= 1) return
    const id = setInterval(() => goMobile(1), 4000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileLen])

  if (maxLen === 0) return null

  return (
    <div className="container mx-auto px-4 min-[992px]:px-14 py-5" onMouseEnter={stop} onMouseLeave={start}>
      <div className="flex items-stretch justify-center gap-2.5 max-[640px]:hidden">
        <PromoColumn slides={left} trackRef={leftRef} />

        <div className="relative flex items-center justify-center w-[130px] -mx-[65px] z-[5] shrink-0">
          <div className="flex flex-col items-center justify-center h-full">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous products"
              className="relative z-10 mb-[-30px] hover:scale-125 transition-transform cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/promo-banner/top-arrow.svg" alt="" className="w-5" />
            </button>
            <div className="relative w-[130px] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/promo-banner/fire-icon-with-bg.svg" alt="" className="w-[130px]" />
              <Link
                href="/offers"
                aria-label="Hot products"
                className="absolute left-1/2 top-1/2 w-[64%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next products"
              className="relative z-10 mt-[-30px] hover:scale-125 transition-transform cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/promo-banner/down-arrow.svg" alt="" className="w-5" />
            </button>
          </div>
        </div>

        <PromoColumn slides={right} trackRef={rightRef} />
      </div>

      <MobileCarousel slides={mobileSlides} trackRef={mobileRef} go={goMobile} />
    </div>
  )
}

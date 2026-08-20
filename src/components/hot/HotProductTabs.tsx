'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export type HotTab = { slug: string; label: string }

type Props = {
  tabs: HotTab[]
  active: string
  onChange: (slug: string) => void
}

/** Matches the `gap-2.5` between pills — needed to compute the exact loop width. */
const GAP = 10
/**
 * Identical copies of the list laid end to end. The scroll position is kept inside
 * copy #2, which leaves a full copy of runway on either side — enough for one arrow
 * step in either direction before the position is re-normalised. Two copies is not
 * enough: the browser clamps at the track's end and the wrap stalls.
 */
const COPIES = 4
/** Index of the copy the scroll position is normalised back into. */
const HOME_COPY = 1
/** Desktop shows this many pills at once; anything beyond scrolls in via the arrows. */
const VISIBLE_TABS = 8

export default function HotProductTabs({ tabs, active, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const groupRef = useRef<HTMLDivElement>(null)
  /** Only loop once the pills actually overflow; otherwise the arrows are dead controls. */
  const [scrollable, setScrollable] = useState(false)
  /** Width of the first VISIBLE_TABS pills — caps the track so exactly that many show. */
  const [trackMax, setTrackMax] = useState<number>()

  /** Width of one full copy of the list, including the gap that follows it. */
  const loopWidth = useCallback(
    () => (groupRef.current?.getBoundingClientRect().width ?? 0) + GAP,
    [],
  )

  useEffect(() => {
    const track = trackRef.current
    const group = groupRef.current
    if (!track || !group) return

    const check = () => {
      // Pills are variable width, so "8 visible" means measuring the first eight rather
      // than assuming a fixed pill size.
      const pills = Array.from(group.children) as HTMLElement[]
      const n = Math.min(VISIBLE_TABS, pills.length)
      if (n > 0) {
        const width =
          pills.slice(0, n).reduce((sum, el) => sum + el.getBoundingClientRect().width, 0) + GAP * (n - 1)
        setTrackMax(Math.ceil(width))
      }
      setScrollable(group.getBoundingClientRect().width > track.clientWidth + 1)
    }

    check()
    const observer = new ResizeObserver(check)
    observer.observe(track)
    observer.observe(group)
    return () => observer.disconnect()
  }, [tabs])

  // Park the viewport on the home copy so there is runway in both directions, then keep
  // it there. Normalising on a debounced `scroll` (rather than immediately) lets the
  // smooth animation finish first — correcting mid-flight fights the animation.
  useEffect(() => {
    const track = trackRef.current
    if (!track || !scrollable) return

    const loop = loopWidth()
    if (loop <= 0) return

    // Open one pill "behind" the list start, so the last tab leads and the first tab
    // ("All") sits in second position. Offsetting forward by a whole copy lands on the
    // visually identical spot while staying inside the normalisation window below.
    const lastPill = groupRef.current?.lastElementChild as HTMLElement | null
    const back = lastPill ? lastPill.getBoundingClientRect().width + GAP : 0
    track.scrollLeft = loop * (HOME_COPY + 1) - back

    let timer: number | undefined
    const onScroll = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const width = loopWidth()
        if (width <= 0) return
        const home = width * HOME_COPY
        // Both copies render identically, so shifting by whole copies is invisible.
        if (track.scrollLeft >= home + width) track.scrollLeft -= width
        else if (track.scrollLeft < home) track.scrollLeft += width
      }, 140)
    }

    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearTimeout(timer)
      track.removeEventListener('scroll', onScroll)
    }
  }, [scrollable, loopWidth, tabs])

  /**
   * Advances exactly one pill per click. Pills are variable width, so the target is the
   * next pill's own offset rather than a fixed step — that also keeps the strip snapped
   * to a pill edge instead of drifting mid-pill.
   */
  const scrollByDir = useCallback((dir: 1 | -1) => {
    const track = trackRef.current
    if (!track) return

    const trackLeft = track.getBoundingClientRect().left
    const offsets = Array.from(track.querySelectorAll('button')).map(
      (pill) => pill.getBoundingClientRect().left - trackLeft + track.scrollLeft,
    )

    const current = track.scrollLeft
    // 1px tolerance so sub-pixel rounding doesn't make a click land on the current pill.
    const target =
      dir === 1
        ? offsets.find((offset) => offset > current + 1)
        : [...offsets].reverse().find((offset) => offset < current - 1)

    if (target === undefined) return
    track.scrollTo({ left: target, behavior: 'smooth' })
  }, [])

  if (tabs.length === 0) return null

  const pill = (tab: HotTab, copy: number) => {
    const isActive = active === tab.slug
    const isClone = copy > 0
    return (
      <button
        key={`${copy}-${tab.slug}`}
        type="button"
        onClick={() => onChange(tab.slug)}
        aria-hidden={isClone || undefined}
        tabIndex={isClone ? -1 : undefined}
        aria-pressed={isClone ? undefined : isActive}
        className={`flex-none rounded-full px-5 py-2.5 text-[14px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
          isActive ? 'bg-[#d32f2f] text-white' : 'bg-[#f5f5f7] text-gray-600 hover:text-[#d32f2f]'
        }`}
      >
        {tab.label}
      </button>
    )
  }

  const arrow = (dir: 1 | -1) => (
    <button
      type="button"
      onClick={() => scrollByDir(dir)}
      aria-label={dir === 1 ? 'Next categories' : 'Previous categories'}
      className="shrink-0 w-[42px] h-[42px] bg-[#f5f5f7] rounded-full flex items-center justify-center hover:bg-[#ececf0] transition-colors cursor-pointer"
    >
      <Image
        src={dir === 1 ? '/images/promo-banner/right-arrow.svg' : '/images/promo-banner/left-arrow.svg'}
        alt=""
        width={9}
        height={16}
        className="w-[9px] h-4"
      />
    </button>
  )

  return (
    // Bottom spacing is left to the parent so the strip can sit outside the product grid.
    <div className="flex items-center justify-center gap-2.5">
      {scrollable ? arrow(-1) : null}

      {/* maxWidth caps the strip at VISIBLE_TABS on wide screens; min-w-0 still lets flex
          shrink it below that on narrow ones, so mobile just gets fewer pills in view. */}
      <div className="relative min-w-0" style={{ maxWidth: trackMax }}>
        <div
          ref={trackRef}
          className="flex gap-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {Array.from({ length: scrollable ? COPIES : 1 }, (_, copy) => (
            <div key={copy} ref={copy === 0 ? groupRef : undefined} className="flex gap-2.5">
              {tabs.map((tab) => pill(tab, copy))}
            </div>
          ))}
        </div>

        {/* Fades the half-cut pills into the page so the strip reads as continuing
            past the arrows rather than being chopped off. */}
        {scrollable ? (
          <>
            <span className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-white via-white/80 to-transparent" />
            <span className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-white via-white/80 to-transparent" />
          </>
        ) : null}
      </div>

      {scrollable ? arrow(1) : null}
    </div>
  )
}

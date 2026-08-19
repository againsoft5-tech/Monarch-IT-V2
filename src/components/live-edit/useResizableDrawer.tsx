'use client'

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

export const DRAWER_MIN_WIDTH = 320
export const DRAWER_DEFAULT_WIDTH = 420
/** Keep a sliver of the preview visible so the drawer can never cover the whole shell. */
const VIEWPORT_MARGIN = 80

function clampWidth(px: number) {
  if (typeof window === 'undefined') return px
  const max = Math.max(DRAWER_MIN_WIDTH, window.innerWidth - VIEWPORT_MARGIN)
  return Math.round(Math.min(Math.max(px, DRAWER_MIN_WIDTH), max))
}

/**
 * Drag-to-resize for a right-anchored drawer.
 *
 * Returns the current width plus the props for a grab handle rendered on the drawer's
 * left edge. Width is remembered per `storageKey` in localStorage; double-clicking the
 * handle restores the default.
 */
export function useResizableDrawer(storageKey: string, defaultWidth = DRAWER_DEFAULT_WIDTH) {
  const [width, setWidth] = useState(defaultWidth)
  const [dragging, setDragging] = useState(false)
  const widthRef = useRef(width)
  widthRef.current = width

  // Restored in an effect (not lazy state) so SSR and first client render match.
  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(storageKey))
      if (Number.isFinite(saved) && saved > 0) setWidth(clampWidth(saved))
    } catch {
      /* storage unavailable */
    }
  }, [storageKey])

  useEffect(() => {
    const onResize = () => setWidth((w) => clampWidth(w))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const persist = useCallback(
    (px: number) => {
      try {
        window.localStorage.setItem(storageKey, String(px))
      } catch {
        /* storage unavailable */
      }
    },
    [storageKey],
  )

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      setDragging(true)

      // Right-anchored drawer: width is the distance from the pointer to the right edge.
      const move = (ev: PointerEvent) => setWidth(clampWidth(window.innerWidth - ev.clientX))
      const up = () => {
        setDragging(false)
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
        window.removeEventListener('pointercancel', up)
        persist(widthRef.current)
      }

      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
      window.addEventListener('pointercancel', up)
    },
    [persist],
  )

  const onDoubleClick = useCallback(() => {
    setWidth(defaultWidth)
    persist(defaultWidth)
  }, [defaultWidth, persist])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 48 : 16
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setWidth((w) => {
          const next = clampWidth(w + step)
          persist(next)
          return next
        })
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setWidth((w) => {
          const next = clampWidth(w - step)
          persist(next)
          return next
        })
      }
    },
    [persist],
  )

  return { width, dragging, onPointerDown, onDoubleClick, onKeyDown }
}

/** Grab strip for the drawer's left edge. Spread the hook's handlers onto it. */
export function DrawerResizeHandle({
  dragging,
  onPointerDown,
  onDoubleClick,
  onKeyDown,
}: {
  dragging: boolean
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void
  onDoubleClick: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void
}) {
  return (
    <>
      {/* Covers the preview iframe while dragging so pointermove keeps reaching this document. */}
      {dragging ? <div className="fixed inset-0 z-[95] cursor-col-resize" /> : null}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel — drag, or use arrow keys. Double-click to reset."
        tabIndex={0}
        title="Drag to resize · double-click to reset"
        onPointerDown={onPointerDown}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
        className={`group absolute left-0 top-0 z-[96] flex h-full w-2 -translate-x-1/2 cursor-col-resize touch-none items-center justify-center outline-none ${
          dragging ? '' : 'hover:bg-transparent'
        }`}
      >
        <span
          aria-hidden
          className={`h-full w-[3px] transition-colors ${
            dragging ? 'bg-[#bd2026]' : 'bg-transparent group-hover:bg-[#bd2026]/50 group-focus:bg-[#bd2026]/50'
          }`}
        />
        <span
          aria-hidden
          className={`pointer-events-none absolute flex h-9 w-[7px] items-center justify-center rounded-full border transition-colors ${
            dragging
              ? 'border-[#bd2026] bg-[#bd2026]'
              : 'border-[#d0d0d0] bg-white group-hover:border-[#bd2026] group-focus:border-[#bd2026]'
          }`}
        />
      </div>
    </>
  )
}

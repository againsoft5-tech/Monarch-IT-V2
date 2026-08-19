'use client'

import { useState, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react'

type Props = {
  label: string
  liveEdit: boolean
  locked?: boolean
  selected?: boolean
  onEdit?: () => void
  children: ReactNode
  className?: string
}

/**
 * Outline + centered "Edit" bar for a single editable region.
 *
 * Simpler sibling of `LiveEditSection`: used on pages that have one fixed section
 * rather than a reorderable `layout[]`, so it carries no move/duplicate/add actions.
 * Like `LiveEditSection` it stays mounted while locked so click-capture survives unlock.
 */
export function LiveEditRegion({
  label,
  liveEdit,
  locked = false,
  selected = false,
  onEdit,
  children,
  className,
}: Props) {
  const [hovered, setHovered] = useState(false)

  if (!liveEdit) return <>{children}</>

  const interactive = !locked
  const showBar = interactive && (hovered || selected)

  const onClickCapture = (e: MouseEvent) => {
    if (!interactive) return
    const target = e.target as HTMLElement | null
    if (target?.closest('[data-live-ignore]')) return
    e.preventDefault()
    e.stopPropagation()
    onEdit?.()
  }

  return (
    <div
      className={`group/live relative overflow-visible transition-[box-shadow,outline-color] ${
        interactive ? 'cursor-pointer' : ''
      } ${
        interactive && selected
          ? 'z-[5] outline outline-[3px] outline-[#bd2026] outline-offset-[-3px]'
          : interactive
            ? 'outline outline-2 outline-transparent hover:outline-[#bd2026]/70'
            : ''
      } ${className ?? ''}`}
      onClickCapture={onClickCapture}
      onMouseEnter={() => {
        if (interactive) setHovered(true)
      }}
      onMouseLeave={() => setHovered(false)}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e: KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onEdit?.()
              }
            }
          : undefined
      }
    >
      {children}
      {showBar ? (
        <div
          data-live-ignore
          className="pointer-events-auto absolute left-1/2 top-1/2 z-[80] flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-none border border-white/10 bg-[#1f1f1f] px-2 py-1 shadow-lg"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            data-live-ignore
            title={`Edit ${label}`}
            aria-label={`Edit ${label}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onEdit?.()
            }}
            className="inline-flex h-7 items-center gap-1.5 rounded-none border-0 bg-transparent px-1.5 text-[12px] font-semibold text-white hover:bg-white/15"
          >
            <span className="mi text-[15px] leading-none">edit</span>
            {label}
          </button>
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1f1f1f]"
          />
        </div>
      ) : null}
    </div>
  )
}

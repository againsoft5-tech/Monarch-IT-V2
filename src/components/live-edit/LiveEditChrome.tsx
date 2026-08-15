'use client'

import {
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'

type ChromeId = 'header' | 'footer' | 'sideMenu'

type Props = {
  chromeId: ChromeId
  label: string
  liveEdit: boolean
  locked?: boolean
  selected?: boolean
  onSelect?: (id: ChromeId) => void
  onEdit?: (id: ChromeId) => void
  children: ReactNode
  className?: string
}

export function LiveEditChrome({
  chromeId,
  label,
  liveEdit,
  locked = false,
  selected = false,
  onSelect,
  onEdit,
  children,
  className,
}: Props) {
  const [hovered, setHovered] = useState(false)

  if (!liveEdit) return <>{children}</>

  const interactive = !locked
  const showBar = interactive && (hovered || selected)

  const onClick = (e: MouseEvent) => {
    if (!interactive) return
    const target = e.target as HTMLElement | null
    if (target?.closest('button, a, input, textarea, select, label, [data-live-ignore]')) return
    e.preventDefault()
    e.stopPropagation()
    onSelect?.(chromeId)
  }

  return (
    <div
      data-live-chrome={chromeId}
      className={[
        'group/live transition-[box-shadow,outline-color]',
        interactive ? 'cursor-pointer' : '',
        className?.includes('absolute') ? '' : 'relative',
        interactive && selected
          ? 'z-[5] outline outline-[3px] outline-[#bd2026] outline-offset-[-3px]'
          : interactive
            ? 'outline outline-2 outline-transparent hover:outline-[#bd2026]/70'
            : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
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
                onSelect?.(chromeId)
              }
            }
          : undefined
      }
    >
      {children}
      {showBar ? (
        <div
          data-live-ignore
          className="absolute left-1/2 top-2 z-[50] flex -translate-x-1/2 items-center gap-1 rounded-none border border-white/10 bg-[#1f1f1f] px-1.5 py-0.5 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="px-1 text-[11px] font-semibold uppercase tracking-wide text-white/70">
            {label}
          </span>
          <button
            type="button"
            title="Edit"
            aria-label={`Edit ${label}`}
            data-live-ignore
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onEdit?.(chromeId)
            }}
            className="inline-flex h-7 w-7 items-center justify-center rounded-none border-0 bg-transparent text-white hover:bg-white/15"
          >
            <span className="mi text-[15px] leading-none">edit</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}

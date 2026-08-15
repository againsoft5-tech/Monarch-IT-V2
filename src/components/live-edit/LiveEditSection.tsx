'use client'

import {
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import type { HomepageSectionType } from '@/lib/live-edit/homepage'

export type LayoutActionName =
  | 'moveUp'
  | 'moveDown'
  | 'duplicate'
  | 'toggleHidden'
  | 'delete'
  | 'add'
  | 'edit'

type Props = {
  sectionId: string
  sectionType: HomepageSectionType
  liveEdit: boolean
  locked?: boolean
  selected?: boolean
  hidden?: boolean
  onSelect?: (id: string) => void
  onAction?: (action: LayoutActionName, sectionId: string, sectionType: HomepageSectionType) => void
  children: ReactNode
  className?: string
}

function Btn({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      data-live-ignore
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      className="inline-flex h-7 w-7 items-center justify-center rounded-none border-0 bg-transparent text-white hover:bg-white/15"
    >
      {children}
    </button>
  )
}

export function LiveEditSection({
  sectionId,
  sectionType,
  liveEdit,
  locked = false,
  selected = false,
  hidden = false,
  onSelect,
  onAction,
  children,
  className,
}: Props) {
  const [hovered, setHovered] = useState(false)

  // Keep the wrapper mounted while in the live-edit preview so unlock doesn't lose capture.
  if (!liveEdit) return <>{children}</>

  const interactive = !locked
  const showBar = interactive && (hovered || selected)

  const onClickCapture = (e: MouseEvent) => {
    if (!interactive) return
    const target = e.target as HTMLElement | null
    if (target?.closest('[data-live-ignore]')) return
    e.preventDefault()
    e.stopPropagation()
    onSelect?.(sectionId)
  }

  return (
    <div
      data-live-section={sectionId}
      className={`group/live relative overflow-visible transition-[box-shadow,outline-color,opacity] ${
        interactive ? 'cursor-pointer' : ''
      } ${
        interactive && selected
          ? 'z-[5] outline outline-[3px] outline-[#bd2026] outline-offset-[-3px]'
          : interactive
            ? 'outline outline-2 outline-transparent hover:outline-[#bd2026]/70'
            : ''
      } ${hidden && interactive ? 'opacity-45' : ''} ${className ?? ''}`}
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
                onSelect?.(sectionId)
              }
            }
          : undefined
      }
    >
      {children}
      {showBar ? (
        <div
          data-live-ignore
          className="pointer-events-auto absolute left-1/2 top-1/2 z-[80] flex -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 rounded-none border border-white/10 bg-[#1f1f1f] px-1 py-0.5 shadow-lg"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Btn label="Move up" onClick={() => onAction?.('moveUp', sectionId, sectionType)}>
            <span className="text-[14px] leading-none">↑</span>
          </Btn>
          <Btn label="Move down" onClick={() => onAction?.('moveDown', sectionId, sectionType)}>
            <span className="text-[14px] leading-none">↓</span>
          </Btn>
          <Btn label="Duplicate" onClick={() => onAction?.('duplicate', sectionId, sectionType)}>
            <span className="text-[13px] leading-none">⧉</span>
          </Btn>
          <Btn
            label={hidden ? 'Show' : 'Hide'}
            onClick={() => onAction?.('toggleHidden', sectionId, sectionType)}
          >
            <span className="text-[13px] leading-none">{hidden ? '◌' : '◉'}</span>
          </Btn>
          <Btn label="Edit" onClick={() => onAction?.('edit', sectionId, sectionType)}>
            <span className="mi text-[15px] leading-none">edit</span>
          </Btn>
          <Btn label="Add section" onClick={() => onAction?.('add', sectionId, sectionType)}>
            <span className="text-[16px] leading-none">+</span>
          </Btn>
          <Btn label="Delete" onClick={() => onAction?.('delete', sectionId, sectionType)}>
            <span className="text-[14px] leading-none">🗑</span>
          </Btn>
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1f1f1f]"
          />
        </div>
      ) : null}
    </div>
  )
}

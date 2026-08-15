'use client'

import { useMemo, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, Copy, Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react'
import type { PromoSection, PromoSlide } from '@/lib/live-edit/homepage'
import { DrawerHeader } from '@/components/live-edit/drawers/DrawerHeader'

type Props = {
  open: boolean
  value: PromoSection
  onChange: (next: PromoSection) => void
  onClose: () => void
  onBack?: () => void
}

type Side = 'left' | 'right'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function newSlide(): PromoSlide {
  return {
    id: `promo-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    label: 'Category',
    title: 'Product Name',
    subtitle: 'Short description',
    buttonText: 'Buy',
    buttonLink: '/',
    image: '',
    hidden: false,
  }
}

function SortablePromoSlideRow({
  slide,
  index,
  sideLabel,
  expanded,
  onToggle,
  onUpdate,
  onRemove,
  onDuplicate,
  onToggleHidden,
}: {
  slide: PromoSlide
  index: number
  sideLabel: string
  expanded: boolean
  onToggle: () => void
  onUpdate: (patch: Partial<PromoSlide>) => void
  onRemove: () => void
  onDuplicate: () => void
  onToggleHidden: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slide.id,
  })
  const isHidden = Boolean(slide.hidden)

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'rounded-none border border-[#e5e5e5] bg-white',
        expanded ? 'overflow-visible' : 'overflow-hidden',
        isDragging && 'z-10 opacity-90 shadow-md ring-1 ring-[#bd2026]/40',
        expanded && 'relative z-20 border-[#bd2026]/40',
        isHidden && 'opacity-60',
      )}
    >
      <div className="flex items-stretch gap-1 p-1.5">
        <button
          type="button"
          className="inline-flex shrink-0 touch-none items-center px-0.5 text-[#888] hover:text-[#222]"
          aria-label={`Drag ${sideLabel} slide ${index + 1}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 cursor-grab active:cursor-grabbing" />
        </button>

        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 rounded-none text-left outline-none hover:bg-[#f5f5f7]"
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <div className="relative h-12 w-[72px] shrink-0 overflow-hidden rounded-none border border-[#e5e5e5] bg-[#f5f5f7]">
            {slide.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slide.image} alt="" className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] text-[#999]">Empty</div>
            )}
          </div>
          <div className="min-w-0 flex-1 py-0.5">
            <p className="truncate text-[12px] font-medium text-[#222]">
              {slide.title.trim() || `${sideLabel} ${index + 1}`}
              {isHidden ? (
                <span className="ml-1.5 text-[10px] font-normal text-[#888]">(hidden)</span>
              ) : null}
            </p>
            <p className="truncate text-[10px] text-[#888]">
              {slide.label || 'No label'}
              {slide.subtitle ? ` · ${slide.subtitle}` : ''}
            </p>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-[#888] transition-transform',
              expanded && 'rotate-180',
            )}
          />
        </button>

        <button
          type="button"
          className="inline-flex shrink-0 items-center justify-center rounded-none px-1.5 text-[#888] hover:bg-[#f5f5f7]"
          title="Duplicate"
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate()
          }}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={cn(
            'inline-flex shrink-0 items-center justify-center rounded-none px-1.5 hover:bg-[#f5f5f7]',
            isHidden ? 'text-[#888]' : 'text-[#222]',
          )}
          title={isHidden ? 'Show on live' : 'Hide from live'}
          onClick={(e) => {
            e.stopPropagation()
            onToggleHidden()
          }}
        >
          {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          className="inline-flex shrink-0 items-center justify-center rounded-none px-1.5 text-[#888] hover:bg-red-50 hover:text-[#bd2026]"
          title="Delete"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {expanded ? (
        <div className="space-y-2 border-t border-[#eee] px-2.5 py-2.5">
          <div className="relative aspect-[4/3] overflow-hidden rounded-none border border-[#e5e5e5] bg-[#f5f5f7]">
            {slide.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slide.image} alt={slide.title} className="h-full w-full object-contain p-3" />
            ) : (
              <div className="flex h-full items-center justify-center text-[12px] text-[#999]">No image</div>
            )}
          </div>
          {(
            [
              ['label', 'Label'],
              ['title', 'Title'],
              ['subtitle', 'Subtitle'],
              ['buttonText', 'Button text'],
              ['buttonLink', 'Button link'],
              ['image', 'Image URL'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">{label}</label>
              <input
                value={slide[key] || ''}
                onChange={(e) => onUpdate({ [key]: e.target.value })}
                className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function SideEditor({
  side,
  label,
  slides,
  expandedId,
  setExpandedId,
  onChangeSide,
}: {
  side: Side
  label: string
  slides: PromoSlide[]
  expandedId: string | null
  setExpandedId: (id: string | null) => void
  onChangeSide: (next: PromoSlide[]) => void
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const ids = useMemo(() => slides.map((s) => s.id), [slides])

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = slides.findIndex((s) => s.id === String(active.id))
    const newIndex = slides.findIndex((s) => s.id === String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    onChangeSide(arrayMove(slides, oldIndex, newIndex))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
          {label} · drag · image · content
        </p>
        <button
          type="button"
          className="inline-flex h-7 items-center gap-1 rounded-none border border-[#ddd] bg-white px-2 text-[11px] font-semibold text-[#333]"
          onClick={() => {
            const slide = newSlide()
            onChangeSide([...slides, slide])
            setExpandedId(slide.id)
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {slides.map((slide, index) => (
              <SortablePromoSlideRow
                key={slide.id}
                slide={slide}
                index={index}
                sideLabel={side}
                expanded={expandedId === slide.id}
                onToggle={() => setExpandedId(expandedId === slide.id ? null : slide.id)}
                onUpdate={(patch) =>
                  onChangeSide(slides.map((s) => (s.id === slide.id ? { ...s, ...patch } : s)))
                }
                onRemove={() => onChangeSide(slides.filter((s) => s.id !== slide.id))}
                onDuplicate={() => {
                  const copy: PromoSlide = {
                    ...slide,
                    id: `promo-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
                    title: `${slide.title || 'Slide'} copy`,
                  }
                  const idx = slides.findIndex((s) => s.id === slide.id)
                  const next = [...slides]
                  next.splice(idx + 1, 0, copy)
                  onChangeSide(next)
                  setExpandedId(copy.id)
                }}
                onToggleHidden={() =>
                  onChangeSide(
                    slides.map((s) => (s.id === slide.id ? { ...s, hidden: !s.hidden } : s)),
                  )
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default function PromoDrawer({ open, value, onChange, onClose, onBack }: Props) {
  const left = value.left ?? []
  const right = value.right ?? []
  const [expandedId, setExpandedId] = useState<string | null>(left[0]?.id ?? right[0]?.id ?? null)

  if (!open) return null

  return (
    <aside className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-[420px] flex-col border-l border-[#e5e5e5] bg-[#eceff3] shadow-xl">
      <DrawerHeader title="Promo banners" onClose={onClose} onBack={onBack} />

      <div className="thin-scroll-gray min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <label className="flex items-center gap-2 text-[13px] text-[#333]">
          <input
            type="checkbox"
            checked={value.enabled !== false}
            onChange={(e) => onChange({ ...value, enabled: e.target.checked, left, right })}
          />
          Section enabled
        </label>

        <SideEditor
          side="left"
          label="Left column"
          slides={left}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          onChangeSide={(next) => onChange({ ...value, left: next, right })}
        />

        <SideEditor
          side="right"
          label="Right column"
          slides={right}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          onChangeSide={(next) => onChange({ ...value, left, right: next })}
        />
      </div>
    </aside>
  )
}

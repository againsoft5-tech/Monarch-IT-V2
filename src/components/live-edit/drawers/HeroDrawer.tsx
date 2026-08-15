'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { ChevronDown, Copy, Eye, EyeOff, GripVertical, ImageUp, Plus, Trash2 } from 'lucide-react'
import type { HeroObjectFit, HeroSection, HeroSlide, HeroSlideLayout } from '@/lib/live-edit/homepage'
import { DEFAULT_LAYOUT, DEFAULT_SUBTITLE_COLOR, DEFAULT_TITLE_COLOR } from '@/lib/heroSliderStore'
import { DrawerHeader } from '@/components/live-edit/drawers/DrawerHeader'

type Props = {
  open: boolean
  value: HeroSection
  onChange: (next: HeroSection) => void
  onClose: () => void
  onBack?: () => void
}

/** Monarch desktop hero box (matches HeroSlideContent DESKTOP_ASPECT). */
const SECTION_W = 1350
const SECTION_H = 600

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a))
  let y = Math.abs(Math.round(b))
  while (y) {
    const t = y
    y = x % y
    x = t
  }
  return x || 1
}

function formatRatio(width: number, height: number): string {
  if (!width || !height) return '—'
  const w = Math.round(width)
  const h = Math.round(height)
  const g = gcd(w, h)
  return `${w / g}:${h / g}`
}

function ratiosMatch(
  sectionW: number,
  sectionH: number,
  imageW: number | null | undefined,
  imageH: number | null | undefined,
): boolean | null {
  if (!sectionW || !sectionH || !imageW || !imageH) return null
  const a = sectionW / sectionH
  const b = imageW / imageH
  return Math.abs(a - b) / a < 0.02
}

function readImageSize(url: string): Promise<{ width: number; height: number } | null> {
  if (!url || typeof window === 'undefined') return Promise.resolve(null)
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => resolve(null)
    img.src = url
  })
}

function FitToggle({
  value,
  onChange,
}: {
  value: HeroObjectFit
  onChange: (fit: HeroObjectFit) => void
}) {
  return (
    <div className="inline-flex rounded-none border border-white/20 bg-black/55 p-0.5 backdrop-blur-sm">
      {(['fill', 'fit'] as const).map((fit) => (
        <button
          key={fit}
          type="button"
          className={cn(
            'h-7 rounded-none px-2 text-[11px] font-medium capitalize transition-colors',
            value === fit ? 'bg-white text-[#111] shadow-sm' : 'text-white/80 hover:text-white',
          )}
          onClick={(e) => {
            e.stopPropagation()
            onChange(fit)
          }}
        >
          {fit}
        </button>
      ))}
    </div>
  )
}

function defaultLayouts(): { desktop: HeroSlideLayout; mobile: HeroSlideLayout } {
  return {
    desktop: JSON.parse(JSON.stringify(DEFAULT_LAYOUT.desktop)),
    mobile: JSON.parse(JSON.stringify(DEFAULT_LAYOUT.mobile)),
  }
}

function newSlide(): HeroSlide {
  const layouts = defaultLayouts()
  return {
    id: `hero-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    enabled: true,
    brandLogo: '',
    productImage: '',
    title: 'New banner',
    subtitle: '',
    href: '/',
    titleColor: DEFAULT_TITLE_COLOR,
    subtitleColor: DEFAULT_SUBTITLE_COLOR,
    objectFit: 'fill',
    imageWidth: null,
    imageHeight: null,
    ...layouts,
  }
}

function SortableBannerRow({
  slide,
  index,
  expanded,
  onToggle,
  onUpdate,
  onRemove,
  onDuplicate,
  onToggleHidden,
}: {
  slide: HeroSlide
  index: number
  expanded: boolean
  onToggle: () => void
  onUpdate: (patch: Partial<HeroSlide>) => void
  onRemove: () => void
  onDuplicate: () => void
  onToggleHidden: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slide.id,
  })
  const preview = slide.productImage || ''
  const fit = slide.objectFit ?? 'fill'
  const isHidden = slide.enabled === false
  const sectionRatio = formatRatio(SECTION_W, SECTION_H)
  const imageLabel =
    slide.imageWidth && slide.imageHeight
      ? `${slide.imageWidth} × ${slide.imageHeight} px`
      : '—'
  const imageRatio =
    slide.imageWidth && slide.imageHeight
      ? formatRatio(slide.imageWidth, slide.imageHeight)
      : '—'
  const match = ratiosMatch(SECTION_W, SECTION_H, slide.imageWidth, slide.imageHeight)

  useEffect(() => {
    let cancelled = false
    if (!preview) return
    if (slide.imageWidth && slide.imageHeight) return
    void readImageSize(preview).then((size) => {
      if (cancelled || !size) return
      onUpdate({ imageWidth: size.width, imageHeight: size.height })
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview])

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'overflow-hidden rounded-none border border-[#e5e5e5] bg-white',
        isDragging && 'z-10 opacity-90 shadow-md ring-1 ring-[#bd2026]/40',
        expanded && 'border-[#bd2026]/40',
        isHidden && 'opacity-60',
      )}
    >
      <div className="flex items-stretch gap-1 p-1.5">
        <button
          type="button"
          className="inline-flex shrink-0 touch-none items-center px-0.5 text-[#888] hover:text-[#222]"
          aria-label={`Drag banner ${index + 1}`}
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
          <div className="relative h-12 w-[84px] shrink-0 overflow-hidden rounded-none border border-[#e5e5e5] bg-[#f5f5f7]">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                className={cn('h-full w-full', fit === 'fit' ? 'object-contain' : 'object-cover')}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] text-[#999]">Empty</div>
            )}
          </div>
          <div className="min-w-0 flex-1 py-0.5">
            <p className="truncate text-[12px] font-medium text-[#222]">
              Banner {index + 1}
              {isHidden ? (
                <span className="ml-1.5 text-[10px] font-normal text-[#888]">(hidden)</span>
              ) : null}
            </p>
            <p className="truncate text-[10px] text-[#888]">{slide.href || 'No link'}</p>
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
          className="inline-flex shrink-0 items-center justify-center rounded-none px-1.5 text-[#888] hover:bg-[#f5f5f7] hover:text-[#222]"
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
          <div
            className="relative overflow-hidden rounded-none border border-[#e5e5e5] bg-[#f5f5f7]"
            style={{ aspectRatio: `${SECTION_W} / ${SECTION_H}` }}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt={slide.title || `Banner ${index + 1}`}
                className={cn('h-full w-full', fit === 'fit' ? 'object-contain' : 'object-cover')}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[12px] text-[#999]">No image</div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/25" />
            <div className="absolute left-2 top-2 z-[2]">
              <label
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-none border border-white/20 bg-black/55 text-white backdrop-blur-sm hover:bg-black/70"
                title="Change image URL below, or paste path"
              >
                <ImageUp className="h-3.5 w-3.5" />
              </label>
            </div>
            <div className="absolute right-2 top-2 z-[2]">
              <FitToggle value={fit} onChange={(objectFit) => onUpdate({ objectFit })} />
            </div>
          </div>

          <div className="space-y-1.5 rounded-none bg-[#f5f5f7] px-2.5 py-2 text-[11px] leading-snug">
            <div className="grid grid-cols-2 gap-2 text-[#666]">
              <div>
                <p className="font-medium text-[#222]">Section</p>
                <p>
                  {SECTION_W} × {SECTION_H} px
                </p>
                <p>
                  Ratio <span className="font-medium text-[#222]">{sectionRatio}</span>
                </p>
              </div>
              <div>
                <p className="font-medium text-[#222]">Image</p>
                <p>{imageLabel}</p>
                <p>
                  Ratio <span className="font-medium text-[#222]">{imageRatio}</span>
                </p>
              </div>
            </div>
            {match === false ? (
              <p className="text-[#bd2026]">
                Image {imageRatio} ≠ section {sectionRatio} — Fill crops · Fit letterbox
              </p>
            ) : match === true ? (
              <p className="text-emerald-700">Image ratio matches section</p>
            ) : (
              <p className="text-[#888]">Set a product image to compare ratios</p>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">Product / banner image</label>
              <input
                value={slide.productImage}
                onChange={(e) => {
                  const productImage = e.target.value
                  onUpdate({ productImage, imageWidth: null, imageHeight: null })
                  void readImageSize(productImage).then((size) => {
                    if (size) onUpdate({ productImage, imageWidth: size.width, imageHeight: size.height })
                  })
                }}
                className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
                placeholder="/images/..."
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">Brand logo</label>
              <input
                value={slide.brandLogo}
                onChange={(e) => onUpdate({ brandLogo: e.target.value })}
                className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">Title</label>
              <input
                value={slide.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">Subtitle</label>
              <input
                value={slide.subtitle}
                onChange={(e) => onUpdate({ subtitle: e.target.value })}
                className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">Link</label>
              <input
                value={slide.href}
                onChange={(e) => onUpdate({ href: e.target.value })}
                className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function HeroDrawer({ open, value, onChange, onClose, onBack }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(value.slides[0]?.id ?? null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const ids = useMemo(() => value.slides.map((s) => s.id), [value.slides])

  if (!open) return null

  const patchSlide = (id: string, patch: Partial<HeroSlide>) => {
    onChange({
      ...value,
      slides: value.slides.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = value.slides.findIndex((s) => s.id === String(active.id))
    const newIndex = value.slides.findIndex((s) => s.id === String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    onChange({ ...value, slides: arrayMove(value.slides, oldIndex, newIndex) })
  }

  return (
    <aside className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-[420px] flex-col border-l border-[#e5e5e5] bg-[#eceff3] shadow-xl">
      <DrawerHeader title="Hero slider" onClose={onClose} onBack={onBack} />

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <label className="flex items-center gap-2 text-[13px] text-[#333]">
          <input
            type="checkbox"
            checked={value.enabled !== false}
            onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
          />
          Section enabled
        </label>

        <div className="grid grid-cols-1 gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#555]">Desktop background</label>
            <input
              value={value.bgDesktop || ''}
              onChange={(e) => onChange({ ...value, bgDesktop: e.target.value })}
              className="h-8 w-full rounded-none border border-[#ddd] bg-white px-2 text-[12px]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#555]">Mobile background</label>
            <input
              value={value.bgMobile || ''}
              onChange={(e) => onChange({ ...value, bgMobile: e.target.value })}
              className="h-8 w-full rounded-none border border-[#ddd] bg-white px-2 text-[12px]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
              Banners · drag · duplicate · eye hide
            </p>
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1 rounded-none border border-[#ddd] bg-white px-2 text-[11px] font-semibold text-[#333]"
              onClick={() => {
                const slide = newSlide()
                onChange({ ...value, slides: [...value.slides, slide] })
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
                {value.slides.map((slide, index) => (
                  <SortableBannerRow
                    key={slide.id}
                    slide={slide}
                    index={index}
                    expanded={expandedId === slide.id}
                    onToggle={() => setExpandedId((id) => (id === slide.id ? null : slide.id))}
                    onUpdate={(patch) => patchSlide(slide.id, patch)}
                    onRemove={() =>
                      onChange({
                        ...value,
                        slides: value.slides.filter((s) => s.id !== slide.id),
                      })
                    }
                    onDuplicate={() => {
                      const copy: HeroSlide = {
                        ...JSON.parse(JSON.stringify(slide)),
                        id: `hero-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
                        title: `${slide.title || 'Banner'} copy`,
                      }
                      const idx = value.slides.findIndex((s) => s.id === slide.id)
                      const slides = [...value.slides]
                      slides.splice(idx + 1, 0, copy)
                      onChange({ ...value, slides })
                      setExpandedId(copy.id)
                    }}
                    onToggleHidden={() => patchSlide(slide.id, { enabled: slide.enabled === false })}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </aside>
  )
}

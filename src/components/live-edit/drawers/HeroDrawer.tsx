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
import { ChevronDown, Copy, Eye, EyeOff, GripVertical, Plus, Settings, Trash2 } from 'lucide-react'
import type { HeroSection, HeroSlide, HeroSlideLayout } from '@/lib/live-edit/homepage'
import { DEFAULT_LAYOUT, DEFAULT_SUBTITLE_COLOR, DEFAULT_TITLE_COLOR } from '@/lib/heroSliderStore'
import type { Device } from '@/lib/heroSliderStore'
import { DrawerHeader } from '@/components/live-edit/drawers/DrawerHeader'
import HeroLayerDrawer, { type HeroLayerPart } from '@/components/live-edit/drawers/HeroLayerDrawer'
import ImageField from '@/components/live-edit/drawers/ImageField'

type Props = {
  open: boolean
  value: HeroSection
  onChange: (next: HeroSection) => void
  onClose: () => void
  onBack?: () => void
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

/** Opens the stacked layer drawer for one of a slide's three layers. */
function GearButton({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-none border border-[#ddd] bg-white text-[#777] hover:border-[#bd2026] hover:text-[#bd2026]"
    >
      <Settings className="h-3.5 w-3.5" />
    </button>
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
  onOpenLayer,
}: {
  slide: HeroSlide
  index: number
  expanded: boolean
  onToggle: () => void
  onUpdate: (patch: Partial<HeroSlide>) => void
  onRemove: () => void
  onDuplicate: () => void
  onToggleHidden: () => void
  onOpenLayer: (part: HeroLayerPart) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slide.id,
  })
  const preview = slide.productImage || ''
  const isHidden = slide.enabled === false

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
              <img src={preview} alt="" className="h-full w-full object-contain" />
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
          className="inline-flex shrink-0 items-center justify-center rounded-none px-1.5 text-[#888] hover:bg-[#f5f5f7] hover:text-[#bd2026]"
          title="Layer settings — logo, text & product image"
          onClick={(e) => {
            e.stopPropagation()
            onOpenLayer('logo')
          }}
        >
          <Settings className="h-3.5 w-3.5" />
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
          <ImageField
            label="Product / banner image"
            value={slide.productImage}
            hint="Cut-out PNG with a transparent background works best."
            onChange={(productImage) => onUpdate({ productImage })}
            action={
              <GearButton
                onClick={() => onOpenLayer('product')}
                title="Product image — z-index, size & position"
              />
            }
          />
          <ImageField
            label="Brand logo"
            value={slide.brandLogo}
            hint="Transparent PNG or SVG works best."
            boxClass="h-12 w-12"
            onChange={(brandLogo) => onUpdate({ brandLogo })}
            action={
              <GearButton
                onClick={() => onOpenLayer('logo')}
                title="Brand logo — z-index, size & position"
              />
            }
          />
          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="text-[11px] font-semibold text-[#555]">Title</label>
              <GearButton
                onClick={() => onOpenLayer('text')}
                title="Text — z-index, size, position & colour"
              />
            </div>
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
      ) : null}
    </div>
  )
}

export default function HeroDrawer({ open, value, onChange, onClose, onBack }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(value.slides[0]?.id ?? null)
  /** Which layer the stacked gear drawer is editing, if any. */
  const [layerTarget, setLayerTarget] = useState<{ slideId: string; part: HeroLayerPart } | null>(null)
  const [layerDevice, setLayerDevice] = useState<Device>('desktop')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const ids = useMemo(() => value.slides.map((s) => s.id), [value.slides])

  const layerSlideIndex = layerTarget
    ? value.slides.findIndex((s) => s.id === layerTarget.slideId)
    : -1
  const layerSlide = layerSlideIndex >= 0 ? value.slides[layerSlideIndex] : null

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
    <>
      <aside className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-[420px] flex-col border-l border-[#e5e5e5] bg-[#eceff3] shadow-xl">
        <DrawerHeader title="Hero slider" onClose={onClose} onBack={onBack} />

        <div className="thin-scroll-gray min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <label className="flex items-center gap-2 text-[13px] text-[#333]">
            <input
              type="checkbox"
              checked={value.enabled !== false}
              onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
            />
            Section enabled
          </label>

          <div className="grid grid-cols-1 gap-3">
            <ImageField
              label="Desktop background"
              value={value.bgDesktop || ''}
              hint="Shared behind every banner. 1350 × 600 (2.25:1) artwork."
              boxClass="h-12 w-[108px]"
              onChange={(bgDesktop) => onChange({ ...value, bgDesktop })}
            />
            <ImageField
              label="Mobile background"
              value={value.bgMobile || ''}
              hint="Square artwork. Leave empty to reuse the desktop background."
              boxClass="h-12 w-12"
              onChange={(bgMobile) => onChange({ ...value, bgMobile })}
            />
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
                      onOpenLayer={(part) => {
                        setExpandedId(slide.id)
                        setLayerTarget({ slideId: slide.id, part })
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </aside>

      {layerSlide && layerTarget ? (
        <HeroLayerDrawer
          slide={layerSlide}
          index={layerSlideIndex}
          part={layerTarget.part}
          onPartChange={(part) => setLayerTarget({ slideId: layerTarget.slideId, part })}
          device={layerDevice}
          onDeviceChange={setLayerDevice}
          bgDesktop={value.bgDesktop || ''}
          bgMobile={value.bgMobile || ''}
          onUpdate={(patch) => patchSlide(layerTarget.slideId, patch)}
          onBack={() => setLayerTarget(null)}
          onClose={() => {
            setLayerTarget(null)
            onClose()
          }}
        />
      ) : null}
    </>
  )
}

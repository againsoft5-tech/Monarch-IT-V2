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
import type { BrandItem, BrandsSection } from '@/lib/live-edit/homepage'
import {
  DEMO_BRANDS,
  demoBrandById,
  demoBrandByName,
} from '@/lib/live-edit/demo-brands'
import { DrawerHeader } from '@/components/live-edit/drawers/DrawerHeader'

type Props = {
  open: boolean
  value: BrandsSection
  onChange: (next: BrandsSection) => void
  onClose: () => void
  onBack?: () => void
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function ensureItemId(item: BrandItem, index: number): BrandItem {
  if (item.id) return item
  return { ...item, id: `brand-row-${index}-${item.brandId || item.name || 'x'}` }
}

function SortableBrandRow({
  item,
  index,
  expanded,
  usedIds,
  onToggle,
  onUpdate,
  onRemove,
  onDuplicate,
  onToggleHidden,
}: {
  item: BrandItem
  index: number
  expanded: boolean
  usedIds: Set<string>
  onToggle: () => void
  onUpdate: (patch: Partial<BrandItem>) => void
  onRemove: () => void
  onDuplicate: () => void
  onToggleHidden: () => void
}) {
  const rowId = item.id || `row-${index}`
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: rowId,
  })
  const isHidden = Boolean(item.hidden)
  const selected = demoBrandById(item.brandId) || demoBrandByName(item.name)
  const summary = selected?.name || item.name || 'No brand'

  const options = DEMO_BRANDS.filter((b) => b.id === item.brandId || !usedIds.has(b.id))

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
          aria-label={`Drag brand ${index + 1}`}
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
          <div className="relative flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-none border border-[#e5e5e5] bg-[#f5f5f7]">
            {item.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.logo} alt="" className="max-h-full max-w-full object-contain p-1" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 py-0.5">
            <p className="truncate text-[12px] font-medium text-[#222]">
              {summary}
              {isHidden ? (
                <span className="ml-1.5 text-[10px] font-normal text-[#888]">(hidden)</span>
              ) : null}
            </p>
            <p className="truncate text-[10px] text-[#888]">{item.href || 'No link'}</p>
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
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#555]">
              Brand (demo select — later from admin DB)
            </label>
            <select
              value={item.brandId || selected?.id || ''}
              onChange={(e) => {
                const brand = demoBrandById(e.target.value)
                if (!brand) {
                  onUpdate({ brandId: '', name: '', logo: '', href: '' })
                  return
                }
                onUpdate({
                  brandId: brand.id,
                  name: brand.name,
                  logo: brand.logo,
                  href: brand.href,
                })
              }}
              className="h-9 w-full rounded-none border border-[#ddd] bg-white px-2 text-[13px]"
            >
              <option value="">Select brand…</option>
              {options.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">Name override</label>
              <input
                value={item.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">Logo URL</label>
              <input
                value={item.logo}
                onChange={(e) => onUpdate({ logo: e.target.value })}
                className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">Brand URL</label>
              <input
                value={item.href}
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

export default function BrandsDrawer({ open, value, onChange, onClose, onBack }: Props) {
  const items = useMemo(
    () => (value.items ?? []).map((item, i) => ensureItemId(item, i)),
    [value.items],
  )
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id ?? null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const ids = useMemo(() => items.map((i) => i.id!), [items])
  const usedIds = useMemo(
    () => new Set(items.map((i) => i.brandId).filter(Boolean) as string[]),
    [items],
  )

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === String(active.id))
    const newIndex = items.findIndex((i) => i.id === String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    onChange({ ...value, items: arrayMove(items, oldIndex, newIndex) })
  }

  if (!open) return null

  return (
    <aside className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-[420px] flex-col border-l border-[#e5e5e5] bg-[#eceff3] shadow-xl">
      <DrawerHeader title="Brands" onClose={onClose} onBack={onBack} />

      <div className="thin-scroll-gray min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-[#555]">Title</label>
          <input
            value={value.title ?? ''}
            onChange={(e) => onChange({ ...value, title: e.target.value, items })}
            className="h-9 w-full rounded-none border border-[#ddd] bg-white px-2 text-[13px]"
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-[#555]">Subtitle</label>
          <input
            value={value.subtitle ?? ''}
            onChange={(e) => onChange({ ...value, subtitle: e.target.value, items })}
            className="h-9 w-full rounded-none border border-[#ddd] bg-white px-2 text-[13px]"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
              Brands · drag · logo · url
            </p>
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1 rounded-none border border-[#ddd] bg-white px-2 text-[11px] font-semibold text-[#333]"
              onClick={() => {
                const available = DEMO_BRANDS.find((b) => !usedIds.has(b.id))
                const row: BrandItem = available
                  ? {
                      id: `brand-row-${Date.now().toString(36)}`,
                      brandId: available.id,
                      name: available.name,
                      logo: available.logo,
                      href: available.href,
                      hidden: false,
                    }
                  : {
                      id: `brand-row-${Date.now().toString(36)}`,
                      brandId: '',
                      name: 'New brand',
                      logo: '',
                      href: '/',
                      hidden: false,
                    }
                onChange({ ...value, items: [...items, row] })
                setExpandedId(row.id!)
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
          <p className="m-0 text-[12px] text-[#777]">
            Select brands from the demo list (later from admin). Override name, logo, or URL per row.
          </p>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <SortableBrandRow
                    key={item.id}
                    item={item}
                    index={index}
                    expanded={expandedId === item.id}
                    usedIds={usedIds}
                    onToggle={() => setExpandedId(expandedId === item.id ? null : item.id!)}
                    onUpdate={(patch) =>
                      onChange({
                        ...value,
                        items: items.map((s) => (s.id === item.id ? { ...s, ...patch } : s)),
                      })
                    }
                    onRemove={() =>
                      onChange({ ...value, items: items.filter((s) => s.id !== item.id) })
                    }
                    onDuplicate={() => {
                      const copy: BrandItem = {
                        ...item,
                        id: `brand-row-${Date.now().toString(36)}`,
                        brandId: undefined,
                        name: `${item.name || 'Brand'} copy`,
                      }
                      const idx = items.findIndex((s) => s.id === item.id)
                      const next = [...items]
                      next.splice(idx + 1, 0, copy)
                      onChange({ ...value, items: next })
                      setExpandedId(copy.id!)
                    }}
                    onToggleHidden={() =>
                      onChange({
                        ...value,
                        items: items.map((s) =>
                          s.id === item.id ? { ...s, hidden: !s.hidden } : s,
                        ),
                      })
                    }
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

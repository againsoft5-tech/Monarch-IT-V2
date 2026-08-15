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
import type { CategoriesSection, CategoryItem } from '@/lib/live-edit/homepage'
import {
  DEMO_CATEGORIES,
  demoCategoryById,
  demoCategoryByName,
} from '@/lib/live-edit/demo-categories'

import { DrawerHeader } from '@/components/live-edit/drawers/DrawerHeader'

type Props = {
  open: boolean
  value: CategoriesSection
  onChange: (next: CategoriesSection) => void
  onClose: () => void
  onBack?: () => void
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function ensureItemId(item: CategoryItem, index: number): CategoryItem {
  if (item.id) return item
  return { ...item, id: `cat-row-${index}-${item.categoryId || item.name || 'x'}` }
}

function SortableCategoryRow({
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
  item: CategoryItem
  index: number
  expanded: boolean
  usedIds: Set<string>
  onToggle: () => void
  onUpdate: (patch: Partial<CategoryItem>) => void
  onRemove: () => void
  onDuplicate: () => void
  onToggleHidden: () => void
}) {
  const rowId = item.id || `row-${index}`
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: rowId,
  })
  const isHidden = Boolean(item.hidden)
  const selected = demoCategoryById(item.categoryId) || demoCategoryByName(item.name)
  const summary = selected?.name || item.name || 'No category'

  const options = DEMO_CATEGORIES.filter(
    (c) => c.id === item.categoryId || !usedIds.has(c.id),
  )

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
          aria-label={`Drag category ${index + 1}`}
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
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-none border border-[#e5e5e5] bg-[#f5f5f7]">
            {item.img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.img} alt="" className="h-full w-full object-contain" />
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
              Category (demo select — later from admin DB)
            </label>
            <select
              value={item.categoryId || selected?.id || ''}
              onChange={(e) => {
                const cat = demoCategoryById(e.target.value)
                if (!cat) {
                  onUpdate({ categoryId: '', name: '', img: '', href: '' })
                  return
                }
                onUpdate({
                  categoryId: cat.id,
                  name: cat.name,
                  img: cat.img,
                  href: cat.href,
                })
              }}
              className="h-9 w-full rounded-none border border-[#ddd] bg-white px-2 text-[13px]"
            >
              <option value="">Select category…</option>
              {options.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">Label override</label>
              <input
                value={item.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">Image URL</label>
              <input
                value={item.img}
                onChange={(e) => onUpdate({ img: e.target.value })}
                className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">Link</label>
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

export default function CategoriesDrawer({ open, value, onChange, onClose, onBack }: Props) {
  const items = useMemo(
    () =>
      (value.items ?? []).map((item, i) => {
        const matched = demoCategoryById(item.categoryId) || demoCategoryByName(item.name)
        return ensureItemId(
          {
            ...item,
            categoryId: item.categoryId || matched?.id,
          },
          i,
        )
      }),
    [value.items],
  )
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id ?? null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const ids = items.map((i) => i.id!)
  const usedIds = new Set(items.map((i) => i.categoryId).filter(Boolean) as string[])

  if (!open) return null

  const setItems = (next: CategoryItem[]) => onChange({ items: next })

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((s) => s.id === String(active.id))
    const newIndex = items.findIndex((s) => s.id === String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    setItems(arrayMove(items, oldIndex, newIndex))
  }

  return (
    <aside className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-[420px] flex-col border-l border-[#e5e5e5] bg-[#eceff3] shadow-xl">
      <DrawerHeader title="Category carousel" onClose={onClose} onBack={onBack} />

      <div className="thin-scroll-gray min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            Categories · drag · select · eye hide
          </p>
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1 rounded-none border border-[#ddd] bg-white px-2 text-[11px] font-semibold text-[#333]"
            onClick={() => {
              const free = DEMO_CATEGORIES.find((c) => !usedIds.has(c.id))
              const row: CategoryItem = {
                id: `cat-row-${Date.now().toString(36)}`,
                categoryId: free?.id,
                name: free?.name || '',
                img: free?.img || '',
                href: free?.href || '',
                hidden: false,
              }
              setItems([...items, row])
              setExpandedId(row.id!)
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item, index) => (
                <SortableCategoryRow
                  key={item.id}
                  item={item}
                  index={index}
                  expanded={expandedId === item.id}
                  usedIds={usedIds}
                  onToggle={() => setExpandedId((id) => (id === item.id ? null : item.id!))}
                  onUpdate={(patch) =>
                    setItems(items.map((row) => (row.id === item.id ? { ...row, ...patch } : row)))
                  }
                  onRemove={() => setItems(items.filter((row) => row.id !== item.id))}
                  onDuplicate={() => {
                    const copy: CategoryItem = {
                      ...item,
                      id: `cat-row-${Date.now().toString(36)}`,
                      categoryId: undefined,
                      name: `${item.name} copy`,
                    }
                    const idx = items.findIndex((r) => r.id === item.id)
                    const next = [...items]
                    next.splice(idx + 1, 0, copy)
                    setItems(next)
                    setExpandedId(copy.id!)
                  }}
                  onToggleHidden={() =>
                    setItems(
                      items.map((row) =>
                        row.id === item.id ? { ...row, hidden: !row.hidden } : row,
                      ),
                    )
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </aside>
  )
}

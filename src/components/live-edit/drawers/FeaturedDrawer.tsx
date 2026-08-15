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
import { GripVertical, Plus, Trash2 } from 'lucide-react'
import type { FeaturedSection } from '@/lib/live-edit/homepage'
import { DEMO_CATEGORIES, demoCategoryById } from '@/lib/live-edit/demo-categories'
import { productsForCategoryId } from '@/lib/live-edit/featured-products'
import { DrawerHeader } from '@/components/live-edit/drawers/DrawerHeader'

type Props = {
  open: boolean
  value: FeaturedSection
  onChange: (next: FeaturedSection) => void
  onClose: () => void
  onBack?: () => void
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function SortableCategoryTab({
  categoryId,
  index,
  onRemove,
}: {
  categoryId: string
  index: number
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: categoryId,
  })
  const cat = demoCategoryById(categoryId)
  const tab = productsForCategoryId(categoryId)
  const count = tab?.products.length ?? 0

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'flex items-center gap-2 rounded-none border border-[#e5e5e5] bg-white p-2',
        isDragging && 'z-10 opacity-90 shadow-md ring-1 ring-[#bd2026]/40',
      )}
    >
      <button
        type="button"
        className="inline-flex shrink-0 touch-none items-center px-0.5 text-[#888] hover:text-[#222]"
        aria-label={`Drag category ${index + 1}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 cursor-grab active:cursor-grabbing" />
      </button>

      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-none border border-[#e5e5e5] bg-[#f5f5f7]">
        {cat?.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cat.img} alt="" className="h-full w-full object-contain" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[#222]">{cat?.name || categoryId}</p>
        <p className="m-0 text-[11px] text-[#888]">
          {count > 0 ? `${count} products` : 'No products yet'}
        </p>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-[#eee] text-[#888] hover:border-[#bd2026] hover:text-[#bd2026]"
        aria-label="Remove category"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export default function FeaturedDrawer({ open, value, onChange, onClose, onBack }: Props) {
  const categoryIds = value.categoryIds ?? []
  const [addId, setAddId] = useState('')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const available = useMemo(
    () => DEMO_CATEGORIES.filter((c) => !categoryIds.includes(c.id)),
    [categoryIds],
  )

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = categoryIds.findIndex((id) => id === String(active.id))
    const newIndex = categoryIds.findIndex((id) => id === String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    onChange({ ...value, categoryIds: arrayMove(categoryIds, oldIndex, newIndex) })
  }

  if (!open) return null

  return (
    <aside className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-[420px] flex-col border-l border-[#e5e5e5] bg-[#eceff3] shadow-xl">
      <DrawerHeader title="Most Wanted" onClose={onClose} onBack={onBack} />

      <div className="thin-scroll-gray min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-[#555]">Title</label>
          <input
            value={value.title ?? ''}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            className="h-9 w-full rounded-none border border-[#ddd] bg-white px-2 text-[13px]"
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-semibold text-[#555]">Subtitle</label>
          <input
            value={value.subtitle ?? ''}
            onChange={(e) => onChange({ ...value, subtitle: e.target.value })}
            className="h-9 w-full rounded-none border border-[#ddd] bg-white px-2 text-[13px]"
          />
        </div>

        <div className="space-y-2">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            Categories · tabs · products
          </p>
          <p className="m-0 text-[12px] text-[#777]">
            Pick categories below. The section tabs cycle through them and show that category&apos;s
            products.
          </p>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={categoryIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {categoryIds.map((id, index) => (
                  <SortableCategoryTab
                    key={id}
                    categoryId={id}
                    index={index}
                    onRemove={() =>
                      onChange({
                        ...value,
                        categoryIds: categoryIds.filter((x) => x !== id),
                      })
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {categoryIds.length === 0 ? (
            <p className="rounded-none border border-dashed border-[#ccc] bg-white px-3 py-4 text-center text-[12px] text-[#888]">
              No categories yet — add one to show products.
            </p>
          ) : null}

          <div className="flex items-stretch gap-2">
            <select
              value={addId}
              onChange={(e) => setAddId(e.target.value)}
              className="h-9 min-w-0 flex-1 rounded-none border border-[#ddd] bg-white px-2 text-[13px]"
              disabled={available.length === 0}
            >
              <option value="">
                {available.length === 0 ? 'All categories added' : 'Select category…'}
              </option>
              {available.map((c) => {
                const count = productsForCategoryId(c.id)?.products.length ?? 0
                return (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {count > 0 ? ` (${count})` : ' (empty)'}
                  </option>
                )
              })}
            </select>
            <button
              type="button"
              disabled={!addId}
              className="inline-flex h-9 items-center gap-1 rounded-none border border-[#ddd] bg-white px-3 text-[12px] font-semibold text-[#333] disabled:opacity-40"
              onClick={() => {
                if (!addId) return
                onChange({ ...value, categoryIds: [...categoryIds, addId] })
                setAddId('')
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}

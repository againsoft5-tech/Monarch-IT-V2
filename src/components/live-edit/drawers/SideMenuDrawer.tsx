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
import { ChevronDown, Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react'
import type { SideMenuItem, SideMenuSection } from '@/lib/live-edit/homepage'
import { DrawerHeader } from '@/components/live-edit/drawers/DrawerHeader'

type Props = {
  open: boolean
  value: SideMenuSection
  onChange: (next: SideMenuSection) => void
  onClose: () => void
  onBack?: () => void
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function newItem(): SideMenuItem {
  return {
    id: `sm-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    label: 'New item',
    icon: '/images/catalog/view/theme/default/image/svg/fire-black-icon.svg',
    href: '/',
    action: 'link',
    active: false,
    hidden: false,
    showOnMobile: true,
  }
}

function SortableItemRow({
  item,
  index,
  expanded,
  onToggle,
  onUpdate,
  onRemove,
}: {
  item: SideMenuItem
  index: number
  expanded: boolean
  onToggle: () => void
  onUpdate: (patch: Partial<SideMenuItem>) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'rounded-none border border-[#e5e5e5] bg-white',
        isDragging && 'z-10 opacity-90 shadow-md ring-1 ring-[#bd2026]/40',
        item.hidden && 'opacity-60',
      )}
    >
      <div className="flex items-stretch gap-1 p-1.5">
        <button
          type="button"
          className="inline-flex shrink-0 touch-none items-center px-0.5 text-[#888]"
          aria-label={`Drag item ${index + 1}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 cursor-grab active:cursor-grabbing" />
        </button>
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={onToggle}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-none border border-[#eee] bg-[#f5f5f7]">
            {item.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.icon} alt="" className="h-5 w-5 object-contain" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-[#222]">{item.label}</p>
            <p className="truncate text-[10px] text-[#888]">{item.href || '#'}</p>
          </div>
          <ChevronDown
            className={cn('h-4 w-4 text-[#888] transition-transform', expanded && 'rotate-180')}
          />
        </button>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center text-[#666]"
          onClick={() => onUpdate({ hidden: !item.hidden })}
        >
          {item.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center text-[#888] hover:text-[#bd2026]"
          onClick={onRemove}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {expanded ? (
        <div className="space-y-2 border-t border-[#eee] px-2.5 py-2.5">
          {(
            [
              ['label', 'Label'],
              ['icon', 'Icon URL'],
              ['href', 'Link URL'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">{label}</label>
              <input
                value={item[key] ?? ''}
                onChange={(e) => onUpdate({ [key]: e.target.value })}
                className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
              />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#555]">Action</label>
            <select
              value={item.action === 'chat' ? 'chat' : 'link'}
              onChange={(e) =>
                onUpdate({ action: e.target.value === 'chat' ? 'chat' : 'link' })
              }
              className="h-8 w-full rounded-none border border-[#ddd] bg-white px-2 text-[12px]"
            >
              <option value="link">Open link</option>
              <option value="chat">Open chat widget</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-[12px] text-[#333]">
            <input
              type="checkbox"
              checked={Boolean(item.active)}
              onChange={(e) => onUpdate({ active: e.target.checked })}
            />
            Highlighted (active style)
          </label>
          <label className="flex items-center gap-2 text-[12px] text-[#333]">
            <input
              type="checkbox"
              checked={item.showOnMobile !== false}
              onChange={(e) => onUpdate({ showOnMobile: e.target.checked })}
            />
            Eligible for mobile bar
          </label>
        </div>
      ) : null}
    </div>
  )
}

export default function SideMenuDrawer({ open, value, onChange, onClose, onBack }: Props) {
  const items = value.items ?? []
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id ?? null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const ids = useMemo(() => items.map((i) => i.id), [items])

  const mobileEligible = useMemo(
    () => items.filter((i) => !i.hidden && i.showOnMobile !== false),
    [items],
  )
  const mobileIds = (value.mobileIds ?? []).filter((id) =>
    mobileEligible.some((i) => i.id === id),
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
      <DrawerHeader eyebrow="Chrome" title="Side menu" onClose={onClose} onBack={onBack} />

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div className="space-y-2 rounded-none border border-[#e5e5e5] bg-white p-3">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">Logo</p>
          <div className="flex h-14 items-center justify-center rounded-none border border-[#eee] bg-[#f5f5f7]">
            {value.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value.logo} alt="" className="h-9 w-auto object-contain" />
            ) : (
              <span className="text-[11px] text-[#999]">No logo</span>
            )}
          </div>
          {(
            [
              ['logo', 'Logo URL'],
              ['logoHref', 'Logo link'],
              ['logoAlt', 'Alt text'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">{label}</label>
              <input
                value={value[key] ?? ''}
                onChange={(e) => onChange({ ...value, [key]: e.target.value })}
                className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
              Desktop icons · drag · link
            </p>
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1 rounded-none border border-[#ddd] bg-white px-2 text-[11px] font-semibold"
              onClick={() => {
                const row = newItem()
                onChange({
                  ...value,
                  items: [...items, row],
                  mobileIds: [...(value.mobileIds ?? []), row.id],
                })
                setExpandedId(row.id)
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
                  <SortableItemRow
                    key={item.id}
                    item={item}
                    index={index}
                    expanded={expandedId === item.id}
                    onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    onUpdate={(patch) =>
                      onChange({
                        ...value,
                        items: items.map((s) => (s.id === item.id ? { ...s, ...patch } : s)),
                      })
                    }
                    onRemove={() =>
                      onChange({
                        ...value,
                        items: items.filter((s) => s.id !== item.id),
                        mobileIds: (value.mobileIds ?? []).filter((id) => id !== item.id),
                      })
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="space-y-2 rounded-none border border-[#e5e5e5] bg-white p-3">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            Mobile bottom bar order
          </p>
          <p className="m-0 text-[12px] text-[#777]">
            Toggle checkboxes to include icons on mobile. Order top → left-to-right.
          </p>
          <div className="space-y-1.5">
            {mobileEligible.map((item) => {
              const checked = mobileIds.includes(item.id)
              return (
                <label
                  key={item.id}
                  className="flex items-center gap-2 rounded-none border border-[#eee] px-2 py-1.5 text-[12px]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...mobileIds, item.id]
                        : mobileIds.filter((id) => id !== item.id)
                      onChange({ ...value, mobileIds: next })
                    }}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.icon} alt="" className="h-4 w-4 object-contain" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {checked ? (
                    <span className="text-[10px] text-[#888]">#{mobileIds.indexOf(item.id) + 1}</span>
                  ) : null}
                </label>
              )
            })}
          </div>
          {mobileIds.length > 1 ? (
            <div className="flex flex-wrap gap-1 pt-1">
              {mobileIds.map((id, i) => (
                <button
                  key={id}
                  type="button"
                  className="rounded-none border border-[#ddd] bg-[#fafafa] px-2 py-1 text-[10px] font-semibold"
                  title="Move earlier"
                  onClick={() => {
                    if (i === 0) return
                    const next = [...mobileIds]
                    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
                    onChange({ ...value, mobileIds: next })
                  }}
                >
                  ← {items.find((x) => x.id === id)?.label || id}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  )
}

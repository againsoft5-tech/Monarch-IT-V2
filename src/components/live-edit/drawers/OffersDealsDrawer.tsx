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
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, Copy, Eye, EyeOff, GripVertical, Plus, Search, Trash2, X } from 'lucide-react'
import { DrawerHeader } from '@/components/live-edit/drawers/DrawerHeader'
import ImageField from '@/components/live-edit/drawers/ImageField'
import { DrawerResizeHandle, useResizableDrawer } from '@/components/live-edit/useResizableDrawer'
import type { OffersPageContent, OffersTab } from '@/lib/live-edit/offers-page'
import { newTabId } from '@/lib/live-edit/offers-page'
import {
  offersCategoryOptions,
  offersProductBySlug,
  productsForTab,
  searchOffersProducts,
} from '@/lib/live-edit/offers-catalog'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

type Props = {
  open: boolean
  value: OffersPageContent
  onChange: (next: OffersPageContent) => void
  onClose: () => void
  onBack?: () => void
}

function SortableTabRow({
  tab,
  index,
  expanded,
  resolvedCount,
  onToggle,
  onUpdate,
  onRemove,
  onDuplicate,
  onToggleHidden,
}: {
  tab: OffersTab
  index: number
  expanded: boolean
  resolvedCount: number
  onToggle: () => void
  onUpdate: (patch: Partial<OffersTab>) => void
  onRemove: () => void
  onDuplicate: () => void
  onToggleHidden: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tab.id,
  })
  const [query, setQuery] = useState('')

  const categories = useMemo(() => offersCategoryOptions(), [])
  const results = useMemo(() => searchOffersProducts(query, 12), [query])
  const isHidden = tab.hidden === true

  const availableCategories = categories.filter((c) => !tab.categorySlugs.includes(c.slug))

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
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
          aria-label={`Drag tab ${index + 1}`}
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
            {tab.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tab.icon} alt="" className="h-full w-full object-contain" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 py-0.5">
            <p className="truncate text-[12px] font-medium text-[#222]">
              {tab.label || 'Untitled tab'}
              {isHidden ? <span className="ml-1.5 text-[10px] font-normal text-[#888]">(hidden)</span> : null}
            </p>
            <p className="truncate text-[10px] text-[#888]">
              {tab.panel === 'coupons' ? (
            <p className="m-0 text-[11px] leading-snug text-[#777]">
              This tab lists every product carrying a live coupon. Coupons are managed in
              Admin → Coupons, so there is nothing to pick here.
            </p>
          ) : tab.panel === 'bundles' ? (
                'Bundles module'
              ) : (
                <>
                  {tab.showAll
                    ? 'All deals'
                    : `${tab.categorySlugs.length} cat · ${tab.productSlugs.length} picked`}
                  {` · ${resolvedCount} products`}
                </>
              )}
            </p>
          </div>
          <ChevronDown
            className={cn('h-4 w-4 shrink-0 text-[#888] transition-transform', expanded && 'rotate-180')}
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
        <div className="space-y-2.5 border-t border-[#eee] px-2.5 py-2.5">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#555]">Tab name</label>
            <input
              type="text"
              value={tab.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
            />
          </div>

          <ImageField
            label="Icon — inactive (grey)"
            value={tab.icon}
            folder="deal-tabs"
            boxClass="h-12 w-12"
            hint="Square SVG or PNG. Shown when the tab is not selected."
            onChange={(icon) => onUpdate({ icon })}
          />
          <ImageField
            label="Icon — active / hover (red)"
            value={tab.iconActive}
            folder="deal-tabs"
            boxClass="h-12 w-12"
            hint="Same artwork in the selected colour — the chip crossfades to this."
            onChange={(iconActive) => onUpdate({ iconActive })}
          />

          <div>
            <p className="m-0 mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
              Panel
            </p>
            <div className="flex gap-1.5">
              {([
                { key: 'grid', label: 'Product grid' },
                { key: 'bundles', label: 'Bundles module' },
                { key: 'coupons', label: 'Coupon products' },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onUpdate({ panel: opt.key })}
                  aria-pressed={(tab.panel ?? 'grid') === opt.key}
                  className={cn(
                    'flex-1 rounded-none border px-1.5 py-1.5 text-[11.5px] font-medium transition-colors',
                    (tab.panel ?? 'grid') === opt.key
                      ? 'border-[#c3272b] bg-[#c3272b] text-white'
                      : 'border-[#e5e5e5] bg-white text-[#555] hover:border-[#c3272b]',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {tab.panel === 'coupons' ? (
            <p className="m-0 text-[11px] leading-snug text-[#777]">
              This tab lists every product carrying a live coupon. Coupons are managed in
              Admin → Coupons, so there is nothing to pick here.
            </p>
          ) : tab.panel === 'bundles' ? (
            <p className="m-0 text-[11px] leading-snug text-[#777]">
              This tab shows the Bundles module — ready bundles and Build Your Own Bundle. Its
              contents come from Admin → Bundles, so there is nothing to pick here.
            </p>
          ) : (
            <>
          <label className="flex items-center gap-2 text-[13px] text-[#333]">
            <input
              type="checkbox"
              checked={tab.showAll === true}
              onChange={(e) => onUpdate({ showAll: e.target.checked })}
            />
            Show all deals (aggregates every other tab)
          </label>

          {tab.showAll ? (
            <p className="m-0 text-[11px] leading-snug text-[#777]">
              This tab collects the products of all other visible tabs, so you don’t have to maintain the
              same list twice.
            </p>
          ) : (
            <>
              <div>
                <p className="m-0 mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
                  By category
                </p>
                {tab.categorySlugs.length ? (
                  <div className="mb-1.5 flex flex-wrap gap-1">
                    {tab.categorySlugs.map((slug) => {
                      const cat = categories.find((c) => c.slug === slug)
                      return (
                        <span
                          key={slug}
                          className="inline-flex items-center gap-1 rounded-none border border-[#ddd] bg-[#fafafa] px-1.5 py-1 text-[11px] text-[#333]"
                        >
                          {cat?.name ?? slug}
                          <button
                            type="button"
                            title="Remove category"
                            onClick={() =>
                              onUpdate({ categorySlugs: tab.categorySlugs.filter((s) => s !== slug) })
                            }
                            className="text-[#888] hover:text-[#bd2026]"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                ) : null}
                <select
                  value=""
                  disabled={availableCategories.length === 0}
                  onChange={(e) => {
                    if (!e.target.value) return
                    onUpdate({ categorySlugs: [...tab.categorySlugs, e.target.value] })
                  }}
                  className="h-8 w-full rounded-none border border-[#ddd] bg-white px-2 text-[12px]"
                >
                  <option value="">
                    {availableCategories.length === 0 ? 'All categories added' : 'Add category…'}
                  </option>
                  {availableCategories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name} ({c.dealCount} deals)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="m-0 mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
                  Individual products
                </p>
                {tab.productSlugs.length ? (
                  <div className="mb-1.5 space-y-1">
                    {tab.productSlugs.map((slug) => {
                      const product = offersProductBySlug(slug)
                      return (
                        <div
                          key={slug}
                          className="flex items-center gap-2 rounded-none border border-[#eee] bg-[#fafafa] px-1.5 py-1"
                        >
                          <div className="h-7 w-7 shrink-0 overflow-hidden border border-[#e5e5e5] bg-white">
                            {product?.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.image} alt="" className="h-full w-full object-contain" />
                            ) : null}
                          </div>
                          <span className="min-w-0 flex-1 truncate text-[11px] text-[#333]">
                            {product?.name ?? slug}
                          </span>
                          <button
                            type="button"
                            title="Remove product"
                            onClick={() =>
                              onUpdate({ productSlugs: tab.productSlugs.filter((s) => s !== slug) })
                            }
                            className="shrink-0 text-[#888] hover:text-[#bd2026]"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : null}

                <div className="flex h-8 items-center gap-1.5 rounded-none border border-[#ddd] bg-white px-2">
                  <Search className="h-3.5 w-3.5 shrink-0 text-[#888]" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products by name…"
                    className="h-full min-w-0 flex-1 border-0 text-[12px] outline-none"
                  />
                </div>

                {query.trim() ? (
                  <div className="thin-scroll-gray mt-1 max-h-[190px] overflow-y-auto border border-[#eee] bg-white">
                    {results.length === 0 ? (
                      <p className="m-0 px-2 py-3 text-center text-[11px] text-[#888]">No products found</p>
                    ) : (
                      results.map((product) => {
                        const already = tab.productSlugs.includes(product.slug)
                        return (
                          <button
                            key={product.slug}
                            type="button"
                            disabled={already}
                            onClick={() => {
                              onUpdate({ productSlugs: [...tab.productSlugs, product.slug] })
                              setQuery('')
                            }}
                            className="flex w-full items-center gap-2 border-b border-[#f2f2f2] px-2 py-1.5 text-left last:border-b-0 hover:bg-[#f5f5f7] disabled:opacity-40"
                          >
                            <div className="h-7 w-7 shrink-0 overflow-hidden border border-[#e5e5e5] bg-white">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={product.image} alt="" className="h-full w-full object-contain" />
                            </div>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[11px] text-[#222]">{product.name}</span>
                              <span className="block text-[10px] text-[#888]">
                                ৳{product.priceNew.toLocaleString()}
                                {product.discountPct > 0 ? ` · ${product.discountPct}% off` : ''}
                              </span>
                            </span>
                            <Plus className="h-3.5 w-3.5 shrink-0 text-[#888]" />
                          </button>
                        )
                      })
                    )}
                  </div>
                ) : null}
              </div>
            </>
          )}
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default function OffersDealsDrawer({ open, value, onChange, onClose, onBack }: Props) {
  const tabs = value.tabs
  const [expandedId, setExpandedId] = useState<string | null>(tabs[0]?.id ?? null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const resize = useResizableDrawer('monarch-offers-drawer-width')

  const counts = useMemo(
    () => new Map(tabs.map((t) => [t.id, productsForTab(t, tabs).length])),
    [tabs],
  )

  if (!open) return null

  const setTabs = (next: OffersTab[]) => onChange({ ...value, tabs: next })

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = tabs.findIndex((t) => t.id === String(active.id))
    const newIndex = tabs.findIndex((t) => t.id === String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    setTabs(arrayMove(tabs, oldIndex, newIndex))
  }

  return (
    <aside
      className={`fixed right-0 top-0 z-[80] flex h-full w-full flex-col border-l border-[#e5e5e5] bg-[#eceff3] shadow-xl ${
        resize.dragging ? 'select-none' : ''
      }`}
      style={{ maxWidth: resize.width }}
    >
      <DrawerResizeHandle
        dragging={resize.dragging}
        onPointerDown={resize.onPointerDown}
        onDoubleClick={resize.onDoubleClick}
        onKeyDown={resize.onKeyDown}
      />
      <DrawerHeader eyebrow="Offers page" title="Deals" onClose={onClose} onBack={onBack} />

      <div className="thin-scroll-gray min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div className="space-y-2">
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">Page title</label>
            <input
              type="text"
              value={value.title}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
              className="h-9 w-full rounded-none border border-[#ddd] bg-white px-2 text-[13px]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">Subtitle</label>
            <input
              type="text"
              value={value.subtitle}
              onChange={(e) => onChange({ ...value, subtitle: e.target.value })}
              className="h-9 w-full rounded-none border border-[#ddd] bg-white px-2 text-[13px]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
              Tabs · drag · select · eye hide
            </p>
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1 rounded-none border border-[#ddd] bg-white px-2 text-[11px] font-semibold text-[#333]"
              onClick={() => {
                const tab: OffersTab = {
                  id: newTabId(),
                  label: 'New tab',
                  icon: '',
                  iconActive: '',
                  categorySlugs: [],
                  productSlugs: [],
                }
                setTabs([...tabs, tab])
                setExpandedId(tab.id)
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>

          {tabs.length === 0 ? (
            <p className="rounded-none border border-dashed border-[#ccc] bg-white px-3 py-4 text-center text-[12px] text-[#888]">
              No tabs yet — add one to show deals.
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={tabs.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {tabs.map((tab, index) => (
                    <SortableTabRow
                      key={tab.id}
                      tab={tab}
                      index={index}
                      expanded={expandedId === tab.id}
                      resolvedCount={counts.get(tab.id) ?? 0}
                      onToggle={() => setExpandedId(expandedId === tab.id ? null : tab.id)}
                      onUpdate={(patch) =>
                        setTabs(tabs.map((t) => (t.id === tab.id ? { ...t, ...patch } : t)))
                      }
                      onRemove={() => setTabs(tabs.filter((t) => t.id !== tab.id))}
                      onDuplicate={() => {
                        const copy: OffersTab = {
                          ...tab,
                          id: newTabId(),
                          label: `${tab.label} copy`,
                          categorySlugs: [...tab.categorySlugs],
                          productSlugs: [...tab.productSlugs],
                        }
                        const next = [...tabs]
                        next.splice(index + 1, 0, copy)
                        setTabs(next)
                        setExpandedId(copy.id)
                      }}
                      onToggleHidden={() =>
                        setTabs(tabs.map((t) => (t.id === tab.id ? { ...t, hidden: !t.hidden } : t)))
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </aside>
  )
}

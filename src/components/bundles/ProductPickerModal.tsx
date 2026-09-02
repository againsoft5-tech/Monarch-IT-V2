'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import ProductImage from '@/components/ui/ProductImage'
import HotProductTabs, { type HotTab } from '@/components/hot/HotProductTabs'
import type { BundleProduct, CustomBundleTab } from '@/data/bundleData'

const ALL_TAB = 'all'

type SortKey = 'best' | 'price-asc' | 'price-desc'

const SORT_LABELS: Record<SortKey, string> = {
  best: 'Best Selling',
  'price-asc': 'Price: Low To High',
  'price-desc': 'Price: High To Low',
}

type Props = {
  open: boolean
  onClose: () => void
  /** Tabs to browse. Pass a single tab to show a flat list with no tab strip. */
  tabs: CustomBundleTab[]
  /** Slugs already used elsewhere in the build — shown as disabled. */
  takenSlugs?: string[]
  onPick: (product: BundleProduct) => void
  title?: string
  eyebrow?: string
}

/**
 * Single-select product chooser. Picking a product closes the dialog and hands it back,
 * so the caller decides which slot it fills — used for both bundle slots and gift slots.
 */
export default function ProductPickerModal({
  open,
  onClose,
  tabs,
  takenSlugs = [],
  onPick,
  title = 'Choose your product',
  eyebrow = 'Purchase product',
}: Props) {
  const [activeTab, setActiveTab] = useState(ALL_TAB)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('best')
  const [sortOpen, setSortOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    setActiveTab(ALL_TAB)
    setQuery('')
    setSortOpen(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  const showTabs = tabs.length > 1
  const tabStrip: HotTab[] = useMemo(
    () => [{ slug: ALL_TAB, label: 'All' }, ...tabs.map((t) => ({ slug: t.key, label: t.label }))],
    [tabs],
  )

  const products = useMemo(() => {
    const source =
      activeTab === ALL_TAB || !showTabs
        ? tabs.flatMap((t) => t.products)
        : (tabs.find((t) => t.key === activeTab)?.products ?? [])

    // The same product can be mapped into more than one tab.
    const seen = new Set<string>()
    let list = source.filter((p) => (seen.has(p.slug) ? false : (seen.add(p.slug), true)))

    const q = query.trim().toLowerCase()
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q))
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.priceNew - b.priceNew)
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.priceNew - a.priceNew)
    return list
  }, [tabs, activeTab, query, sort, showTabs])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[10020] flex items-start justify-center overflow-y-auto bg-black/40 p-3 sm:p-6">
      <button type="button" aria-label="Close" className="fixed inset-0 cursor-default" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative my-4 w-full max-w-[1180px] rounded-2xl border border-[#d32f2f]/40 bg-white shadow-2xl md:rounded-[28px]"
      >
        <div className="relative px-4 pb-3 pt-5 text-center sm:px-8">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">{eyebrow}</p>
          <h2 className="m-0 mt-1 text-xl font-bold text-gray-900 sm:text-2xl">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] text-gray-500 transition-colors hover:bg-[#ececf0] hover:text-[#d32f2f] sm:right-6"
          >
            <span className="mi text-[20px] leading-none">close</span>
          </button>
        </div>

        {showTabs ? (
          <div className="px-3 sm:px-8">
            <HotProductTabs tabs={tabStrip} active={activeTab} onChange={setActiveTab} />
          </div>
        ) : null}

        <div className="mt-4 flex justify-center px-4 sm:px-8">
          <div className="flex h-11 w-full max-w-[520px] items-center gap-2 rounded-full bg-[#f5f5f7] px-4">
            <span className="mi text-[20px] text-gray-400">search</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Products"
              className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 px-4 sm:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f7] px-4 py-2 text-[13px] font-semibold text-gray-600">
            <Image src="/images/pc-builder/icons/filter-icon.svg" alt="" width={18} height={13} />
            {products.length} products
          </span>

          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full bg-[#f5f5f7] px-3 py-2 text-[13px] text-gray-500"
            >
              <span className="mi text-[20px]">swap_vert</span>
              <span className="font-semibold">Sort By:</span> {SORT_LABELS[sort]}
            </button>
            {sortOpen ? (
              <div className="absolute right-0 top-full z-10 mt-2 w-[200px] rounded-2xl border border-gray-100 bg-white p-2 shadow-lg">
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSort(key)
                      setSortOpen(false)
                    }}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-[13px] ${
                      sort === key ? 'bg-[#f5f5f7] font-semibold text-[#d32f2f]' : 'text-gray-700'
                    }`}
                  >
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="thin-scroll-red mt-4 max-h-[58vh] overflow-y-auto px-4 pb-6 sm:px-8">
          {products.length === 0 ? (
            <p className="py-14 text-center text-[14px] text-gray-400">No products available here yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => {
                const taken = takenSlugs.includes(p.slug)
                return (
                  <div key={p.slug} className="flex flex-col">
                    <div className="flex aspect-square items-center justify-center rounded-2xl bg-[#f5f6fa] p-3">
                      <ProductImage
                        src={p.image}
                        alt={p.name}
                        width={200}
                        height={200}
                        className="h-[80%] w-[80%] object-contain"
                      />
                    </div>
                    <p className="mt-2 line-clamp-2 min-h-[2.6em] text-[13px] font-bold leading-[1.3] text-[#333]">
                      {p.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-[14px] font-bold text-[#c3272b]">
                        <span className="font-medium">৳</span>
                        <span className="font-price">{p.priceNew.toLocaleString()}</span>
                      </span>
                      {p.priceOld > p.priceNew ? (
                        <span className="text-[11px] text-gray-400 line-through">
                          ৳{p.priceOld.toLocaleString()}
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      disabled={taken}
                      onClick={() => {
                        onPick(p)
                        onClose()
                      }}
                      className="mt-2.5 h-9 rounded-full border border-[#c3272b] bg-white text-[13px] font-bold text-[#c3272b] transition-colors hover:bg-[#c3272b] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#c3272b]"
                    >
                      {taken ? 'Already added' : 'Add to bundle'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

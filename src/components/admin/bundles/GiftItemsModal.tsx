'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { catalogSample, searchCatalog } from '@/lib/bundleStore'
import { newGiftId, type BundleGiftItem } from '@/data/bundleData'

const RED = '#bd2026'

type Props = {
  /** The item being edited, or `undefined` when adding new ones. */
  editing?: BundleGiftItem
  /** Slugs already in the list, so they can't be added twice. */
  usedSlugs: string[]
  onAdd: (items: BundleGiftItem[]) => void
  onClose: () => void
}

type Mode = 'products' | 'text'

/**
 * Add / edit dialog for a tier's free-gift list.
 *
 * Two modes share one dialog because an offer may mix both: "Products" pulls
 * real catalog items (several at a time), "Text and Img" authors a custom gift
 * such as "Free T-Shirt" with its own artwork.
 */
export default function GiftItemsModal({ editing, usedSlugs, onAdd, onClose }: Props) {
  const [mode, setMode] = useState<Mode>(editing ? (editing.kind === 'text' ? 'text' : 'products') : 'products')
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<BundleGiftItem[]>([])
  const [text, setText] = useState(editing?.kind === 'text' ? editing.name : '')
  const [image, setImage] = useState(editing?.image ?? '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const results = query.trim() ? searchCatalog(query, 20) : catalogSample(20)

  const togglePick = (slug: string, name: string, img: string) => {
    setPicked((prev) => {
      const hit = prev.find((g) => g.slug === slug)
      if (hit) return prev.filter((g) => g.slug !== slug)
      // Editing swaps the one product out rather than growing the selection.
      const next: BundleGiftItem = { id: editing?.id ?? newGiftId(), kind: 'product', slug, name, image: img }
      return editing ? [next] : [...prev, next]
    })
  }

  const upload = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('folder', 'bundle-gifts')
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed')
      setImage(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const commit = () => {
    if (mode === 'products') {
      if (picked.length === 0) return
      onAdd(picked)
    } else {
      const name = text.trim()
      if (!name) return
      onAdd([{ id: editing?.id ?? newGiftId(), kind: 'text', name, image: image.trim() || undefined }])
    }
    onClose()
  }

  const canCommit = mode === 'products' ? picked.length > 0 : text.trim().length > 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={editing ? 'Edit gift item' : 'Add gift item'}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="m-0 text-[15px] font-bold text-gray-900">
            {editing ? 'Edit gift item' : 'Add gift item'}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700" aria-label="Close">
            <span className="mi text-[20px] leading-none">close</span>
          </button>
        </div>

        {/* An existing item keeps its kind — switching a product into text would
            silently drop the catalog link the storefront uses. */}
        {!editing ? (
          <div className="flex gap-2 px-5 pt-4">
            {(['products', 'text'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-full px-4 py-1.5 text-[12.5px] font-semibold ${
                  mode === m ? 'text-white' : 'bg-gray-100 text-gray-600'
                }`}
                style={mode === m ? { backgroundColor: RED } : undefined}
              >
                {m === 'products' ? 'Products' : 'Text and Img'}
              </button>
            ))}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {mode === 'products' ? (
            <>
              <p className="m-0 mb-2 text-[12px] text-gray-500">
                {editing
                  ? 'Pick the product this gift should point to.'
                  : 'Tick every product to offer — the customer picks one when the list holds more than one.'}
              </p>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products to offer…"
                className="mb-2 h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
              />
              <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-100">
                {results.length === 0 ? (
                  <p className="m-0 px-3 py-6 text-center text-[12.5px] text-gray-400">No products found.</p>
                ) : (
                  results.map((p) => {
                    const already = usedSlugs.includes(p.slug) && editing?.slug !== p.slug
                    const on = picked.some((g) => g.slug === p.slug)
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        disabled={already}
                        onClick={() => togglePick(p.slug, p.name, p.image)}
                        className={`flex w-full items-center gap-2.5 border-b border-gray-50 px-3 py-2 text-left last:border-b-0 disabled:opacity-40 ${
                          on ? 'bg-[#fdf2f3]' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span
                          className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border ${
                            on ? 'border-transparent text-white' : 'border-gray-300'
                          }`}
                          style={on ? { backgroundColor: RED } : undefined}
                        >
                          {on ? <span className="mi text-[13px] leading-none">check</span> : null}
                        </span>
                        <Image src={p.image} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                        <span className="min-w-0 flex-1 truncate text-[12.5px] text-gray-700">{p.name}</span>
                        <span className="shrink-0 text-[12px] text-gray-400">
                          ৳{p.priceNew.toLocaleString()}
                        </span>
                        {already ? <span className="shrink-0 text-[11px] text-gray-400">Added</span> : null}
                      </button>
                    )
                  })
                )}
              </div>
            </>
          ) : (
            <>
              <label className="mb-3 block">
                <span className="mb-1 block text-[12px] font-semibold text-gray-600">Gift text</span>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder='e.g. "Free T-Shirt"'
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
                />
              </label>

              <span className="mb-1 block text-[12px] font-semibold text-gray-600">Image (optional)</span>
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                  {image ? (
                    <Image src={image} alt="" width={56} height={56} className="max-h-14 max-w-14 object-contain" />
                  ) : (
                    <span className="mi text-[22px] text-gray-300">redeem</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="/uploads/… or paste a URL"
                    className="mb-2 h-9 w-full rounded-lg border border-gray-200 px-3 text-[12.5px] outline-none focus:border-gray-400"
                  />
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void upload(file)
                      e.target.value = ''
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="h-9 rounded-full border border-gray-300 px-4 text-[12.5px] font-semibold text-gray-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading…' : 'Upload image'}
                  </button>
                </div>
              </div>
              {error ? <p className="m-0 mt-2 text-[12px] text-[#bd2026]">{error}</p> : null}
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-full border border-gray-300 px-5 text-[13px] font-semibold text-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={commit}
            disabled={!canCommit}
            className="h-10 rounded-full px-6 text-[13px] font-semibold text-white disabled:opacity-40"
            style={{ backgroundColor: RED }}
          >
            {editing
              ? 'Save gift'
              : mode === 'text'
                ? 'Add gift'
                : picked.length > 0
                  ? `Add ${picked.length} ${picked.length === 1 ? 'product' : 'products'}`
                  : 'Add products'}
          </button>
        </div>
      </div>
    </div>
  )
}

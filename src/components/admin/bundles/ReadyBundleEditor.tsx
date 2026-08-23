'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import TierEditor from '@/components/admin/bundles/TierEditor'
import SaveBar from '@/components/admin/bundles/SaveBar'
import { saveReadyBundle, searchCatalog, toBundleProduct, useBundleStore } from '@/lib/bundleStore'
import {
  BUNDLE_TIER_COUNTS,
  MAX_BUNDLE_PRODUCTS,
  MIN_BUNDLE_PRODUCTS,
  computeBundlePricing,
  giftLabel,
  type ReadyBundle,
} from '@/data/bundleData'

const RED = '#bd2026'

export default function ReadyBundleEditor({ bundleId }: { bundleId: string }) {
  const { isAdminLoggedIn, adminChecked } = useAdminAuth()
  const router = useRouter()
  const db = useBundleStore()
  const [query, setQuery] = useState('')
  /** Local working copy — nothing here is public until Save. */
  const [draft, setDraft] = useState<ReadyBundle | null>(null)
  const [saved, setSaved] = useState(false)

  const stored = db.ready[bundleId]

  // Seed the draft once the store has loaded. Deliberately not re-synced afterwards:
  // overwriting the draft from the store would wipe whatever the admin is typing.
  useEffect(() => {
    if (stored && !draft) setDraft(stored)
  }, [stored, draft])

  useEffect(() => {
    if (adminChecked && !isAdminLoggedIn) router.replace('/admin/login')
  }, [adminChecked, isAdminLoggedIn, router])

  const dirty = useMemo(
    () => Boolean(draft && stored && JSON.stringify(draft) !== JSON.stringify(stored)),
    [draft, stored],
  )

  if (!adminChecked || !isAdminLoggedIn) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#eef0f3] text-[14px] text-gray-400">
        Loading...
      </div>
    )
  }

  if (!stored || !draft) {
    return (
      <div className="bundles-module min-h-full bg-[#eef0f3] px-4 py-8 lg:px-10">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 text-center">
          <p className="mb-4 text-[14px] text-gray-500">
            {stored ? 'Loading…' : 'This bundle no longer exists.'}
          </p>
          <Link href="/admin/bundles" className="font-semibold text-[#bd2026] no-underline">
            Back to bundles
          </Link>
        </div>
      </div>
    )
  }

  const patch = (next: Partial<ReadyBundle>) => {
    setDraft((d) => (d ? { ...d, ...next } : d))
    setSaved(false)
  }

  const addProduct = (slug: string) => {
    const found = searchCatalog(slug, 50).find((p) => p.slug === slug)
    if (!found) return
    setDraft((d) => {
      if (!d) return d
      if (d.products.length >= MAX_BUNDLE_PRODUCTS) return d
      if (d.products.some((p) => p.slug === slug)) return d
      return { ...d, products: [...d.products, toBundleProduct(found, d.id)] }
    })
    setSaved(false)
  }

  // Only surface the tiers this bundle can actually reach: a 2-product bundle can never
  // hit the 3- or 4-product tier, so those boxes would just be dead controls.
  const tierCounts = BUNDLE_TIER_COUNTS.filter(
    (c) => c <= Math.min(MAX_BUNDLE_PRODUCTS, Math.max(MIN_BUNDLE_PRODUCTS, draft.products.length)),
  )

  const pricing = computeBundlePricing(draft.products, draft.tiers)
  const atMax = draft.products.length >= MAX_BUNDLE_PRODUCTS
  const results = query.trim() ? searchCatalog(query, 8) : []
  const tooFew = draft.products.length < MIN_BUNDLE_PRODUCTS

  return (
    <div className="bundles-module min-h-full bg-[#eef0f3] px-4 py-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/admin/bundles"
              className="mb-1 inline-flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-700"
            >
              <span className="mi text-[16px]">arrow_back</span> Bundles
            </Link>
            <h1 className="m-0 text-xl font-bold text-gray-900">{draft.name}</h1>
          </div>
          <button
            type="button"
            onClick={() => patch({ active: !draft.active })}
            disabled={tooFew && !draft.active}
            className="h-10 rounded-full px-5 text-[13px] font-semibold text-white disabled:opacity-40"
            style={{ backgroundColor: draft.active ? '#6b7280' : RED }}
            title={tooFew ? `Add at least ${MIN_BUNDLE_PRODUCTS} products first` : undefined}
          >
            {draft.active ? 'Set to draft' : 'Set live'}
          </button>
        </div>

        {/* Setup */}
        <section className="mb-5 rounded-2xl bg-white p-5">
          <h2 className="m-0 mb-4 text-[15px] font-bold text-gray-900">Setup</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-gray-600">Bundle name</span>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => patch({ name: e.target.value })}
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-gray-600">Cover image URL (optional)</span>
              <input
                type="text"
                value={draft.image ?? ''}
                onChange={(e) => patch({ image: e.target.value })}
                placeholder="/images/..."
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-[12px] font-semibold text-gray-600">Description</span>
              <textarea
                value={draft.description ?? ''}
                onChange={(e) => patch({ description: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] outline-none focus:border-gray-400"
              />
            </label>
          </div>
        </section>

        {/* Products */}
        <section className="mb-5 rounded-2xl bg-white p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="m-0 text-[15px] font-bold text-gray-900">
              Products ({draft.products.length}/{MAX_BUNDLE_PRODUCTS})
            </h2>
            {tooFew ? (
              <span className="text-[12px] font-semibold text-[#bd2026]">
                Add at least {MIN_BUNDLE_PRODUCTS}
              </span>
            ) : null}
          </div>
          <p className="m-0 mb-4 text-[12.5px] text-gray-500">
            Search the catalog and add {MIN_BUNDLE_PRODUCTS}–{MAX_BUNDLE_PRODUCTS} products.
          </p>

          {draft.products.length > 0 ? (
            <ul className="mb-4 flex list-none flex-col gap-2 p-0">
              {draft.products.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2">
                  <Image src={p.image} alt="" width={40} height={40} className="h-10 w-10 object-contain" />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-gray-800">{p.name}</span>
                  <span className="text-[13px] font-bold text-[#c3272b]">৳{p.priceNew.toLocaleString()}</span>
                  <button
                    type="button"
                    onClick={() => patch({ products: draft.products.filter((x) => x.id !== p.id) })}
                    className="text-gray-400 hover:text-[#bd2026]"
                    aria-label={`Remove ${p.name}`}
                  >
                    <span className="mi text-[18px]">delete</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {atMax ? (
            <p className="m-0 text-[12.5px] text-gray-400">
              Maximum of {MAX_BUNDLE_PRODUCTS} products reached — remove one to add another.
            </p>
          ) : (
            <>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products to add…"
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
              />
              {results.length > 0 ? (
                <div className="mt-2 max-h-[220px] overflow-y-auto rounded-lg border border-gray-100">
                  {results.map((p) => {
                    const already = draft.products.some((x) => x.slug === p.slug)
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        disabled={already}
                        onClick={() => {
                          addProduct(p.slug)
                          setQuery('')
                        }}
                        className="flex w-full items-center gap-3 border-b border-gray-50 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50 disabled:opacity-40"
                      >
                        <Image src={p.image} alt="" width={32} height={32} className="h-8 w-8 object-contain" />
                        <span className="min-w-0 flex-1 truncate text-[13px] text-gray-700">{p.name}</span>
                        <span className="text-[12.5px] text-gray-500">৳{p.priceNew.toLocaleString()}</span>
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </>
          )}
        </section>

        {/* Tiers */}
        <section className="mb-5 rounded-2xl bg-white p-5">
          <h2 className="m-0 mb-1 text-[15px] font-bold text-gray-900">Discount &amp; Free Gift</h2>
          <TierEditor
            tiers={draft.tiers}
            counts={tierCounts}
            onChange={(tiers) => patch({ tiers })}
            hint={`This bundle holds ${draft.products.length} product${
              draft.products.length === 1 ? '' : 's'
            }, so the ${Math.max(MIN_BUNDLE_PRODUCTS, draft.products.length)}-product tier below is the one that applies.`}
          />
        </section>

        {/* Preview */}
        <section className="rounded-2xl bg-white p-5">
          <h2 className="m-0 mb-3 text-[15px] font-bold text-gray-900">Customer price</h2>
          <div className="flex flex-wrap items-center gap-4 text-[13px]">
            <span className="text-gray-500">
              Regular <b className="text-gray-700">৳{pricing.regularTotal.toLocaleString()}</b>
            </span>
            <span className="text-gray-500">
              Tier discount <b className="text-[#00a05a]">৳{pricing.tierDiscount.toLocaleString()}</b>
            </span>
            <span className="text-gray-500">
              Bundle price <b className="text-[17px] text-[#c3272b]">৳{pricing.total.toLocaleString()}</b>
            </span>
            {pricing.gift ? (
              <span className="rounded-full bg-[#e8f6ee] px-3 py-1 text-[12px] font-bold text-[#0f7a43]">
                Free gift: {giftLabel(pricing.gift)}
              </span>
            ) : null}
          </div>
        </section>
      </div>

      <SaveBar
        dirty={dirty}
        saved={saved}
        onSave={() => {
          const committed = saveReadyBundle(draft)
          if (committed) setDraft(committed)
          setSaved(true)
        }}
        onDiscard={() => {
          setDraft(stored)
          setSaved(false)
        }}
      />
    </div>
  )
}

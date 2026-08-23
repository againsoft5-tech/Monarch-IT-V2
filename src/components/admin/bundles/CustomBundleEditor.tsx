'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import TierEditor from '@/components/admin/bundles/TierEditor'
import SaveBar from '@/components/admin/bundles/SaveBar'
import { categoryProductsMap } from '@/data/categoryProducts'
import { saveCustomBundle, searchCatalog, toBundleProduct, useBundleStore } from '@/lib/bundleStore'
import {
  MAX_BUNDLE_PRODUCTS,
  MIN_BUNDLE_PRODUCTS,
  type CustomBundle,
  type CustomBundleTab,
} from '@/data/bundleData'

const RED = '#bd2026'

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function CustomBundleEditor({ bundleId }: { bundleId: string }) {
  const { isAdminLoggedIn, adminChecked } = useAdminAuth()
  const router = useRouter()
  const db = useBundleStore()
  const [activeTabKey, setActiveTabKey] = useState<string | null>(null)
  const [newTabLabel, setNewTabLabel] = useState('')
  const [query, setQuery] = useState('')
  const [importCategory, setImportCategory] = useState('')
  /** Local working copy — nothing here is public until Save. */
  const [draft, setDraft] = useState<CustomBundle | null>(null)
  const [saved, setSaved] = useState(false)

  const stored = db.custom[bundleId]

  // Seed once; re-syncing from the store would wipe in-progress edits.
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

  const patch = (next: Partial<CustomBundle>) => {
    setDraft((d) => (d ? { ...d, ...next } : d))
    setSaved(false)
  }

  const patchTab = (tabKey: string, next: Partial<CustomBundleTab>) =>
    patch({ tabs: draft.tabs.map((t) => (t.key === tabKey ? { ...t, ...next } : t)) })

  const addTab = () => {
    const label = newTabLabel.trim()
    if (!label) return
    const base = slugify(label) || `tab-${draft.tabs.length + 1}`
    let key = base
    let n = 2
    while (draft.tabs.some((t) => t.key === key)) key = `${base}-${n++}`
    patch({ tabs: [...draft.tabs, { key, label, products: [] }] })
    setNewTabLabel('')
  }

  const activeTab = draft.tabs.find((t) => t.key === activeTabKey) ?? draft.tabs[0]
  const results = query.trim() ? searchCatalog(query, 8) : []
  const noTabs = draft.tabs.length === 0

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
            disabled={noTabs && !draft.active}
            className="h-10 rounded-full px-5 text-[13px] font-semibold text-white disabled:opacity-40"
            style={{ backgroundColor: draft.active ? '#6b7280' : RED }}
            title={noTabs ? 'Add at least one tab first' : undefined}
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
              <span className="mb-1 block text-[12px] font-semibold text-gray-600">Description</span>
              <input
                type="text"
                value={draft.description ?? ''}
                onChange={(e) => patch({ description: e.target.value })}
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
              />
            </label>
          </div>
        </section>

        {/* Tabs */}
        <section className="mb-5 rounded-2xl bg-white p-5">
          <h2 className="m-0 mb-1 text-[15px] font-bold text-gray-900">Tabs</h2>
          <p className="m-0 mb-4 text-[12.5px] text-gray-500">
            Each tab is a category the customer switches between (e.g. Processor, RAM, Motherboard).
          </p>

          <div className="mb-4 flex flex-col gap-2">
            {draft.tabs.map((tab) => (
              <div key={tab.key} className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                <input
                  type="text"
                  value={tab.label}
                  onChange={(e) => patchTab(tab.key, { label: e.target.value })}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-gray-200 px-2 text-[13px] outline-none focus:border-gray-400"
                />
                <span className="shrink-0 text-[12px] text-gray-500">{tab.products.length} products</span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete tab "${tab.label}"?`))
                      patch({ tabs: draft.tabs.filter((t) => t.key !== tab.key) })
                  }}
                  className="shrink-0 text-gray-400 hover:text-[#bd2026]"
                  aria-label={`Delete ${tab.label}`}
                >
                  <span className="mi text-[18px]">delete</span>
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTabLabel}
              onChange={(e) => setNewTabLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addTab()
              }}
              placeholder="New tab name (e.g. Processor)"
              className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
            />
            <button
              type="button"
              onClick={addTab}
              className="h-10 shrink-0 rounded-full px-5 text-[13px] font-semibold text-white"
              style={{ backgroundColor: RED }}
            >
              + Add Tab
            </button>
          </div>
        </section>

        {/* Products per tab */}
        <section className="mb-5 rounded-2xl bg-white p-5">
          <h2 className="m-0 mb-4 text-[15px] font-bold text-gray-900">Products</h2>

          {noTabs ? (
            <p className="m-0 text-[13px] text-gray-400">Add a tab above first.</p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                {draft.tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTabKey(tab.key)}
                    className={`rounded-full px-4 py-1.5 text-[13px] font-semibold ${
                      activeTab?.key === tab.key ? 'text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                    style={activeTab?.key === tab.key ? { backgroundColor: RED } : undefined}
                  >
                    {tab.label} ({tab.products.length})
                  </button>
                ))}
              </div>

              {activeTab ? (
                <>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <select
                      value={importCategory}
                      onChange={(e) => setImportCategory(e.target.value)}
                      className="h-10 rounded-lg border border-gray-200 px-2 text-[13px] outline-none"
                    >
                      <option value="">Import a whole category…</option>
                      {Object.keys(categoryProductsMap).map((slug) => (
                        <option key={slug} value={slug}>
                          {slug}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!importCategory}
                      onClick={() => {
                        const catalog = categoryProductsMap[importCategory]?.products ?? []
                        const existing = new Set(activeTab.products.map((p) => p.slug))
                        const added = catalog
                          .filter((p) => !existing.has(p.slug))
                          .map((p) => toBundleProduct(p, activeTab.key))
                        patchTab(activeTab.key, { products: [...activeTab.products, ...added] })
                        setImportCategory('')
                      }}
                      className="h-10 rounded-full border border-gray-300 px-4 text-[13px] font-semibold text-gray-700 disabled:opacity-40"
                    >
                      Import
                    </button>
                  </div>

                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search products to add to "${activeTab.label}"…`}
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
                  />
                  {results.length > 0 ? (
                    <div className="mt-2 max-h-[220px] overflow-y-auto rounded-lg border border-gray-100">
                      {results.map((p) => {
                        const already = activeTab.products.some((x) => x.slug === p.slug)
                        return (
                          <button
                            key={p.slug}
                            type="button"
                            disabled={already}
                            onClick={() => {
                              patchTab(activeTab.key, {
                                products: [...activeTab.products, toBundleProduct(p, activeTab.key)],
                              })
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

                  {activeTab.products.length > 0 ? (
                    <ul className="mt-4 flex max-h-[320px] list-none flex-col gap-2 overflow-y-auto p-0">
                      {activeTab.products.map((p) => (
                        <li key={p.id} className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2">
                          <Image src={p.image} alt="" width={36} height={36} className="h-9 w-9 object-contain" />
                          <span className="min-w-0 flex-1 truncate text-[13px] text-gray-800">{p.name}</span>
                          <span className="text-[13px] font-bold text-[#c3272b]">
                            ৳{p.priceNew.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              patchTab(activeTab.key, {
                                products: activeTab.products.filter((x) => x.id !== p.id),
                              })
                            }
                            className="text-gray-400 hover:text-[#bd2026]"
                            aria-label={`Remove ${p.name}`}
                          >
                            <span className="mi text-[18px]">delete</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="m-0 mt-4 text-[13px] text-gray-400">No products in this tab yet.</p>
                  )}
                </>
              ) : null}
            </>
          )}
        </section>

        {/* Tiers */}
        <section className="rounded-2xl bg-white p-5">
          <h2 className="m-0 mb-1 text-[15px] font-bold text-gray-900">Discount &amp; Free Gift</h2>
          <TierEditor
            tiers={draft.tiers}
            onChange={(tiers) => patch({ tiers })}
            hint={`Applied by how many products the customer picks across tabs (${MIN_BUNDLE_PRODUCTS}–${MAX_BUNDLE_PRODUCTS}).`}
          />
        </section>
      </div>

      <SaveBar
        dirty={dirty}
        saved={saved}
        onSave={() => {
          const committed = saveCustomBundle(draft)
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

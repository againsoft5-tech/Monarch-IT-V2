'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import TierEditor from '@/components/admin/bundles/TierEditor'
import { categoryProductsMap } from '@/data/categoryProducts'
import {
  addCustomBundleTab,
  addProductToCustomTab,
  deleteCustomBundleTab,
  importCategoryIntoCustomTab,
  removeProductFromCustomTab,
  searchCatalog,
  setCustomBundleActive,
  updateCustomBundleMeta,
  updateCustomBundleTab,
  updateCustomBundleTiers,
  useBundleStore,
} from '@/lib/bundleStore'
import { MAX_BUNDLE_PRODUCTS, MIN_BUNDLE_PRODUCTS } from '@/data/bundleData'

const RED = '#bd2026'

export default function CustomBundleEditor({ bundleId }: { bundleId: string }) {
  const { isAdminLoggedIn, adminChecked } = useAdminAuth()
  const router = useRouter()
  const db = useBundleStore()
  const [activeTabKey, setActiveTabKey] = useState<string | null>(null)
  const [newTabLabel, setNewTabLabel] = useState('')
  const [query, setQuery] = useState('')
  const [importCategory, setImportCategory] = useState('')

  useEffect(() => {
    if (adminChecked && !isAdminLoggedIn) router.replace('/admin/login')
  }, [adminChecked, isAdminLoggedIn, router])

  if (!adminChecked || !isAdminLoggedIn) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#eef0f3] text-[14px] text-gray-400">
        Loading...
      </div>
    )
  }

  const bundle = db.custom[bundleId]
  if (!bundle) {
    return (
      <div className="bundles-module min-h-full bg-[#eef0f3] px-4 py-8 lg:px-10">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 text-center">
          <p className="mb-4 text-[14px] text-gray-500">This bundle no longer exists.</p>
          <Link href="/admin/bundles" className="font-semibold text-[#bd2026] no-underline">
            Back to bundles
          </Link>
        </div>
      </div>
    )
  }

  const activeTab = bundle.tabs.find((t) => t.key === activeTabKey) ?? bundle.tabs[0]
  const results = query.trim() ? searchCatalog(query, 8) : []
  const noTabs = bundle.tabs.length === 0

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
            <h1 className="m-0 text-xl font-bold text-gray-900">{bundle.name}</h1>
          </div>
          <button
            type="button"
            onClick={() => setCustomBundleActive(bundle.id, !bundle.active)}
            disabled={noTabs && !bundle.active}
            className="h-10 cursor-pointer rounded-full px-5 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: bundle.active ? '#6b7280' : RED }}
            title={noTabs ? 'Add at least one tab first' : undefined}
          >
            {bundle.active ? 'Deactivate' : 'Publish'}
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
                value={bundle.name}
                onChange={(e) => updateCustomBundleMeta(bundle.id, { name: e.target.value })}
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-gray-600">Description</span>
              <input
                type="text"
                value={bundle.description ?? ''}
                onChange={(e) => updateCustomBundleMeta(bundle.id, { description: e.target.value })}
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
            {bundle.tabs.map((tab) => (
              <div key={tab.key} className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
                <input
                  type="text"
                  value={tab.label}
                  onChange={(e) => updateCustomBundleTab(bundle.id, tab.key, e.target.value)}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-gray-200 px-2 text-[13px] outline-none focus:border-gray-400"
                />
                <span className="shrink-0 text-[12px] text-gray-500">{tab.products.length} products</span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete tab "${tab.label}"?`)) deleteCustomBundleTab(bundle.id, tab.key)
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
              placeholder="New tab name (e.g. Processor)"
              className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
            />
            <button
              type="button"
              onClick={() => {
                if (!newTabLabel.trim()) return
                addCustomBundleTab(bundle.id, newTabLabel)
                setNewTabLabel('')
              }}
              className="h-10 shrink-0 cursor-pointer rounded-full px-5 text-[13px] font-semibold text-white"
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
                {bundle.tabs.map((tab) => (
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
                        importCategoryIntoCustomTab(bundle.id, activeTab.key, importCategory)
                        setImportCategory('')
                      }}
                      className="h-10 cursor-pointer rounded-full border border-gray-300 px-4 text-[13px] font-semibold text-gray-700 disabled:opacity-40"
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
                              addProductToCustomTab(bundle.id, activeTab.key, p)
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
                            onClick={() => removeProductFromCustomTab(bundle.id, activeTab.key, p.id)}
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
            tiers={bundle.tiers}
            onChange={(tiers) => updateCustomBundleTiers(bundle.id, tiers)}
            hint={`Applied by how many products the customer picks across tabs (${MIN_BUNDLE_PRODUCTS}–${MAX_BUNDLE_PRODUCTS}).`}
          />
        </section>
      </div>
    </div>
  )
}

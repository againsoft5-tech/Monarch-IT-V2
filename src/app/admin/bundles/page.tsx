'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import {
  createCustomBundle,
  createReadyBundle,
  deleteCustomBundle,
  deleteReadyBundle,
  duplicateCustomBundle,
  duplicateReadyBundle,
  setCustomBundleActive,
  setReadyBundleActive,
  useBundleStore,
} from '@/lib/bundleStore'
import { MIN_BUNDLE_PRODUCTS } from '@/data/bundleData'

const RED = '#bd2026'

type Kind = 'ready' | 'custom'

export default function AdminBundlesPage() {
  const { isAdminLoggedIn, adminChecked } = useAdminAuth()
  const router = useRouter()
  const db = useBundleStore()
  const [kind, setKind] = useState<Kind>('ready')
  const [newName, setNewName] = useState('')

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

  const byNewest = <T extends { createdAt: string }>(list: T[]) =>
    [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const readyList = byNewest(Object.values(db.ready))
  const customList = byNewest(Object.values(db.custom))

  const create = () => {
    const name = newName.trim()
    if (!name) return
    const created = kind === 'ready' ? createReadyBundle(name) : createCustomBundle(name)
    setNewName('')
    router.push(`/admin/bundles/${kind}/${created.id}`)
  }

  return (
    <div className="bundles-module min-h-full bg-[#eef0f3] px-4 py-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href="/admin"
            className="mb-1 inline-flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-700"
          >
            <span className="mi text-[16px]">arrow_back</span> Dashboard
          </Link>
          <h1 className="m-0 text-xl font-bold text-gray-900">Bundles</h1>
        </div>

        <div className="mb-5 flex gap-2">
          {(['ready', 'custom'] as Kind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`rounded-full px-5 py-2 text-[13px] font-semibold ${
                kind === k ? 'text-white' : 'bg-white text-gray-600'
              }`}
              style={kind === k ? { backgroundColor: RED } : undefined}
            >
              {k === 'ready' ? `Ready Bundles (${readyList.length})` : `Custom Bundles (${customList.length})`}
            </button>
          ))}
        </div>

        <div className="mb-5 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') create()
            }}
            placeholder={kind === 'ready' ? 'New ready bundle name…' : 'New custom bundle name…'}
            className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
          />
          <button
            type="button"
            onClick={create}
            className="h-10 shrink-0 cursor-pointer rounded-full px-5 text-[13px] font-semibold text-white"
            style={{ backgroundColor: RED }}
          >
            + New Bundle
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white">
          {(kind === 'ready' ? readyList : customList).length === 0 ? (
            <p className="m-0 p-10 text-center text-[14px] text-gray-400">
              No {kind} bundles yet. Create one above.
            </p>
          ) : kind === 'ready' ? (
            readyList.map((b, i) => (
              <div
                key={b.id}
                className={`flex flex-wrap items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}
              >
                <span className="min-w-0 flex-1">
                  <Link
                    href={`/admin/bundles/ready/${b.id}`}
                    className="block truncate text-[14px] font-semibold text-gray-900 no-underline hover:text-[#bd2026]"
                  >
                    {b.name}
                  </Link>
                  <span className="block text-[12px] text-gray-500">
                    {b.products.length} product{b.products.length === 1 ? '' : 's'}
                    {b.products.length < MIN_BUNDLE_PRODUCTS ? ' · needs more' : ''}
                  </span>
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    b.active ? 'bg-[#e8f6ee] text-[#0f7a43]' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {b.active ? 'Live' : 'Draft'}
                </span>
                <Link
                  href={`/admin/bundles/ready/${b.id}`}
                  className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#bd2026] no-underline hover:underline"
                >
                  <span className="mi text-[15px] leading-none">edit</span>
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setReadyBundleActive(b.id, !b.active)}
                  disabled={b.products.length < MIN_BUNDLE_PRODUCTS && !b.active}
                  className="text-[12.5px] font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-40"
                >
                  {b.active ? 'Deactivate' : 'Publish'}
                </button>
                <button
                  type="button"
                  onClick={() => duplicateReadyBundle(b.id)}
                  className="text-[12.5px] font-semibold text-gray-600 hover:text-gray-900"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete "${b.name}"? This cannot be undone.`)) deleteReadyBundle(b.id)
                  }}
                  className="text-[12.5px] font-semibold text-[#bd2026]"
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            customList.map((b, i) => (
              <div
                key={b.id}
                className={`flex flex-wrap items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}
              >
                <span className="min-w-0 flex-1">
                  <Link
                    href={`/admin/bundles/custom/${b.id}`}
                    className="block truncate text-[14px] font-semibold text-gray-900 no-underline hover:text-[#bd2026]"
                  >
                    {b.name}
                  </Link>
                  <span className="block text-[12px] text-gray-500">
                    {b.tabs.length} tab{b.tabs.length === 1 ? '' : 's'} ·{' '}
                    {b.tabs.reduce((n, t) => n + t.products.length, 0)} products
                  </span>
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    b.active ? 'bg-[#e8f6ee] text-[#0f7a43]' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {b.active ? 'Live' : 'Draft'}
                </span>
                <Link
                  href={`/admin/bundles/custom/${b.id}`}
                  className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#bd2026] no-underline hover:underline"
                >
                  <span className="mi text-[15px] leading-none">edit</span>
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setCustomBundleActive(b.id, !b.active)}
                  disabled={b.tabs.length === 0 && !b.active}
                  className="text-[12.5px] font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-40"
                >
                  {b.active ? 'Deactivate' : 'Publish'}
                </button>
                <button
                  type="button"
                  onClick={() => duplicateCustomBundle(b.id)}
                  className="text-[12.5px] font-semibold text-gray-600 hover:text-gray-900"
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete "${b.name}"? This cannot be undone.`)) deleteCustomBundle(b.id)
                  }}
                  className="text-[12.5px] font-semibold text-[#bd2026]"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

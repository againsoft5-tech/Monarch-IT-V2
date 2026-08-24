'use client'

import { useEffect, useState } from 'react'
import {
  DEFAULT_BUNDLE_DB,
  MAX_BUNDLE_PRODUCTS,
  defaultTiers,
  type BundleDB,
  type BundleProduct,
  type BundleTier,
  type CustomBundle,
  type CustomBundleTab,
  type ReadyBundle,
} from '@/data/bundleData'
import { categoryProductsMap, type CategoryProduct } from '@/data/categoryProducts'

/**
 * Client-side view of the bundle store.
 *
 * Bundles are now served by `/api/bundles` (see `bundle-repository.ts`) rather than
 * living in each visitor's localStorage — a shared bundle link has to mean the same
 * thing in someone else's browser, which local storage can never provide.
 *
 * The mutation helpers below stay synchronous: they act on an in-memory snapshot,
 * notify listeners immediately, then persist in the background. That keeps the admin
 * editors responsive and their call sites unchanged.
 */
const API_URL = '/api/bundles'
const CHANNEL_NAME = 'monarch-bundle-sync'
const LOCAL_EVENT = 'monarch-bundle-local-change'

let channel: BroadcastChannel | null = null
function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME)
  return channel
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function nowIso() {
  return new Date().toISOString()
}

/**
 * Last DB seen from the server. Seeded with the shipped bundles so the very first
 * render has something real to show while the fetch is in flight.
 */
let snapshot: BundleDB = DEFAULT_BUNDLE_DB
/** De-duplicates concurrent fetches (several components mount at once). */
let inFlight: Promise<BundleDB> | null = null

function notify() {
  getChannel()?.postMessage({ kind: 'db' })
  window.dispatchEvent(new Event(LOCAL_EVENT))
}

/** Synchronous read of the snapshot — every mutation helper builds on this. */
function readDB(): BundleDB {
  return snapshot
}

/** Pulls the authoritative DB from the server and republishes it to listeners. */
async function refreshDB(): Promise<BundleDB> {
  if (typeof window === 'undefined') return snapshot
  if (inFlight) return inFlight

  inFlight = (async () => {
    try {
      const res = await fetch(API_URL, { cache: 'no-store' })
      if (!res.ok) throw new Error(`GET ${API_URL} -> ${res.status}`)
      const db = (await res.json()) as BundleDB
      snapshot = { ready: db.ready ?? {}, custom: db.custom ?? {} }
    } catch (err) {
      // Keep whatever we already have rather than blanking the storefront.
      console.error('[bundles] failed to load', err)
    } finally {
      inFlight = null
    }
    return snapshot
  })()

  return inFlight
}

/**
 * Applies a change optimistically, then persists.
 *
 * The UI updates from the snapshot straight away; the PUT confirms it. A failed write
 * is logged and the server copy pulled back, so the admin never sees a phantom save.
 */
function writeDB(db: BundleDB) {
  snapshot = db
  notify()
  void (async () => {
    try {
      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(db),
      })
      if (!res.ok) throw new Error(`PUT ${API_URL} -> ${res.status}`)
      snapshot = (await res.json()) as BundleDB
      notify()
    } catch (err) {
      console.error('[bundles] failed to save', err)
      await refreshDB()
      notify()
    }
  })()
}

export function useBundleStore(): BundleDB {
  const [db, setDb] = useState<BundleDB>(snapshot)

  useEffect(() => {
    void refreshDB().then(setDb)

    // Same tab: the snapshot already holds the change, so just re-read it.
    const onLocal = () => setDb(readDB())
    // Another tab saved, so this tab's snapshot is stale — go back to the server.
    const onMessage = (e: MessageEvent<{ kind: string }>) => {
      if (e.data?.kind === 'db') void refreshDB().then(setDb)
    }

    const ch = getChannel()
    ch?.addEventListener('message', onMessage)
    window.addEventListener(LOCAL_EVENT, onLocal)
    return () => {
      ch?.removeEventListener('message', onMessage)
      window.removeEventListener(LOCAL_EVENT, onLocal)
    }
  }, [])

  return db
}

/* ---------------------------------------------------------------- catalog */

/** Flattened catalog, built once, for the admin product pickers. */
let catalogCache: CategoryProduct[] | null = null
function catalog(): CategoryProduct[] {
  if (!catalogCache) {
    catalogCache = Object.values(categoryProductsMap).flatMap((c) => c?.products ?? [])
  }
  return catalogCache
}

export function searchCatalog(query: string, limit = 12): CategoryProduct[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const out: CategoryProduct[] = []
  for (const p of catalog()) {
    if (p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)) {
      out.push(p)
      if (out.length >= limit) break
    }
  }
  return out
}

/**
 * Finds a catalog product by its exact name.
 *
 * Cart lines written before gift slugs were stored carry only a name, so this
 * recovers the product page link for them rather than leaving the badge dead.
 */
export function catalogProductByName(name: string): CategoryProduct | undefined {
  const needle = name.trim().toLowerCase()
  if (!needle) return undefined
  return catalog().find((p) => p.name.trim().toLowerCase() === needle)
}

/** First page of the catalog, so a picker can be browsed before anything is typed. */
export function catalogSample(limit = 20): CategoryProduct[] {
  return catalog().slice(0, limit)
}

export function catalogProductBySlug(slug: string): CategoryProduct | undefined {
  return catalog().find((p) => p.slug === slug)
}

/** Snapshot a catalog product into the shape bundles store. */
export function toBundleProduct(product: CategoryProduct, idPrefix = 'p'): BundleProduct {
  return {
    id: `${idPrefix}-${product.slug}`,
    slug: product.slug,
    name: product.name,
    image: product.image,
    priceOld: product.priceOld || product.priceNew,
    priceNew: product.priceNew,
  }
}

/* ------------------------------------------------------------ ready bundles */

export function getReadyBundle(id: string): ReadyBundle | undefined {
  return readDB().ready[id]
}

function updateReady(id: string, updater: (b: ReadyBundle) => ReadyBundle) {
  const db = readDB()
  const current = db.ready[id]
  if (!current) return
  db.ready[id] = { ...updater(current), updatedAt: nowIso() }
  writeDB(db)
}

export function createReadyBundle(name: string): ReadyBundle {
  const db = readDB()
  const base = slugify(name) || 'bundle'
  let id = base
  let n = 2
  while (db.ready[id]) id = `${base}-${n++}`

  const bundle: ReadyBundle = {
    id,
    name: name.trim() || 'Untitled bundle',
    active: false,
    products: [],
    tiers: defaultTiers(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
  db.ready[id] = bundle
  writeDB(db)
  return bundle
}

export function deleteReadyBundle(id: string) {
  const db = readDB()
  delete db.ready[id]
  writeDB(db)
}

export function duplicateReadyBundle(id: string): ReadyBundle | undefined {
  const source = getReadyBundle(id)
  if (!source) return undefined
  const copy = createReadyBundle(`${source.name} copy`)
  updateReady(copy.id, (b) => ({
    ...b,
    description: source.description,
    image: source.image,
    products: source.products.map((p) => ({ ...p })),
    tiers: source.tiers.map((t) => ({ ...t, gifts: t.gifts.map((g) => ({ ...g })) })),
  }))
  return getReadyBundle(copy.id)
}

export function updateReadyBundleMeta(
  id: string,
  meta: Partial<Pick<ReadyBundle, 'name' | 'description' | 'image'>>,
) {
  updateReady(id, (b) => ({ ...b, ...meta }))
}

export function setReadyBundleActive(id: string, active: boolean) {
  updateReady(id, (b) => ({ ...b, active }))
}

/** Adds a catalog product, refusing to exceed the max bundle size. */
export function addProductToReadyBundle(id: string, product: CategoryProduct) {
  updateReady(id, (b) => {
    if (b.products.length >= MAX_BUNDLE_PRODUCTS) return b
    if (b.products.some((p) => p.slug === product.slug)) return b
    return { ...b, products: [...b.products, toBundleProduct(product, id)] }
  })
}

export function removeProductFromReadyBundle(id: string, productId: string) {
  updateReady(id, (b) => ({ ...b, products: b.products.filter((p) => p.id !== productId) }))
}

export function updateReadyBundleTiers(id: string, tiers: BundleTier[]) {
  updateReady(id, (b) => ({ ...b, tiers }))
}

/**
 * Commits a whole edited bundle at once. The editors keep changes in local draft state
 * and call this on Save, so nothing reaches the live store until the admin says so.
 */
export function saveReadyBundle(bundle: ReadyBundle): ReadyBundle | undefined {
  const db = readDB()
  if (!db.ready[bundle.id]) return undefined
  // Returned so the editor can re-seed its draft with the stamped record; otherwise the
  // fresh `updatedAt` alone would keep the draft looking dirty forever after saving.
  const next: ReadyBundle = { ...bundle, updatedAt: nowIso() }
  db.ready[bundle.id] = next
  writeDB(db)
  return next
}

/* ----------------------------------------------------------- custom bundles */

export function getCustomBundle(id: string): CustomBundle | undefined {
  return readDB().custom[id]
}

function updateCustom(id: string, updater: (b: CustomBundle) => CustomBundle) {
  const db = readDB()
  const current = db.custom[id]
  if (!current) return
  db.custom[id] = { ...updater(current), updatedAt: nowIso() }
  writeDB(db)
}

export function createCustomBundle(name: string): CustomBundle {
  const db = readDB()
  const base = slugify(name) || 'custom-bundle'
  let id = base
  let n = 2
  while (db.custom[id]) id = `${base}-${n++}`

  const bundle: CustomBundle = {
    id,
    name: name.trim() || 'Untitled bundle',
    active: false,
    tabs: [],
    tiers: defaultTiers(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
  db.custom[id] = bundle
  writeDB(db)
  return bundle
}

export function deleteCustomBundle(id: string) {
  const db = readDB()
  delete db.custom[id]
  writeDB(db)
}

export function duplicateCustomBundle(id: string): CustomBundle | undefined {
  const source = getCustomBundle(id)
  if (!source) return undefined
  const copy = createCustomBundle(`${source.name} copy`)
  updateCustom(copy.id, (b) => ({
    ...b,
    description: source.description,
    tabs: source.tabs.map((t) => ({ ...t, products: t.products.map((p) => ({ ...p })) })),
    tiers: source.tiers.map((t) => ({ ...t, gifts: t.gifts.map((g) => ({ ...g })) })),
  }))
  return getCustomBundle(copy.id)
}

export function updateCustomBundleMeta(
  id: string,
  meta: Partial<Pick<CustomBundle, 'name' | 'description'>>,
) {
  updateCustom(id, (b) => ({ ...b, ...meta }))
}

export function setCustomBundleActive(id: string, active: boolean) {
  updateCustom(id, (b) => ({ ...b, active }))
}

export function addCustomBundleTab(id: string, label: string) {
  updateCustom(id, (b) => {
    const base = slugify(label) || `tab-${b.tabs.length + 1}`
    let key = base
    let n = 2
    while (b.tabs.some((t) => t.key === key)) key = `${base}-${n++}`
    const tab: CustomBundleTab = { key, label: label.trim() || 'Untitled tab', products: [] }
    return { ...b, tabs: [...b.tabs, tab] }
  })
}

export function updateCustomBundleTab(id: string, tabKey: string, label: string) {
  updateCustom(id, (b) => ({
    ...b,
    tabs: b.tabs.map((t) => (t.key === tabKey ? { ...t, label } : t)),
  }))
}

export function deleteCustomBundleTab(id: string, tabKey: string) {
  updateCustom(id, (b) => ({ ...b, tabs: b.tabs.filter((t) => t.key !== tabKey) }))
}

export function addProductToCustomTab(id: string, tabKey: string, product: CategoryProduct) {
  updateCustom(id, (b) => ({
    ...b,
    tabs: b.tabs.map((t) =>
      t.key !== tabKey || t.products.some((p) => p.slug === product.slug)
        ? t
        : { ...t, products: [...t.products, toBundleProduct(product, tabKey)] },
    ),
  }))
}

/** Bulk-add every product of a catalog category into a tab. */
export function importCategoryIntoCustomTab(id: string, tabKey: string, categorySlug: string) {
  const products = categoryProductsMap[categorySlug]?.products ?? []
  updateCustom(id, (b) => ({
    ...b,
    tabs: b.tabs.map((t) => {
      if (t.key !== tabKey) return t
      const existing = new Set(t.products.map((p) => p.slug))
      const added = products.filter((p) => !existing.has(p.slug)).map((p) => toBundleProduct(p, tabKey))
      return { ...t, products: [...t.products, ...added] }
    }),
  }))
}

export function removeProductFromCustomTab(id: string, tabKey: string, productId: string) {
  updateCustom(id, (b) => ({
    ...b,
    tabs: b.tabs.map((t) =>
      t.key === tabKey ? { ...t, products: t.products.filter((p) => p.id !== productId) } : t,
    ),
  }))
}

export function updateCustomBundleTiers(id: string, tiers: BundleTier[]) {
  updateCustom(id, (b) => ({ ...b, tiers }))
}

/** Commits a whole edited custom bundle at once — see `saveReadyBundle`. */
export function saveCustomBundle(bundle: CustomBundle): CustomBundle | undefined {
  const db = readDB()
  if (!db.custom[bundle.id]) return undefined
  const next: CustomBundle = { ...bundle, updatedAt: nowIso() }
  db.custom[bundle.id] = next
  writeDB(db)
  return next
}

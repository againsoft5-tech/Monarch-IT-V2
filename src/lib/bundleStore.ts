'use client'

import { useEffect, useState } from 'react'
import {
  DEFAULT_BUNDLE_DB,
  MAX_BUNDLE_PRODUCTS,
  SEED_DATE,
  defaultTiers,
  normalizeTiers,
  type BundleDB,
  type BundleProduct,
  type BundleTier,
  type CustomBundle,
  type CustomBundleTab,
  type ReadyBundle,
} from '@/data/bundleData'
import { categoryProductsMap, type CategoryProduct } from '@/data/categoryProducts'

/**
 * Client-side store for bundles, mirroring `comboStore` (localStorage + BroadcastChannel)
 * so admin edits sync across tabs. Swap `readDB`/`writeDB` for an API when a backend exists.
 */
const DB_KEY = 'monarch_bundles'
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
 * Bump when the shipped seed set changes. Stores created before a bump get the new
 * seeds merged in once — stamping the version means a bundle the admin deleted stays
 * deleted instead of reappearing on every page load.
 */
const SEED_VERSION = 5

type StoredDB = BundleDB & { seedVersion?: number }

function persist(db: BundleDB) {
  localStorage.setItem(DB_KEY, JSON.stringify({ ...db, seedVersion: SEED_VERSION } satisfies StoredDB))
}

/**
 * Brings every stored tier onto the current gift shape.
 *
 * Bundles live in the visitor's own localStorage, so a browser can hold records
 * written before gifts became a list. Normalising on read means the rest of the
 * app only ever sees `tier.gifts`.
 */
function upgradeTiers(db: BundleDB): BundleDB {
  const ready = Object.fromEntries(
    Object.entries(db.ready).map(([id, b]) => [id, { ...b, tiers: normalizeTiers(b.tiers) }]),
  )
  const custom = Object.fromEntries(
    Object.entries(db.custom).map(([id, b]) => [id, { ...b, tiers: normalizeTiers(b.tiers) }]),
  )
  return { ready, custom }
}

function readDB(): BundleDB {
  if (typeof window === 'undefined') return DEFAULT_BUNDLE_DB
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (!raw) {
      // First visit — seed so the shipped bundles are editable in admin, not just rendered.
      persist(DEFAULT_BUNDLE_DB)
      return DEFAULT_BUNDLE_DB
    }

    const parsed = JSON.parse(raw) as Partial<StoredDB>
    const stored = upgradeTiers({ ready: parsed.ready ?? {}, custom: parsed.custom ?? {} })
    if (parsed.seedVersion === SEED_VERSION) return stored

    // Older store (or one created before seeding existed): fill in the missing seeds.
    // Stored entries win, so anything the admin created or edited is preserved.
    const merged: BundleDB = {
      ready: { ...DEFAULT_BUNDLE_DB.ready, ...stored.ready },
      custom: { ...DEFAULT_BUNDLE_DB.custom, ...stored.custom },
    }

    // Refresh seeds the admin never touched, so seed changes (a new product in a shipped
    // bundle, say) actually reach existing browsers. An edited seed still carries a fresh
    // `updatedAt`, so it is left exactly as the admin left it.
    for (const [id, seed] of Object.entries(DEFAULT_BUNDLE_DB.ready)) {
      if (merged.ready[id]?.updatedAt === SEED_DATE) merged.ready[id] = seed
    }
    for (const [id, seed] of Object.entries(DEFAULT_BUNDLE_DB.custom)) {
      if (merged.custom[id]?.updatedAt === SEED_DATE) merged.custom[id] = seed
    }

    persist(merged)
    return merged
  } catch {
    return DEFAULT_BUNDLE_DB
  }
}

function writeDB(db: BundleDB) {
  persist(db)
  getChannel()?.postMessage({ kind: 'db' })
  window.dispatchEvent(new Event(LOCAL_EVENT))
}

export function useBundleStore(): BundleDB {
  const [db, setDb] = useState<BundleDB>(DEFAULT_BUNDLE_DB)

  useEffect(() => {
    setDb(readDB())
    const refresh = () => setDb(readDB())
    const ch = getChannel()
    const onMessage = (e: MessageEvent<{ kind: string }>) => {
      if (e.data?.kind === 'db') refresh()
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === DB_KEY) refresh()
    }
    ch?.addEventListener('message', onMessage)
    window.addEventListener(LOCAL_EVENT, refresh)
    window.addEventListener('storage', onStorage)
    return () => {
      ch?.removeEventListener('message', onMessage)
      window.removeEventListener(LOCAL_EVENT, refresh)
      window.removeEventListener('storage', onStorage)
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

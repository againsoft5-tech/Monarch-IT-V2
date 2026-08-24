import { promises as fs } from 'fs'
import path from 'path'
import {
  DEFAULT_BUNDLE_DB,
  SEED_DATE,
  normalizeTiers,
  type BundleDB,
} from '@/data/bundleData'

/**
 * File-backed bundle store (dev / self-contained), mirroring `offers-persist.ts`.
 *
 * Prefer importing `bundleRepository` from `bundle-repository.ts` in app code so a
 * future admin/DB adapter can replace this without touching the UI.
 *
 * Bundles used to live in each visitor's localStorage. That could never support a
 * shared link — the recipient's browser holds *their* storage, so they would see the
 * shipped seeds instead of what the sender saw. Server-side storage is what makes a
 * bundle URL mean the same thing for everyone.
 */
const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'bundles.json')

/**
 * Bump when the shipped seed set changes. Files written before a bump get the new
 * seeds merged in once — stamping the version means a bundle the admin deleted stays
 * deleted instead of reappearing on every read.
 */
export const SEED_VERSION = 6

type StoredDB = BundleDB & { seedVersion?: number }

/** Brings every stored tier onto the current gift shape (see `normalizeTiers`). */
function upgradeTiers(db: BundleDB): BundleDB {
  const ready = Object.fromEntries(
    Object.entries(db.ready).map(([id, b]) => [id, { ...b, tiers: normalizeTiers(b.tiers) }]),
  )
  const custom = Object.fromEntries(
    Object.entries(db.custom).map(([id, b]) => [id, { ...b, tiers: normalizeTiers(b.tiers) }]),
  )
  return { ready, custom }
}

/**
 * Merges the shipped seeds into a stored DB.
 *
 * Stored entries win, so anything the admin created or edited survives. Seeds the
 * admin never touched are refreshed outright — an untouched seed still carries the
 * fixed `SEED_DATE`, so a seed change (a new product in a shipped bundle, say)
 * actually reaches an existing store.
 */
function mergeSeeds(stored: BundleDB): BundleDB {
  const merged: BundleDB = {
    ready: { ...DEFAULT_BUNDLE_DB.ready, ...stored.ready },
    custom: { ...DEFAULT_BUNDLE_DB.custom, ...stored.custom },
  }
  for (const [id, seed] of Object.entries(DEFAULT_BUNDLE_DB.ready)) {
    if (merged.ready[id]?.updatedAt === SEED_DATE) merged.ready[id] = seed
  }
  for (const [id, seed] of Object.entries(DEFAULT_BUNDLE_DB.custom)) {
    if (merged.custom[id]?.updatedAt === SEED_DATE) merged.custom[id] = seed
  }
  return merged
}

export async function readBundleDB(): Promise<BundleDB> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8')
    const parsed = JSON.parse(raw) as Partial<StoredDB>
    const stored = upgradeTiers({ ready: parsed.ready ?? {}, custom: parsed.custom ?? {} })
    return parsed.seedVersion === SEED_VERSION ? stored : mergeSeeds(stored)
  } catch {
    // No file yet (or a read-only filesystem): the shipped seeds are the truth.
    return DEFAULT_BUNDLE_DB
  }
}

export async function writeBundleDB(db: BundleDB): Promise<BundleDB> {
  const next = upgradeTiers(db)
  const payload: StoredDB = { ...next, seedVersion: SEED_VERSION }
  await fs.writeFile(DATA_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  return next
}

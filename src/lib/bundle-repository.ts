import type { BundleDB } from '@/data/bundleData'
import { readBundleDB, writeBundleDB } from '@/lib/bundle-persist'

/**
 * Storage seam for bundles — mirrors `offersPageRepository`.
 *
 * Today: JSON file via `bundle-persist.ts`.
 * Later (admin DB): implement the same interface and swap the binding below; the
 * admin editors, the storefront and the shareable bundle pages stay unchanged.
 */
export type BundleRepository = {
  read: () => Promise<BundleDB>
  write: (db: BundleDB) => Promise<BundleDB>
}

export const fileBundleRepository: BundleRepository = {
  async read() {
    return readBundleDB()
  },
  async write(db) {
    return writeBundleDB(db)
  },
}

/** Active backend — change only this binding when moving to an admin DB. */
export const bundleRepository: BundleRepository = fileBundleRepository

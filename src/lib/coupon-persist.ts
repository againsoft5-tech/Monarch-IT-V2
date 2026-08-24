import { promises as fs } from 'fs'
import path from 'path'
import {
  COUPON_SEED_DATE,
  DEFAULT_COUPON_DB,
  ensureCoupon,
  type CouponDB,
} from '@/data/couponData'

/**
 * File-backed coupon store, mirroring `bundle-persist.ts`.
 *
 * Server-side for the same reason bundles are: a coupon advertised on a product page
 * has to mean the same thing for every visitor, which per-browser storage cannot do.
 */
const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'coupons.json')

/** Bump when the shipped seed set changes. */
export const COUPON_SEED_VERSION = 2

type StoredDB = CouponDB & { seedVersion?: number }

function normalize(db: CouponDB): CouponDB {
  return {
    coupons: Object.fromEntries(
      Object.entries(db.coupons ?? {}).map(([id, c]) => [id, ensureCoupon(c, id)]),
    ),
  }
}

/** Stored entries win; seeds the admin never touched are refreshed. */
function mergeSeeds(stored: CouponDB): CouponDB {
  const merged: CouponDB = { coupons: { ...DEFAULT_COUPON_DB.coupons, ...stored.coupons } }
  for (const [id, seed] of Object.entries(DEFAULT_COUPON_DB.coupons)) {
    if (merged.coupons[id]?.updatedAt === COUPON_SEED_DATE) merged.coupons[id] = seed
  }
  return merged
}

export async function readCouponDB(): Promise<CouponDB> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8')
    const parsed = JSON.parse(raw) as Partial<StoredDB>
    const stored = normalize({ coupons: parsed.coupons ?? {} })
    return parsed.seedVersion === COUPON_SEED_VERSION ? stored : mergeSeeds(stored)
  } catch {
    // No file yet (or a read-only filesystem): the shipped seeds are the truth.
    return DEFAULT_COUPON_DB
  }
}

export async function writeCouponDB(db: CouponDB): Promise<CouponDB> {
  const next = normalize(db)
  const payload: StoredDB = { ...next, seedVersion: COUPON_SEED_VERSION }
  await fs.writeFile(DATA_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  return next
}

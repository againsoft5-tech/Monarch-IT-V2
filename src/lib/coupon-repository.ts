import type { CouponDB } from '@/data/couponData'
import { readCouponDB, writeCouponDB } from '@/lib/coupon-persist'

/**
 * Storage seam for coupons — mirrors `bundleRepository`.
 *
 * Today: JSON file. Later (admin DB): implement the same interface and swap the
 * binding below; the admin editor and the storefront stay unchanged.
 */
export type CouponRepository = {
  read: () => Promise<CouponDB>
  write: (db: CouponDB) => Promise<CouponDB>
}

export const fileCouponRepository: CouponRepository = {
  async read() {
    return readCouponDB()
  },
  async write(db) {
    return writeCouponDB(db)
  },
}

/** Active backend — change only this binding when moving to an admin DB. */
export const couponRepository: CouponRepository = fileCouponRepository

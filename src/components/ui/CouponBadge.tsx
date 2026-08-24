'use client'

import { useMemo } from 'react'
import { useCouponStore } from '@/lib/couponStore'
import {
  bestCouponForProduct,
  effectivePrice,
  guaranteedCouponForProduct,
  type Coupon,
  type CouponProduct,
} from '@/data/couponData'

/**
 * The best live coupon for a product, or nothing.
 *
 * Shared by the card badge and the product page so both advertise the same offer.
 */
export function useProductCoupon(product: CouponProduct | undefined) {
  const db = useCouponStore()
  return useMemo(() => {
    if (!product) return undefined
    return bestCouponForProduct(Object.values(db.coupons), product)
  }, [db, product])
}

/** Every live coupon — for callers that price a whole list at once. */
export function useCouponList(): Coupon[] {
  const db = useCouponStore()
  return useMemo(() => Object.values(db.coupons), [db])
}

/**
 * The price to show, sort and filter by.
 *
 * Only coupons guaranteed to apply are folded in, so the listed number is one the
 * cart will honour — which is what lets the price filter and "Low to High" keep
 * agreeing with what the customer sees.
 */
export function useEffectivePrice(product: CouponProduct | undefined): number {
  const coupons = useCouponList()
  return useMemo(
    () => (product ? effectivePrice(coupons, product) : 0),
    [coupons, product],
  )
}

/**
 * "+৳20 OFF · Code: BTS22" under a product's price.
 *
 * Shown for conditional coupons too — those cannot move the listed price, so the
 * badge is the only place the customer learns about them.
 */
export default function CouponBadge({ product }: { product: CouponProduct }) {
  const coupons = useCouponList()
  const hit = useProductCoupon(product)
  if (!hit) return null

  // A guaranteed coupon is already inside the price above, so say so rather than
  // implying a further reduction on top of it.
  const inPrice = Boolean(guaranteedCouponForProduct(coupons, product))

  return (
    <span className="flex w-full items-center justify-center gap-1 truncate rounded-full bg-[#c3272b] px-2 py-1 text-[10px] font-bold text-white md:text-[11px]">
      <span className="shrink-0">
        {inPrice ? '' : '+'}৳{hit.discount.toLocaleString()} OFF
      </span>
      <span className="shrink-0 opacity-60">·</span>
      <span className="min-w-0 truncate font-semibold">Code: {hit.coupon.code}</span>
    </span>
  )
}

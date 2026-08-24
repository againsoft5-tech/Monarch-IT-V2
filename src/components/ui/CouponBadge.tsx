'use client'

import { useMemo } from 'react'
import { useCouponStore } from '@/lib/couponStore'
import { bestCouponForProduct, type CouponProduct } from '@/data/couponData'

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

/**
 * "+৳20 OFF · Code: BTS22" under a product's price.
 *
 * The price itself is left alone: it feeds sorting and the price filter everywhere,
 * and a coupon that only applies at cart level would make those lie. The badge
 * advertises the saving; the cart delivers it.
 */
export default function CouponBadge({ product }: { product: CouponProduct }) {
  const hit = useProductCoupon(product)
  if (!hit) return null

  return (
    <span className="flex w-full items-center justify-center gap-1 truncate rounded-full bg-[#c3272b] px-2 py-1 text-[10px] font-bold text-white md:text-[11px]">
      <span className="shrink-0">+৳{hit.discount.toLocaleString()} OFF</span>
      <span className="shrink-0 opacity-60">·</span>
      <span className="min-w-0 truncate font-semibold">Code: {hit.coupon.code}</span>
    </span>
  )
}

'use client'

import { useCart } from '@/context/CartContext'

/**
 * The code the customer entered, with a remove control.
 *
 * Price-range codes only apply because someone typed them, so the cart has to show
 * which one is in force and let it be taken back off — otherwise an applied offer
 * looks permanent and indistinguishable from an automatic one.
 */
export default function AppliedCoupon({ onClear }: { onClear?: () => void }) {
  const { appliedCoupons, couponAuto, clearCoupon } = useCart()
  const manual = !couponAuto && appliedCoupons.length > 0
  if (!manual) return null

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {appliedCoupons.map((c) => (
        <span
          key={c.code}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f6ee] px-2.5 py-1 text-[11.5px] font-bold text-[#0f7a43]"
        >
          <span className="mi text-[14px] leading-none">sell</span>
          {c.code} · ৳{c.discount.toLocaleString()} off
        </span>
      ))}
      <button
        type="button"
        onClick={() => {
          clearCoupon()
          onClear?.()
        }}
        className="text-[11.5px] font-semibold text-gray-500 underline hover:text-[#c3272b]"
      >
        Remove
      </button>
    </div>
  )
}

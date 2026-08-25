'use client'

import { useCart } from '@/context/CartContext'

/**
 * The code the customer entered, with a way to take it back off.
 *
 * Only their own code appears here: automatic product coupons are not theirs to
 * remove, so showing them beside a delete control would promise something false.
 */
export default function AppliedCoupon({ onClear }: { onClear?: () => void }) {
  const { appliedCoupons, manualCode, clearCoupon } = useCart()
  const applied = manualCode ? appliedCoupons.find((c) => c.code === manualCode) : undefined
  if (!applied) return null

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {/* Padded on the right so the corner button never sits over the text. */}
      <span className="relative inline-flex items-center gap-1.5 rounded-full bg-[#e8f6ee] py-1 pl-2.5 pr-5 text-[11.5px] font-bold text-[#0f7a43]">
        <span className="mi text-[14px] leading-none">sell</span>
        {applied.code} · ৳{applied.discount.toLocaleString()} off
        <button
          type="button"
          onClick={() => {
            clearCoupon()
            onClear?.()
          }}
          title={`Remove ${applied.code}`}
          aria-label={`Remove ${applied.code}`}
          className="absolute -right-1 -top-1 flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-full bg-[#0f7a43] text-white transition-colors hover:bg-[#c3272b]"
        >
          <span className="mi text-[12px] leading-none">close</span>
        </button>
      </span>
    </div>
  )
}

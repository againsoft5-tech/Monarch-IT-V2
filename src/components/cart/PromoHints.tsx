'use client'

import { useCart } from '@/context/CartContext'

/**
 * The promo note beside the coupon box.
 *
 * Shows at most one applicable code — several buttons would let the customer pick a
 * worse offer than the one they qualify for — plus the next band as an incentive.
 */
export default function PromoHints({ onPick }: { onPick?: (code: string) => void }) {
  const { promoOffer, promoNext, applyCoupon } = useCart()
  if (!promoOffer && !promoNext) return null

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {promoOffer ? (
        <button
          type="button"
          onClick={() => {
            onPick?.(promoOffer.code)
            applyCoupon(promoOffer.code)
          }}
          className="flex w-full cursor-pointer items-start gap-1.5 rounded-lg border border-dashed border-[#0f7a43]/40 bg-[#f2fbf6] px-2.5 py-1.5 text-left text-[11.5px] text-[#0f7a43] transition-colors hover:border-[#0f7a43]"
        >
          <span className="mi shrink-0 text-[15px] leading-none">sell</span>
          <span className="min-w-0">
            <b className="font-bold">{promoOffer.code}</b> — ৳{promoOffer.discount.toLocaleString()} off
            your items without an offer
            <span className="font-semibold"> · tap to apply</span>
          </span>
        </button>
      ) : null}

      {promoNext ? (
        <p className="m-0 flex items-start gap-1.5 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11.5px] text-gray-500">
          <span className="mi shrink-0 text-[15px] leading-none">lock</span>
          <span className="min-w-0">
            Add ৳{promoNext.needed.toLocaleString()} more to unlock{' '}
            <b className="font-bold">{promoNext.code}</b> — {promoNext.text}
          </span>
        </p>
      ) : null}
    </div>
  )
}

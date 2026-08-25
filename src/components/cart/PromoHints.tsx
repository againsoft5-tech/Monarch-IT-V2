'use client'

import { useCart } from '@/context/CartContext'

/**
 * The note beside the promo box listing price-range codes.
 *
 * Those codes never apply on their own, so without this the customer would have to be
 * told about them out-of-band. Tapping one fills the box and applies it.
 */
export default function PromoHints({ onPick }: { onPick?: (code: string) => void }) {
  const { promoHints, applyCoupon } = useCart()
  if (promoHints.length === 0) return null

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {promoHints.map((hint) => (
        <button
          key={hint.code}
          type="button"
          onClick={() => {
            onPick?.(hint.code)
            applyCoupon(hint.code)
          }}
          className={`flex w-full items-start gap-1.5 rounded-lg border border-dashed px-2.5 py-1.5 text-left text-[11.5px] transition-colors ${
            hint.usable
              ? 'border-[#0f7a43]/40 bg-[#f2fbf6] text-[#0f7a43] hover:border-[#0f7a43]'
              : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
          }`}
        >
          <span className="mi shrink-0 text-[15px] leading-none">sell</span>
          <span className="min-w-0">
            <b className="font-bold">{hint.code}</b> — {hint.text}
            {hint.usable ? <span className="font-semibold"> · tap to apply</span> : null}
          </span>
        </button>
      ))}
    </div>
  )
}

'use client'

import GiftItemsEditor from '@/components/admin/bundles/GiftItemsEditor'
import {
  BUNDLE_TIER_COUNTS,
  clampGiftLimit,
  type BundleTier,
  type BundleTierCount,
} from '@/data/bundleData'

type Props = {
  tiers: BundleTier[]
  onChange: (tiers: BundleTier[]) => void
  /** Explains what "count" means for this bundle type. */
  hint: string
  /** Which tiers to show. Defaults to every supported count. */
  counts?: readonly BundleTierCount[]
}

/**
 * Discount + free gift per product count (2 / 3 / 4).
 *
 * Every supported count always gets a row, so an admin can see at a glance which tiers
 * are configured; a tier with a 0 value simply grants no discount.
 */
export default function TierEditor({ tiers, onChange, hint, counts = BUNDLE_TIER_COUNTS }: Props) {
  const tierFor = (count: BundleTierCount): BundleTier =>
    tiers.find((t) => t.count === count) ?? {
      count,
      discountType: 'fixed',
      discountValue: 0,
      gifts: [],
      giftLimit: 1,
    }

  const patch = (count: BundleTierCount, next: Partial<BundleTier>) => {
    const others = tiers.filter((t) => t.count !== count)
    onChange([...others, { ...tierFor(count), ...next }].sort((a, b) => a.count - b.count))
  }

  return (
    <div>
      <p className="m-0 mb-4 text-[12.5px] text-gray-500">{hint}</p>

      {/* Flex + a fixed 3-column basis rather than a grid: with fewer tiers the boxes keep
          the same width and simply centre, instead of stretching to fill the row. */}
      <div className="flex flex-wrap justify-center gap-4">
        {counts.map((count) => {
          const tier = tierFor(count)
          return (
            <div
              key={count}
              className="w-full rounded-xl border border-gray-200 bg-white p-4 md:w-[calc((100%-2rem)/3)]"
            >
              <h4 className="m-0 mb-3 text-[14px] font-bold text-gray-900">{count}-Product Discount</h4>

              <div className="mb-3 flex gap-2">
                <select
                  value={tier.discountType}
                  onChange={(e) =>
                    patch(count, { discountType: e.target.value as BundleTier['discountType'] })
                  }
                  className="h-9 rounded-lg border border-gray-200 px-2 text-[13px] outline-none"
                >
                  <option value="fixed">৳ Fixed</option>
                  <option value="percent">% Percent</option>
                </select>
                <input
                  type="number"
                  min={0}
                  max={tier.discountType === 'percent' ? 100 : undefined}
                  value={tier.discountValue}
                  onChange={(e) => {
                    const raw = Number(e.target.value) || 0
                    const clamped =
                      tier.discountType === 'percent' ? Math.min(100, Math.max(0, raw)) : Math.max(0, raw)
                    patch(count, { discountValue: clamped })
                  }}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-gray-200 px-2 text-[13px] outline-none focus:border-gray-400"
                />
              </div>

              <p className="m-0 mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Free gift
              </p>
              <GiftItemsEditor
                gifts={tier.gifts}
                limit={tier.giftLimit}
                onChange={(gifts) => patch(count, { gifts })}
                onLimitChange={(giftLimit) => patch(count, { giftLimit: clampGiftLimit(giftLimit) })}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

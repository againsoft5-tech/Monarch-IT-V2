'use client'

import { useState } from 'react'
import Image from 'next/image'
import { searchCatalog } from '@/lib/bundleStore'
import {
  BUNDLE_TIER_COUNTS,
  type BundleGift,
  type BundleTier,
  type BundleTierCount,
} from '@/data/bundleData'

const RED = '#bd2026'

type Props = {
  tiers: BundleTier[]
  onChange: (tiers: BundleTier[]) => void
  /** Explains what "count" means for this bundle type. */
  hint: string
  /** Which tiers to show. Defaults to every supported count. */
  counts?: readonly BundleTierCount[]
}

function GiftPicker({ gift, onChange }: { gift: BundleGift; onChange: (g: BundleGift) => void }) {
  const [query, setQuery] = useState('')
  const results = query.trim() ? searchCatalog(query, 6) : []

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {(['none', 'product', 'choice', 'text'] as const).map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => {
              if (kind === 'none') onChange({ kind: 'none' })
              else if (kind === 'text') onChange({ kind: 'text', text: '' })
              else if (kind === 'choice') onChange({ kind: 'choice', products: [] })
              else onChange({ kind: 'product', slug: '', name: '', image: '' })
            }}
            className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
              gift.kind === kind ? 'text-white' : 'bg-gray-100 text-gray-600'
            }`}
            style={gift.kind === kind ? { backgroundColor: RED } : undefined}
          >
            {kind === 'none'
              ? 'No gift'
              : kind === 'product'
                ? 'Fixed product'
                : kind === 'choice'
                  ? 'Customer picks'
                  : 'Custom text'}
          </button>
        ))}
      </div>

      {gift.kind === 'choice' ? (
        <div>
          <p className="m-0 mb-1.5 text-[11px] text-gray-500">
            Products the customer may choose one free item from.
          </p>
          {gift.products.length > 0 ? (
            <div className="mb-2 flex flex-col gap-1">
              {gift.products.map((g) => (
                <div key={g.slug} className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1.5">
                  {g.image ? (
                    <Image src={g.image} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
                  ) : null}
                  <span className="min-w-0 flex-1 truncate text-[12px] text-gray-700">{g.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({ kind: 'choice', products: gift.products.filter((x) => x.slug !== g.slug) })
                    }
                    className="text-gray-400 hover:text-[#bd2026]"
                    aria-label={`Remove ${g.name}`}
                  >
                    <span className="mi text-[16px] leading-none">close</span>
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products to offer…"
            className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
          />
          {results.length > 0 ? (
            <div className="mt-1 max-h-[150px] overflow-y-auto rounded-lg border border-gray-100">
              {results.map((p) => {
                const already = gift.products.some((g) => g.slug === p.slug)
                return (
                  <button
                    key={p.slug}
                    type="button"
                    disabled={already}
                    onClick={() => {
                      onChange({
                        kind: 'choice',
                        products: [...gift.products, { slug: p.slug, name: p.name, image: p.image }],
                      })
                      setQuery('')
                    }}
                    className="flex w-full items-center gap-2 border-b border-gray-50 px-2 py-1.5 text-left last:border-b-0 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <Image src={p.image} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
                    <span className="min-w-0 flex-1 truncate text-[12.5px] text-gray-700">{p.name}</span>
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      {gift.kind === 'text' ? (
        <input
          type="text"
          value={gift.text}
          onChange={(e) => onChange({ kind: 'text', text: e.target.value })}
          placeholder='e.g. "Free T-Shirt"'
          className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
        />
      ) : null}

      {gift.kind === 'product' ? (
        <div>
          {gift.slug ? (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1.5">
              {gift.image ? (
                <Image src={gift.image} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
              ) : null}
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-gray-700">{gift.name}</span>
              <button
                type="button"
                onClick={() => onChange({ kind: 'product', slug: '', name: '', image: '' })}
                className="text-[12px] text-gray-400 hover:text-[#bd2026]"
              >
                Change
              </button>
            </div>
          ) : null}

          {!gift.slug ? (
            <>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a product to gift…"
                className="h-9 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
              />
              {results.length > 0 ? (
                <div className="mt-1 max-h-[150px] overflow-y-auto rounded-lg border border-gray-100">
                  {results.map((p) => (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => {
                        onChange({ kind: 'product', slug: p.slug, name: p.name, image: p.image })
                        setQuery('')
                      }}
                      className="flex w-full items-center gap-2 border-b border-gray-50 px-2 py-1.5 text-left last:border-b-0 hover:bg-gray-50"
                    >
                      <Image src={p.image} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                      <span className="min-w-0 flex-1 truncate text-[12.5px] text-gray-700">{p.name}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
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
      gift: { kind: 'none' },
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
              <GiftPicker gift={tier.gift} onChange={(gift) => patch(count, { gift })} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

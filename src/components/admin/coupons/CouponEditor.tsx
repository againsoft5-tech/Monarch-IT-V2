'use client'

import { useState } from 'react'
import { categoryProductsMap } from '@/data/categoryProducts'
import { brandList } from '@/data/brandIndex'
import { searchCatalog } from '@/lib/bundleStore'
import { couponOfferLabel, type Coupon, type CouponKind } from '@/data/couponData'

const RED = '#bd2026'

/** Chip list with a remove button — used for all three scope lists. */
function Chips({
  values,
  labelFor,
  onRemove,
}: {
  values: string[]
  labelFor: (value: string) => string
  onRemove: (value: string) => void
}) {
  if (values.length === 0) return null
  return (
    <div className="mb-1.5 flex flex-wrap gap-1">
      {values.map((v) => (
        <span
          key={v}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-[11.5px] text-gray-700"
        >
          {labelFor(v)}
          <button type="button" onClick={() => onRemove(v)} aria-label={`Remove ${labelFor(v)}`}>
            <span className="mi text-[14px] leading-none text-gray-400 hover:text-[#bd2026]">close</span>
          </button>
        </span>
      ))}
    </div>
  )
}

/**
 * One coupon's settings.
 *
 * Edits a draft the parent owns, so nothing reaches the storefront until Save.
 */
export default function CouponEditor({
  coupon,
  onChange,
}: {
  coupon: Coupon
  onChange: (next: Coupon) => void
}) {
  const [query, setQuery] = useState('')
  const patch = (next: Partial<Coupon>) => onChange({ ...coupon, ...next })

  const categories = Object.keys(categoryProductsMap).sort()
  const results = query.trim() ? searchCatalog(query, 8) : []
  const scoped =
    coupon.categorySlugs.length > 0 || coupon.brandSlugs.length > 0 || coupon.productSlugs.length > 0
  const coversNothing = coupon.kind === 'product' && !coupon.appliesToAll && !scoped

  const num = (v: string) => (v.trim() === '' ? undefined : Math.max(0, Number(v) || 0))

  const KINDS: { key: CouponKind; label: string; blurb: string }[] = [
    {
      key: 'product',
      label: 'Product coupon',
      blurb: 'Pick the categories, brands or products it covers. Advertised on those products and applied automatically.',
    },
    {
      key: 'price-range',
      label: 'Price-range coupon',
      blurb: 'No product list — it covers whatever the customer buys that has no other offer and reaches the spend below. Only applies once the customer enters the code.',
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="m-0 mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Coupon type
        </p>
        <div className="grid gap-2 md:grid-cols-2">
          {KINDS.map((k) => (
            <button
              key={k.key}
              type="button"
              onClick={() => patch({ kind: k.key })}
              aria-pressed={coupon.kind === k.key}
              className={`rounded-xl border p-3 text-left transition-colors ${
                coupon.kind === k.key
                  ? 'border-[#bd2026] bg-[#fdf2f3]'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="block text-[13px] font-bold text-gray-900">{k.label}</span>
              <span className="mt-0.5 block text-[11.5px] leading-snug text-gray-500">{k.blurb}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Code + discount */}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[12px] font-semibold text-gray-600">Coupon code</span>
          <input
            type="text"
            value={coupon.code}
            onChange={(e) => patch({ code: e.target.value.toUpperCase() })}
            placeholder="BTS22"
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px] font-semibold uppercase tracking-wide outline-none focus:border-gray-400"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[12px] font-semibold text-gray-600">
            Badge text (optional)
          </span>
          <input
            type="text"
            value={coupon.label ?? ''}
            onChange={(e) => patch({ label: e.target.value || undefined })}
            placeholder="Limited Offer"
            className="h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
          />
        </label>
      </div>

      <div>
        <p className="m-0 mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Discount
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={coupon.type}
            onChange={(e) => patch({ type: e.target.value as Coupon['type'] })}
            className="h-10 rounded-lg border border-gray-200 px-2 text-[13px] outline-none focus:border-gray-400"
          >
            <option value="flat">৳ Fixed</option>
            <option value="percent">% Percent</option>
          </select>
          <input
            type="number"
            min={0}
            max={coupon.type === 'percent' ? 100 : undefined}
            value={coupon.value}
            onChange={(e) => {
              const raw = Number(e.target.value) || 0
              patch({ value: coupon.type === 'percent' ? Math.min(100, Math.max(0, raw)) : Math.max(0, raw) })
            }}
            className="h-10 rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
          />
          {coupon.type === 'percent' ? (
            <label className="block">
              <input
                type="number"
                min={0}
                value={coupon.maxDiscount ?? ''}
                onChange={(e) => patch({ maxDiscount: num(e.target.value) })}
                placeholder="Max discount ৳"
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
              />
            </label>
          ) : null}
        </div>
        <p className="m-0 mt-1.5 text-[11.5px] text-gray-500">
          Shows as <b>{couponOfferLabel(coupon)}</b> on products.
          {coupon.type === 'percent' && coupon.maxDiscount
            ? ` Never more than ৳${coupon.maxDiscount.toLocaleString()}.`
            : ''}
        </p>
      </div>

      {/* Rules */}
      <div>
        <p className="m-0 mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Rules</p>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[12px] text-gray-600">Minimum order (৳)</span>
            <input
              type="number"
              min={0}
              value={coupon.minOrder ?? ''}
              onChange={(e) => patch({ minOrder: num(e.target.value) })}
              placeholder="No minimum"
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] text-gray-600">Total uses allowed</span>
            <input
              type="number"
              min={0}
              value={coupon.usageLimit ?? ''}
              onChange={(e) => patch({ usageLimit: num(e.target.value) })}
              placeholder="Unlimited"
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] text-gray-600">Starts</span>
            <input
              type="date"
              value={coupon.startsAt?.slice(0, 10) ?? ''}
              onChange={(e) => patch({ startsAt: e.target.value || undefined })}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] text-gray-600">Ends</span>
            <input
              type="date"
              value={coupon.endsAt?.slice(0, 10) ?? ''}
              onChange={(e) => patch({ endsAt: e.target.value || undefined })}
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
            />
          </label>
        </div>
        {coupon.usageLimit ? (
          <p className="m-0 mt-1.5 text-[11.5px] text-gray-500">
            Used {coupon.used} of {coupon.usageLimit}.
          </p>
        ) : null}
      </div>

      {/* Scope */}
      {coupon.kind === 'price-range' ? (
        <div>
          <p className="m-0 mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Applies to
          </p>
          <p className="m-0 mb-2.5 text-[11.5px] text-gray-500">
            Any cart line with no other offer, once its total (unit price × quantity) falls in
            this range. Two ৳300 items count as ৳600.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[12px] text-gray-600">Line total from (৳)</span>
              <input
                type="number"
                min={0}
                value={coupon.minLineTotal ?? ''}
                onChange={(e) => patch({ minLineTotal: num(e.target.value) })}
                placeholder="500"
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] text-gray-600">Up to (৳, optional)</span>
              <input
                type="number"
                min={0}
                value={coupon.maxLineTotal ?? ''}
                onChange={(e) => patch({ maxLineTotal: num(e.target.value) })}
                placeholder="No upper limit"
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-[13px] outline-none focus:border-gray-400"
              />
            </label>
          </div>
          <p className="m-0 mt-1.5 text-[11.5px] text-gray-500">
            Not shown on product pages or cards — the customer applies it in the cart.
          </p>
        </div>
      ) : (
      <div>
        <p className="m-0 mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Applies to
        </p>
        <label className="mb-2 flex items-center gap-2 text-[13px] text-gray-800">
          <input
            type="checkbox"
            checked={coupon.appliesToAll === true}
            onChange={(e) => patch({ appliesToAll: e.target.checked })}
          />
          Every product on the site
        </label>

        {coupon.appliesToAll ? (
          <p className="m-0 mb-2.5 text-[11.5px] text-gray-500">
            Covers the whole catalog. The lists below are ignored.
          </p>
        ) : coversNothing ? (
          <p className="m-0 mb-2.5 text-[11.5px] font-semibold text-[#bd2026]">
            Nothing selected — this coupon covers no products and will never apply. Pick a
            category, brand or product below, or tick “Every product”.
          </p>
        ) : (
          <p className="m-0 mb-2.5 text-[11.5px] text-gray-500">
            Any product matching one of the lists below.
          </p>
        )}

        <div className={`grid gap-4 md:grid-cols-3 ${coupon.appliesToAll ? 'pointer-events-none opacity-40' : ''}`}>
          <div>
            <span className="mb-1 block text-[12px] font-semibold text-gray-600">Categories</span>
            <Chips
              values={coupon.categorySlugs}
              labelFor={(v) => v}
              onRemove={(v) => patch({ categorySlugs: coupon.categorySlugs.filter((x) => x !== v) })}
            />
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) patch({ categorySlugs: [...coupon.categorySlugs, e.target.value] })
              }}
              className="h-10 w-full rounded-lg border border-gray-200 px-2 text-[12.5px] outline-none focus:border-gray-400"
            >
              <option value="">Add category…</option>
              {categories
                .filter((c) => !coupon.categorySlugs.includes(c))
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <span className="mb-1 block text-[12px] font-semibold text-gray-600">Brands</span>
            <Chips
              values={coupon.brandSlugs}
              labelFor={(v) => brandList.find((b) => b.slug === v)?.name ?? v}
              onRemove={(v) => patch({ brandSlugs: coupon.brandSlugs.filter((x) => x !== v) })}
            />
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) patch({ brandSlugs: [...coupon.brandSlugs, e.target.value] })
              }}
              className="h-10 w-full rounded-lg border border-gray-200 px-2 text-[12.5px] outline-none focus:border-gray-400"
            >
              <option value="">Add brand…</option>
              {brandList
                .filter((b) => !coupon.brandSlugs.includes(b.slug))
                .map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <span className="mb-1 block text-[12px] font-semibold text-gray-600">Products</span>
            <Chips
              values={coupon.productSlugs}
              labelFor={(v) => v}
              onRemove={(v) => patch({ productSlugs: coupon.productSlugs.filter((x) => x !== v) })}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="h-10 w-full rounded-lg border border-gray-200 px-3 text-[12.5px] outline-none focus:border-gray-400"
            />
            {results.length > 0 ? (
              <div className="mt-1 max-h-[170px] overflow-y-auto rounded-lg border border-gray-100 thin-scroll-gray">
                {results.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    disabled={coupon.productSlugs.includes(p.slug)}
                    onClick={() => {
                      patch({ productSlugs: [...coupon.productSlugs, p.slug] })
                      setQuery('')
                    }}
                    className="block w-full truncate border-b border-gray-50 px-2 py-1.5 text-left text-[12px] text-gray-700 last:border-b-0 hover:bg-gray-50 disabled:opacity-40"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      )}

      <label className="flex items-center gap-2 text-[13px] text-gray-800">
        <input
          type="checkbox"
          checked={coupon.active}
          onChange={(e) => patch({ active: e.target.checked })}
        />
        Live on the storefront
        <span className="text-[11.5px] text-gray-400">
          (a draft is never advertised or auto-applied)
        </span>
      </label>

      <span className="text-[11px] text-gray-400" style={{ color: coupon.code ? undefined : RED }}>
        {coupon.code ? '' : 'A coupon needs a code before it can go live.'}
      </span>
    </div>
  )
}

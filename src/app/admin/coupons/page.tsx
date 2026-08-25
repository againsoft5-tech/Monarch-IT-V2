'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import CouponEditor from '@/components/admin/coupons/CouponEditor'
import SaveBar from '@/components/admin/bundles/SaveBar'
import {
  createCoupon,
  deleteCoupon,
  saveCoupon,
  setCouponActive,
  useCoupons,
} from '@/lib/couponStore'
import { couponOfferLabel, isCouponLive, type Coupon } from '@/data/couponData'

const RED = '#bd2026'

function scopeSummary(coupon: Coupon): string {
  if (coupon.kind === 'price-range') {
    const from = coupon.minLineTotal ? `৳${coupon.minLineTotal.toLocaleString()}+` : 'any'
    const to = coupon.maxLineTotal ? ` – ৳${coupon.maxLineTotal.toLocaleString()}` : ''
    return `Price range · lines ${from}${to} with no other offer`
  }
  if (coupon.appliesToAll) return 'Every product'
  const bits: string[] = []
  if (coupon.categorySlugs.length) bits.push(`${coupon.categorySlugs.length} categories`)
  if (coupon.brandSlugs.length) bits.push(`${coupon.brandSlugs.length} brands`)
  if (coupon.productSlugs.length) bits.push(`${coupon.productSlugs.length} products`)
  // Flagged rather than hidden: a coupon covering nothing looks live but never fires.
  return bits.length ? bits.join(' · ') : '⚠ No products selected'
}

export default function AdminCouponsPage() {
  const { isAdminLoggedIn, adminChecked } = useAdminAuth()
  const router = useRouter()
  const coupons = useCoupons()
  const [newCode, setNewCode] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  /** Local working copy — nothing here is public until Save. */
  const [draft, setDraft] = useState<Coupon | null>(null)
  const [saved, setSaved] = useState(false)

  const stored = coupons.find((c) => c.id === editingId)

  useEffect(() => {
    if (adminChecked && !isAdminLoggedIn) router.replace('/admin/login')
  }, [adminChecked, isAdminLoggedIn, router])

  const dirty = useMemo(
    () => Boolean(draft && stored && JSON.stringify(draft) !== JSON.stringify(stored)),
    [draft, stored],
  )

  if (!adminChecked || !isAdminLoggedIn) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#eef0f3] text-[14px] text-gray-400">
        Loading...
      </div>
    )
  }

  const productCoupons = coupons.filter((c) => c.kind !== 'price-range')
  const priceRangeCoupons = coupons.filter((c) => c.kind === 'price-range')

  const open = (coupon: Coupon) => {
    setEditingId(coupon.id)
    setDraft(coupon)
    setSaved(false)
  }

  const create = (kind: Coupon['kind']) => {
    const created = createCoupon(newCode, kind)
    setNewCode('')
    open(created)
  }

  return (
    <div className="bundles-module min-h-full bg-[#eef0f3] px-4 py-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="m-0 text-xl font-bold text-gray-900">Coupons</h1>
          <p className="m-0 mt-1 text-[13px] text-gray-500">
            A <b>product coupon</b> is advertised on the products it covers and applied
            automatically. A <b>price-range coupon</b> is a plain promo code the customer
            enters, covering whatever they buy that has no other offer.
          </p>
        </div>

        {/* Create */}
        <section className="mb-5 rounded-2xl bg-white p-5">
          <h2 className="m-0 text-[15px] font-bold text-gray-900">New coupon</h2>
          <p className="m-0 mb-3 mt-0.5 text-[12.5px] text-gray-500">
            Enter a code, then pick which kind to create. You can change the kind later.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') create('product')
              }}
              placeholder="Coupon code, e.g. BTS22"
              className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-[13px] font-semibold uppercase tracking-wide outline-none focus:border-gray-400"
            />
            <button
              type="button"
              onClick={() => create('product')}
              disabled={!newCode.trim()}
              className="h-10 rounded-full px-5 text-[13px] font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: RED }}
            >
              Product coupon
            </button>
            <button
              type="button"
              onClick={() => create('price-range')}
              disabled={!newCode.trim()}
              className="h-10 rounded-full border px-5 text-[13px] font-semibold disabled:opacity-40"
              style={{ borderColor: RED, color: RED }}
            >
              Price-range coupon
            </button>
          </div>
        </section>

        {/* Lists — the two kinds behave so differently that mixing them in one table
            makes the list hard to scan: one is advertised and automatic, the other is
            a code the customer has to type. */}
        {([
          {
            kind: 'product' as const,
            title: 'Product coupons',
            blurb: 'Advertised on the products they cover and applied automatically.',
            rows: productCoupons,
          },
          {
            kind: 'price-range' as const,
            title: 'Price-range coupons',
            blurb: 'Plain promo codes the customer enters — they cover whatever has no other offer.',
            rows: priceRangeCoupons,
          },
        ]).map((group) => (
          <section key={group.kind} className="mb-5 rounded-2xl bg-white p-5">
            <h2 className="m-0 text-[15px] font-bold text-gray-900">
              {group.title} ({group.rows.length})
            </h2>
            <p className="m-0 mb-4 mt-0.5 text-[12.5px] text-gray-500">{group.blurb}</p>

            {group.rows.length === 0 ? (
              <p className="m-0 text-[13px] text-gray-400">None yet.</p>
            ) : (
              <ul className="flex list-none flex-col gap-2 p-0">
                {group.rows.map((c) => {
                  const live = isCouponLive(c)
                  return (
                    <li
                      key={c.id}
                      className={`flex flex-wrap items-center gap-3 rounded-xl px-3 py-2.5 ${
                        editingId === c.id ? 'bg-[#fdf2f3]' : 'bg-gray-50'
                      }`}
                    >
                      <span className="rounded-lg bg-white px-2.5 py-1 text-[12.5px] font-bold uppercase tracking-wide text-gray-800">
                        {c.code || '(no code)'}
                      </span>
                      <span className="text-[12.5px] font-semibold text-[#c3272b]">
                        {couponOfferLabel(c)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[12px] text-gray-500">
                        {scopeSummary(c)}
                        {c.minOrder ? ` · min ৳${c.minOrder.toLocaleString()}` : ''}
                        {c.endsAt ? ` · till ${c.endsAt.slice(0, 10)}` : ''}
                      </span>

                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          live ? 'bg-[#e8f6ee] text-[#0f7a43]' : 'bg-gray-200 text-gray-500'
                        }`}
                        title={
                          c.active && !live
                            ? 'Active, but outside its dates or fully used'
                            : undefined
                        }
                      >
                        {live ? 'Live' : c.active ? 'Not running' : 'Draft'}
                      </span>

                      <button
                        type="button"
                        onClick={() => open(c)}
                        className="shrink-0 rounded-full border border-gray-300 px-3 py-1 text-[12px] font-semibold text-gray-700 hover:border-gray-400"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setCouponActive(c.id, !c.active)}
                        className="shrink-0 text-[12px] font-semibold text-gray-500 hover:text-gray-800"
                      >
                        {c.active ? 'Set draft' : 'Set live'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!window.confirm(`Delete coupon "${c.code}"?`)) return
                          deleteCoupon(c.id)
                          if (editingId === c.id) {
                            setEditingId(null)
                            setDraft(null)
                          }
                        }}
                        className="shrink-0 text-gray-400 hover:text-[#bd2026]"
                        aria-label={`Delete ${c.code}`}
                      >
                        <span className="mi text-[18px]">delete</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        ))}

        {/* Editor */}
        {draft ? (
          <section className="rounded-2xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="m-0 text-[15px] font-bold text-gray-900">
                Editing {draft.code || 'new coupon'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setDraft(null)
                }}
                className="text-gray-400 hover:text-gray-700"
                aria-label="Close editor"
              >
                <span className="mi text-[20px] leading-none">close</span>
              </button>
            </div>
            <CouponEditor coupon={draft} onChange={setDraft} />
          </section>
        ) : null}
      </div>

      {draft ? (
        <SaveBar
          dirty={dirty}
          saved={saved}
          onSave={() => {
            const committed = saveCoupon(draft)
            if (committed) setDraft(committed)
            setSaved(true)
          }}
          onDiscard={() => {
            if (stored) setDraft(stored)
            setSaved(false)
          }}
        />
      ) : null}
    </div>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import ProductImage from '@/components/ui/ProductImage'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import BundleAddedModal from '@/components/bundles/BundleAddedModal'
import GiftChoiceModal from '@/components/bundles/GiftChoiceModal'
import ShareButton from '@/components/bundles/ShareButton'
import { bundleToCartItem } from '@/lib/bundleCart'
import { computeBundlePricing, resolveGifts, type ReadyBundle } from '@/data/bundleData'
import type { CartItem } from '@/data/cart'

/**
 * A single ready bundle on its own page — the destination of a shared link.
 *
 * Wider than the grid card so a recipient arriving cold can see every product, the
 * free gifts and the saving without scrolling into a list of other bundles.
 */
export default function BundleDetail({ bundle }: { bundle: ReadyBundle }) {
  const { addItems } = useCart()
  const [chosenGiftIds, setChosenGiftIds] = useState<string[]>([])
  const [giftOpen, setGiftOpen] = useState(false)
  const [added, setAdded] = useState<CartItem | null>(null)

  const pricing = computeBundlePricing(bundle.products, bundle.tiers)
  const saving = Math.max(0, pricing.regularTotal - pricing.total)
  const gifts = pricing.gifts
  const giftLimit = pricing.giftLimit
  const activeGifts = resolveGifts(gifts, chosenGiftIds, giftLimit)
  const needsChoice = gifts.length > giftLimit
  const threeUp = bundle.products.length === 3

  const add = () => {
    const item = bundleToCartItem({
      cartId: `ready-${bundle.id}`,
      name: bundle.name,
      image: bundle.image,
      slug: `bundles/${bundle.id}`,
      products: bundle.products,
      tiers: bundle.tiers,
      chosenGiftIds,
    })
    addItems([item])
    setAdded(item)
  }

  return (
    <div className="bundles-module container mx-auto px-4 py-8 min-[992px]:px-14">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Product tiles — same layout rules as the grid card, just larger. */}
        <div
          className="grid h-[300px] gap-4 sm:h-[420px]"
          style={{
            gridTemplateColumns: threeUp ? 'minmax(0, 0.85fr) minmax(0, 1.5fr)' : 'repeat(2, minmax(0, 1fr))',
            gridTemplateRows: bundle.products.length > 2 ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
          }}
        >
          {bundle.products.map((p, i) => {
            const cell = !threeUp
              ? undefined
              : i === 2
                ? { gridColumn: 2, gridRow: '1 / span 2' }
                : { gridColumn: 1, gridRow: i + 1 }
            return (
              <Link
                key={p.id}
                href={`/${p.slug}`}
                title={p.name}
                style={cell}
                className="flex h-full items-center justify-center rounded-2xl bg-[#f5f6fa] p-4 transition-colors hover:bg-[#eceff5]"
              >
                <ProductImage
                  src={p.image}
                  alt={p.name}
                  width={320}
                  height={320}
                  className="max-h-full max-w-full object-contain"
                />
              </Link>
            )
          })}
        </div>

        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdecec] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#c3272b]">
            Monarch Bundle
          </span>
          <h1 className="m-0 mt-3 text-[24px] font-bold leading-tight text-gray-900 md:text-[28px]">
            {bundle.name}
          </h1>
          {bundle.description ? (
            <p className="m-0 mt-2 text-[13.5px] leading-relaxed text-gray-500">{bundle.description}</p>
          ) : null}

          <ul className="mt-5 flex min-w-0 list-none flex-col gap-2 p-0">
            {bundle.products.map((p, i) => (
              <li key={p.id} className="flex min-w-0 items-center gap-2.5 text-[13px]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#333] text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                <Link
                  href={`/${p.slug}`}
                  title={p.name}
                  className="inline-block max-w-full min-w-0 flex-1 truncate align-bottom text-gray-700 no-underline hover:text-[#c3272b]"
                >
                  {p.name}
                </Link>
                <span className="shrink-0 whitespace-nowrap">
                  <span className="font-semibold text-gray-700">৳{p.priceNew.toLocaleString()}</span>
                  {p.priceOld > p.priceNew ? (
                    <span className="ml-1.5 text-[11.5px] text-gray-400 line-through">
                      ৳{p.priceOld.toLocaleString()}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>

          {gifts.length > 0 ? (
            <div className="mt-4">
              <span className="mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#0f7a43]">
                <span className="mi text-[15px] leading-none">redeem</span>
                {needsChoice ? `Free gift — pick ${giftLimit}` : 'Free gift'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeGifts.map((g) => (
                  <span
                    key={g.id}
                    className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-[#e8f6ee] px-3 py-1.5 text-[12px] font-bold text-[#0f7a43]"
                  >
                    {g.image ? (
                      <ProductImage src={g.image} alt="" width={20} height={20} className="h-4 w-4 shrink-0 object-contain" />
                    ) : null}
                    <span className="min-w-0 truncate">{g.name}</span>
                  </span>
                ))}
                {needsChoice ? (
                  <button
                    type="button"
                    onClick={() => setGiftOpen(true)}
                    className="rounded-full border border-[#0f7a43] px-3 py-1.5 text-[12px] font-bold text-[#0f7a43] transition-colors hover:bg-[#e8f6ee]"
                  >
                    Change
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#e3e6ee] pt-4">
            {saving > 0 ? (
              <span className="rounded-full bg-[#e8f6ee] px-3 py-1 text-[12px] font-bold text-[#00a05a]">
                Save ৳{saving.toLocaleString()}
              </span>
            ) : null}
            <span className="ml-auto flex items-baseline gap-2 whitespace-nowrap">
              <span className="text-[24px] font-bold text-[#c3272b]">
                <span className="font-medium">৳</span>
                <span className="font-price">{pricing.total.toLocaleString()}</span>
              </span>
              {saving > 0 ? (
                <span className="text-[13px] text-gray-400 line-through">
                  ৳{pricing.regularTotal.toLocaleString()}
                </span>
              ) : null}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2.5">
            <button
              type="button"
              onClick={add}
              className="h-12 min-w-0 flex-1 rounded-full bg-[#c3272b] text-[13.5px] font-bold uppercase tracking-wide text-white shadow-[0_6px_16px_rgba(195,39,43,0.28)] transition-colors hover:bg-[#a5121c]"
            >
              Add bundle to cart
            </button>
            <ShareButton
              size="md"
              path={`/bundles/${bundle.id}`}
              text={`${bundle.name} — ৳${pricing.total.toLocaleString()} at Monarch IT`}
            />
          </div>

          <Link
            href="/bundles"
            className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-gray-500 no-underline hover:text-[#c3272b]"
          >
            <span className="mi text-[16px] leading-none">arrow_back</span> All bundles
          </Link>
        </div>
      </div>

      <GiftChoiceModal
        open={giftOpen}
        gifts={gifts}
        limit={giftLimit}
        selectedIds={activeGifts.map((g) => g.id)}
        onChange={setChosenGiftIds}
        onClose={() => setGiftOpen(false)}
      />
      <BundleAddedModal item={added} onClose={() => setAdded(null)} />
    </div>
  )
}

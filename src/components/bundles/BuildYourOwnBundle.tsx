'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import ProductPickerModal from '@/components/bundles/ProductPickerModal'
import BundleAddedModal from '@/components/bundles/BundleAddedModal'
import GiftChoiceModal from '@/components/bundles/GiftChoiceModal'
import ShareButton from '@/components/bundles/ShareButton'
import { bundleToCartItem } from '@/lib/bundleCart'
import { buildShareLink } from '@/lib/bundleShareLink'
import type { CartItem } from '@/data/cart'
import {
  BUNDLE_TIER_COUNTS,
  computeBundlePricing,
  giftPickLimit,
  giftsAreAutomatic,
  tierForCount,
  type BundleProduct,
  type BundleTierCount,
  type CustomBundle,
} from '@/data/bundleData'

/** Copy for each tier card, matching the three-card selector in the design. */
const TIER_COPY: Record<BundleTierCount, { eyebrow: string; blurb: string }> = {
  2: { eyebrow: 'Get a special bundle discount', blurb: 'Choose 2 products and save more.' },
  3: { eyebrow: 'Get a higher bundle discount', blurb: 'Choose 3 products and unlock a bigger discount.' },
  4: { eyebrow: 'Get our best bundle discount', blurb: 'Choose 4 products and get the best bundle price.' },
}

/** Empty slot / filled slot tile. */
function Slot({
  product,
  onClick,
  onClear,
  label = 'SELECT PRODUCT',
}: {
  product?: { name: string; image?: string; priceNew?: number }
  onClick: () => void
  onClear?: () => void
  label?: string
}) {
  if (!product) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-2xl bg-[#f5f6fa] text-gray-400 transition-colors hover:bg-[#eceff5] hover:text-[#c3272b]"
      >
        <span className="mi text-[34px] leading-none">add</span>
        <span className="text-[11px] font-semibold tracking-wide">{label}</span>
      </button>
    )
  }

  return (
    <div className="relative flex aspect-square w-full flex-col items-center justify-center rounded-2xl bg-[#f5f6fa] p-3">
      <button
        type="button"
        onClick={onClick}
        className="flex h-full w-full flex-col items-center justify-center gap-1"
        title="Change product"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={150}
            height={150}
            className="h-[62%] w-[70%] object-contain"
          />
        ) : (
          // Text gifts carry no artwork, so the gift glyph stands in.
          <span className="mi text-[40px] leading-none text-[#0f7a43]">redeem</span>
        )}
        <span className="line-clamp-2 px-1 text-center text-[11px] font-semibold leading-tight text-gray-700">
          {product.name}
        </span>
        {typeof product.priceNew === 'number' ? (
          <span className="text-[12px] font-bold text-[#c3272b]">৳{product.priceNew.toLocaleString()}</span>
        ) : null}
      </button>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          aria-label={`Remove ${product.name}`}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-400 shadow hover:text-[#c3272b]"
        >
          <span className="mi text-[16px] leading-none">close</span>
        </button>
      ) : null}
    </div>
  )
}

export type BuildInitialSelection = {
  bundleId: string
  tierCount: BundleTierCount
  products: BundleProduct[]
  giftIds: string[]
  /** Slugs a share link asked for that no longer resolve. */
  droppedProducts: string[]
}

export default function BuildYourOwnBundle({
  bundles,
  initial,
}: {
  bundles: CustomBundle[]
  /** A selection restored from a share link, already validated server-side. */
  initial?: BuildInitialSelection
}) {
  const { addItems } = useCart()
  const [bundleId, setBundleId] = useState(initial?.bundleId ?? bundles[0]?.id ?? '')
  const bundle = bundles.find((b) => b.id === bundleId) ?? bundles[0]

  const [tierCount, setTierCount] = useState<BundleTierCount>(initial?.tierCount ?? 2)
  /** Slot index → chosen product. Sparse so slots can be filled in any order. */
  const [slots, setSlots] = useState<Record<number, BundleProduct>>(() =>
    Object.fromEntries((initial?.products ?? []).map((p, i) => [i, p])),
  )
  /** Gifts the customer picked; only meaningful when the pool exceeds the allowance. */
  const [chosenGiftIds, setChosenGiftIds] = useState<string[]>(initial?.giftIds ?? [])
  /** Dismissible: the recipient only needs telling once. */
  const [droppedNotice, setDroppedNotice] = useState(initial?.droppedProducts ?? [])
  const [picking, setPicking] = useState<{ index: number } | null>(null)
  const [giftOpen, setGiftOpen] = useState(false)
  /** The line just added, shown in the confirmation dialog. */
  const [added, setAdded] = useState<CartItem | null>(null)

  const tier = bundle ? tierForCount(bundle.tiers, tierCount) : undefined
  const gifts = tier?.gifts ?? []
  /** How many free products this tier hands over — the admin's allowance, capped by the pool. */
  const giftLimit = giftPickLimit(gifts, tier?.giftLimit)
  /** A pool no bigger than the allowance is simply granted: nothing to choose. */
  const giftsAuto = giftsAreAutomatic(gifts, tier?.giftLimit)
  const chosenGifts = giftsAuto
    ? gifts
    : chosenGiftIds
        .map((id) => gifts.find((g) => g.id === id))
        .filter((g): g is (typeof gifts)[number] => Boolean(g))

  const selected = useMemo(
    () => Array.from({ length: tierCount }, (_, i) => slots[i]).filter(Boolean) as BundleProduct[],
    [slots, tierCount],
  )
  const pricing = useMemo(
    () => (bundle ? computeBundlePricing(selected, bundle.tiers) : undefined),
    [bundle, selected],
  )

  const allFilled = selected.length === tierCount
  // Empty gift slots would ship a bundle the customer did not finish configuring.
  const giftsPicked = giftsAuto || gifts.length === 0 || chosenGifts.length === giftLimit
  const canAdd = allFilled && giftsPicked

  const reset = (count: BundleTierCount) => {
    setTierCount(count)
    // Keep any already-chosen products that still fit the new slot count.
    setSlots((prev) => {
      const next: Record<number, BundleProduct> = {}
      for (let i = 0; i < count; i++) if (prev[i]) next[i] = prev[i]
      return next
    })
    setChosenGiftIds([])
  }

  /* Gifts are chosen inline from their own tiles, so the picker only ever
     browses the bundle's purchasable tabs. */

  const addToCart = () => {
    if (!bundle || !canAdd) return
    const item = bundleToCartItem({
      cartId: `bundle-${bundle.id}-${selected.map((p) => p.slug).sort().join('_')}`,
      name: `${bundle.name} · ${tierCount}-Product Bundle`,
      slug: 'bundles',
      products: selected,
      tiers: bundle.tiers,
      chosenGiftIds,
    })
    addItems([item])
    setSlots({})
    setChosenGiftIds([])
    setAdded(item)
  }

  if (!bundle) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-[14px] text-gray-400">
        No build-your-own bundle is live right now. Please check back soon.
      </div>
    )
  }

  return (
    <div>
      <div className="mb-7 text-center">
        <h2 className="m-0 text-2xl font-bold text-gray-900 md:text-[28px]">Build Your Own Bundle</h2>
        <p className="m-0 mt-1.5 text-[14px] text-gray-500">
          Choose 2, 3, or 4 products and enjoy an exclusive discount on your bundle.
        </p>
      </div>

      {/* A shared link can outlive its products. Say so rather than quietly showing
          a smaller bundle than the sender built. */}
      {droppedNotice.length > 0 ? (
        <div className="mx-auto mb-6 flex max-w-[560px] items-start gap-2 rounded-2xl bg-[#fff6e6] px-4 py-3 text-[12.5px] text-[#8a5a00]">
          <span className="mi shrink-0 text-[18px] leading-none">info</span>
          <span className="min-w-0 flex-1">
            {droppedNotice.length === 1
              ? '1 product from this shared bundle is no longer available, so it was left out.'
              : `${droppedNotice.length} products from this shared bundle are no longer available, so they were left out.`}
          </span>
          <button
            type="button"
            onClick={() => setDroppedNotice([])}
            aria-label="Dismiss"
            className="shrink-0 text-[#8a5a00]/60 hover:text-[#8a5a00]"
          >
            <span className="mi text-[16px] leading-none">close</span>
          </button>
        </div>
      ) : null}

      {bundles.length > 1 ? (
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {bundles.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setBundleId(b.id)
                setSlots({})
                setChosenGiftIds([])
              }}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
                b.id === bundle.id ? 'bg-[#c3272b] text-white' : 'bg-[#f5f5f7] text-gray-600'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      ) : null}

      {/* Tier selector */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {BUNDLE_TIER_COUNTS.map((count) => {
          const active = tierCount === count
          return (
            <button
              key={count}
              type="button"
              onClick={() => reset(count)}
              className={`rounded-2xl border px-5 py-4 text-left transition-colors ${
                active ? 'border-[#c3272b] bg-white' : 'border-[#eceff3] bg-white hover:border-gray-300'
              }`}
            >
              <span className="block text-[10.5px] font-semibold uppercase tracking-wide text-gray-400">
                {TIER_COPY[count].eyebrow}
              </span>
              <span className="mt-1 block text-[17px] font-bold text-gray-900">{count}-Product Bundle</span>
              <span className="mt-1 block text-[12px] leading-snug text-gray-500">{TIER_COPY[count].blurb}</span>
            </button>
          )
        })}
      </div>

      {/* Slots */}
      <div className="mb-3 text-center">
        <p className="m-0 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-gray-400">
          Your selected bundle
        </p>
        <h3 className="m-0 mt-0.5 text-[19px] font-bold text-gray-900">{tierCount}-Product Bundle</h3>
      </div>

      {/* Fixed slot width rather than fractional columns — otherwise a 2-product bundle
          stretches two square tiles across the whole container. */}
      <div className="mb-10 flex flex-wrap justify-center gap-4">
        {Array.from({ length: tierCount }, (_, i) => (
          <div key={i} className="w-[calc(50%-8px)] sm:w-[200px]">
            <Slot
              product={slots[i]}
              onClick={() => setPicking({ index: i })}
              onClear={slots[i] ? () => setSlots((p) => { const n = { ...p }; delete n[i]; return n }) : undefined}
            />
          </div>
        ))}
      </div>

      {/* Free products — one slot per gift the tier hands over. A pool the same
          size as the allowance needs no choosing, so those show as filled tiles. */}
      {gifts.length > 0 ? (
        <div className="mb-10">
          <div className="mb-3 text-center">
            <h3 className="m-0 text-[19px] font-bold text-gray-900">Select your free products</h3>
            <p className="m-0 mt-0.5 text-[12.5px] text-gray-500">
              {giftsAuto
                ? 'Included free with this bundle.'
                : `Choose ${giftLimit} eligible free product${
                    giftLimit === 1 ? '' : 's'
                  } from our collection.`}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {Array.from({ length: giftLimit }, (_, i) => {
              const gift = chosenGifts[i]
              return (
                <div key={gift?.id ?? `gift-slot-${i}`} className="w-[calc(50%-8px)] sm:w-[200px]">
                  <Slot
                    label="SELECT GIFT"
                    product={gift ? { name: gift.name, image: gift.image } : undefined}
                    onClick={() => {
                      if (!giftsAuto) setGiftOpen(true)
                    }}
                    onClear={
                      !giftsAuto && gift
                        ? () => setChosenGiftIds((prev) => prev.filter((id) => id !== gift.id))
                        : undefined
                    }
                  />
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* Summary */}
      {pricing ? (
        <div className="mx-auto max-w-[560px] overflow-hidden rounded-2xl bg-[#f5f6fa]">
          <ul className="m-0 flex list-none flex-col p-0">
            {selected.map((p, i) => (
              <li key={p.slug} className="flex items-center gap-3 border-b border-white px-4 py-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#333] text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-gray-800">{p.name}</span>
                <span className="shrink-0 whitespace-nowrap text-[13px]">
                  <span className="font-semibold text-gray-700">৳{p.priceNew.toLocaleString()}</span>
                  {p.priceOld > p.priceNew ? (
                    <span className="ml-1 text-[11.5px] text-gray-400 line-through">
                      ৳{p.priceOld.toLocaleString()}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
            {selected.length === 0 ? (
              <li className="px-4 py-4 text-center text-[13px] text-gray-400">
                Pick {tierCount} products to see your bundle price.
              </li>
            ) : null}
          </ul>

          <div className="px-4 py-3">
            {/* Only what the customer actually holds — listing the fallback here would
                credit gifts whose slots are still empty. */}
            {chosenGifts.map((g, i) => (
              <div key={g.id} className="mb-2 flex items-center justify-between gap-3 text-[13px]">
                <span className="shrink-0 font-semibold text-[#0f7a43]">{i === 0 ? 'Free gift' : ''}</span>
                <span className="min-w-0 truncate font-semibold text-[#0f7a43]">{g.name}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-gray-500">You save</span>
              <span className="font-bold text-[#00a05a]">৳{pricing.tierDiscount.toLocaleString()}</span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="text-[14px] font-bold text-[#c3272b]">Total</span>
              <span className="flex items-baseline gap-2 whitespace-nowrap">
                <span className="text-[18px] font-bold text-[#c3272b]">
                  ৳{pricing.total.toLocaleString()}
                </span>
                {/* Regular total, so the bundle saving is visible on the price itself. */}
                {pricing.regularTotal > pricing.total ? (
                  <span className="text-[12.5px] text-gray-400 line-through">
                    ৳{pricing.regularTotal.toLocaleString()}
                  </span>
                ) : null}
              </span>
            </div>
          </div>

          {/* Footer: the hint sits above the CTA so the button keeps the panel's
              bottom edge, and the pill matches the Add-to-cart on bundle cards. */}
          <div className="px-4 pb-4">
            {!canAdd ? (
              <p className="m-0 mb-2 flex items-center justify-center gap-1 text-center text-[12px] text-gray-500">
                <span className="mi text-[15px] leading-none text-gray-400">info</span>
                {!allFilled
                  ? `Select ${tierCount - selected.length} more product${
                      tierCount - selected.length === 1 ? '' : 's'
                    }.`
                  : `Choose ${giftLimit - chosenGifts.length} more free gift${
                      giftLimit - chosenGifts.length === 1 ? '' : 's'
                    }.`}
              </p>
            ) : null}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={addToCart}
                disabled={!canAdd}
                className="flex h-12 min-w-0 flex-1 items-center justify-center whitespace-nowrap rounded-full bg-[#c3272b] text-[14px] font-bold uppercase tracking-wide text-white shadow-[0_6px_16px_rgba(195,39,43,0.28)] transition-colors hover:bg-[#a5121c] disabled:cursor-not-allowed disabled:bg-[#c8ccd6] disabled:shadow-none"
              >
                Add bundle to cart
              </button>
              {/* Only shareable once something is actually chosen — an empty link
                  would just drop the recipient on a blank builder. */}
              {bundle && selected.length > 0 ? (
                <ShareButton
                  size="md"
                  path={buildShareLink({
                    bundleId: bundle.id,
                    tierCount,
                    slugs: selected.map((p) => p.slug),
                    giftIds: chosenGifts.map((g) => g.id),
                  })}
                  text={`My ${tierCount}-product bundle${
                    pricing ? ` — ৳${pricing.total.toLocaleString()}` : ''
                  } at Monarch IT`}
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <BundleAddedModal item={added} onClose={() => setAdded(null)} />

      <GiftChoiceModal
        open={giftOpen}
        gifts={gifts}
        limit={giftLimit}
        selectedIds={chosenGiftIds}
        onChange={setChosenGiftIds}
        onClose={() => setGiftOpen(false)}
      />

      <ProductPickerModal
        open={picking !== null}
        onClose={() => setPicking(null)}
        tabs={bundle?.tabs ?? []}
        takenSlugs={selected.map((p) => p.slug)}
        title="Choose your product"
        eyebrow="Purchase product"
        onPick={(product) => {
          if (!picking) return
          setSlots((prev) => ({ ...prev, [picking.index]: product }))
        }}
      />
    </div>
  )
}

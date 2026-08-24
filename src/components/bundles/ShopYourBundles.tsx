'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import BundleAddedModal from '@/components/bundles/BundleAddedModal'
import GiftChoiceModal from '@/components/bundles/GiftChoiceModal'
import { bundleToCartItem } from '@/lib/bundleCart'
import { computeBundlePricing, resolveGifts, type ReadyBundle } from '@/data/bundleData'
import type { CartItem } from '@/data/cart'

/** 3 rows of the 3-across grid, matching the design. */
const PAGE_SIZE = 9

type SortKey = 'best' | 'price-asc' | 'price-desc' | 'saving'

const SORT_LABELS: Record<SortKey, string> = {
  best: 'Best Selling',
  'price-asc': 'Price: Low To High',
  'price-desc': 'Price: High To Low',
  saving: 'Biggest Saving',
}

function BundleCard({
  bundle,
  onChat,
  onAdded,
}: {
  bundle: ReadyBundle
  onChat: () => void
  /** Raises the just-added line so the list can confirm it in one shared dialog. */
  onAdded: (item: CartItem) => void
}) {
  const { addItems } = useCart()
  // A single gift comes with the bundle; several are offered as a choice, with the
  // first standing in so the card always shows what the customer will receive.
  const [chosenGiftIds, setChosenGiftIds] = useState<string[]>([])
  const [giftOpen, setGiftOpen] = useState(false)
  const pricing = computeBundlePricing(bundle.products, bundle.tiers)
  const gifts = pricing.gifts
  const giftLimit = pricing.giftLimit
  /** What the customer walks away with — their picks, or the whole list when it fits. */
  const activeGifts = resolveGifts(gifts, chosenGiftIds, giftLimit)
  const needsChoice = gifts.length > giftLimit

  /** What the bundle takes off the products' regular prices, shown next to the total. */
  const saving = Math.max(0, pricing.regularTotal - pricing.total)
  /** Three products get the small-small-feature layout rather than a plain grid. */
  const threeUp = bundle.products.length === 3

  const add = () => {
    const item = bundleToCartItem({
      cartId: `ready-${bundle.id}`,
      name: bundle.name,
      image: bundle.image,
      slug: 'bundles',
      products: bundle.products,
      tiers: bundle.tiers,
      chosenGiftIds,
    })
    addItems([item])
    onAdded(item)
  }

  return (
    // h-full + flex so every card in a row is the same height and the CTA can sit flush
    // at the bottom regardless of how many products the bundle lists.
    <div className="flex h-full min-w-0 flex-col gap-3">
      {/*
        Two columns in every case: 2 → one row, 4 → 2×2, 3 → two stacked small tiles
        beside one full-height feature tile.
        The block keeps a FIXED height whatever the product count, so every card's image
        area, product list and CTA line up across the row — a 3- or 4-product bundle just
        gets proportionally smaller tiles rather than a taller card.
      */}
      <div
        className="grid h-[168px] gap-3 sm:h-[190px]"
        style={{
          // A 3-product bundle gives the feature tile the wider column.
          gridTemplateColumns: threeUp ? 'minmax(0, 0.85fr) minmax(0, 1.5fr)' : 'repeat(2, minmax(0, 1fr))',
          gridTemplateRows:
            bundle.products.length > 2 ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
        }}
      >
        {bundle.products.map((p, i) => {
          // Three products: two small tiles stack in column 1 while the third fills
          // column 2. Positions are explicit — auto-placement would flow the third
          // tile back under the first instead of spanning both rows.
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
              className="flex h-full items-center justify-center rounded-2xl bg-[#f5f6fa] p-3 transition-colors hover:bg-[#eceff5]"
            >
              <Image
                src={p.image}
                alt={p.name}
                width={150}
                height={150}
                className="max-h-full max-w-full object-contain"
              />
            </Link>
          )
        })}
      </div>

      {/* Details panel — same tint and radius as the image tiles above, holding the product
          list, price and CTA. flex-1 (not mt-auto) so the panel starts directly under the
          fixed-height image block and stretches to the bottom: every card in the row then
          shows the same tinted rectangle, however many products or gifts it carries. */}
      <div className="flex min-w-0 flex-1 flex-col rounded-2xl bg-[#f5f6fa] p-4">
      {/* Grows to absorb the height difference, keeping price and CTA on the bottom edge. */}
      <div className="flex min-w-0 flex-1 flex-col">
      <ul className="flex min-w-0 list-none flex-col gap-1.5 p-0">
        {bundle.products.map((p, i) => (
          <li key={p.id} className="flex min-w-0 items-center gap-2 text-[11.5px] leading-snug">
            <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#333] text-[10px] font-bold text-white">
              {i + 1}
            </span>
            <Link
              href={`/${p.slug}`}
              title={p.name}
              className="min-w-0 flex-1 truncate text-gray-700 no-underline hover:text-[#c3272b]"
            >
              {p.name}
            </Link>
            <span className="shrink-0 whitespace-nowrap">
              <span className="font-semibold text-gray-700">৳{p.priceNew.toLocaleString()}</span>
              {p.priceOld > p.priceNew ? (
                <span className="ml-1 text-gray-400 line-through">৳{p.priceOld.toLocaleString()}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>

      {!needsChoice && activeGifts.length > 0 ? (
        <span className="mt-2 flex min-w-0 flex-col gap-1">
          {activeGifts.map((g) => (
            <span
              key={g.id}
              className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-[#e8f6ee] px-2.5 py-1 text-[11px] font-bold text-[#0f7a43]"
            >
              {/* Gifts with artwork show it; the glyph is the fallback. */}
              {g.image ? (
                <Image src={g.image} alt="" width={20} height={20} className="h-4 w-4 shrink-0 object-contain" />
              ) : (
                <span className="mi shrink-0 text-[14px] leading-none">redeem</span>
              )}
              <span className="min-w-0 truncate">{g.name}</span>
            </span>
          ))}
        </span>
      ) : null}

      {needsChoice ? (
        <>
          {/* The card is too narrow to show gift artwork, so picking happens in a dialog. */}
          <button
            type="button"
            onClick={() => setGiftOpen(true)}
            className="mt-2 flex min-w-0 items-center gap-1.5 rounded-xl bg-[#e8f6ee] px-2.5 py-1.5 text-left transition-colors hover:bg-[#d8efe2]"
          >
            {activeGifts[0]?.image ? (
              <Image
                src={activeGifts[0].image}
                alt=""
                width={22}
                height={22}
                className="h-[18px] w-[18px] shrink-0 object-contain"
              />
            ) : (
              <span className="mi shrink-0 text-[16px] leading-none text-[#0f7a43]">redeem</span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block text-[10.5px] font-bold uppercase tracking-wide text-[#0f7a43]">
                Free gift — pick {giftLimit}
              </span>
              <span className="block truncate text-[11px] font-semibold text-[#0f7a43]">
                {activeGifts.map((g) => g.name).join(', ')}
              </span>
            </span>
            <span className="mi shrink-0 text-[18px] leading-none text-[#0f7a43]">expand_more</span>
          </button>

          <GiftChoiceModal
            open={giftOpen}
            gifts={gifts}
            limit={giftLimit}
            selectedIds={activeGifts.map((g) => g.id)}
            onChange={setChosenGiftIds}
            onClose={() => setGiftOpen(false)}
          />
        </>
      ) : null}

      </div>

      <div className="mt-2.5 flex items-center gap-2 border-t border-[#e3e6ee] pt-2.5">
        {saving > 0 ? (
          <span className="shrink-0 rounded-full bg-[#e8f6ee] px-2 py-[2px] text-[10.5px] font-bold text-[#00a05a]">
            Save ৳{saving.toLocaleString()}
          </span>
        ) : null}
        <span className="ml-auto flex min-w-0 items-center gap-2">
          <span className="text-[15px] font-bold text-[#c3272b]">
            <span className="font-medium">৳</span>
            <span className="font-price">{pricing.total.toLocaleString()}</span>
          </span>
          {saving > 0 ? (
            <span className="text-[11.5px] text-gray-400 line-through">
              ৳{pricing.regularTotal.toLocaleString()}
            </span>
          ) : null}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={add}
          className="h-10 min-w-0 flex-1 rounded-full bg-[#c3272b] px-2 text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#a5121c] sm:text-[12px]"
        >
          Add bundle to cart
        </button>
        <button
          type="button"
          onClick={onChat}
          title="Chat with us"
          aria-label="Chat with us"
          // White so it reads as a control against the tinted panel behind it.
          className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e3e6ee] bg-white transition-colors hover:border-[#c3272b] hover:bg-[#c3272b]"
        >
          <Image
            src="/images/catalog/view/theme/default/image/message-icon.svg"
            alt=""
            width={18}
            height={18}
            className="h-4 w-4 transition-all group-hover:brightness-0 group-hover:invert"
          />
        </button>
      </div>
      </div>
    </div>
  )
}

export default function ShopYourBundles({ bundles }: { bundles: ReadyBundle[] }) {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const [sort, setSort] = useState<SortKey>('best')
  /** The line just added, shown in the confirmation dialog. */
  const [added, setAdded] = useState<CartItem | null>(null)
  const [sortOpen, setSortOpen] = useState(false)
  const [pages, setPages] = useState(1)

  const sorted = useMemo(() => {
    const withPrice = bundles.map((b) => ({ b, p: computeBundlePricing(b.products, b.tiers) }))
    if (sort === 'price-asc') withPrice.sort((a, x) => a.p.total - x.p.total)
    if (sort === 'price-desc') withPrice.sort((a, x) => x.p.total - a.p.total)
    if (sort === 'saving') withPrice.sort((a, x) => x.p.tierDiscount - a.p.tierDiscount)
    return withPrice.map((w) => w.b)
  }, [bundles, sort])

  const visible = sorted.slice(0, pages * PAGE_SIZE)
  const hasMore = visible.length < sorted.length

  const onChat = () => {
    if (!isLoggedIn) router.push('/login')
  }

  if (bundles.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-[14px] text-gray-400">
        No ready bundles are live right now. Please check back soon.
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f7] px-4 py-2 text-[13px] font-semibold text-gray-600">
          <Image src="/images/pc-builder/icons/filter-icon.svg" alt="" width={18} height={13} />
          Filter By
        </span>

        <div className="relative">
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-full bg-[#f5f5f7] px-3 py-2 text-[13px] text-gray-500"
          >
            <span className="mi text-[20px]">swap_vert</span>
            <span className="font-semibold">Sort By:</span> {SORT_LABELS[sort]}
          </button>
          {sortOpen ? (
            <div className="absolute right-0 top-full z-20 mt-2 w-[210px] rounded-2xl border border-gray-100 bg-white p-2 shadow-lg">
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSort(key)
                    setSortOpen(false)
                    setPages(1)
                  }}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-[13px] ${
                    sort === key ? 'bg-[#f5f5f7] font-semibold text-[#d32f2f]' : 'text-gray-700'
                  }`}
                >
                  {SORT_LABELS[key]}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Gap matches the category product grid (gap-8 / md:gap-[50px]) so bundles sit on
          the same rhythm as product cards elsewhere on the site.
          The 1366px step is written in rem: Tailwind v4 emits px-based media queries
          BEFORE rem-based ones, so a `min-[1366px]` rule would lose to `lg:`. */}
      <div className="grid gap-8 sm:grid-cols-2 md:gap-[50px] lg:grid-cols-3 min-[85.375rem]:grid-cols-4 min-[85.375rem]:gap-8">
        {visible.map((b) => (
          <BundleCard key={b.id} bundle={b} onChat={onChat} onAdded={setAdded} />
        ))}
      </div>

      <BundleAddedModal item={added} onClose={() => setAdded(null)} />

      {hasMore ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setPages((p) => p + 1)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#c3272b] bg-white px-6 py-2.5 text-[13px] font-bold text-[#c3272b] transition-colors hover:bg-[#c3272b] hover:text-white"
          >
            <i className="fa fa-chevron-down text-base" /> More
          </button>
        </div>
      ) : null}
    </div>
  )
}

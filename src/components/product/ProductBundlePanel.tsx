'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import ProductImage from '@/components/ui/ProductImage'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import BundleAddedModal from '@/components/bundles/BundleAddedModal'
import GiftChoiceModal from '@/components/bundles/GiftChoiceModal'
import ShareButton from '@/components/bundles/ShareButton'
import { bundleToCartItem } from '@/lib/bundleCart'
import { useBundleStore } from '@/lib/bundleStore'
import { computeBundlePricing, resolveGifts, type ReadyBundle } from '@/data/bundleData'
import type { CartItem } from '@/data/cart'

const RED = '#c3272b'

function percentOff(priceOld: number, priceNew: number) {
  if (priceOld <= 0 || priceNew >= priceOld) return 0
  return Math.round(((priceOld - priceNew) / priceOld) * 100)
}

/**
 * One bundle, laid out for the product page rail.
 *
 * Split out so React discards the gift picks whenever the shown bundle changes —
 * a `key` on the element does what an effect would otherwise have to.
 */
function Panel({
  bundle,
  slug,
  onAdded,
}: {
  bundle: ReadyBundle
  /** The product whose page this is; it is pulled to the top of the list. */
  slug: string
  onAdded: (item: CartItem) => void
}) {
  const { addItems } = useCart()
  const [chosenGiftIds, setChosenGiftIds] = useState<string[]>([])
  const [giftOpen, setGiftOpen] = useState(false)

  const pricing = computeBundlePricing(bundle.products, bundle.tiers)
  const gifts = pricing.gifts
  const activeGifts = resolveGifts(gifts, chosenGiftIds, pricing.giftLimit)
  const needsChoice = gifts.length > pricing.giftLimit
  const saving = Math.max(0, pricing.regularTotal - pricing.total)

  // The viewed product leads the list: the customer needs to see at a glance that the
  // thing they are looking at is inside this offer, not beside it.
  const ordered = useMemo(
    () => [
      ...bundle.products.filter((p) => p.slug === slug),
      ...bundle.products.filter((p) => p.slug !== slug),
    ],
    [bundle.products, slug],
  )

  const add = () => {
    const item = bundleToCartItem({
      // Matches the id used on the bundles grid, so adding the same bundle from two
      // places updates one cart line instead of creating a duplicate.
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
    <>
      <ul className="m-0 flex list-none flex-col gap-2 p-0 @[270px]:gap-2.5">
        {ordered.map((p) => {
          const off = percentOff(p.priceOld, p.priceNew)
          const isOwn = p.slug === slug
          return (
            <li key={p.id} className="flex min-w-0 items-center gap-2 @[270px]:gap-2.5">
              <Link
                href={`/${p.slug}`}
                title={p.name}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f5f6fa] p-1 transition-colors hover:bg-[#eceff5] @[230px]:h-12 @[230px]:w-12 @[230px]:rounded-xl @[270px]:h-[58px] @[270px]:w-[58px] @[270px]:p-1.5"
              >
                <ProductImage
                  src={p.image}
                  alt={p.name}
                  width={52}
                  height={52}
                  className="max-h-full max-w-full object-contain"
                />
              </Link>
              <div className="min-w-0 flex-1">
                {isOwn ? (
                  <span className="mb-0.5 inline-block rounded-full bg-[#fdecec] px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wide text-[#c3272b] @[230px]:px-2 @[230px]:text-[9.5px]">
                    {/* The full phrase does not fit a 200px rail, and a truncated
                        badge reads as a glitch — so the narrow rail says less. */}
                    <span className="@[230px]:hidden">Viewing</span>
                    <span className="hidden @[230px]:inline">Currently viewing</span>
                  </span>
                ) : null}
                <Link
                  href={`/${p.slug}`}
                  title={p.name}
                  className="line-clamp-2 text-[11px] font-semibold leading-snug text-gray-800 no-underline hover:text-[#c3272b] @[230px]:text-[11.5px] @[270px]:text-[12px]"
                >
                  {p.name}
                </Link>
                <p className="m-0 mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-[11px] leading-tight @[270px]:text-[11.5px]">
                  <span className="font-bold" style={{ color: RED }}>
                    ৳{p.priceNew.toLocaleString()}
                  </span>
                  {off > 0 ? (
                    <>
                      {/* Dropped first when space runs out: the percentage carries the
                          same message in a third of the width. */}
                      <span className="hidden text-[11px] text-gray-400 line-through @[230px]:inline">
                        ৳{p.priceOld.toLocaleString()}
                      </span>
                      <span className="text-[10.5px] font-semibold text-[#00a05a] @[230px]:text-[11px]">
                        {off}% OFF
                      </span>
                    </>
                  ) : null}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Gifts. Without this row the same bundle would promise a free gift on the
          bundles page and in the cart, but silently drop it here. */}
      {gifts.length > 0 ? (
        <div className="mt-2.5 flex flex-col gap-1.5">
          {needsChoice ? (
            <button
              type="button"
              onClick={() => setGiftOpen(true)}
              className="flex min-w-0 cursor-pointer items-center gap-1.5 rounded-xl bg-[#e8f6ee] px-2 py-1.5 text-left transition-colors hover:bg-[#d8efe2] @[270px]:gap-2 @[270px]:px-2.5 @[270px]:py-2"
            >
              {activeGifts[0]?.image ? (
                <ProductImage
                  src={activeGifts[0].image}
                  alt=""
                  width={22}
                  height={22}
                  className="h-4 w-4 shrink-0 object-contain @[270px]:h-[18px] @[270px]:w-[18px]"
                />
              ) : (
                <span className="mi shrink-0 text-[15px] leading-none text-[#0f7a43]">redeem</span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-[9.5px] font-bold uppercase tracking-wide text-[#0f7a43] @[270px]:text-[10px]">
                  Free gift — pick {pricing.giftLimit}
                </span>
                <span className="block truncate text-[10.5px] font-semibold text-[#0f7a43] @[270px]:text-[11px]">
                  {activeGifts.map((g) => g.name).join(', ')}
                </span>
              </span>
              <span className="mi shrink-0 text-[16px] leading-none text-[#0f7a43]">expand_more</span>
            </button>
          ) : (
            activeGifts.map((g) => (
              <span
                key={g.id}
                className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-[#e8f6ee] px-2 py-1 text-[10.5px] font-bold text-[#0f7a43] @[270px]:px-2.5 @[270px]:text-[11px]"
              >
                {g.image ? (
                  <ProductImage
                    src={g.image}
                    alt=""
                    width={20}
                    height={20}
                    className="h-3.5 w-3.5 shrink-0 object-contain @[270px]:h-4 @[270px]:w-4"
                  />
                ) : (
                  <span className="mi shrink-0 text-[13px] leading-none">redeem</span>
                )}
                <span className="min-w-0 truncate">{g.name}</span>
              </span>
            ))
          )}

          <GiftChoiceModal
            open={giftOpen}
            gifts={gifts}
            limit={pricing.giftLimit}
            selectedIds={activeGifts.map((g) => g.id)}
            onChange={setChosenGiftIds}
            onClose={() => setGiftOpen(false)}
          />
        </div>
      ) : null}

      {/* Saving above the total in a narrow rail: side by side they collide at 200px. */}
      <div className="mt-3 flex flex-col items-start gap-0.5 border-t border-gray-100 pt-2.5 @[230px]:flex-row @[230px]:items-center @[230px]:gap-2 @[270px]:mt-4 @[270px]:pt-3.5">
        {saving > 0 ? (
          <span className="shrink-0 text-[11.5px] font-bold text-[#00a05a] @[270px]:text-[12.5px]">
            Save ৳{saving.toLocaleString()}
          </span>
        ) : null}
        <span className="text-[16px] font-bold text-gray-900 @[230px]:ml-auto @[270px]:text-[17px]">
          <span className="font-medium">৳</span>
          <span className="font-price">{pricing.total.toLocaleString()}</span>
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 @[270px]:gap-2">
        <button
          type="button"
          onClick={add}
          className="h-9 min-w-0 flex-1 cursor-pointer whitespace-nowrap rounded-full border-[1.5px] border-[#c3272b] bg-white px-1 text-[11px] font-bold uppercase tracking-wide text-[#c3272b] transition-colors hover:bg-[#c3272b] hover:text-white @[270px]:h-10 @[270px]:text-[12px]"
        >
          Add to cart
        </button>
        <ShareButton
          path={`/bundles/${bundle.id}`}
          text={`${bundle.name} — ৳${pricing.total.toLocaleString()} at Monarch IT`}
        />
      </div>
    </>
  )
}

/**
 * Live ready bundles containing this product, best offer first.
 *
 * Exported because the product page has to know whether a rail exists *before* it
 * lays itself out — an empty third grid column would still hold its width, leaving
 * the gallery and info squeezed for a panel that never appears.
 */
export function useProductBundles(slug: string) {
  const db = useBundleStore()

  return useMemo(() => {
    const withPricing = Object.values(db.ready)
      .filter((b) => b.active && b.products.some((p) => p.slug === slug))
      .map((b) => ({ bundle: b, pricing: computeBundlePricing(b.products, b.tiers) }))

    // Biggest saving first. Ties go to the smaller bundle — cheaper to say yes to —
    // and then to the most recently edited, so a fresh offer outranks a stale one.
    return withPricing.sort((a, z) => {
      const savingA = a.pricing.regularTotal - a.pricing.total
      const savingZ = z.pricing.regularTotal - z.pricing.total
      if (savingZ !== savingA) return savingZ - savingA
      if (a.bundle.products.length !== z.bundle.products.length) {
        return a.bundle.products.length - z.bundle.products.length
      }
      return z.bundle.updatedAt.localeCompare(a.bundle.updatedAt)
    })
  }, [db, slug])
}

/**
 * "Bundle & Save" rail on the product page.
 *
 * Shows one ready bundle that contains this product. When several do, the one that
 * saves the most money leads — the same rule the rest of the site uses when it has to
 * choose an offer for the customer — and small arrows let them step through the others
 * rather than hiding those bundles altogether.
 *
 * Sized by *container* queries, not page breakpoints: the same component has to work
 * as a 200px rail beside a 1200px page, as a 280px rail on a wide monitor, and as a
 * full-width block under the fold on a tablet. Asking how much room it actually got
 * is the only rule that holds in all three.
 *
 * Renders nothing when no live bundle contains the product, so most pages are unaffected.
 */
export default function ProductBundlePanel({ slug }: { slug: string }) {
  const matches = useProductBundles(slug)
  const [index, setIndex] = useState(0)
  const [added, setAdded] = useState<CartItem | null>(null)

  if (matches.length === 0) return null

  // Clamped rather than reset: the list can shrink under us when the store refreshes.
  const active = matches[Math.min(index, matches.length - 1)].bundle
  const step = (delta: number) =>
    setIndex((i) => (Math.min(i, matches.length - 1) + delta + matches.length) % matches.length)

  return (
    // The query container is the bare wrapper, so its width is the space the panel was
    // given rather than that minus the card's own padding.
    <div className="@container">
      <div className="rounded-[20px] border-[1.5px] border-gray-100 bg-white p-3 @[230px]:rounded-[24px] @[230px]:p-3.5 @[270px]:rounded-[28px] @[270px]:p-4">
        <div className="flex items-center justify-center gap-1 @[270px]:gap-2">
          {matches.length > 1 ? (
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous bundle"
              className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 @[270px]:h-7 @[270px]:w-7"
            >
              <span className="mi text-[18px] leading-none @[270px]:text-[20px]">chevron_left</span>
            </button>
          ) : null}
          <h2 className="m-0 text-center text-[13px] font-bold uppercase tracking-wide text-gray-900 @[230px]:text-[14px] @[270px]:text-[15px]">
            Bundle &amp; Save
          </h2>
          {matches.length > 1 ? (
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next bundle"
              className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 @[270px]:h-7 @[270px]:w-7"
            >
              <span className="mi text-[18px] leading-none @[270px]:text-[20px]">chevron_right</span>
            </button>
          ) : null}
        </div>

        {/* The bundle's own name and page — the rail shows the offer, not all of it. */}
        <p className="m-0 mb-3 mt-0.5 truncate text-center text-[11px] text-gray-400 @[270px]:mb-4 @[270px]:text-[11.5px]">
          <Link
            href={`/bundles/${active.id}`}
            className="text-gray-500 no-underline hover:text-[#c3272b]"
          >
            {active.name}
          </Link>
          {matches.length > 1 ? (
            <span className="ml-1 text-gray-400">
              ({Math.min(index, matches.length - 1) + 1}/{matches.length})
            </span>
          ) : null}
        </p>

        <Panel key={active.id} bundle={active} slug={slug} onAdded={setAdded} />

        <p className="m-0 mt-2.5 text-center text-[11px] text-gray-500 @[270px]:mt-3 @[270px]:text-[12px]">
          Build your{' '}
          <Link href="/bundles/build" className="font-bold no-underline" style={{ color: RED }}>
            Own Bundle
          </Link>
        </p>

        <BundleAddedModal item={added} onClose={() => setAdded(null)} />
      </div>
    </div>
  )
}

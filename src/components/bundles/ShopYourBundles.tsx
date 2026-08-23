'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { bundleToCartItem } from '@/lib/bundleCart'
import { computeBundlePricing, giftLabel, type ReadyBundle } from '@/data/bundleData'

/** 3 rows of the 3-across grid, matching the design. */
const PAGE_SIZE = 9

type SortKey = 'best' | 'price-asc' | 'price-desc' | 'saving'

const SORT_LABELS: Record<SortKey, string> = {
  best: 'Best Selling',
  'price-asc': 'Price: Low To High',
  'price-desc': 'Price: High To Low',
  saving: 'Biggest Saving',
}

function BundleCard({ bundle, onChat }: { bundle: ReadyBundle; onChat: () => void }) {
  const { addItems, openCart } = useCart()
  const pricing = computeBundlePricing(bundle.products, bundle.tiers)
  const gift = giftLabel(pricing.gift)

  const add = () => {
    addItems([
      bundleToCartItem({
        cartId: `ready-${bundle.id}`,
        name: bundle.name,
        image: bundle.image,
        slug: 'bundles',
        products: bundle.products,
        tiers: bundle.tiers,
      }),
    ])
    openCart()
  }

  return (
    // h-full + flex so every card in a row is the same height and the CTA can sit flush
    // at the bottom regardless of how many products the bundle lists.
    <div className="flex h-full min-w-0 flex-col gap-3">
      {/*
        Always two columns: 2 → one row, 4 → 2×2, 3 → two on top and the last centred.
        The block keeps a FIXED height whatever the product count, so every card's image
        area, product list and CTA line up across the row — a 3- or 4-product bundle just
        gets proportionally smaller tiles rather than a taller card.
      */}
      <div
        className="grid h-[168px] grid-cols-2 gap-3 sm:h-[190px]"
        style={{
          gridTemplateRows:
            bundle.products.length > 2 ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
        }}
      >
        {bundle.products.map((p, i) => {
          const centredLast = bundle.products.length === 3 && i === 2
          return (
            <Link
              key={p.id}
              href={`/${p.slug}`}
              title={p.name}
              className={`flex h-full items-center justify-center rounded-2xl bg-[#f5f6fa] p-3 transition-colors hover:bg-[#eceff5] ${
                // Half the row minus half the 12px gap keeps it the same width as the tiles above.
                centredLast ? 'col-span-2 mx-auto w-[calc(50%-6px)]' : ''
              }`}
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
          list, price and CTA. mt-auto bottom-aligns it so CTAs line up across the row. */}
      <div className="mt-auto flex min-w-0 flex-col rounded-2xl bg-[#f5f6fa] p-4">
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

      {gift ? (
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#e8f6ee] px-2.5 py-1 text-[11px] font-bold text-[#0f7a43]">
          <span className="mi text-[14px] leading-none">redeem</span>
          {gift}
        </span>
      ) : null}

      <div className="mt-2.5 flex items-center justify-end gap-2 border-t border-[#e3e6ee] pt-2.5">
        <span className="text-[15px] font-bold text-[#c3272b]">
          <span className="font-medium">৳</span>
          <span className="font-price">{pricing.total.toLocaleString()}</span>
        </span>
        {pricing.regularTotal > pricing.total ? (
          <span className="text-[11.5px] text-gray-400 line-through">
            ৳{pricing.regularTotal.toLocaleString()}
          </span>
        ) : null}
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
          the same rhythm as product cards elsewhere on the site. */}
      <div className="grid gap-8 sm:grid-cols-2 md:gap-[50px] lg:grid-cols-3">
        {visible.map((b) => (
          <BundleCard key={b.id} bundle={b} onChat={onChat} />
        ))}
      </div>

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

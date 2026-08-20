'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { resolveFeaturedTabs } from '@/lib/live-edit/featured-products'

type Props = {
  title?: string
  subtitle?: string
  /** Demo category ids — tab order; products come from each category. */
  categoryIds?: string[]
}

export default function FeaturedProducts({
  title = 'Most Wanted',
  subtitle = 'Explore Our Best-Selling Deals',
  categoryIds,
}: Props) {
  const tabs = resolveFeaturedTabs(categoryIds)
  const [activeTab, setActiveTab] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveTab(0)
  }, [categoryIds?.join('|')])

  const scroll = (amount: number) => {
    trackRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const changeTab = (dir: number) => {
    if (tabs.length === 0) return
    setActiveTab((t) => (t + dir + tabs.length) % tabs.length)
  }

  const safeIndex = tabs.length ? Math.min(activeTab, tabs.length - 1) : 0
  const products = tabs[safeIndex]?.products ?? []

  return (
    <section className="mt-2.5">
      <div className="container mx-auto px-4 min-[992px]:px-14">
        <div className="text-center my-8">
          <h2 className="text-[#333] font-bold text-2xl md:text-[28px] mb-1">{title}</h2>
          <p className="text-[#777] text-[15px] mt-0">{subtitle}</p>
        </div>

        {tabs.length > 0 ? (
          <div className="flex items-center justify-center gap-[15px] mb-8 select-none">
            <button
              type="button"
              onClick={() => changeTab(-1)}
              aria-label="Previous tab"
              className="w-[38px] h-[38px] rounded-full bg-[#f5f5f7] flex items-center justify-center cursor-pointer"
            >
              <Image
                src="/images/promo-banner/left-arrow.svg"
                alt=""
                width={9}
                height={16}
                className="w-[9px] h-4"
              />
            </button>

            <div className="inline-flex items-center">
              {tabs.map((tab, i) => (
                <button
                  key={tab.categoryId}
                  type="button"
                  onClick={() => setActiveTab(i)}
                  className={`px-7 py-2 rounded-full font-medium text-[15px] whitespace-nowrap transition-colors cursor-pointer ${
                    i === safeIndex ? 'bg-[#D92128] text-white' : 'hidden'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => changeTab(1)}
              aria-label="Next tab"
              className="w-[38px] h-[38px] rounded-full bg-[#f5f5f7] flex items-center justify-center cursor-pointer"
            >
              <Image
                src="/images/promo-banner/right-arrow.svg"
                alt=""
                width={9}
                height={16}
                className="w-[9px] h-4"
              />
            </button>
          </div>
        ) : null}
      </div>

      <div className="bg-[#f6f7f9] py-2.5">
        <div className="container mx-auto px-4 min-[992px]:px-14">
          <div className="relative">
            <button
              type="button"
              onClick={() => scroll(-300)}
              aria-label="Scroll products left"
              className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 w-[38px] h-[38px] rounded-full bg-[#f5f5f7] items-center justify-center cursor-pointer"
            >
              <Image
                src="/images/promo-banner/left-arrow.svg"
                alt=""
                width={9}
                height={16}
                className="w-[9px] h-4"
              />
            </button>

            <div
              ref={trackRef}
              className="flex gap-3 md:gap-5 overflow-x-auto scroll-smooth py-2.5 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {products.length === 0 ? (
                <p className="w-full py-10 text-center text-[14px] text-[#888]">
                  No products for this category yet.
                </p>
              ) : (
                products.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/${p.slug}`}
                    // Per-row count matches the category grid (2 / md:3 / lg:4 / 5), so the
                    // widths subtract this track's own gaps: gap-3 (12px), md:gap-5 (20px).
                    // The 5-col breakpoint must stay in rem — Tailwind v4 emits px-based
                    // media queries before rem ones, so min-[1400px] would lose to lg:.
                    className="flex-none w-[calc((100%-12px)/2)] md:w-[calc((100%-40px)/3)] lg:w-[calc((100%-60px)/4)] min-[87.5rem]:w-[calc((100%-80px)/5)] bg-white p-3 md:p-5 rounded-2xl md:rounded-[35px] flex flex-col no-underline"
                  >
                    <div className="bg-white rounded-2xl flex items-center justify-center mb-3">
                      <Image
                        src={p.image}
                        alt={p.name}
                        width={228}
                        height={228}
                        className="max-w-full h-auto object-contain"
                      />
                    </div>

                    <div className="flex items-center gap-0.5 text-[13px] text-[#FFC107] mb-1">
                      <span>★★★★★</span>
                      <span className="text-[#777] text-xs ml-1">
                        {p.rating.toFixed(2)} ({p.reviews})
                      </span>
                    </div>

                    <h4 className="text-[15px] font-bold text-[#333] mb-2.5 line-clamp-2 min-h-[2.6em] leading-[1.3em]">
                      {p.name}
                    </h4>

                    <div className="mt-auto flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#be1e2d] text-base">
                        <span className="font-medium">৳</span><span className="font-price">{p.priceNew.toLocaleString()}</span>
                      </span>
                      {p.priceOld ? (
                        <span className="line-through text-[#b5b5b5] text-[13px]">
                          ৳{p.priceOld.toLocaleString()}
                        </span>
                      ) : null}
                      {p.discountPct ? (
                        <span className="text-[#00CC96] text-[13px] font-semibold">
                          {p.discountPct}% OFF
                        </span>
                      ) : null}
                    </div>
                  </Link>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => scroll(300)}
              aria-label="Scroll products right"
              className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 w-[38px] h-[38px] rounded-full bg-[#f5f5f7] items-center justify-center cursor-pointer"
            >
              <Image
                src="/images/promo-banner/right-arrow.svg"
                alt=""
                width={9}
                height={16}
                className="w-[9px] h-4"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

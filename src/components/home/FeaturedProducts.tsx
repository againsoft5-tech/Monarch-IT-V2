'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { featuredTabs } from '@/data/products'

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const scroll = (amount: number) => {
    trackRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const changeTab = (dir: number) => {
    setActiveTab((t) => (t + dir + featuredTabs.length) % featuredTabs.length)
  }

  const products = featuredTabs[activeTab].products

  return (
    <section className="mt-2.5">
      <div className="container mx-auto px-4 min-[992px]:px-14">
        <div className="text-center my-8">
          <h2 className="text-[#333] font-bold text-2xl md:text-[28px] mb-1">Most Wanted</h2>
          <p className="text-[#777] text-[15px] mt-0">Explore Our Best-Selling Deal</p>
        </div>

        <div className="flex items-center justify-center gap-[15px] mb-8 select-none">
          <button
            type="button"
            onClick={() => changeTab(-1)}
            aria-label="Previous tab"
            className="w-[38px] h-[38px] rounded-full bg-[#f5f5f7] flex items-center justify-center cursor-pointer"
          >
            <Image src="/images/promo-banner/left-arrow.svg" alt="" width={9} height={16} className="w-[9px] h-4" />
          </button>

          <div className="inline-flex items-center">
            {featuredTabs.map((tab, i) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`px-7 py-2 rounded-full font-medium text-[15px] whitespace-nowrap transition-colors cursor-pointer ${
                  i === activeTab ? 'bg-[#BE1E2D] text-white' : 'hidden'
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
            <Image src="/images/promo-banner/right-arrow.svg" alt="" width={9} height={16} className="w-[9px] h-4" />
          </button>
        </div>
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
              <Image src="/images/promo-banner/left-arrow.svg" alt="" width={9} height={16} className="w-[9px] h-4" />
            </button>

            <div
              ref={trackRef}
              className="flex gap-3 md:gap-5 overflow-x-auto scroll-smooth py-2.5 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {/* 6 cards across at >= 1400px. The breakpoint has to be written in rem: Tailwind v4
                  emits px-based media queries before the rem-based defaults, so a min-[1400px]
                  width would be overridden by lg:w-[calc(25%-15px)]. */}
              {products.map((p) => (
                <Link
                  key={p.slug}
                  href="/sony-bravia-8-k-65xr80-65-inch-4k-hdr-oled-google-tv"
                  className="flex-none w-[47%] sm:w-[31%] lg:w-[calc(25%-15px)] min-[87.5rem]:w-[calc((100%-100px)/6)] bg-white p-3 md:p-5 rounded-2xl md:rounded-[35px] flex flex-col no-underline"
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

                  <h4 className="text-[15px] font-medium text-[#333] mb-2.5 line-clamp-2 min-h-[2.6em] leading-[1.3em]">
                    {p.name}
                  </h4>

                  <div className="mt-auto flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#BE1E2D] text-base">৳{p.priceNew.toLocaleString()}</span>
                    {p.priceOld && (
                      <span className="line-through text-[#b5b5b5] text-[13px]">৳{p.priceOld.toLocaleString()}</span>
                    )}
                    {p.discountPct && (
                      <span className="text-[#00CC96] text-[13px] font-semibold">{p.discountPct}% OFF</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scroll(300)}
              aria-label="Scroll products right"
              className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 w-[38px] h-[38px] rounded-full bg-[#f5f5f7] items-center justify-center cursor-pointer"
            >
              <Image src="/images/promo-banner/right-arrow.svg" alt="" width={9} height={16} className="w-[9px] h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

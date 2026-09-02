'use client'

import { useRef } from 'react'
import Image from 'next/image'
import ProductImage from '@/components/ui/ProductImage'
import Link from 'next/link'
import type { RelatedProduct } from '@/data/productDetail'

// Mirrors the home page "Most Wanted" carousel (see components/home/FeaturedProducts),
// minus the category tabs — the product page shows a single fixed list.
export default function MoreToLove({ products }: { products: RelatedProduct[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scroll = (amount: number) => {
    trackRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <section className="mt-2.5">
      <div className="bg-white pt-10 pb-2.5">
        <div className="container mx-auto px-4 min-[992px]:px-14">
          <div className="text-center">
            <h2 className="text-[#333] font-bold text-2xl md:text-[28px] mb-1">More to love</h2>
            <p className="text-[#777] text-[15px] mt-0">Chosen by customers like you</p>
          </div>
        </div>
      </div>

      <div className="bg-[#f6f7f9] pb-8">
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
              className="flex gap-3 md:gap-5 overflow-x-auto scroll-smooth pt-5 pb-2.5 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {/* 6 cards across at >= 1400px. The breakpoint has to be written in rem: Tailwind v4
                  emits px-based media queries before the rem-based defaults, so a min-[1400px]
                  width would be overridden by lg:w-[calc(25%-15px)]. */}
              {products.map((p) => (
                <Link
                  key={p.slug}
                  href={`/${p.slug}`}
                  // Kept in step with FeaturedProducts and the category grid: 2 / md:3 / lg:4 / 5.
                  className="flex-none w-[calc((100%-12px)/2)] md:w-[calc((100%-40px)/3)] lg:w-[calc((100%-60px)/4)] min-[87.5rem]:w-[calc((100%-80px)/5)] bg-white p-3 md:p-5 rounded-2xl md:rounded-[35px] flex flex-col no-underline"
                >
                  <div className="bg-white rounded-2xl flex items-center justify-center mb-3">
                    <ProductImage
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
                    <span className="font-bold text-[#BE1E2D] text-base"><span className="font-medium">৳</span><span className="font-price">{p.priceNew.toLocaleString()}</span></span>
                    {p.priceOld > p.priceNew && (
                      <span className="line-through text-[#b5b5b5] text-[13px]">৳{p.priceOld.toLocaleString()}</span>
                    )}
                    {p.discountPct > 0 && (
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

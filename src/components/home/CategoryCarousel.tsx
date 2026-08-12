'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { featuredCategories } from '@/data/categories'

export default function CategoryCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateEdges = () => {
    const el = carouselRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 0)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)
  }

  const scroll = (amount: number) => {
    carouselRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  return (
    <div className="bg-[#f5f5f7] py-5">
      <div className="container mx-auto px-4 min-[992px]:px-14">
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => scroll(-300)}
            aria-label="Scroll left"
            className={`absolute -left-2.5 z-10 bg-white border border-gray-200 rounded-full w-9 h-9 flex items-center justify-center shadow-sm transition-opacity cursor-pointer ${
              atStart ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <span className="mi text-[#d32f2e] text-[20px]">chevron_left</span>
          </button>

          <div
            ref={carouselRef}
            onScroll={updateEdges}
            className="flex overflow-x-auto gap-[15px] scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full"
          >
            {featuredCategories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="flex-none w-[157px] min-[768px]:max-[1399px]:w-[calc((100%-45px)/4)] min-[1400px]:w-[calc((100%-75px)/6)] flex flex-col items-center p-3 md:p-5 rounded-2xl border border-[#f0f0f0] bg-white no-underline"
              >
                <Image src={cat.img} alt={cat.name} width={200} height={160} className="object-contain w-full h-auto" />
                <span className="text-xs md:text-xl font-semibold text-[#4d4d4d] mt-2 text-center">{cat.name}</span>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll(300)}
            aria-label="Scroll right"
            className={`absolute -right-2.5 z-10 bg-white border border-gray-200 rounded-full w-9 h-9 flex items-center justify-center shadow-sm transition-opacity cursor-pointer ${
              atEnd ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <span className="mi text-[#d32f2e] text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}

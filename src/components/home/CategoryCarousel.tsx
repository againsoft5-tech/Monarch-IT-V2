'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { featuredCategories } from '@/data/categories'

type Cat = { name: string; img: string; href: string }

type Props = {
  items?: Cat[]
}

export default function CategoryCarousel({ items }: Props = {}) {
  const list = items?.length ? items : featuredCategories
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
    <div className="bg-[#f5f5f7] py-[5px] md:py-5">
      <div className="container mx-auto px-4 min-[992px]:px-14">
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => scroll(-300)}
            aria-label="Scroll left"
            className={`hidden md:flex absolute left-0 z-10 w-[38px] h-[38px] bg-[#f5f5f7] rounded-full items-center justify-center transition-opacity cursor-pointer ${
              atStart ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <Image src="/images/promo-banner/left-arrow.svg" alt="" width={9} height={16} className="w-[9px] h-4" />
          </button>

          <div
            ref={carouselRef}
            onScroll={updateEdges}
            className="flex overflow-x-auto gap-[5px] md:gap-[15px] scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full"
          >
            {list.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="flex-none w-[calc((100%-30px)/4)] md:w-[calc((100%-45px)/4)] min-[1400px]:w-[calc((100%-75px)/6)] flex flex-col items-center p-3 md:p-5 rounded-[20px] md:rounded-[35px] border border-[#f0f0f0] bg-white no-underline"
              >
                <Image src={cat.img} alt={cat.name} width={200} height={160} className="object-contain w-full h-auto" />
                <span className="text-[10px] md:text-xl font-semibold text-[#4d4d4d] mt-0 md:mt-2 text-center">{cat.name}</span>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll(300)}
            aria-label="Scroll right"
            className={`hidden md:flex absolute right-0 z-10 w-[38px] h-[38px] bg-[#f5f5f7] rounded-full items-center justify-center transition-opacity cursor-pointer ${
              atEnd ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <Image src="/images/promo-banner/right-arrow.svg" alt="" width={9} height={16} className="w-[9px] h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { RelatedProduct } from '@/data/productDetail'

function PairedCard({ product, className = '' }: { product: RelatedProduct; className?: string }) {
  return (
    <div className={`flex flex-col bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.07)] text-left ${className}`}>
      <Link href={`/${product.slug}`} className="aspect-square shrink-0 flex items-center justify-center">
        <Image src={product.image} alt={product.name} width={200} height={200} className="w-[78%] h-[78%] object-contain" />
      </Link>
      <div className="flex-1 p-3">
        <div className="flex items-center gap-1 mb-1 flex-wrap">
          <span className="text-[#ffcb39] text-lg leading-none">
            {'★'.repeat(Math.round(product.rating)) + '☆'.repeat(5 - Math.round(product.rating))}
          </span>
          <span className="text-[12px] text-gray-600">{product.rating.toFixed(0)}</span>
          <span className="inline-flex items-center gap-0.5 text-[12px] text-gray-600">
            ({product.reviews}
            <Image src="/images/catalog/view/theme/default/image/verified.svg" alt="Verified" width={12} height={12} className="w-3 h-3" />)
          </span>
        </div>
        <div className="text-[13px] font-bold mb-2 line-clamp-2">
          <Link href={`/${product.slug}`} className="text-[#4d4d4d] no-underline hover:text-[#c3272b]">
            {product.name}
          </Link>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-base font-bold text-[#c3272b]"><span className="font-medium">৳</span>{product.priceNew.toLocaleString()}</span>
          <span className="text-[11px] text-gray-400 line-through">৳{product.priceOld.toLocaleString()}</span>
          <span className="text-[10.5px] font-bold text-[#00c68b]">{product.discountPct}% OFF</span>
        </div>
      </div>
    </div>
  )
}

export default function ProductSidebar({ products }: { products: RelatedProduct[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const pausedRef = useRef(false)

  const canLoop = products.length > 1
  const loopProducts = canLoop ? [...products, ...products] : products

  useEffect(() => {
    const track = trackRef.current
    if (!track || !canLoop) return

    const step = () => {
      if (!pausedRef.current) {
        const half = track.scrollWidth / 2
        track.scrollLeft += 0.6
        if (track.scrollLeft >= half) track.scrollLeft -= half
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [canLoop])

  const pause = () => {
    pausedRef.current = true
  }
  const resume = () => {
    pausedRef.current = false
  }

  return (
    <aside className="lg:w-[280px] shrink-0 flex flex-col h-full">
      <div className="bg-white rounded-[35px] p-5 text-center flex-1 flex flex-col lg:mt-[55px]">
        <div className="text-[15px] font-normal text-gray-900 mb-2.5">
          Frequently <strong className="font-bold">Paired</strong>
        </div>

        {/* Mobile / tablet: multiple cards, auto-scrolling and finger-swipeable */}
        <div
          ref={trackRef}
          onTouchStart={pause}
          onTouchEnd={resume}
          onMouseEnter={pause}
          onMouseLeave={resume}
          className="flex lg:hidden gap-3 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {loopProducts.map((product, i) => (
            <PairedCard key={`${product.slug}-${i}`} product={product} className="flex-none w-[68%] sm:w-[220px]" />
          ))}
        </div>

        {/* Desktop: single card */}
        {products[0] && <PairedCard product={products[0]} className="hidden lg:flex flex-1" />}
      </div>
    </aside>
  )
}

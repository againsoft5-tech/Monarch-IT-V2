'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { SearchProduct } from '@/data/searchIndex'
import { getProductDetail } from '@/data/productDetail'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useCompare } from '@/context/CompareContext'
import { categoryProductToCompare } from '@/lib/compareAdapter'
import { useToast, Toast } from '@/components/ui/Toast'
import ProductCard from '@/components/ui/ProductCard'
import ChatWidget from '@/components/chat/ChatWidget'

type Props = {
  query: string
  products: SearchProduct[]
}

const INITIAL_COUNT = 8
const LOAD_MORE_COUNT = 8

export default function SearchResultsPage({ query, products }: Props) {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const { addItems } = useCart()
  const { slots, setSlot } = useCompare()
  const [sort, setSort] = useState<'default' | 'best-seller' | 'price-asc' | 'price-desc'>('default')
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT)
  const [chatOpen, setChatOpen] = useState(false)
  const { toast, showToast } = useToast()

  useEffect(() => {
    setVisibleCount(INITIAL_COUNT)
  }, [query])

  useEffect(() => {
    if (!sortOpen) return
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [sortOpen])

  const sortLabels: Record<typeof sort, string> = {
    default: 'Default',
    'best-seller': 'Best Selling',
    'price-asc': 'Low To High',
    'price-desc': 'High To Low',
  }

  const handleChatClick = () => {
    if (!isLoggedIn) {
      showToast('Please login to start chatting')
      router.push('/login')
      return
    }
    setChatOpen(true)
  }

  const handleCompareClick = (product: SearchProduct) => {
    const alreadyIndex = slots.findIndex((s) => s?.slug === product.slug)
    if (alreadyIndex !== -1) {
      showToast(`${product.name} is already in your compare list.`)
      return
    }
    const emptyIndex = slots.findIndex((s) => s === null)
    if (emptyIndex === -1) {
      showToast('Compare list is full. Remove an item first.')
      return
    }
    setSlot(emptyIndex, categoryProductToCompare(product))
    showToast(`${product.name} added to compare list!`)
  }

  const handleBuyNow = (product: SearchProduct) => {
    const detail = getProductDetail(product.slug)
    const hasOptions = Boolean(
      (detail?.options && detail.options.length > 0) || (detail?.variantGroups && detail.variantGroups.length > 0)
    )

    if (hasOptions) {
      router.push(`/${product.slug}`)
      return
    }

    addItems([
      {
        id: product.slug,
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: product.priceNew,
        priceOld: product.priceOld,
        discountPct: product.discountPct,
        qty: 1,
      },
    ])
    router.push('/checkout')
  }

  const sorted = useMemo(() => {
    let list = products
    if (sort === 'best-seller') list = [...list].sort((a, b) => b.reviews - a.reviews)
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.priceNew - b.priceNew)
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.priceNew - a.priceNew)
    return list
  }, [products, sort])

  const paged = sorted.slice(0, visibleCount)
  const hasMore = visibleCount < sorted.length

  return (
    <div className="cp-cat-wrap">
      <Toast message={toast} />
      <div className="container mx-auto px-4 min-[992px]:px-14 py-6">
        <div>
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-[#4d4d4d]">Search results for &ldquo;{query}&rdquo;</h1>
            <p className="mt-1.5 text-[15px] md:text-base text-gray-500">
              {products.length} product{products.length === 1 ? '' : 's'} found
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <span className="mi text-[56px] text-gray-300 block mb-4">search_off</span>
              <p className="text-[14px] text-gray-500 mb-6">
                No products matched your search. Try a different keyword.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 bg-[#d32f2f] text-white text-[14px] font-semibold px-5 py-2.5 rounded-full no-underline hover:bg-[#b71c1c] transition-colors"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-end gap-3 mb-4">
                <div ref={sortRef} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setSortOpen((v) => !v)}
                    className="flex items-center gap-1.5 bg-[#f5f5f7] rounded-full px-3 py-2 cursor-pointer"
                  >
                    <span className="mi text-gray-500 text-[24px]">swap_vert</span>
                    <span className="text-gray-500 text-[14px] font-semibold max-[400px]:hidden">Sort By:</span>
                    <span className="text-[13px] font-medium text-gray-500">{sortLabels[sort]}</span>
                  </button>

                  {sortOpen && (
                    <div className="absolute right-0 top-full mt-2 w-[190px] bg-white border border-gray-100 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.14)] z-50 p-3.5 flex flex-col gap-3.5">
                      {(['best-seller', 'price-asc', 'price-desc'] as const).map((value) => (
                        <label key={value} className="flex items-center gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={sort === value}
                            onChange={() => {
                              setSort(sort === value ? 'default' : value)
                              setVisibleCount(INITIAL_COUNT)
                              setSortOpen(false)
                            }}
                            className="w-[18px] h-[18px] accent-[#c3272b] cursor-pointer"
                          />
                          <span className="text-[14px] text-gray-800">{sortLabels[value]}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-[50px]">
                {paged.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onBuyNow={handleBuyNow}
                    onCompare={handleCompareClick}
                    onChat={handleChatClick}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-10">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + LOAD_MORE_COUNT)}
                    className="inline-flex items-center gap-2 bg-white text-[#c3272b] border border-[#c3272b] font-bold text-[13px] px-6 py-2.5 rounded-full hover:bg-[#c3272b] hover:text-white transition-colors cursor-pointer"
                  >
                    <i className="fa fa-chevron-down text-base" /> More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}

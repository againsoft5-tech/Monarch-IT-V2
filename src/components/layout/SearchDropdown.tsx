'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { searchCategories, searchProducts } from '@/data/searchIndex'

export default function SearchDropdown({
  query,
  onNavigate,
  positionClassName = 'absolute left-0 right-0 top-full mt-2',
}: {
  query: string
  onNavigate?: () => void
  positionClassName?: string
}) {
  const [tab, setTab] = useState<'products' | 'categories'>('products')

  const q = query.trim().toLowerCase()

  const matchedProducts = useMemo(() => {
    if (!q) return []
    return searchProducts.filter((p) => p.name.toLowerCase().includes(q))
  }, [q])

  const matchedCategories = useMemo(() => {
    if (!q) return []
    return searchCategories.filter((c) => c.name.toLowerCase().includes(q))
  }, [q])

  if (!q) return null

  return (
    <div className={`${positionClassName} bg-white border border-gray-200 rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.14)] z-50 overflow-hidden`}>
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <button
          type="button"
          onClick={() => setTab('products')}
          className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors cursor-pointer ${
            tab === 'products' ? 'bg-[#d32f2f] text-white' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Products
        </button>
        <button
          type="button"
          onClick={() => setTab('categories')}
          className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors cursor-pointer ${
            tab === 'categories' ? 'bg-[#d32f2f] text-white' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Categories
        </button>
      </div>

      <div className="max-h-[320px] overflow-y-auto thin-scroll-red border-t border-gray-100">
        {tab === 'products' &&
          (matchedProducts.length === 0 ? (
            <p className="text-[13px] text-gray-400 text-center py-6 m-0">No products found.</p>
          ) : (
            matchedProducts.map((p) => (
              <Link
                key={p.slug}
                href={`/${p.slug}`}
                onClick={onNavigate}
                className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 last:border-b-0 no-underline hover:bg-gray-50 transition-colors"
              >
                <Image
                  src={p.image}
                  alt=""
                  width={44}
                  height={44}
                  className="w-11 h-11 object-contain rounded-md bg-gray-50 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-gray-800 m-0 truncate">{p.name}</p>
                  <p className="text-[13px] font-bold text-[#d32f2f] m-0 mt-0.5">
                    <span className="font-medium">৳</span><span className="font-price">{p.priceNew.toLocaleString()}</span>
                    {p.priceOld > p.priceNew && (
                      <span className="text-gray-400 font-normal line-through ml-1.5 text-[11.5px]">
                        ৳{p.priceOld.toLocaleString()}
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            ))
          ))}

        {tab === 'categories' &&
          (matchedCategories.length === 0 ? (
            <p className="text-[13px] text-gray-400 text-center py-6 m-0">No categories found.</p>
          ) : (
            matchedCategories.map((c) => (
              <Link
                key={c.name}
                href={c.href}
                onClick={onNavigate}
                className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 last:border-b-0 no-underline hover:bg-gray-50 transition-colors"
              >
                <span className="w-11 h-11 rounded-md bg-gray-50 flex items-center justify-center shrink-0">
                  <span className="mi text-[20px] text-gray-400">category</span>
                </span>
                <p className="text-[13px] text-gray-800 m-0 truncate">{c.name}</p>
              </Link>
            ))
          ))}
      </div>

      {matchedProducts.length > 0 && (
        <Link
          href={`/search?q=${encodeURIComponent(query.trim())}`}
          onClick={onNavigate}
          className="block text-center text-[13px] font-semibold text-[#d32f2f] no-underline py-3 border-t border-gray-100 hover:bg-gray-50 transition-colors"
        >
          See all {matchedProducts.length} results
        </Link>
      )}
    </div>
  )
}

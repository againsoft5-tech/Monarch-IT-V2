'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import MobileDrawer from './MobileDrawer'
import SearchDropdown from './SearchDropdown'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'

const IMG_BASE = '/images'

export default function MobileHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [query, setQuery] = useState('')
  const { openCart, itemCount } = useCart()
  const { isLoggedIn } = useAuth()
  const searchRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setQuery('')
    setSearchFocused(false)
    setDrawerOpen(false)
  }, [pathname])

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    const q = query.trim()
    if (!q) return
    setSearchFocused(false)
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 20)
    updateScrolled()
    window.addEventListener('scroll', updateScrolled, { passive: true })
    return () => window.removeEventListener('scroll', updateScrolled)
  }, [])

  useEffect(() => {
    if (!searchFocused) return
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [searchFocused])

  return (
    <>
      <div
        ref={searchRef}
        className={`md:hidden sticky top-0 z-40 flex items-center gap-2.5 px-4 py-3 transition-all duration-300 ${
          scrolled ? 'bg-[#f4f5f7]/70 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.06)]' : 'bg-[#f4f5f7]'
        }`}
      >
        <Link href="/" className="shrink-0 flex items-center">
          <Image
            src={`${IMG_BASE}/catalog/view/theme/default/image/monarch-it-icon.png`}
            alt="Monarch IT"
            width={40}
            height={34}
            className="h-9 w-auto object-contain"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center bg-white rounded-full px-4 py-2.5">
            <Image src="/images/compare-icons/search-icon.svg" alt="" width={18} height={18} className="w-[18px] h-[18px] mr-2.5 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search Products"
              autoComplete="off"
              className="flex-1 min-w-0 border-none bg-transparent outline-none text-[14px] text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={openCart}
            className="relative w-9 h-9 bg-white rounded-full flex items-center justify-center text-gray-700 cursor-pointer"
            aria-label="Cart"
          >
            <Image
              src={`${IMG_BASE}/catalog/view/theme/default/image/cart-icon.svg`}
              alt="Cart"
              width={20}
              height={20}
              className="w-[20px] h-[20px]"
            />
            {itemCount > 0 ? (
              <span className="absolute top-0 right-0 bg-[#d32f2f] text-white text-[9px] font-bold min-w-[15px] h-[15px] px-[3px] rounded-full flex items-center justify-center border border-white leading-none">
                {itemCount}
              </span>
            ) : (
              <span className="absolute top-0 right-0.5 w-2.5 h-2.5 bg-[#d32f2f] rounded-full border-2 border-white" />
            )}
          </button>

          <Link
            href={isLoggedIn ? '/account' : '/login'}
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-gray-700 no-underline"
            aria-label="Account"
          >
            <Image
              src={`${IMG_BASE}/catalog/view/theme/default/image/account-icon.svg`}
              alt="Account"
              width={20}
              height={20}
              className="w-[20px] h-[20px]"
            />
          </Link>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 flex items-center justify-center text-gray-700 cursor-pointer"
            aria-label="Open menu"
          >
            <span className="mi text-[26px]">menu</span>
          </button>
        </div>

        {searchFocused && (
          <SearchDropdown
            query={query}
            onNavigate={() => {
              setSearchFocused(false)
              setQuery('')
            }}
            positionClassName="absolute left-3 right-3 top-full mt-2"
          />
        )}
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}

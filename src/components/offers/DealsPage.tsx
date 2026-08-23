'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CategoryProduct } from '@/data/categoryProducts'
import { getProductDetail } from '@/data/productDetail'
import type { OffersPageContent } from '@/lib/live-edit/offers-page'
import { DEFAULT_OFFERS_PAGE, ensureOffersContent } from '@/lib/live-edit/offers-page'
import BundlesPage from '@/components/bundles/BundlesPage'
import { productsForTab } from '@/lib/live-edit/offers-catalog'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useCompare } from '@/context/CompareContext'
import { categoryProductToCompare } from '@/lib/compareAdapter'
import { useToast, Toast } from '@/components/ui/Toast'
import ProductCard from '@/components/ui/ProductCard'
import ChatWidget from '@/components/chat/ChatWidget'
import Breadcrumbs from '@/components/category/Breadcrumbs'

// Keep in sync with the min-[87.5rem] (1400px) grid-cols-5 class on the grid below.
const FIVE_COL_QUERY = '(min-width: 1400px)'
const PAGE_SIZE = 8
const PAGE_SIZE_5_COL = 10

// Shared by the badge's CSS border-radius/border-width and its dots' orbit path, so the
// dots always ride exactly on the border line, corner shape included, instead of drifting off it.
const BADGE_RADII = { tl: 15, tr: 35, br: 15, bl: 35 }
const BADGE_BORDER_WIDTH = 1
const ORBIT_DURATION = '7s'

function orbitRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  r: { tl: number; tr: number; br: number; bl: number }
) {
  return `M ${x + r.tl} ${y} H ${x + width - r.tr} A ${r.tr} ${r.tr} 0 0 1 ${x + width} ${y + r.tr} V ${
    y + height - r.br
  } A ${r.br} ${r.br} 0 0 1 ${x + width - r.br} ${y + height} H ${x + r.bl} A ${r.bl} ${r.bl} 0 0 1 ${x} ${
    y + height - r.bl
  } V ${y + r.tl} A ${r.tl} ${r.tl} 0 0 1 ${x + r.tl} ${y} Z`
}

function MonarchDealsBadge({ title }: { title: string }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [orbitPath, setOrbitPath] = useState('')

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const inset = BADGE_BORDER_WIDTH / 2
    const update = () => {
      const w = el.offsetWidth - BADGE_BORDER_WIDTH
      const h = el.offsetHeight - BADGE_BORDER_WIDTH
      const r = {
        tl: Math.max(BADGE_RADII.tl - inset, 0),
        tr: Math.max(BADGE_RADII.tr - inset, 0),
        br: Math.max(BADGE_RADII.br - inset, 0),
        bl: Math.max(BADGE_RADII.bl - inset, 0),
      }
      setOrbitPath(`path('${orbitRectPath(inset, inset, w, h, r)}')`)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex justify-center mb-4">
      <div
        ref={boxRef}
        className="relative inline-flex flex-col items-center border border-[#3d3d3d] px-10 md:px-16 py-4"
        style={{
          borderRadius: `${BADGE_RADII.tl}px ${BADGE_RADII.tr}px ${BADGE_RADII.br}px ${BADGE_RADII.bl}px`,
          borderWidth: BADGE_BORDER_WIDTH,
        }}
      >
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-wide text-[#3d3d3d] uppercase">{title}</h1>
        {orbitPath && (
          <>
            <span
              className="orbit-dot w-3.5 h-3.5 rounded-full bg-[#d32f2f]"
              style={{ offsetPath: orbitPath, animationDuration: ORBIT_DURATION }}
            />
            <span
              className="orbit-dot w-2.5 h-2.5 rounded-full bg-[#d32f2f]"
              style={{ offsetPath: orbitPath, animationDuration: ORBIT_DURATION, animationDelay: '-3.5s' }}
            />
          </>
        )}
      </div>
    </div>
  )
}

type Props = {
  /** CMS payload from the offers-page repository. Falls back to the shipped defaults. */
  content?: OffersPageContent
}

export default function DealsPage({ content }: Props = {}) {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const { addItems } = useCart()
  const { slots, setSlot } = useCompare()
  const { toast, showToast } = useToast()

  const page = useMemo(() => ensureOffersContent(content ?? DEFAULT_OFFERS_PAGE), [content])
  const tabs = useMemo(() => page.tabs.filter((t) => !t.hidden), [page.tabs])

  const [activeDeal, setActiveDeal] = useState<string>(() => tabs[0]?.id ?? '')

  /**
   * Any tab can be switched to the bundles module from live-edit, so this reads
   * the tab's own `panel` setting rather than assuming a particular tab id.
   */
  const showBundles = (tabs.find((t) => t.id === activeDeal) ?? tabs[0])?.panel === 'bundles'

  // A tab the admin just hid/removed must not strand the grid on an empty selection.
  useEffect(() => {
    if (tabs.length && !tabs.some((t) => t.id === activeDeal)) setActiveDeal(tabs[0].id)
  }, [tabs, activeDeal])

  const dealProducts = useMemo(() => {
    const tab = tabs.find((t) => t.id === activeDeal) ?? tabs[0]
    return tab ? productsForTab(tab, page.tabs) : []
  }, [tabs, activeDeal, page.tabs])

  // Price slider bounds span every tab so switching tabs never fights the active filter.
  const allProducts = useMemo(
    () => page.tabs.flatMap((t) => productsForTab(t, page.tabs)),
    [page.tabs],
  )
  const priceMinDefault = allProducts.length ? Math.min(...allProducts.map((p) => p.priceNew)) : 0
  const priceMaxDefault = allProducts.length ? Math.max(...allProducts.map((p) => p.priceNew)) : 0

  const chipRef = useRef<HTMLDivElement>(null)
  const [chipAtStart, setChipAtStart] = useState(true)
  const [chipAtEnd, setChipAtEnd] = useState(false)

  const [filterOpen, setFilterOpen] = useState(false)
  const [brandSectionOpen, setBrandSectionOpen] = useState(true)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([])
  const [priceMin, setPriceMin] = useState(priceMinDefault)
  const [priceMax, setPriceMax] = useState(priceMaxDefault)
  const [sort, setSort] = useState<'default' | 'best-seller' | 'price-asc' | 'price-desc'>('best-seller')
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)
  const [pagesShown, setPagesShown] = useState(1)
  const [fiveCol, setFiveCol] = useState(false)
  const [descOpen, setDescOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatProduct, setChatProduct] = useState<CategoryProduct | null>(null)

  useEffect(() => {
    const mq = window.matchMedia(FIVE_COL_QUERY)
    const sync = () => setFiveCol(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const pageSize = fiveCol ? PAGE_SIZE_5_COL : PAGE_SIZE

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

  const updateChipEdges = () => {
    const el = chipRef.current
    if (!el) return
    setChipAtStart(el.scrollLeft <= 0)
    setChipAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)
  }

  const scrollChips = (amount: number) => {
    chipRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const handleChatClick = (product?: CategoryProduct) => {
    if (!isLoggedIn) {
      showToast('Please login to start chatting')
      router.push('/login')
      return
    }
    setChatProduct(product ?? null)
    setChatOpen(true)
  }

  const handleCompareClick = (product: CategoryProduct) => {
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

  const handleBuyNow = (product: CategoryProduct) => {
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

  const brands = useMemo(() => {
    const names = dealProducts.map((p) => p.name.split(' ')[0])
    return Array.from(new Set(names))
  }, [dealProducts])

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]))
    setPagesShown(1)
  }

  const toggleAvailability = (status: string) => {
    setSelectedAvailability((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
    setPagesShown(1)
  }

  const filtered = useMemo(() => {
    let list = dealProducts.filter((p) => p.priceNew >= priceMin && p.priceNew <= priceMax)
    if (selectedBrands.length) {
      list = list.filter((p) => selectedBrands.includes(p.name.split(' ')[0]))
    }
    if (selectedAvailability.length) {
      list = list.filter(() => selectedAvailability.includes('In Stock'))
    }
    if (sort === 'best-seller') list = [...list].sort((a, b) => b.reviews - a.reviews)
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.priceNew - b.priceNew)
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.priceNew - a.priceNew)
    return list
  }, [dealProducts, priceMin, priceMax, selectedBrands, selectedAvailability, sort])

  const visibleCount = pagesShown * pageSize
  const paged = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  if (allProducts.length === 0) {
    return (
      <>
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Offers & Deals', href: '/offers-and-deals' }]} />
        <div className="container mx-auto px-4 min-[992px]:px-14 py-16">
          <div className="text-center max-w-md mx-auto">
            <span className="mi text-[56px] text-gray-300 block mb-4">local_offer</span>
            <p className="text-[14px] text-gray-500 mb-6">No active offers right now. Please check back soon.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-[#d32f2f] text-white text-[14px] font-semibold px-5 py-2.5 rounded-full no-underline hover:bg-[#b71c1c] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="cp-cat-wrap">
      <Toast message={toast} />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Offers & Deals', href: '/offers-and-deals' }]} />

      <div className="container mx-auto px-4 min-[992px]:px-14 py-6">
        {/* Sidebar filters (off-canvas at every breakpoint) */}
        <div
          onClick={() => setFilterOpen(false)}
          className={`fixed inset-0 desk:top-[72px] bg-black/50 z-[9998] transition-opacity ${
            filterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        />
        <aside
          className={`fixed inset-4 md:inset-auto md:top-[88px] md:left-4 md:h-[calc(100%-104px)] md:w-[88%] md:max-w-[320px] bg-white z-[9999] rounded-[28px] shadow-2xl transition-transform duration-300 flex flex-col overflow-hidden ${
            filterOpen ? 'translate-x-0' : '-translate-x-[calc(100%+1rem)]'
          }`}
        >
          <div className="flex-none flex items-center justify-between px-5 py-4 bg-white">
            <span className="flex items-center gap-2 font-bold text-base text-gray-900">
              <Image src="/images/pc-builder/icons/filter-icon.svg" alt="" width={24} height={17} /> Filter By
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPriceMin(priceMinDefault)
                  setPriceMax(priceMaxDefault)
                  setSelectedBrands([])
                  setSelectedAvailability([])
                  setPagesShown(1)
                }}
                className="w-9 h-9 rounded-full bg-gray-400 hover:bg-gray-500 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Clear all filters"
                title="Clear all filters"
              >
                <span className="mi text-2xl text-white">restart_alt</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-400 hover:bg-gray-500 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close filters"
              >
                <span className="mi text-2xl text-white">close</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto thin-scroll-red p-5 flex flex-col gap-5">
            <div className="bg-[#f8f9fb] rounded-2xl p-4 shrink-0">
              <div className="flex items-center gap-2 font-bold text-[15px] text-gray-900 mb-4">
                <span className="mi text-[#c3272b] text-[18px]">payments</span>
                Price Range
              </div>
              <div className="relative h-1.5 mt-2 mb-1">
                <div className="absolute inset-0 rounded-full bg-gray-200" />
                <div
                  className="absolute h-1.5 rounded-full bg-[#c3272b]"
                  style={{
                    left: `${
                      priceMaxDefault > priceMinDefault
                        ? ((priceMin - priceMinDefault) / (priceMaxDefault - priceMinDefault)) * 100
                        : 0
                    }%`,
                    right: `${
                      priceMaxDefault > priceMinDefault
                        ? 100 - ((priceMax - priceMinDefault) / (priceMaxDefault - priceMinDefault)) * 100
                        : 0
                    }%`,
                  }}
                />
                <input
                  type="range"
                  min={priceMinDefault}
                  max={priceMaxDefault}
                  value={priceMin}
                  onChange={(e) => {
                    setPriceMin(Math.min(Number(e.target.value), priceMax))
                    setPagesShown(1)
                  }}
                  className="absolute inset-0 w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#c3272b] [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#c3272b] [&::-moz-range-thumb]:cursor-pointer"
                />
                <input
                  type="range"
                  min={priceMinDefault}
                  max={priceMaxDefault}
                  value={priceMax}
                  onChange={(e) => {
                    setPriceMax(Math.max(Number(e.target.value), priceMin))
                    setPagesShown(1)
                  }}
                  className="absolute inset-0 w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#c3272b] [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#c3272b] [&::-moz-range-thumb]:cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between gap-2.5 mt-4">
                <div className="flex-1 flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 h-10">
                  <span className="text-[#c3272b] text-[13px] font-medium">৳</span>
                  <input
                    type="text"
                    value={priceMin}
                    onChange={(e) => {
                      setPriceMin(Math.min(Number(e.target.value) || 0, priceMax))
                      setPagesShown(1)
                    }}
                    className="w-full min-w-0 text-center text-[13px] font-semibold text-gray-700 outline-none bg-transparent"
                  />
                </div>
                <span className="text-gray-300 shrink-0">—</span>
                <div className="flex-1 flex items-center gap-1 bg-white border border-gray-200 rounded-full px-3 h-10">
                  <span className="text-[#c3272b] text-[13px] font-medium">৳</span>
                  <input
                    type="text"
                    value={priceMax}
                    onChange={(e) => {
                      setPriceMax(Math.max(Number(e.target.value) || 0, priceMin))
                      setPagesShown(1)
                    }}
                    className="w-full min-w-0 text-center text-[13px] font-semibold text-gray-700 outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#f8f9fb] rounded-2xl p-4 shrink-0">
              <div className="flex items-center gap-2 font-bold text-[15px] text-gray-900 mb-3">
                <span className="mi text-[#c3272b] text-[18px]">inventory_2</span>
                Availability
              </div>
              <div className="flex flex-col gap-0.5">
                {['In Stock', 'Pre Order', 'Up Coming'].map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white cursor-pointer text-[14px] text-gray-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAvailability.includes(status)}
                      onChange={() => toggleAvailability(status)}
                      className="accent-[#c3272b] w-4 h-4 shrink-0"
                    />
                    {status}
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-[#f8f9fb] rounded-2xl overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => setBrandSectionOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer"
              >
                <span className="flex items-center gap-2 font-bold text-[15px] text-gray-900">
                  <span className="mi text-[#c3272b] text-[18px]">sell</span>
                  Brand
                </span>
                <span
                  className={`mi text-gray-500 text-[20px] transition-transform ${brandSectionOpen ? 'rotate-180' : ''}`}
                >
                  expand_more
                </span>
              </button>
              {brandSectionOpen && (
                <div className="px-3 pb-3 flex flex-col gap-0.5 max-h-[210px] overflow-y-auto thin-scroll-red">
                  {brands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white cursor-pointer text-[14px] text-gray-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="accent-[#c3272b] w-4 h-4 shrink-0"
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div>
          <MonarchDealsBadge title={page.title} />
          {page.subtitle ? (
            <p className="text-center text-[13px] md:text-[15px] text-gray-500 mb-6">{page.subtitle}</p>
          ) : null}

          {/* Deal type chips */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 md:gap-3 max-w-full">
              <button
                type="button"
                onClick={() => scrollChips(-260)}
                aria-label="Scroll left"
                className={`hidden md:flex shrink-0 w-[38px] h-[38px] bg-[#f5f5f7] rounded-full items-center justify-center transition-opacity cursor-pointer ${
                  chipAtStart ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                <Image src="/images/promo-banner/left-arrow.svg" alt="" width={9} height={16} className="w-[9px] h-4" />
              </button>

              <div
                ref={chipRef}
                onScroll={updateChipEdges}
                className="flex overflow-x-auto gap-4 md:gap-6 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-w-0"
              >
                {tabs.map((deal) => {
                  const isActive = activeDeal === deal.id
                  return (
                    <button
                      key={deal.id}
                      type="button"
                      onClick={() => {
                        setActiveDeal(deal.id)
                        setPagesShown(1)
                      }}
                      className="group flex-none flex flex-col items-center gap-1.5 cursor-pointer"
                    >
                      <span className="relative w-11 h-11 md:w-14 md:h-14">
                        {deal.icon ? (
                          <Image
                            src={deal.icon}
                            alt={deal.label}
                            width={56}
                            height={56}
                            className={`absolute inset-0 w-full h-full transition-opacity ${
                              isActive ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'
                            }`}
                          />
                        ) : null}
                        {deal.iconActive ? (
                          <Image
                            src={deal.iconActive}
                            alt=""
                            width={56}
                            height={56}
                            className={`absolute inset-0 w-full h-full transition-opacity ${
                              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          />
                        ) : null}
                      </span>
                      <span
                        className={`text-[11px] md:text-[12px] font-semibold whitespace-nowrap transition-colors ${
                          isActive ? 'text-[#d32f2f]' : 'text-gray-500 group-hover:text-[#d32f2f]'
                        }`}
                      >
                        {deal.label}
                      </span>
                      <span
                        className={`h-[3px] w-4 rounded-full bg-[#d32f2f] transition-opacity ${
                          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollChips(260)}
                aria-label="Scroll right"
                className={`hidden md:flex shrink-0 w-[38px] h-[38px] bg-[#f5f5f7] rounded-full items-center justify-center transition-opacity cursor-pointer ${
                  chipAtEnd ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                <Image src="/images/promo-banner/right-arrow.svg" alt="" width={9} height={16} className="w-[9px] h-4" />
              </button>
            </div>
          </div>

          {showBundles ? (
            <BundlesPage embedded />
          ) : (
            <>
            <div className="flex items-center justify-between gap-3 mb-4">
              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                className="group shrink-0 inline-flex items-center gap-1.5 bg-[#f5f5f7] border border-[#f5f5f7] rounded-full px-4 py-2 text-[14px] font-semibold text-gray-600 hover:border-[#d32f2f] hover:text-[#d32f2f] transition-colors cursor-pointer"
              >
                <span className="relative w-[21px] h-[15px]">
                  <Image
                    src="/images/pc-builder/icons/filter-icon.svg"
                    alt=""
                    width={21}
                    height={15}
                    className="absolute inset-0 transition-opacity opacity-100 group-hover:opacity-0"
                  />
                  <Image
                    src="/images/pc-builder/icons/filter-icon-red2.svg"
                    alt=""
                    width={21}
                    height={15}
                    className="absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100"
                  />
                </span>
                Filter By
              </button>

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
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[190px] bg-white border border-gray-100 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.14)] z-50 p-3.5 flex flex-col gap-3.5">
                    {(['best-seller', 'price-asc', 'price-desc'] as const).map((value) => (
                      <label key={value} className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={sort === value}
                          onChange={() => {
                            setSort(sort === value ? 'default' : value)
                            setPagesShown(1)
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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 min-[87.5rem]:grid-cols-5 gap-8 md:gap-[50px]">
              {paged.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  ribbonLabel={p.dealLabel}
                  onBuyNow={handleBuyNow}
                  onCompare={handleCompareClick}
                  onChat={() => handleChatClick(p)}
                />
              ))}

              {paged.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <span className="mi text-[56px] text-gray-400 block mb-3">search_off</span>
                  <p className="text-gray-600">No products match the selected filters.</p>
                </div>
              )}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  type="button"
                  onClick={() => setPagesShown((p) => p + 1)}
                  className="inline-flex items-center gap-2 bg-white text-[#c3272b] border border-[#c3272b] font-bold text-[13px] px-6 py-2.5 rounded-full hover:bg-[#c3272b] hover:text-white transition-colors cursor-pointer"
                >
                  <i className="fa fa-chevron-down text-base" /> More
                </button>
              </div>
            )}
            </>
          )}

          <div className="bg-white border-[1.5px] border-[#f1f5f9] rounded-[25px] mt-10">
            <div
              className={`relative overflow-hidden transition-[max-height] duration-500 ease-in-out px-5 pt-4 ${
                descOpen ? 'max-h-none pb-4' : 'max-h-[170px]'
              }`}
            >
              <h2 className="text-[17px] font-bold text-gray-900 mb-2">About Monarch Deals</h2>
              <p className="text-[13px] text-gray-600 leading-[1.8] mb-3">
                Monarch IT brings together every ongoing discount, bundle, and clearance offer across desktops,
                laptops, gaming gear, ACs, UPS, and office equipment in one place. Prices shown already reflect the
                deal discount, so there is nothing extra to apply at checkout.
              </p>
              <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5">Why buy from Monarch IT</h3>
              <p className="text-[13px] text-gray-600 leading-[1.8] mb-3">
                Every product listed here is sourced directly from authorized distributors, backed by nationwide
                delivery and dedicated customer support across our service network in Bangladesh.
              </p>
              {!descOpen && (
                <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-gradient-to-b from-white/0 to-white pointer-events-none" />
              )}
            </div>
            <div className="text-center pb-4">
              <button
                type="button"
                onClick={() => setDescOpen((v) => !v)}
                aria-label={descOpen ? 'Collapse description' : 'Expand description'}
                className="w-[42px] h-[42px] rounded-full bg-[#f5f6fa] border border-[#e5e5e5] shadow-[0_2px_8px_rgba(0,0,0,0.08)] inline-flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
              >
                <i
                  className={`fa fa-chevron-down text-xl text-[#d32f2f] transition-transform duration-400 ${
                    descOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      <ChatWidget
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        product={
          chatProduct
            ? {
                name: chatProduct.name,
                image: chatProduct.image,
                priceNew: chatProduct.priceNew,
                priceOld: chatProduct.priceOld,
                discountPct: chatProduct.discountPct,
                href: `/${chatProduct.slug}`,
              }
            : undefined
        }
      />
    </div>
  )
}

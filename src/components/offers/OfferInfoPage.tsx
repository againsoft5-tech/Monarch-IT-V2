'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { OfferInfo } from '@/data/offers'
import type { CategoryProduct } from '@/data/categoryProducts'
import { getProductDetail } from '@/data/productDetail'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useCompare } from '@/context/CompareContext'
import { categoryProductToCompare } from '@/lib/compareAdapter'
import { useToast, Toast } from '@/components/ui/Toast'
import ProductCard from '@/components/ui/ProductCard'
import CountdownTimer from '@/components/product/CountdownTimer'
import ChatWidget from '@/components/chat/ChatWidget'

export default function OfferInfoPage({ offer }: { offer: OfferInfo }) {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const { addItems } = useCart()
  const { slots, setSlot } = useCompare()
  const { toast, showToast } = useToast()
  const [chatOpen, setChatOpen] = useState(false)
  const [activeSection, setActiveSection] = useState(offer.sections[0]?.key)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const key = entry.target.getAttribute('data-section-key')
            if (key) setActiveSection(key)
          }
        })
      },
      { rootMargin: '-150px 0px -70% 0px', threshold: 0 }
    )
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [offer.slug])

  const scrollToSection = (key: string) => {
    const el = sectionRefs.current[key]
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 130
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const handleChatClick = () => {
    if (!isLoggedIn) {
      showToast('Please login to start chatting')
      router.push('/login')
      return
    }
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

  return (
    <div className="cp-cat-wrap">
      <Toast message={toast} />
      <div className="container mx-auto px-4 min-[992px]:px-14 py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-[#4d4d4d]">{offer.title}</h1>
          <p className="mt-1.5 text-[15px] md:text-base text-gray-500">{offer.description}</p>

          {offer.richDescription ? (
            <p className="w-full mt-4 text-[14px] text-gray-600 leading-[1.9]">{offer.richDescription}</p>
          ) : (
            <div className="flex items-center justify-center gap-4 mt-3 text-[13px] text-gray-400">
              <span className="inline-flex items-center gap-1">
                <span className="mi text-[16px]">calendar_month</span>
                {offer.startDate} - {offer.endDate}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="mi text-[16px]">storefront</span>
                {offer.outletLabel}
              </span>
            </div>
          )}

          <div className="flex justify-center">
            <CountdownTimer endDate={offer.endDateISO} />
          </div>
        </div>

        <div className="sticky top-16 desk:top-[72px] z-30 bg-white/95 backdrop-blur-sm -mx-4 px-4 md:mx-0 md:px-0 py-3 mb-8 border-b border-gray-100 overflow-x-auto thin-scroll-red">
          <div className="flex items-center gap-2 w-max mx-auto">
            {offer.sections.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => scrollToSection(s.key)}
                className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeSection === s.key ? 'bg-[#d32f2f] text-white' : 'bg-[#f5f5f7] text-gray-600 hover:text-[#d32f2f]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {offer.sections.map((section) => (
          <div
            key={section.key}
            ref={(el) => {
              sectionRefs.current[section.key] = el
            }}
            data-section-key={section.key}
            className="mb-12 scroll-mt-32"
          >
            <h2 className="text-xl md:text-2xl font-bold text-[#4d4d4d] mb-5 text-center">{section.label}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-[50px]">
              {section.products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onBuyNow={handleBuyNow}
                  onCompare={handleCompareClick}
                  onChat={handleChatClick}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="bg-[#f5f6fa] rounded-[25px] px-5 py-5 mt-4">
          <h3 className="font-bold text-[15px] text-gray-900 mb-3">Terms & Conditions</h3>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            {offer.terms.map((t, i) => (
              <li key={i} className="text-[13px] text-gray-600 leading-[1.7]">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}

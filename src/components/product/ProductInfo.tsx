'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { ProductDetail } from '@/data/productDetail'
import CountdownTimer from './CountdownTimer'
import VariantSelector from './VariantSelector'
import { useToast, Toast } from '@/components/ui/Toast'
import { useCart } from '@/context/CartContext'
import { useCompare } from '@/context/CompareContext'
import { toCompareProduct } from '@/lib/compareAdapter'
import { useAuth } from '@/context/AuthContext'
import ChatWidget from '@/components/chat/ChatWidget'
import type { VariantCombo, VariantGroup } from '@/lib/productVariants'

function formatDeliveryDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ProductInfo({
  product,
  onShowSpecs,
  variantGroups = [],
  variantCombos = [],
  selection = {},
  onSelectVariant,
  activeCombo,
}: {
  product: ProductDetail
  onShowSpecs: () => void
  variantGroups?: VariantGroup[]
  variantCombos?: VariantCombo[]
  selection?: Record<string, string>
  onSelectVariant?: (groupKey: string, optionId: string) => void
  activeCombo?: VariantCombo
}) {
  const deliveryStart = new Date()
  const deliveryEnd = new Date()
  deliveryEnd.setDate(deliveryEnd.getDate() + 4)

  const [qty, setQty] = useState(1)
  const [priceOption, setPriceOption] = useState<'full' | 'emi'>('full')
  const [chatOpen, setChatOpen] = useState(false)
  const { toast, showToast } = useToast()
  const { addItems } = useCart()
  const { slots, setSlot } = useCompare()
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  const changeQty = (dir: number) => setQty((q) => Math.max(1, q + dir))

  const hasVariants = variantGroups.length > 0
  const price = activeCombo?.price ?? product.priceNew
  const priceOld = activeCombo?.priceOld ?? product.priceOld
  const discountPct = activeCombo?.discountPct ?? product.discountPct
  const variantSuffix = hasVariants ? Object.values(selection).join('-') : ''

  // Matches monarchit.com.bd's live EMI calculation: 7% flat markup over 6 months,
  // only offered once the marked-up total clears ৳5,000.
  const emiTotal = price * 1.07
  const emiMonthly = Math.round(emiTotal / 6)
  const showEmi = emiTotal > 5000

  const cartItem = {
    id: variantSuffix ? `${product.slug}-${variantSuffix}` : product.slug,
    name: product.name,
    slug: product.slug,
    image: product.images[0]?.large ?? '',
    price,
    priceOld,
    discountPct,
    qty,
  }

  const handleBuyNow = () => {
    addItems([cartItem])
    router.push('/checkout')
  }

  const handleCompare = () => {
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
    setSlot(emptyIndex, toCompareProduct(product))
    showToast(`${product.name} added to compare list!`)
  }

  const handleChatClick = () => {
    if (!isLoggedIn) {
      showToast('Please login to start chatting')
      router.push('/login')
      return
    }
    setChatOpen(true)
  }

  return (
    <div className="px-4 py-2 md:px-6 md:pt-0">
      <Toast message={toast} />
      <div className="flex flex-wrap items-start gap-x-3 gap-y-4">
        <h1 className="w-full order-2 text-xl font-bold text-gray-900 leading-snug">{product.name}</h1>

        <div className="order-3 grid grid-cols-1 gap-y-2 md:contents">
          <label className="cursor-pointer md:order-3">
            <input
              type="radio"
              name="payment_method"
              checked={priceOption === 'full'}
              onChange={() => setPriceOption('full')}
              className="sr-only peer"
            />
            <div className="flex items-center justify-start gap-2 px-3.5 py-2 md:px-5 md:py-2.5 rounded-full border-[1.5px] border-gray-200 peer-checked:border-[#d92128] transition-colors">
              <span className="text-[18px] md:text-[22px] font-bold text-[#d32f2f]">৳{price.toLocaleString()}</span>
              {priceOld > price && <del className="text-[13px] text-gray-400">৳{priceOld.toLocaleString()}</del>}
              {discountPct > 0 && <span className="text-[12px] font-bold text-[#00b87a]">{discountPct}% OFF</span>}
            </div>
          </label>

          {showEmi && (
            <label className="cursor-pointer md:order-4">
              <input
                type="radio"
                name="payment_method"
                checked={priceOption === 'emi'}
                onChange={() => setPriceOption('emi')}
                className="sr-only peer"
              />
              <div className="flex items-center justify-start gap-2 px-3.5 py-2 md:px-5 md:py-2.5 rounded-full border-[1.5px] border-gray-200 peer-checked:border-[#d92128] transition-colors">
                <span className="text-[18px] md:text-[22px] font-bold text-gray-700">৳{emiMonthly.toLocaleString()}/</span>
                <div className="flex flex-col leading-tight">
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700">
                    month
                    <span className="bg-[#00b87a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">EMI</span>
                  </span>
                  <span className="text-[11px] text-gray-400">0% EMI for up to 6 Months</span>
                </div>
              </div>
            </label>
          )}
        </div>

        <div className="order-5 w-full flex items-center gap-1.5 md:gap-2 md:contents md:w-auto">
          <div className="shrink-0 inline-flex items-center gap-1 bg-[#f3f4f6] rounded-full h-9 px-2 md:order-8">
            <button
              type="button"
              onClick={() => changeQty(-1)}
              className="w-6 font-semibold text-gray-700 hover:text-[#d92128] cursor-pointer"
            >
              −
            </button>
            <span className="w-6 text-center font-bold text-gray-800">{qty}</span>
            <button
              type="button"
              onClick={() => changeQty(1)}
              className="w-6 font-semibold text-gray-700 hover:text-[#d92128] cursor-pointer"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 md:flex-none md:order-9 bg-[#D32F2F] text-white font-bold text-[13px] h-9 px-4 md:px-5 rounded-full hover:bg-[#b71c1c] transition-colors whitespace-nowrap cursor-pointer"
          >
            Buy Now
          </button>

          <button
            type="button"
            onClick={handleChatClick}
            title="Chat Now"
            className="shrink-0 md:order-10 group flex items-center justify-center gap-1.5 bg-[#f3f4f6] text-gray-800 font-semibold text-[13px] w-9 md:w-auto h-9 px-0 md:px-3.5 rounded-full hover:bg-[#c3272b] hover:text-white transition-colors cursor-pointer"
          >
            <Image
              src="/images/catalog/view/theme/default/image/message-icon.svg"
              alt="Message Icon"
              width={22}
              height={22}
              className="w-[22px] h-[22px] shrink-0 transition-[filter] group-hover:brightness-0 group-hover:invert"
            />
            <span className="hidden md:inline">Chat Now</span>
          </button>

          <button
            type="button"
            title="Compare"
            onClick={handleCompare}
            className="shrink-0 md:order-11 group w-9 h-9 bg-[#f3f4f6] rounded-full flex items-center justify-center hover:bg-[#c3272b] transition-colors cursor-pointer"
          >
            <Image
              src="/images/catalog/view/theme/default/image/compare-icon-svg.svg"
              alt="Compare Icon"
              width={22}
              height={22}
              className="w-[22px] h-[22px] transition-[filter] group-hover:brightness-0 group-hover:invert"
            />
          </button>
        </div>

        {hasVariants && onSelectVariant && (
          <div className="w-full order-9 md:order-6">
            <VariantSelector
              groups={variantGroups}
              combos={variantCombos}
              selection={selection}
              onSelect={onSelectVariant}
            />
          </div>
        )}

        <div className="w-full order-10 md:order-5">
          <div className="text-[14px] font-bold text-gray-700 mb-2">Key Features</div>
          <div className="text-[13px] text-gray-600 leading-[1.7] max-h-[90px] overflow-hidden">
            <ul className="list-disc pl-5 space-y-0.5">
              {product.keyFeatures.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={onShowSpecs}
            className="text-[12.5px] font-semibold text-[#d92128] mt-1 hover:underline cursor-pointer"
          >
            More ›
          </button>
        </div>

        {product.discountEndsAt && (
          <div className="w-full order-11 md:order-7">
            <CountdownTimer endDate={product.discountEndsAt} />
          </div>
        )}

        <div className="w-full md:w-fit order-12 flex flex-col items-start md:flex-row md:items-center gap-2.5 md:gap-5 md:flex-wrap text-[12px] text-gray-600 md:px-3.5 md:py-2.5 md:border-[1.5px] md:border-gray-100 md:rounded-2xl">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border-[1.5px] border-gray-100 rounded-2xl md:border-0 md:rounded-none md:p-0">
            <Image src="/images/catalog/view/theme/default/image/delivery-icon.svg" alt="Delivery" width={20} height={16} />
            Estimated delivery:{' '}
            <strong className="text-gray-700">
              {formatDeliveryDate(deliveryStart)} – {formatDeliveryDate(deliveryEnd)}
            </strong>
          </span>
          <a href="#" className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border-[1.5px] border-gray-100 rounded-2xl md:border-0 md:rounded-none md:p-0 no-underline text-gray-600 hover:text-[#d92128]">
            <Image src="/images/catalog/view/theme/default/image/return-and-refund-policy-icon.svg" alt="Returns" width={16} height={16} />
            Returns &amp; Refunds Policy
          </a>
        </div>
      </div>

      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Breadcrumbs from '@/components/category/Breadcrumbs'

const IMG_BASE = '/images'

const trackingSteps = ['Accepted', 'Picked', 'In Transit', 'Ready for Delivery', 'Delivered']

const trackingUpdates = [
  { time: 'Apr 6, 2026 3:37 PM', text: 'New order pickup requested' },
  { time: 'Apr 6, 2026 3:45 PM', text: 'Order has been confirmed' },
  { time: 'Apr 6, 2026 4:28 PM', text: 'Order has been assigned to Sahadat Hossain - 01632934597 for pickup' },
  { time: 'Apr 6, 2026 6:19 PM', text: 'Order weight has been updated from 0.5kg to 1kg' },
]

export default function OrderTrackPage() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [copied, setCopied] = useState(false)

  const consignmentId = 'DM060426MWTJL9'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(consignmentId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable in this browser context
    }
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Order Track', href: '/order-track' }]} />

      <div className="container mx-auto px-4 min-[992px]:px-14 py-8 md:py-14">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 max-w-[1150px] mx-auto">
          <Image
            src={`${IMG_BASE}/catalog/view/theme/default/image/login-page-image.png`}
            alt="Order Track"
            width={520}
            height={520}
            className="hidden md:block md:w-[420px] h-auto object-contain shrink-0"
          />

          <div className="w-full max-w-[460px] bg-[#f4f5f7] rounded-[32px] p-4 md:p-5">
            <form onSubmit={(e) => e.preventDefault()} className="bg-[#d32f2f] rounded-[26px] p-6 md:p-7">
              <h1 className="text-white text-xl md:text-2xl font-bold m-0">Track Your Order</h1>
              <p className="text-white/80 text-[13px] mt-1 mb-5">Please enter your order tracking number</p>

              <div className="flex items-center gap-2.5 bg-white rounded-full px-4 py-3 mb-3.5">
                <Image src="/images/compare-icons/search-icon.svg" alt="" width={18} height={18} className="w-[18px] h-[18px] shrink-0" />
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Tracking number"
                  autoComplete="off"
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-[14px] text-gray-800 placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                className="w-full h-[46px] border-2 border-white rounded-full text-white font-bold text-[15px] hover:bg-white hover:text-[#d32f2f] transition-colors cursor-pointer"
              >
                Track Order
              </button>
            </form>

            <div className="bg-white rounded-[22px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] mt-5 max-h-[420px] overflow-y-auto">
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-gray-800 mb-4">
                  <span>Home</span>
                  <span className="text-gray-300">›</span>
                  <span>Tracking</span>
                  <span className="text-gray-300">›</span>
                  <span>Delivery Details</span>
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <span className="text-[13px] text-gray-500">Consignment ID</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[14px] font-bold text-gray-900 cursor-pointer"
                  >
                    {consignmentId}
                    <span className="mi text-[16px] text-[#d32f2f]">{copied ? 'check' : 'content_copy'}</span>
                  </button>
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4 flex items-start justify-between gap-4">
                  <span className="text-[13px] text-gray-500 shrink-0">Shipping Info</span>
                  <div className="text-right">
                    <p className="text-[14px] font-bold text-gray-900 m-0">01345957620</p>
                    <p className="text-[13px] font-semibold text-gray-700 mt-1 mb-0.5">Tahsan Sharif</p>
                    <p className="text-[12px] text-gray-500 m-0 leading-relaxed">
                      Road 3, House: 126(flat 7A), Mohammadia
                      <br />
                      Housing Society, Mohammadpur, Dhaka
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] text-gray-500 m-0">Payment Details</p>
                    <p className="text-[15px] font-bold text-gray-900 mt-1 mb-0"><span className="font-medium">৳</span> 2,360</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#00a76a]">
                    <span className="mi text-[18px]">payments</span>
                    Cash Payment
                  </span>
                </div>

                <div className="border-t border-gray-100 mt-4 pt-4">
                  <h2 className="text-[15px] font-bold text-gray-900 m-0 mb-6">Tracking Details</h2>

                  <div className="relative mb-8">
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-1.5 bg-[#d32f2f] rounded-full" style={{ width: '88%' }} />
                    </div>
                    <div className="absolute -top-3.5" style={{ left: '88%', transform: 'translateX(-50%)' }}>
                      <div className="w-7 h-7 rounded-full bg-white border-2 border-[#d32f2f] flex items-center justify-center shadow-sm">
                        <Image
                          src={`${IMG_BASE}/catalog/view/theme/default/image/delivery-icon.svg`}
                          alt=""
                          width={14}
                          height={14}
                          className="w-3.5 h-3.5"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between mt-3">
                      {trackingSteps.map((step) => (
                        <span key={step} className="text-[10.5px] font-medium text-gray-500 text-center flex-1">
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex flex-col items-center pt-0.5">
                      <span className="w-5 h-5 rounded-full bg-[#00a76a] flex items-center justify-center shrink-0">
                        <span className="mi text-white text-[13px]">check</span>
                      </span>
                      <span className="flex-1 w-px bg-[#00a76a]/30 mt-1" />
                    </div>
                    <div className="pb-2">
                      <p className="text-[14px] font-bold text-gray-900 m-0 mb-2.5">Accepted</p>
                      <div className="space-y-3">
                        {trackingUpdates.map((u) => (
                          <div key={u.text}>
                            <p className="text-[13px] text-gray-700 m-0">- {u.text}</p>
                            <p className="text-[11.5px] text-gray-400 mt-0.5 m-0">{u.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

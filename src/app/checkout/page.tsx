'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Breadcrumbs from '@/components/category/Breadcrumbs'
import { useCart } from '@/context/CartContext'
import { DISTRICTS, UPAZILAS } from '@/data/bdLocations'
import BundleLineDetails from '@/components/cart/BundleLineDetails'
import CartLineThumb from '@/components/cart/CartLineThumb'

function CashOnDeliveryIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 470 453.21" className={className} fill="currentColor">
      <path d="M482.7,233.13a16.79,16.79,0,0,0-14.49-8.31,117.89,117.89,0,0,0-33.57,5.07V57c0-19.45-14.11-33.57-33.57-33.57h-235C146.62,23.4,132.5,37.52,132.5,57v179.5a158.69,158.69,0,0,0-71.34,60.08L17.52,367.06a16.78,16.78,0,1,0,28.54,17.67l43.43-70.18c22.94-35.16,60.35-56.16,100.08-56.16H280.7A50.45,50.45,0,0,1,233.21,292H199.64a16.79,16.79,0,0,0,0,33.57H367.5a16.79,16.79,0,0,0,13.42-6.7l20.26-27a81.7,81.7,0,0,1,34.74-27.05L408.1,314.22c-20.16,37.46-61.12,61.67-104.38,61.67a415.06,415.06,0,0,0-230.89,70,16.79,16.79,0,0,0,18.63,27.93,381.58,381.58,0,0,1,212.26-64.32c55.44,0,108-31.14,133.79-79.06l45.32-80.56A16.73,16.73,0,0,0,482.7,233.13ZM266.79,57h33.57V73.75H266.79ZM374.22,271.82,359.11,292H299.93a83.11,83.11,0,0,0,17.21-50.35,16.79,16.79,0,0,0-16.78-16.79H189.57a145.93,145.93,0,0,0-23.5,2.12V57h67.14V90.54A16.79,16.79,0,0,0,250,107.32h67.14a16.78,16.78,0,0,0,16.79-16.78V57h67.14V245.91A113.09,113.09,0,0,0,374.22,271.82Z" transform="translate(-15 -23.4)" />
    </svg>
  )
}

function MobileBankingIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 255.1 452" className={className} fill="currentColor">
      <path fillRule="evenodd" d="M250,423.47a20.09,20.09,0,1,1-20.09,20.09v0a20.05,20.05,0,0,1,20-20ZM328.74,24H171.15a48.74,48.74,0,0,0-48.7,48.78V427.15A48.85,48.85,0,0,0,171.3,476H328.85a48.78,48.78,0,0,0,48.7-48.85V72.74A48.77,48.77,0,0,0,328.74,24Zm34.39,384.17H136.84v-331H363.13Z" transform="translate(-122.45 -24)" />
    </svg>
  )
}

function OnlineBankingIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 446.76 454" className={className} fill="currentColor">
      <path d="M235.14,125.41l-.16.15a22.33,22.33,0,1,0,30,33.06l.17-.15a22.34,22.34,0,1,0-30.05-33.06Z" transform="translate(-26.62 -23)" />
      <path d="M451,432.32H49A22.34,22.34,0,0,0,49,477H451a22.34,22.34,0,0,0,0-44.68Z" transform="translate(-26.62 -23)" />
      <path d="M116,253.62A22.34,22.34,0,0,0,93.64,276v89.35H71.3a22.34,22.34,0,1,0,0,44.68H428.7a22.34,22.34,0,1,0,0-44.68H406.36V276a22.34,22.34,0,1,0-44.67,0v89.35H317V276a22.34,22.34,0,1,0-44.67,0v89.35H227.66V276A22.34,22.34,0,1,0,183,276v89.35H138.31V276A22.34,22.34,0,0,0,116,253.62Z" transform="translate(-26.62 -23)" />
      <path d="M49,231.29H451a22.34,22.34,0,0,0,14.84-39L312.33,55.76c-18.64-16.56-28.9-25.69-43.13-29.94a66.81,66.81,0,0,0-38.41,0c-14.22,4.25-24.48,13.38-43.12,29.94L34.12,192.25a22.34,22.34,0,0,0,14.84,39ZM217.36,89.15C230.3,77.64,238.86,70,243.6,68.62a22.31,22.31,0,0,1,12.8,0c4.74,1.42,13.3,9,26.25,20.53l109.64,97.46H107.71Z" transform="translate(-26.62 -23)" />
    </svg>
  )
}

function LocationDropdown({
  value,
  options,
  onChange,
  wrapperClassName = '',
  textClassName = '',
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
  wrapperClassName?: string
  textClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={wrapRef} className={`relative ${wrapperClassName}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`block w-full truncate bg-transparent text-left outline-none cursor-pointer ${textClassName}`}
      >
        {value}
      </button>

      {open && (
        <div className="thin-scroll-red absolute left-0 top-[calc(100%+10px)] z-50 max-h-64 min-w-[170px] overflow-y-auto rounded-2xl border border-gray-100 bg-white py-1.5 shadow-[0_10px_32px_rgba(0,0,0,0.14)]">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
              className={`block w-full whitespace-nowrap px-4 py-2 text-left text-[13px] transition-colors cursor-pointer ${
                opt === value ? 'bg-[#fdeceb] font-semibold text-[#d32f2f]' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

type Mode = 'guest' | 'login' | 'register'
type Payment = 'cod' | 'mobile' | 'online'

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    discount,
    total: cartTotal,
    couponMessage,
    applyCoupon,
    appliedCoupon,
    couponAuto,
    couponSavingFor,
    updateQty,
    removeItem,
  } = useCart()
  const [mode, setMode] = useState<Mode>('guest')
  const [district, setDistrict] = useState('Dhaka')
  const [upazila, setUpazila] = useState(UPAZILAS['Dhaka'][0])
  const [payment, setPayment] = useState<Payment>('cod')
  const [coupon, setCoupon] = useState('')

  // An auto-applied coupon fills the box on its own: the discount is already in the
  // total, so an empty field would read as "no code applied".
  useEffect(() => {
    if (appliedCoupon) setCoupon(appliedCoupon)
  }, [appliedCoupon])
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleDistrictChange = (value: string) => {
    setDistrict(value)
    setUpazila(UPAZILAS[value]?.[0] ?? '')
  }

  const shipping = district === 'Dhaka' && upazila === 'Dhaka City' ? 0 : 120
  const total = cartTotal + shipping

  const handlePlaceOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Checkout', href: '/checkout' },
        ]}
      />

      <div className="container mx-auto px-4 min-[992px]:px-14 py-6 md:py-8">
        {items.length === 0 ? (
          <div className="max-w-[420px] mx-auto text-center py-16">
            <p className="text-gray-500 mb-4">Your cart is empty!</p>
            <Link
              href="/"
              className="inline-block bg-[#d32f2f] text-white text-[14px] font-semibold px-6 py-2.5 rounded-full no-underline hover:bg-[#b71c1c] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handlePlaceOrder}
            className="bg-[#f5f5f7] rounded-[24px] md:rounded-[36px] p-3.5 md:p-7 max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-[1.9fr_1fr] gap-4 md:gap-6"
          >
            {/* LEFT: FORM */}
            <div className="order-2 lg:order-1 bg-white rounded-[20px] md:rounded-[26px] p-5 md:p-8 flex flex-col gap-4">
              <div className="inline-flex self-start bg-[#f5f5f7] rounded-full p-1">
                {(['guest', 'login', 'register'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`px-5 py-2 rounded-full text-[13px] font-semibold capitalize transition-colors cursor-pointer ${
                      mode === m
                        ? 'bg-[#d32f2f] text-white shadow-[0_4px_12px_rgba(211,47,47,0.3)]'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {mode === 'login' ? (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="flex items-center gap-1 px-5 py-2.5 rounded-full border border-gray-200 focus-within:border-gray-400 transition-colors">
                      <span className="text-[13px] font-semibold text-gray-800 shrink-0 whitespace-nowrap mr-1">Email:</span>
                      <input
                        type="email"
                        autoComplete="email"
                        className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-gray-800"
                      />
                    </div>
                    <div className="flex items-center gap-1 px-5 py-2.5 rounded-full border border-gray-200 focus-within:border-gray-400 transition-colors">
                      <span className="text-[13px] font-semibold text-gray-800 shrink-0 whitespace-nowrap mr-1">Password:</span>
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-gray-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((v) => !v)}
                        aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                        className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      >
                        <i className={`fa-solid ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'} text-[13px]`} />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="self-start bg-[#d32f2f] text-white text-[14px] font-semibold px-9 py-3 rounded-full shadow-[0_6px_18px_rgba(211,47,47,0.25)] hover:bg-[#b71c1c] transition-colors cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-[17px] font-bold text-gray-800 m-0">Information</h2>

                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="flex items-center gap-1 px-5 py-2.5 rounded-full border border-gray-200 focus-within:border-gray-400 transition-colors">
                        <span className="text-[13px] font-semibold text-gray-800 shrink-0 whitespace-nowrap mr-1">Name*:</span>
                        <input
                          name="firstname"
                          type="text"
                          autoComplete="name"
                          className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-gray-800"
                        />
                      </div>
                      <div className="flex items-center gap-1 px-5 py-2.5 rounded-full border border-gray-200 focus-within:border-gray-400 transition-colors">
                        <span className="text-[13px] font-semibold text-gray-800 shrink-0 whitespace-nowrap mr-1">Number*:</span>
                        <input
                          name="telephone"
                          type="tel"
                          className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-gray-800"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1 px-5 py-2.5 rounded-full border border-gray-200 focus-within:border-gray-400 transition-colors">
                      <span className="text-[13px] font-semibold text-gray-800 shrink-0 whitespace-nowrap mr-1">Email*:</span>
                      <input
                        name="email"
                        type="email"
                        className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-gray-800"
                      />
                    </div>

                    <div className="flex items-center gap-1 px-5 py-2.5 rounded-full border border-gray-200 focus-within:border-gray-400 transition-colors">
                      <span className="text-[13px] font-semibold text-gray-800 shrink-0 whitespace-nowrap mr-1">Address*:</span>
                      <input
                        name="address_1"
                        type="text"
                        className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-gray-800"
                      />
                    </div>

                    <div className="flex items-center gap-1 px-4 sm:px-5 py-2.5 rounded-full border border-gray-200">
                      <span className="text-[12px] sm:text-[13px] font-semibold text-gray-800 shrink-0 whitespace-nowrap mr-1">
                        Information:
                      </span>
                      <LocationDropdown
                        value={district}
                        options={DISTRICTS}
                        onChange={handleDistrictChange}
                        wrapperClassName="shrink-0 max-w-[34%] sm:max-w-none"
                        textClassName="text-[12px] sm:text-[13px] font-medium text-gray-500"
                      />
                      <span className="mi text-[14px] text-gray-400 shrink-0">chevron_right</span>
                      <LocationDropdown
                        value={upazila}
                        options={UPAZILAS[district] ?? []}
                        onChange={setUpazila}
                        wrapperClassName="flex-1 min-w-0"
                        textClassName="text-[12px] sm:text-[13px] font-medium text-gray-500"
                      />
                    </div>

                    {mode === 'register' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="flex items-center gap-1 px-5 py-2.5 rounded-full border border-gray-200 focus-within:border-gray-400 transition-colors">
                          <span className="text-[13px] font-semibold text-gray-800 shrink-0 whitespace-nowrap mr-1">Password*:</span>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-gray-800"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                          >
                            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-[13px]`} />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 px-5 py-2.5 rounded-full border border-gray-200 focus-within:border-gray-400 transition-colors">
                          <span className="text-[13px] font-semibold text-gray-800 shrink-0 whitespace-nowrap mr-1">Confirm*:</span>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-gray-800"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                          >
                            <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-[13px]`} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-2.5 mt-1">
                    {(
                      [
                        { key: 'cod', label: 'Cash On Delivery', Icon: CashOnDeliveryIcon, w: 'w-[17px]' },
                        { key: 'mobile', label: 'Mobile Banking', Icon: MobileBankingIcon, w: 'w-[9px]' },
                        { key: 'online', label: 'Online Banking', Icon: OnlineBankingIcon, w: 'w-[16px]' },
                      ] as { key: Payment; label: string; Icon: typeof CashOnDeliveryIcon; w: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setPayment(opt.key)}
                        className={`flex items-center gap-2 border rounded-full px-3 py-2.5 text-[12px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          payment === opt.key
                            ? 'border-[1.5px] border-[#d32f2f] text-[#d32f2f]'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span
                          className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${
                            payment === opt.key ? 'border-[#d32f2f]' : 'border-gray-300'
                          }`}
                        >
                          {payment === opt.key && <span className="w-2.5 h-2.5 rounded-full bg-[#d32f2f]" />}
                        </span>
                        <opt.Icon className={`${opt.w} h-4 shrink-0`} />
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-start gap-2 text-[11.5px] text-gray-500 mt-1">
                    <i className="fa-solid fa-circle-check text-[#d32f2f] mt-0.5" />
                    <span>
                      I have read and agree to the{' '}
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-[#d32f2f] font-semibold no-underline">
                        Terms &amp; Conditions
                      </a>
                      ,{' '}
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-[#d32f2f] font-semibold no-underline">
                        Privacy Policy
                      </a>{' '}
                      &amp;{' '}
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-[#d32f2f] font-semibold no-underline">
                        Return Policy
                      </a>
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="self-start bg-[#d32f2f] text-white text-[14px] font-semibold px-9 py-3 rounded-full shadow-[0_6px_18px_rgba(211,47,47,0.25)] hover:bg-[#b71c1c] transition-colors cursor-pointer mt-1"
                  >
                    Place Order
                  </button>
                </>
              )}
            </div>

            {/* RIGHT: SUMMARY */}
            <div className="order-1 lg:order-2 bg-white rounded-[20px] md:rounded-[26px] p-5 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex flex-col gap-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3.5 items-start">
                      <div className="w-[62px] h-[62px] shrink-0 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center p-1">
                        <CartLineThumb item={item} size={54} />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <Link
                          href={`/${item.slug}`}
                          className="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2 no-underline hover:text-[#d32f2f]"
                        >
                          {item.name}
                        </Link>

                        <BundleLineDetails item={item} />

                        {couponSavingFor(item) > 0 ? (
                          <span className="inline-flex w-fit items-center rounded-full bg-[#d32f2f] px-2 py-0.5 text-[10.5px] font-bold text-white">
                            ৳{couponSavingFor(item).toLocaleString()} OFF Coupon Applied
                          </span>
                        ) : null}

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[13.5px] font-bold text-[#d32f2f]">
                            <span className="font-medium">৳</span><span className="font-price">{item.price.toLocaleString()}</span>
                          </span>
                          {!!item.priceOld && item.priceOld > item.price && (
                            <span className="text-[11px] text-gray-400 line-through">
                              ৳{item.priceOld.toLocaleString()}
                            </span>
                          )}
                          {!!item.discountPct && (
                            <span className="text-[10.5px] font-semibold text-green-600">
                              {item.discountPct}% OFF
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center gap-2.5 h-8 bg-[#f5f5f7] rounded-full px-3 text-[12px] font-bold text-gray-600">
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, item.qty - 1)}
                              className="cursor-pointer select-none px-0.5"
                            >
                              -
                            </button>
                            <span>{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.id, item.qty + 1)}
                              className="cursor-pointer select-none px-0.5"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.name}`}
                            className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center shrink-0 hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            <Image src="/icons/delete-button.svg" alt="" width={14} height={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/"
                  className="inline-block bg-[#f5f5f7] text-gray-600 text-[12px] font-semibold px-5 py-2 rounded-full no-underline mt-3.5 mb-5 hover:bg-gray-200 hover:text-[#d32f2f] transition-colors"
                >
                  Buy More
                </Link>
              </div>

              <div>
                <div className="flex flex-col gap-3 text-[13.5px] font-medium text-gray-600 pt-5 border-t-2 border-gray-100">
                  <div className="flex justify-between">
                    <span>Sub-Total</span>
                    <span className="text-[#10b981] font-bold"><span className="font-medium">৳</span><span className="font-price">{subtotal.toLocaleString()}</span></span>
                  </div>
                  <div className="flex justify-between">
                    <span>{shipping === 0 ? 'Inside Dhaka City' : `Delivery to ${upazila}, ${district}`}</span>
                    <span className="text-[#10b981] font-bold">
                      <span className="font-medium">৳</span><span className="font-price">{shipping === 0 ? '0' : shipping.toLocaleString()}</span>
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span>
                        Promo Code Discount
                        {appliedCoupon ? (
                          <b className="ml-1 text-gray-700">{appliedCoupon}</b>
                        ) : null}
                      </span>
                      <span className="text-green-600 font-bold">-<span className="font-medium">৳</span><span className="font-price">{discount.toLocaleString()}</span></span>
                    </div>
                  )}
                  <hr className="border-t border-dashed border-gray-200 my-1" />
                  <div className="flex justify-between text-[15px] font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-[#d32f2f]"><span className="font-medium">৳</span><span className="font-price">{total.toLocaleString()}</span></span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-5">
                  <p className="text-[13px] font-semibold text-gray-600 m-0">
                    Coupon/<span className="text-[#d32f2f]">Promo Code</span>
                  </p>
                  <div className="flex bg-[#f5f5f7] rounded-full">
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Promo / Coupon Code"
                      className="flex-1 bg-transparent px-4 py-2.5 outline-none text-[12.5px] text-gray-800 min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => applyCoupon(coupon)}
                      className="shrink-0 bg-[#d32f2f] text-white text-[12.5px] font-semibold px-6 rounded-full hover:bg-[#b71c1c] transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponAuto && appliedCoupon && !couponMessage ? (
                    <p className="mt-2 text-[12px] font-semibold text-green-600">
                      {appliedCoupon} applied automatically — best available offer.
                    </p>
                  ) : null}
                  {couponMessage && (
                    <p
                      className={`text-[11px] m-0 ${
                        couponMessage.type === 'success' ? 'text-green-600' : 'text-[#d32f2f]'
                      }`}
                    >
                      {couponMessage.text}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

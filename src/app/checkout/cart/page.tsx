'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Breadcrumbs from '@/components/category/Breadcrumbs'
import { useCart } from '@/context/CartContext'
import BundleLineDetails from '@/components/cart/BundleLineDetails'
import CartLineThumb from '@/components/cart/CartLineThumb'

export default function CartPage() {
  const {
    items,
    subtotal,
    discount,
    total,
    couponMessage,
    applyCoupon,
    appliedCoupon,
    appliedCoupons,
    couponAuto,
    couponSavingFor,
    updateQty,
    removeItem,
  } = useCart()
  const [coupon, setCoupon] = useState('')

  // Mirrors checkout: show the code that is actually working.
  useEffect(() => {
    if (appliedCoupon) setCoupon(appliedCoupon)
  }, [appliedCoupon])

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Shopping Cart', href: '/checkout/cart' },
        ]}
      />

      <div className="container mx-auto px-4 min-[992px]:px-14 py-6 md:py-8">
        <h1 className="text-[22px] font-bold text-gray-800 mb-4 md:mb-5">Shopping Cart</h1>

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
            {/* LEFT: PRODUCTS + COUPON */}
            <div className="lg:col-span-2 flex flex-col gap-5 md:gap-6">
              <div className="bg-white rounded-[20px] md:rounded-[26px] shadow-[0_15px_35px_rgba(0,0,0,0.04)] p-4 md:p-6">
                <div className="text-[15px] font-bold text-gray-800 pb-3.5 border-b border-gray-200 mb-1">
                  Your Products
                </div>

                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap sm:flex-nowrap items-start gap-4 py-4 border-b border-gray-100 last:border-b-0 last:pb-1"
                  >
                    <div className="w-[78px] h-[78px] shrink-0 bg-[#f5f5f7] border border-gray-200 rounded-2xl flex items-center justify-center p-1.5">
                      <CartLineThumb item={item} size={70} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/${item.slug}`}
                        className="block text-[14.5px] font-semibold text-gray-800 no-underline hover:text-[#d32f2f] transition-colors"
                      >
                        {item.name}
                      </Link>

                      <BundleLineDetails item={item} />

                      {couponSavingFor(item) > 0 ? (
                        <span className="mt-1.5 inline-flex w-fit items-center rounded-full bg-[#d32f2f] px-2 py-0.5 text-[10.5px] font-bold text-white">
                          ৳{couponSavingFor(item).toLocaleString()} OFF Coupon Applied
                        </span>
                      ) : null}

                      <div className="flex items-center justify-between gap-3 flex-wrap mt-3">
                        <div className="flex items-center h-[38px] w-[116px] bg-[#f5f5f7] rounded-full overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            className="w-[34px] h-full flex items-center justify-center text-gray-500 hover:text-[#d32f2f] transition-colors cursor-pointer"
                          >
                            <i className="fa-solid fa-minus text-[12px]" />
                          </button>
                          <span className="flex-1 text-center text-[14px] font-bold text-gray-800">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            className="w-[34px] h-full flex items-center justify-center text-gray-500 hover:text-[#d32f2f] transition-colors cursor-pointer"
                          >
                            <i className="fa-solid fa-plus text-[12px]" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3.5">
                          <div className="text-right">
                            <div className="text-[16px] font-bold text-[#d32f2f]">
                              <span className="font-medium">৳</span><span className="font-price">{(item.price * item.qty).toLocaleString()}</span>
                            </div>
                            <div className="text-[11px] text-gray-500">৳<span className="font-price">{item.price.toLocaleString()}</span>/unit</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.name}`}
                            className="w-8 h-8 rounded-full bg-[#f5f5f7] text-gray-500 flex items-center justify-center shrink-0 hover:bg-[#d32f2f] hover:text-white transition-colors cursor-pointer"
                          >
                            <i className="fa-solid fa-xmark text-[15px]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-[20px] md:rounded-[26px] shadow-[0_15px_35px_rgba(0,0,0,0.04)] p-4 md:p-6">
                <div className="flex items-center gap-2 mb-1">
                  <i className="fa-solid fa-ticket text-[#d32f2f] text-[18px]" />
                  <h2 className="text-[14.5px] font-bold text-gray-800 m-0">Have a Coupon?</h2>
                </div>
                <p className="text-[12.5px] text-gray-500 mb-3">Apply your coupon for an instant discount!</p>
                <div className="flex h-[46px] bg-[#f5f5f7] rounded-full">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="PROMO / COUPON Code"
                    className="flex-1 min-w-0 bg-transparent px-4.5 outline-none text-[13px] text-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => applyCoupon(coupon)}
                    className="shrink-0 bg-[#d32f2f] text-white text-[12.5px] font-semibold px-6 rounded-full hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Apply Coupon
                  </button>
                </div>
                {couponMessage && (
                  <p
                    className={`text-[11px] mt-2 ${
                      couponMessage.type === 'success' ? 'text-green-600' : 'text-[#d32f2f]'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT: ORDER SUMMARY */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[20px] md:rounded-[26px] shadow-[0_15px_35px_rgba(0,0,0,0.04)] p-4 md:p-6 lg:sticky lg:top-24">
                <div className="text-[15px] font-bold text-gray-800 pb-3.5 border-b border-gray-200 mb-1">
                  Order Summary
                </div>

                <div className="flex flex-col gap-3 mt-3">
                  <div className="flex justify-between text-[13.5px] font-medium text-gray-500">
                    <span>Sub-Total</span>
                    <span className="text-gray-800 font-bold"><span className="font-medium">৳</span><span className="font-price">{subtotal.toLocaleString()}</span></span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[13.5px] font-medium text-gray-500">
                      <span>
                        Promo Code Discount
                      </span>
                      <span className="text-green-600 font-bold">-<span className="font-medium">৳</span><span className="font-price">{discount.toLocaleString()}</span></span>
                    </div>
                  )}
                  <hr className="border-t-[1.5px] border-dashed border-gray-200 my-1" />
                  <div className="flex justify-between items-center text-[16px] font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-[#d32f2f] text-[19px]"><span className="font-medium">৳</span><span className="font-price">{total.toLocaleString()}</span></span>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <Link
                    href="/"
                    className="flex-1 h-[46px] flex items-center justify-center gap-1.5 rounded-full bg-[#f5f5f7] text-gray-800 text-[13px] font-semibold no-underline hover:bg-gray-200 hover:text-[#d32f2f] transition-colors"
                  >
                    <i className="fa-solid fa-plus text-[12px]" /> Add More
                  </Link>
                  <Link
                    href="/checkout"
                    className="flex-1 h-[46px] flex items-center justify-center rounded-full bg-[#d32f2f] text-white text-[13px] font-semibold no-underline shadow-[0_6px_18px_rgba(211,47,47,0.25)] hover:opacity-90 transition-opacity"
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

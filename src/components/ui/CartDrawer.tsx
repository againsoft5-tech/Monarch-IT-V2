'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import BundleLineDetails from '@/components/cart/BundleLineDetails'
import PromoHints from '@/components/cart/PromoHints'
import CartLineThumb from '@/components/cart/CartLineThumb'
import AppliedCoupon from '@/components/cart/AppliedCoupon'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, subtotal, discount, total, couponMessage, applyCoupon } = useCart()
  const [coupon, setCoupon] = useState('')

  return (
    <>
      <div
        onClick={closeCart}
        className={`fixed inset-0 bg-black/50 z-[10000] transition-opacity ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <div
        className={`fixed top-0 right-0 h-full w-[90%] max-w-[400px] bg-white z-[10001] shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="relative bg-[#f5f6fc] px-5 py-4 flex items-center justify-between shrink-0">
          <p className="m-0 font-semibold text-[15px] tracking-wide text-[#6c767f]">YOUR CART</p>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            title={`${items.length} item(s) - ৳${subtotal.toLocaleString()}`}
            className="absolute right-2 top-0 h-full flex items-center text-black cursor-pointer opacity-100"
          >
            <span className="mi text-2xl">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Your cart is empty!</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-start gap-3 px-5 py-4 border-b border-gray-100">
                <Link
                  href={`/${item.slug}`}
                  className="shrink-0 w-[47px] h-[47px] p-[2px] rounded border border-gray-100"
                >
                  <CartLineThumb item={item} size={47} />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="mb-1.5">
                    <Link
                      href={`/${item.slug}`}
                      className="text-[13px] font-medium text-gray-800 no-underline hover:text-[#c3272b] line-clamp-2"
                    >
                      {item.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] text-gray-600 flex-wrap">
                    <span>৳<span className="font-price">{item.price.toLocaleString()}</span></span>
                    <span className="mi text-[18px] text-gray-400">close</span>
                    <span>{item.qty}</span>
                    <span className="text-gray-400">=</span>
                    <span className="font-bold text-gray-900"><span className="font-medium">৳</span><span className="font-price">{(item.price * item.qty).toLocaleString()}</span></span>
                  </div>

                  {/* Bundle contents + free gifts, shared with the cart and checkout pages. */}
                  <BundleLineDetails item={item} />

                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  title="Remove"
                  aria-label={`Remove ${item.name}`}
                  className="shrink-0 text-[#c3272b] hover:text-[#8f1c1f] cursor-pointer"
                >
                  <span className="mi text-xl">delete</span>
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="bg-white border-t border-gray-100 px-5 py-4 shrink-0">
            <div className="flex mb-4">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Promo Code"
                className="flex-1 min-w-0 border border-gray-200 rounded-l-md px-3 py-2 text-[13px] text-black outline-none"
              />
              <button
                type="button"
                onClick={() => applyCoupon(coupon)}
                className="shrink-0 bg-[#c3272b] border-2 border-[#c3272b] text-white text-[13px] font-semibold px-4 rounded-r-md hover:bg-[#a71f22] transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>

            <AppliedCoupon onClear={() => setCoupon('')} />
                  <PromoHints onPick={setCoupon} />

            {couponMessage && (
              <p
                className={`text-[12px] -mt-2.5 mb-3 ${
                  couponMessage.type === 'success' ? 'text-green-600' : 'text-[#c3272b]'
                }`}
              >
                {couponMessage.text}
              </p>
            )}

            <div className="flex items-center justify-between text-[14px] text-gray-600 mb-1">
              <span>Sub-Total</span>
              <span className="font-bold"><span className="font-medium">৳</span><span className="font-price">{subtotal.toLocaleString()}</span></span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-[14px] text-green-600 mb-1">
                <span>Discount</span>
                <span className="font-bold">-<span className="font-medium">৳</span><span className="font-price">{discount.toLocaleString()}</span></span>
              </div>
            )}
            <div className="flex items-center justify-between text-[15px] font-semibold text-gray-900 mb-4">
              <span>Total</span>
              <span className="font-bold"><span className="font-medium">৳</span><span className="font-price">{total.toLocaleString()}</span></span>
            </div>

            <div className="flex gap-3">
              <Link href="/checkout/cart" onClick={closeCart} className="flex-1">
                <button className="w-full border-2 border-[#c3272b] text-[#c3272b] font-semibold text-[13px] py-2.5 rounded-full hover:bg-[#c3272b] hover:text-white transition-colors cursor-pointer">
                  View Cart
                </button>
              </Link>
              <Link href="/checkout" onClick={closeCart} className="flex-1">
                <button className="w-full bg-[#c3272b] text-white font-semibold text-[13px] py-2.5 rounded-full hover:bg-[#a71f22] transition-colors cursor-pointer">
                  Checkout
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

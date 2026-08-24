'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import BundleLineDetails from '@/components/cart/BundleLineDetails'
import CartLineThumb from '@/components/cart/CartLineThumb'
import type { CartItem } from '@/data/cart'

/**
 * Confirmation shown after a bundle is added.
 *
 * Replaces sliding the cart drawer open: the drawer lists the whole cart, which
 * buries what just happened. This states the outcome, shows exactly what went in
 * (products and free gifts), then offers the three onward paths.
 */
export default function BundleAddedModal({ item, onClose }: { item: CartItem | null; onClose: () => void }) {
  useEffect(() => {
    if (!item) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [item, onClose])

  if (!item) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Added to your cart"
      /* z above the body-level SideMenu rail and BackToTop button (both z-[9999])
         and the cart drawer (z-[10001]); the toast at z-[10050] still wins. */
      className="fixed inset-0 z-[10020] flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <span className="flex min-w-0 items-center gap-2 text-[15px] font-bold text-[#0f7a43]">
            <span className="mi shrink-0 text-[20px] leading-none">check_circle</span>
            Added to your cart
          </span>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            <span className="mi text-[20px] leading-none">close</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-[#f5f6fa] p-1">
              <CartLineThumb item={item} size={62} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[13.5px] font-semibold leading-snug text-gray-800">{item.name}</p>
              <BundleLineDetails item={item} />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-[13px] text-gray-500">Bundle price</span>
            <span className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="text-[17px] font-bold text-[#c3272b]">৳{item.price.toLocaleString()}</span>
              {item.priceOld && item.priceOld > item.price ? (
                <span className="text-[12px] text-gray-400 line-through">
                  ৳{item.priceOld.toLocaleString()}
                </span>
              ) : null}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-100 px-5 py-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-11 flex-1 rounded-full border border-gray-300 text-[13px] font-semibold text-gray-700 transition-colors hover:border-gray-400"
            >
              Continue shopping
            </button>
            <Link
              href="/checkout/cart"
              className="flex h-11 flex-1 items-center justify-center rounded-full border border-[#c3272b] text-[13px] font-bold text-[#c3272b] no-underline transition-colors hover:bg-[#fdecec]"
            >
              View cart
            </Link>
          </div>
          <Link
            href="/checkout"
            className="flex h-11 items-center justify-center rounded-full bg-[#c3272b] text-[13px] font-bold uppercase tracking-wide text-white no-underline transition-colors hover:bg-[#a5121c]"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}

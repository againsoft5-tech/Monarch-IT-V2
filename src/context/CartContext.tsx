'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { initialCartItems, type CartItem } from '@/data/cart'
import { useCouponStore } from '@/lib/couponStore'
import {
  bestCouponForCart,
  couponDiscountForCart,
  normalizeCode,
  type Coupon,
} from '@/data/couponData'

const CART_STORAGE_KEY = 'monarchit_cart'

type CouponMessage = { type: 'success' | 'error'; text: string }

type CartContextType = {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  addItems: (newItems: CartItem[]) => void
  itemCount: number
  subtotal: number
  appliedCoupon: string | null
  discount: number
  total: number
  couponMessage: CouponMessage | null
  applyCoupon: (code: string) => void
  /** True when the applied coupon was chosen for the customer, not typed. */
  couponAuto: boolean
  /** Per-line saving, so a cart row can show its own "coupon applied" badge. */
  couponSavingFor: (item: CartItem) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(initialCartItems)
  const [isOpen, setIsOpen] = useState(false)
  /** A code the customer typed. Null means "whatever is best" applies. */
  const [manualCoupon, setManualCoupon] = useState<string | null>(null)
  const [couponMessage, setCouponMessage] = useState<CouponMessage | null>(null)
  const couponDb = useCouponStore()

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {
      // ignore malformed/unavailable storage
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore quota/unavailable storage errors
    }
  }, [items])

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) return
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, qty } : item)))
  }

  const addItems = (newItems: CartItem[]) => {
    setItems((prev) => {
      const next = [...prev]
      for (const newItem of newItems) {
        const idx = next.findIndex((item) => item.id === newItem.id)
        if (idx >= 0) {
          next[idx] = { ...next[idx], qty: next[idx].qty + newItem.qty }
        } else {
          next.push(newItem)
        }
      }
      return next
    })
  }

  const { itemCount, subtotal } = useMemo(
    () => ({
      itemCount: items.reduce((sum, item) => sum + item.qty, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.qty, 0),
    }),
    [items]
  )

  const couponList = useMemo(() => Object.values(couponDb.coupons), [couponDb])
  const lines = useMemo(
    () => items.map((i) => ({ slug: i.slug, price: i.price, qty: i.qty })),
    [items],
  )

  /**
   * The coupon actually in force.
   *
   * Nothing typed → the best-value live coupon applies on its own, which is what
   * makes "add to cart and the discount is already there" work. A typed code only
   * wins if it beats that; otherwise the customer would lose money by entering one.
   */
  const applied = useMemo(() => {
    const auto = bestCouponForCart(couponList, lines)
    if (!manualCoupon) return auto ? { ...auto, manual: false } : undefined

    const typed = couponList.find((c) => c.code === manualCoupon)
    const typedDiscount = typed ? couponDiscountForCart(typed, lines) : 0
    if (typed && typedDiscount > 0 && (!auto || typedDiscount >= auto.discount)) {
      return { coupon: typed, discount: typedDiscount, manual: true }
    }
    return auto ? { ...auto, manual: false } : undefined
  }, [couponList, lines, manualCoupon])

  const appliedCoupon = applied?.coupon.code ?? null
  const discount = Math.min(applied?.discount ?? 0, subtotal)
  const total = subtotal - discount

  /** How much of the discount this line accounts for, for the per-row badge. */
  const couponSavingFor = (item: CartItem) => {
    if (!applied) return 0
    const line = { slug: item.slug, price: item.price, qty: item.qty }
    return couponDiscountForCart(applied.coupon, [line])
  }

  const applyCoupon = (code: string) => {
    const normalized = normalizeCode(code)
    if (!normalized) {
      setManualCoupon(null)
      setCouponMessage({ type: 'error', text: 'Please enter a promo code!' })
      return
    }

    const coupon: Coupon | undefined = couponList.find((c) => c.code === normalized)
    if (!coupon) {
      setManualCoupon(null)
      setCouponMessage({ type: 'error', text: 'Please enter a valid promo code!' })
      return
    }

    const worth = couponDiscountForCart(coupon, lines)
    if (worth <= 0) {
      setManualCoupon(null)
      setCouponMessage({
        type: 'error',
        text: coupon.minOrder
          ? `This code needs a minimum order of ৳${coupon.minOrder.toLocaleString()}.`
          : 'This code does not apply to anything in your cart.',
      })
      return
    }

    setManualCoupon(coupon.code)
    // Say so rather than silently ignoring the code they just typed.
    const better = bestCouponForCart(couponList, lines)
    setCouponMessage(
      better && better.discount > worth
        ? {
            type: 'success',
            text: `${better.coupon.code} saves you more, so it stayed applied.`,
          }
        : { type: 'success', text: 'Promo code applied successfully!' },
    )
  }

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        removeItem,
        updateQty,
        addItems,
        itemCount,
        subtotal,
        appliedCoupon,
        discount,
        total,
        couponMessage,
        applyCoupon,
        couponAuto: applied ? !applied.manual : false,
        couponSavingFor,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

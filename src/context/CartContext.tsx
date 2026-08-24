'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { initialCartItems, type CartItem } from '@/data/cart'
import { useCouponStore } from '@/lib/couponStore'
import {
  couponCoversProduct,
  couponDiscount,
  couponDiscountForCart,
  isCouponLive,
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
  /** True when coupons were chosen for the customer rather than typed. */
  couponAuto: boolean
  /** Every coupon contributing to the discount, with what each is worth. */
  appliedCoupons: { code: string; discount: number }[]
  /** This line's share of the discount, for its "coupon applied" badge. */
  couponSavingFor: (item: CartItem) => number
  /** The coupon covering this line, if any. */
  couponCodeFor: (item: CartItem) => string | null
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
   * Coupons applied per line, so a cart of several products keeps every offer it
   * advertised — the product page promised each one, and losing all but the largest
   * would make those promises false.
   *
   * Each line takes the coupon worth most to it, then a coupon's total is computed
   * over all the lines it won and shared back out. That matters because a coupon's
   * generosity is defined once, not per line: a flat ৳500 code is ৳500 across the
   * cart, and a "10%, max ৳2,000" code caps at ৳2,000 in total, not per product.
   */
  const applied = useMemo(() => {
    const usable = couponList.filter(
      (c) => isCouponLive(c) && (!c.minOrder || subtotal >= c.minOrder),
    )

    // 1. Assign: each line picks the coupon that would save it the most on its own.
    const assignment = new Map<string, Coupon>()
    for (const line of lines) {
      let best: { coupon: Coupon; discount: number } | undefined
      for (const coupon of usable) {
        if (!couponCoversProduct(coupon, line.slug)) continue
        const d = couponDiscount(coupon, line.price * line.qty)
        if (d > 0 && (!best || d > best.discount)) best = { coupon, discount: d }
      }
      if (best) assignment.set(line.slug, best.coupon)
    }

    // 2. Total each coupon over the lines it won, so caps apply once.
    const byCoupon = new Map<string, { coupon: Coupon; lines: typeof lines; total: number }>()
    for (const line of lines) {
      const coupon = assignment.get(line.slug)
      if (!coupon) continue
      const entry = byCoupon.get(coupon.id) ?? { coupon, lines: [], total: 0 }
      entry.lines = [...entry.lines, line]
      byCoupon.set(coupon.id, entry)
    }
    for (const entry of byCoupon.values()) {
      entry.total = couponDiscountForCart(entry.coupon, entry.lines)
    }

    // 3. Share each coupon's total back across its lines, for the per-row badges.
    const perLine = new Map<string, { code: string; amount: number }>()
    for (const entry of byCoupon.values()) {
      const base = entry.lines.reduce((sum, l) => sum + l.price * l.qty, 0)
      let handed = 0
      entry.lines.forEach((line, i) => {
        const isLast = i === entry.lines.length - 1
        // The last line absorbs the rounding remainder so the parts match the total.
        const share = isLast
          ? entry.total - handed
          : Math.round((entry.total * (line.price * line.qty)) / (base || 1))
        handed += share
        perLine.set(line.slug, { code: entry.coupon.code, amount: share })
      })
    }

    const coupons = [...byCoupon.values()]
      .filter((e) => e.total > 0)
      .map((e) => ({ code: e.coupon.code, discount: e.total }))
      .sort((a, b) => b.discount - a.discount)

    return {
      perLine,
      coupons,
      total: coupons.reduce((sum, c) => sum + c.discount, 0),
    }
  }, [couponList, lines, subtotal])

  const appliedCoupons = applied.coupons
  const appliedCoupon = appliedCoupons[0]?.code ?? null
  const discount = Math.min(applied.total, subtotal)
  const total = subtotal - discount

  const couponSavingFor = (item: CartItem) => applied.perLine.get(item.slug)?.amount ?? 0
  const couponCodeFor = (item: CartItem) => applied.perLine.get(item.slug)?.code ?? null

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
        text: coupon.minOrder && subtotal < coupon.minOrder
          ? `This code needs a minimum order of ৳${coupon.minOrder.toLocaleString()}.`
          : 'This code does not apply to anything in your cart.',
      })
      return
    }

    setManualCoupon(coupon.code)
    // Every live coupon is already applied where it fits, so a typed code is a
    // confirmation rather than a change. Saying so beats a silent no-op.
    const already = appliedCoupons.some((c) => c.code === coupon.code)
    setCouponMessage({
      type: 'success',
      text: already
        ? `${coupon.code} is already applied to your cart.`
        : 'Promo code applied successfully!',
    })
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
        couponAuto: !manualCoupon && appliedCoupons.length > 0,
        appliedCoupons,
        couponSavingFor,
        couponCodeFor,
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

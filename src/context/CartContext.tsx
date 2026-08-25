'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { initialCartItems, type CartItem } from '@/data/cart'
import { useCouponStore } from '@/lib/couponStore'
import {
  couponConditionText,
  couponCoversProduct,
  couponDiscount,
  couponDiscountForCart,
  isCouponLive,
  normalizeCode,
  priceRangeQualifies,
  type Coupon,
} from '@/data/couponData'

const CART_STORAGE_KEY = 'monarchit_cart'
/** The code the customer typed. Kept beside the cart so a reload does not undo it. */
const COUPON_STORAGE_KEY = 'monarchit_cart_coupon'

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
  /** The code the customer typed, if any — the only one they can take back off. */
  manualCode: string | null
  /** Drops a code the customer entered, so an applied offer is never stuck. */
  clearCoupon: () => void
  /** The coupon covering this line, if any. */
  couponCodeFor: (item: CartItem) => string | null
  /** Which kind covers this line — a pooled code shows no per-row figure. */
  couponKindFor: (item: CartItem) => 'product' | 'price-range' | null
  /**
   * The one price-range code this cart qualifies for. Only ever one: with several
   * matching, offering the smaller of them would quietly short-change the customer.
   */
  promoOffer: { code: string; text: string; discount: number } | null
  /** The next band up, so the customer can see what a little more would unlock. */
  promoNext: { code: string; text: string; needed: number } | null
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
      const code = localStorage.getItem(COUPON_STORAGE_KEY)
      if (code) setManualCoupon(code)
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

  useEffect(() => {
    try {
      if (manualCoupon) localStorage.setItem(COUPON_STORAGE_KEY, manualCoupon)
      else localStorage.removeItem(COUPON_STORAGE_KEY)
    } catch {
      // ignore quota/unavailable storage errors
    }
  }, [manualCoupon])

  // An emptied cart ends the code with it: the next basket is a fresh decision.
  useEffect(() => {
    if (items.length === 0 && manualCoupon) {
      setManualCoupon(null)
      setCouponMessage(null)
    }
  }, [items.length, manualCoupon])

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

    // 1. Assign: each line picks the product coupon that would save it the most.
    const assignment = new Map<string, Coupon>()
    for (const line of lines) {
      let best: { coupon: Coupon; discount: number } | undefined
      for (const coupon of usable) {
        if (!couponCoversProduct(coupon, line.slug)) continue
        const d = couponDiscount(coupon, line.price * line.qty, line.qty)
        if (d > 0 && (!best || d > best.discount)) best = { coupon, discount: d }
      }
      if (best) assignment.set(line.slug, best.coupon)
    }

    /*
     * A price-range code fills the gaps. It is never automatic — the customer has to
     * enter it — and it only reaches lines carrying no offer of their own, so it tops
     * up the cart rather than competing with the coupons already on it.
     */
    const typed = manualCoupon
      ? usable.find((c) => c.code === manualCoupon && c.kind === 'price-range')
      : undefined
    if (typed) {
      const open = lines.filter((l) => !assignment.has(l.slug))
      const pooled = open.reduce((sum, l) => sum + l.price * l.qty, 0)
      if (priceRangeQualifies(typed, pooled)) {
        for (const line of open) assignment.set(line.slug, typed)
      }
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
    const perLine = new Map<string, { code: string; amount: number; kind: Coupon['kind'] }>()
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
        perLine.set(line.slug, { code: entry.coupon.code, amount: share, kind: entry.coupon.kind })
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
  }, [couponList, lines, subtotal, manualCoupon])

  const appliedCoupons = applied.coupons
  const appliedCoupon = appliedCoupons[0]?.code ?? null
  const discount = Math.min(applied.total, subtotal)
  const total = subtotal - discount

  /**
   * Pool = everything with no offer of its own. Bands are matched against that total.
   *
   * If the admin's bands overlap, several can match at once; the biggest saving wins
   * rather than the highest band, because showing a smaller discount when a larger one
   * applies is a real loss to the customer, while band order is only a preference.
   */
  const { promoOffer, promoNext } = useMemo(() => {
    const live = couponList.filter(
      (c) => c.kind === 'price-range' && isCouponLive(c) && (!c.minOrder || subtotal >= c.minOrder),
    )
    const pooled = lines
      .filter((l) => !applied.perLine.has(l.slug) || applied.perLine.get(l.slug)?.code === manualCoupon)
      .reduce((sum, l) => sum + l.price * l.qty, 0)

    const matching = live
      .filter((c) => priceRangeQualifies(c, pooled))
      .map((c) => ({ coupon: c, discount: couponDiscount(c, pooled, 1) }))
      .sort((a, b) => b.discount - a.discount)

    const winner = matching[0]
    const offer =
      winner && winner.coupon.code !== manualCoupon
        ? {
            code: winner.coupon.code,
            text: couponConditionText(winner.coupon),
            discount: winner.discount,
          }
        : null

    // The cheapest band the cart has not reached yet.
    const upcoming = live
      .filter((c) => (c.minLineTotal ?? 0) > pooled)
      .sort((a, b) => (a.minLineTotal ?? 0) - (b.minLineTotal ?? 0))[0]
    const next = upcoming
      ? {
          code: upcoming.code,
          text: couponConditionText(upcoming),
          needed: (upcoming.minLineTotal ?? 0) - pooled,
        }
      : null

    return { promoOffer: offer, promoNext: next }
  }, [couponList, lines, subtotal, applied, manualCoupon])

  const clearCoupon = () => {
    setManualCoupon(null)
    setCouponMessage(null)
  }

  const couponSavingFor = (item: CartItem) => applied.perLine.get(item.slug)?.amount ?? 0
  const couponCodeFor = (item: CartItem) => applied.perLine.get(item.slug)?.code ?? null
  const couponKindFor = (item: CartItem) => applied.perLine.get(item.slug)?.kind ?? null

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

    if (!isCouponLive(coupon)) {
      setManualCoupon(null)
      setCouponMessage({ type: 'error', text: 'This promo code is no longer available.' })
      return
    }

    if (coupon.minOrder && subtotal < coupon.minOrder) {
      setManualCoupon(null)
      setCouponMessage({
        type: 'error',
        text: `This code needs a minimum order of ৳${coupon.minOrder.toLocaleString()}.`,
      })
      return
    }

    if (coupon.kind === 'price-range') {
      // Everything with no offer of its own, pooled — the threshold is on the total.
      const open = lines.filter(
        (l) => !applied.perLine.has(l.slug) || applied.perLine.get(l.slug)?.code === coupon.code,
      )
      const pooled = open.reduce((sum, l) => sum + l.price * l.qty, 0)
      if (!priceRangeQualifies(coupon, pooled)) {
        setManualCoupon(null)
        setCouponMessage({
          type: 'error',
          text: coupon.minLineTotal
            ? `Your items without an offer come to ৳${pooled.toLocaleString()} — this code needs ৳${coupon.minLineTotal.toLocaleString()}.`
            : 'This code does not apply to anything in your cart.',
        })
        return
      }
      setManualCoupon(coupon.code)
      setCouponMessage({ type: 'success', text: 'Promo code applied successfully!' })
      return
    }

    // Product coupons apply on their own, so typing one is a confirmation at most.
    const worth = couponDiscountForCart(coupon, lines)
    if (worth <= 0) {
      setManualCoupon(null)
      setCouponMessage({
        type: 'error',
        text: 'This code does not apply to anything in your cart.',
      })
      return
    }
    setManualCoupon(coupon.code)
    setCouponMessage({
      type: 'success',
      text: appliedCoupons.some((c) => c.code === coupon.code)
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
        couponKindFor,
        promoOffer,
        promoNext,
        manualCode: manualCoupon,
        clearCoupon,
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

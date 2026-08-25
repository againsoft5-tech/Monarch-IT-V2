import { categoryProductsMap } from '@/data/categoryProducts'
import { getBrandProducts, brandList } from '@/data/brandIndex'

/**
 * Coupon codes that can attach themselves to products.
 *
 * The old `coupons.ts` list was three hardcoded codes the customer had to type at
 * checkout. These are admin-authored, scoped to what they apply to, and advertised on
 * the product itself so the discount is visible before the cart.
 */
export type CouponDiscountType = 'percent' | 'flat'

/**
 * Two ways a coupon decides what it covers.
 *
 * - `product`     — scoped to categories / brands / products. Applied automatically
 *                   and advertised on the product itself.
 * - `price-range` — a general promo code with no product list: it covers whatever the
 *                   customer is buying that has no offer of its own and reaches a
 *                   spend threshold. Never advertised, and only applies once entered.
 */
export type CouponKind = 'product' | 'price-range'

export type Coupon = {
  id: string
  kind: CouponKind
  /** What the customer types — stored uppercase, matched case-insensitively. */
  code: string
  /** Optional strapline shown beside the offer, e.g. "Limited Offer". */
  label?: string
  type: CouponDiscountType
  value: number
  /** Ceiling for a percent coupon, so "20% off" cannot give away a monitor. */
  maxDiscount?: number
  /** Cart subtotal the coupon needs before it applies. */
  minOrder?: number
  /** ISO dates; empty means no bound on that side. */
  startsAt?: string
  endsAt?: string
  /** Total redemptions allowed across all customers. */
  usageLimit?: number
  used: number
  active: boolean
  /**
   * Site-wide scope, stated outright.
   *
   * Deliberately explicit: an empty scope used to mean "everything", so a coupon saved
   * before its products were picked quietly discounted the entire catalog. Blanket
   * coverage now has to be asked for.
   */
  appliesToAll?: boolean
  /**
   * Scope. A product matching ANY of them is covered, so a coupon can span a category
   * plus a few extras. All empty (and not `appliesToAll`) covers nothing.
   */
  categorySlugs: string[]
  brandSlugs: string[]
  productSlugs: string[]
  /**
   * `price-range` only: the line total (unit price × quantity) a product must reach
   * before this code touches it. Quantity counts, so two ৳300 items qualify at ৳600.
   */
  minLineTotal?: number
  maxLineTotal?: number
  createdAt: string
  updatedAt: string
}

export type CouponDB = { coupons: Record<string, Coupon> }

/** A product as the matcher needs to see it. */
export type CouponProduct = { slug: string; priceNew: number }

/** One cart row, for the rules that care about quantity. */
export type CouponCartLine = { slug: string; price: number; qty: number }

/* ------------------------------------------------------------------ lookups */

let slugToCategories: Map<string, string[]> | null = null
let slugToBrands: Map<string, string[]> | null = null

/** slug → the category keys it appears under. Built once; the catalog is static. */
function categoryIndex(): Map<string, string[]> {
  if (slugToCategories) return slugToCategories
  const map = new Map<string, string[]>()
  for (const [categorySlug, catalog] of Object.entries(categoryProductsMap)) {
    for (const product of catalog?.products ?? []) {
      const list = map.get(product.slug) ?? []
      list.push(categorySlug)
      map.set(product.slug, list)
    }
  }
  slugToCategories = map
  return map
}

/** slug → the brand slugs it belongs to. */
function brandIndex(): Map<string, string[]> {
  if (slugToBrands) return slugToBrands
  const map = new Map<string, string[]>()
  for (const brand of brandList) {
    for (const product of getBrandProducts(brand.slug)) {
      const list = map.get(product.slug) ?? []
      list.push(brand.slug)
      map.set(product.slug, list)
    }
  }
  slugToBrands = map
  return map
}

/* ------------------------------------------------------------- eligibility */

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase()
}

/** Live right now: enabled, inside its date window, and not used up. */
export function isCouponLive(coupon: Coupon, now = Date.now()): boolean {
  if (!coupon.active || !coupon.code) return false
  if (coupon.startsAt && now < Date.parse(coupon.startsAt)) return false
  // The end date is inclusive of that whole day.
  if (coupon.endsAt && now > Date.parse(coupon.endsAt) + 86_399_000) return false
  if (coupon.usageLimit && coupon.used >= coupon.usageLimit) return false
  return true
}

/** Whether a product-scoped coupon covers this product. Price-range codes never do. */
export function couponCoversProduct(coupon: Coupon, slug: string): boolean {
  if (coupon.kind !== 'product') return false
  if (coupon.appliesToAll) return true
  // Nothing chosen means nothing covered — see `appliesToAll`.
  if (coupon.productSlugs.includes(slug)) return true
  if (coupon.categorySlugs.some((c) => categoryIndex().get(slug)?.includes(c))) return true
  return coupon.brandSlugs.some((b) => brandIndex().get(slug)?.includes(b))
}

/**
 * Whether a price-range code's pooled total falls in its range.
 *
 * The threshold is tested against the *combined* total of everything with no offer of
 * its own, and the discount then applies once to that pool. Testing each line
 * separately would hand out the coupon several times over in one cart.
 */
export function priceRangeQualifies(coupon: Coupon, pooledTotal: number): boolean {
  if (coupon.kind !== 'price-range' || pooledTotal <= 0) return false
  if (coupon.minLineTotal && pooledTotal < coupon.minLineTotal) return false
  if (coupon.maxLineTotal && pooledTotal > coupon.maxLineTotal) return false
  return true
}

/**
 * Money off a set of covered items.
 *
 * A flat coupon is per unit, so buying two of something doubles the saving — that is
 * how a "৳50 off" sticker on a product reads. A percent coupon scales by nature.
 * `maxDiscount` then caps the coupon's whole contribution, once.
 */
export function couponDiscount(coupon: Coupon, amount: number, units = 1): number {
  if (amount <= 0) return 0
  const raw = coupon.type === 'percent' ? (amount * coupon.value) / 100 : coupon.value * units
  const capped = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw
  return Math.max(0, Math.min(Math.round(capped), amount))
}

/**
 * The best coupon to advertise on a product.
 *
 * "Best" is simply the largest saving — with several live coupons on one product,
 * showing anything less would be quietly short-changing the customer.
 * `minOrder` is deliberately ignored here: it is a cart rule, and a product card has
 * no cart to test it against.
 */
export function bestCouponForProduct(
  coupons: Coupon[],
  product: CouponProduct,
  now = Date.now(),
): { coupon: Coupon; discount: number } | undefined {
  let best: { coupon: Coupon; discount: number } | undefined
  for (const coupon of coupons) {
    if (coupon.kind !== 'product') continue // price-range codes are never advertised
    if (!isCouponLive(coupon, now)) continue
    if (!couponCoversProduct(coupon, product.slug)) continue
    const discount = couponDiscount(coupon, product.priceNew)
    if (discount <= 0) continue
    if (!best || discount > best.discount) best = { coupon, discount }
  }
  return best
}

/**
 * The best coupon that is *certain* to apply to this product on its own.
 *
 * A `minOrder` coupon only bites once the cart subtotal reaches it, so it cannot be
 * folded into a listed price — unless the product alone already clears the minimum,
 * in which case any cart holding it qualifies. Anything conditional stays an advert
 * (the badge) rather than a price, so the number shown is always the number charged.
 */
export function guaranteedCouponForProduct(
  coupons: Coupon[],
  product: CouponProduct,
  now = Date.now(),
): { coupon: Coupon; discount: number } | undefined {
  const certain = coupons.filter((c) => !c.minOrder || product.priceNew >= c.minOrder)
  return bestCouponForProduct(certain, product, now)
}

/** Listed price after any guaranteed coupon — the number filters and sorts must use. */
export function effectivePrice(coupons: Coupon[], product: CouponProduct, now = Date.now()): number {
  const hit = guaranteedCouponForProduct(coupons, product, now)
  return hit ? Math.max(0, product.priceNew - hit.discount) : product.priceNew
}

/**
 * What a coupon takes off a cart.
 *
 * Only the lines the coupon actually covers count toward the discount, so a
 * monitor-only code cannot discount a keyboard sitting beside it. `minOrder` is
 * tested against the whole subtotal, which is how customers read it.
 */
export function couponDiscountForCart(
  coupon: Coupon,
  lines: CouponCartLine[],
  now = Date.now(),
): number {
  if (!isCouponLive(coupon, now)) return 0
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0)
  if (coupon.minOrder && subtotal < coupon.minOrder) return 0
  if (coupon.kind === 'price-range') {
    // One pool, one discount — never per line, and never multiplied by quantity.
    const pooled = lines.reduce((sum, l) => sum + l.price * l.qty, 0)
    return priceRangeQualifies(coupon, pooled) ? couponDiscount(coupon, pooled, 1) : 0
  }
  const eligible = lines.filter((l) => couponCoversProduct(coupon, l.slug))
  const amount = eligible.reduce((sum, l) => sum + l.price * l.qty, 0)
  const units = eligible.reduce((sum, l) => sum + l.qty, 0)
  return couponDiscount(coupon, amount, units)
}

/** The single best-value coupon for a cart — one coupon applies, never several. */
export function bestCouponForCart(
  coupons: Coupon[],
  lines: CouponCartLine[],
  now = Date.now(),
): { coupon: Coupon; discount: number } | undefined {
  let best: { coupon: Coupon; discount: number } | undefined
  for (const coupon of coupons) {
    const discount = couponDiscountForCart(coupon, lines, now)
    if (discount <= 0) continue
    if (!best || discount > best.discount) best = { coupon, discount }
  }
  return best
}

/**
 * Plain-language condition for a price-range code, for the note beside the promo box.
 *
 * These never apply on their own, so the customer has to be told what unlocks them —
 * otherwise the code is a secret.
 */
export function couponConditionText(coupon: Coupon): string {
  const off = coupon.type === 'percent'
    ? `${coupon.value}% off`
    : `৳${coupon.value.toLocaleString()} off`
  const range = coupon.minLineTotal
    ? coupon.maxLineTotal
      ? `৳${coupon.minLineTotal.toLocaleString()}–৳${coupon.maxLineTotal.toLocaleString()}`
      : `৳${coupon.minLineTotal.toLocaleString()} or more`
    : 'any amount'
  const min = coupon.minOrder ? `, on orders over ৳${coupon.minOrder.toLocaleString()}` : ''
  return `${off} when your items without an offer total ${range}${min}`
}

/** Short human label for the offer, e.g. "৳20 OFF" or "10% OFF". */
export function couponOfferLabel(coupon: Coupon, discount?: number): string {
  if (typeof discount === 'number' && discount > 0) return `৳${discount.toLocaleString()} OFF`
  return coupon.type === 'percent' ? `${coupon.value}% OFF` : `৳${coupon.value.toLocaleString()} OFF`
}

/** Fills every missing field so readers can rely on the shape. */
export function ensureCoupon(raw: Partial<Coupon> | null | undefined, id: string): Coupon {
  const c = raw ?? {}
  return {
    id: c.id || id,
    kind: c.kind === 'price-range' ? 'price-range' : 'product',
    code: normalizeCode(c.code ?? ''),
    label: c.label || undefined,
    type: c.type === 'percent' ? 'percent' : 'flat',
    value: Number(c.value) || 0,
    maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : undefined,
    minOrder: c.minOrder ? Number(c.minOrder) : undefined,
    startsAt: c.startsAt || undefined,
    endsAt: c.endsAt || undefined,
    usageLimit: c.usageLimit ? Number(c.usageLimit) : undefined,
    used: Number(c.used) || 0,
    active: c.active !== false,
    appliesToAll: c.appliesToAll === true,
    categorySlugs: Array.isArray(c.categorySlugs) ? c.categorySlugs : [],
    brandSlugs: Array.isArray(c.brandSlugs) ? c.brandSlugs : [],
    productSlugs: Array.isArray(c.productSlugs) ? c.productSlugs : [],
    minLineTotal: c.minLineTotal ? Number(c.minLineTotal) : undefined,
    maxLineTotal: c.maxLineTotal ? Number(c.maxLineTotal) : undefined,
    createdAt: c.createdAt || COUPON_SEED_DATE,
    updatedAt: c.updatedAt || COUPON_SEED_DATE,
  }
}

/* ------------------------------------------------------------------- seeds */

/** Fixed so server and client render the same value, and marks an untouched seed. */
export const COUPON_SEED_DATE = '2026-01-01T00:00:00.000Z'

function seed(input: Partial<Coupon> & Pick<Coupon, 'id' | 'code' | 'type' | 'value'>): Coupon {
  return {
    kind: 'product',
    appliesToAll: false,
    label: undefined,
    maxDiscount: undefined,
    minOrder: undefined,
    startsAt: undefined,
    endsAt: undefined,
    usageLimit: undefined,
    used: 0,
    active: true,
    categorySlugs: [],
    brandSlugs: [],
    productSlugs: [],
    createdAt: COUPON_SEED_DATE,
    updatedAt: COUPON_SEED_DATE,
    ...input,
    code: normalizeCode(input.code),
  }
}

export const DEFAULT_COUPON_DB: CouponDB = {
  // Normalised like a stored record: an editor seeded from this constant must match
  // exactly what the API hands back, or it opens permanently unsaved.
  //
  // Each seed covers five hand-picked products rather than the whole catalog: a coupon
  // on everything makes the badge meaningless and gives the Coupons tab nothing to
  // narrow. The three sets are chosen by price band so each code suits what it covers,
  // and they never overlap — 15 distinct products carry an offer.
  coupons: Object.fromEntries(
    [
      seed({
        id: 'bts22',
        code: 'BTS22',
        type: 'flat',
        value: 50,
        label: 'Limited Offer',
        // Low-cost accessories, where ৳50 is a real saving.
        productSlugs: [
          'onikuma-gt889-over-ear-gaming-headphone',
          'T-wolf-s4-desktop-speaker',
          'arctic-w1-3d-single-monitor-arm',
          'onikuma-x37-wired-headphone',
          'k600-80plus-600w-power-supply',
        ],
      }),
      seed({
        id: 'save10',
        code: 'SAVE10',
        type: 'percent',
        value: 10,
        maxDiscount: 2000,
        minOrder: 5000,
        // Mid-range gear, all above the ৳5,000 minimum on their own.
        productSlugs: [
          'onikuma-mt707-keyboard',
          'onikuma-g83-keyboard',
          'royalkludge-rk-mg5-wireless-mouse',
          'RK-L98-mechanical-cream-keyboard',
          'oscoo-on901-256gb-ssd',
        ],
      }),
      seed({
        id: 'auto5',
        kind: 'price-range',
        code: 'SAVE5',
        type: 'percent',
        value: 5,
        label: 'Spend ৳500+',
        // Any item without an offer of its own, once that line reaches ৳500.
        minLineTotal: 500,
      }),
      seed({
        id: 'save500',
        code: 'SAVE500',
        type: 'flat',
        value: 500,
        minOrder: 10000,
        // Big-ticket items spread across categories, so the badge shows up site-wide.
        productSlugs: [
          'haier-1-6-ton-cleancool-ac',
          'manli-polar-fox-geforce--rtx-5080-oc-graphics-card',
          'sony-playstation-portal-remote-player',
          'koorui-g2421v-24-inch-qhd-180hz-gaming-monitor',
          'marsriva-mr-uf3000-3000va-smart-line-interactive-ups',
        ],
      }),
    ].map((c) => [c.id, ensureCoupon(c, c.id)]),
  ),
}


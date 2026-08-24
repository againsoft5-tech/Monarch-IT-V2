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

export type Coupon = {
  id: string
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
   * Scope. All three empty means "every product" — otherwise the coupon applies to a
   * product matching ANY of them, so a coupon can cover a category plus a few extras.
   */
  categorySlugs: string[]
  brandSlugs: string[]
  productSlugs: string[]
  createdAt: string
  updatedAt: string
}

export type CouponDB = { coupons: Record<string, Coupon> }

/** A product as the matcher needs to see it. */
export type CouponProduct = { slug: string; priceNew: number }

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

/** Whether the coupon covers this product at all. */
export function couponCoversProduct(coupon: Coupon, slug: string): boolean {
  const scoped =
    coupon.categorySlugs.length > 0 || coupon.brandSlugs.length > 0 || coupon.productSlugs.length > 0
  if (!scoped) return true
  if (coupon.productSlugs.includes(slug)) return true
  if (coupon.categorySlugs.some((c) => categoryIndex().get(slug)?.includes(c))) return true
  return coupon.brandSlugs.some((b) => brandIndex().get(slug)?.includes(b))
}

/** Money off a given amount, respecting the percent ceiling. */
export function couponDiscount(coupon: Coupon, amount: number): number {
  if (amount <= 0) return 0
  const raw = coupon.type === 'percent' ? (amount * coupon.value) / 100 : coupon.value
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
    if (!isCouponLive(coupon, now)) continue
    if (!couponCoversProduct(coupon, product.slug)) continue
    const discount = couponDiscount(coupon, product.priceNew)
    if (discount <= 0) continue
    if (!best || discount > best.discount) best = { coupon, discount }
  }
  return best
}

export type CouponCartLine = { slug: string; price: number; qty: number }

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
  const eligible = lines
    .filter((l) => couponCoversProduct(coupon, l.slug))
    .reduce((sum, l) => sum + l.price * l.qty, 0)
  return couponDiscount(coupon, eligible)
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
    categorySlugs: Array.isArray(c.categorySlugs) ? c.categorySlugs : [],
    brandSlugs: Array.isArray(c.brandSlugs) ? c.brandSlugs : [],
    productSlugs: Array.isArray(c.productSlugs) ? c.productSlugs : [],
    createdAt: c.createdAt || COUPON_SEED_DATE,
    updatedAt: c.updatedAt || COUPON_SEED_DATE,
  }
}

/* ------------------------------------------------------------------- seeds */

/** Fixed so server and client render the same value, and marks an untouched seed. */
export const COUPON_SEED_DATE = '2026-01-01T00:00:00.000Z'

function seed(input: Partial<Coupon> & Pick<Coupon, 'id' | 'code' | 'type' | 'value'>): Coupon {
  return {
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


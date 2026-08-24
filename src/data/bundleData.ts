/**
 * Bundles module — data contract.
 *
 * Deliberately separate from the older Combo module (`comboData.ts`): combo tiers key off
 * how many *groups* a customer picked, whereas bundles key off how many *products* were
 * picked (2/3/4) and can carry a free gift per tier. Keeping them apart avoids breaking
 * the live combo campaigns.
 */

import { categoryProductsMap } from './categoryProducts'

export type BundleDiscountType = 'percent' | 'fixed'

/** Smallest and largest number of products a bundle may contain / a customer may pick. */
/** Nobody should be handing out more than this many gifts on one tier. */
export const MAX_GIFT_PICKS = 4

export const MIN_BUNDLE_PRODUCTS = 2
export const MAX_BUNDLE_PRODUCTS = 4
/** The product counts a tier can be defined for. */
export const BUNDLE_TIER_COUNTS = [2, 3, 4] as const
export type BundleTierCount = (typeof BUNDLE_TIER_COUNTS)[number]

/** A catalog product snapshot held inside a bundle. */
export type BundleProduct = {
  /** Stable id within the bundle. */
  id: string
  /** Catalog slug — the storefront product page and cart line link. */
  slug: string
  name: string
  image: string
  /** Regular (pre-discount) price. */
  priceOld: number
  /** Selling price before any bundle-tier discount. */
  priceNew: number
}

/** Shape of a product inside a pre-list stored gift; see `normalizeGifts`. */
type LegacyGiftProduct = { slug: string; name: string; image: string }

/**
 * One entry in a tier's free-gift list.
 *
 * A tier holds a *list* so an admin can mix catalog products and custom
 * text+image gifts in the same offer:
 * - `product` — a real store product, carrying its slug so it can link out
 * - `text`    — a custom gift such as "Free T-Shirt", with an optional image
 *
 * A lone gift is granted automatically; more than one means the customer picks.
 */
export type BundleGiftItem = {
  id: string
  kind: 'product' | 'text'
  /** Catalog slug — product gifts only. */
  slug?: string
  /** Product name, or the custom gift text. */
  name: string
  image?: string
}

/** Discount + free-gift list unlocked at an exact selected-product count. */
export type BundleTier = {
  count: BundleTierCount
  discountType: BundleDiscountType
  discountValue: number
  gifts: BundleGiftItem[]
  /**
   * How many gifts from the list the customer may keep. Defaults to 1, so a tier
   * that never sets it behaves like a plain "pick one" offer.
   */
  giftLimit?: number
}

/** Admin-authored fixed bundle shown on "Shop Your Bundles". */
export type ReadyBundle = {
  id: string
  name: string
  description?: string
  /** Optional cover art; falls back to a collage of the product images. */
  image?: string
  active: boolean
  /** Between MIN_BUNDLE_PRODUCTS and MAX_BUNDLE_PRODUCTS entries. */
  products: BundleProduct[]
  tiers: BundleTier[]
  createdAt: string
  updatedAt: string
}

/** One selectable tab inside a custom bundle (e.g. Processor, RAM). */
export type CustomBundleTab = {
  key: string
  label: string
  products: BundleProduct[]
}

/** Admin-authored "Build Your Own Bundle" instance. */
export type CustomBundle = {
  id: string
  name: string
  description?: string
  active: boolean
  tabs: CustomBundleTab[]
  tiers: BundleTier[]
  createdAt: string
  updatedAt: string
}

export type BundleDB = {
  ready: Record<string, ReadyBundle>
  custom: Record<string, CustomBundle>
}

/** Ids only have to be unique inside one tier's gift list. */
export function newGiftId(): string {
  return `gift-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Reads a tier's gift list, upgrading the pre-list shape on the way.
 *
 * Bundles are persisted in the visitor's own localStorage, so records written by
 * an older build (a single `gift` object) are still out there and have to keep
 * working — a stored `{ kind: 'choice', products: [...] }` becomes one gift item
 * per product, which is exactly what it always meant.
 */
export function normalizeGifts(raw: unknown): BundleGiftItem[] {
  if (Array.isArray(raw)) {
    return raw
      .filter((g): g is BundleGiftItem => Boolean(g) && typeof (g as BundleGiftItem).name === 'string')
      .map((g) => ({
        id: g.id || newGiftId(),
        kind: g.kind === 'product' ? ('product' as const) : ('text' as const),
        slug: g.slug,
        name: g.name,
        image: g.image,
      }))
  }

  const legacy = raw as {
    kind?: string
    name?: string
    image?: string
    slug?: string
    text?: string
    products?: LegacyGiftProduct[]
  } | null

  if (!legacy || !legacy.kind || legacy.kind === 'none') return []
  if (legacy.kind === 'text') {
    return legacy.text ? [{ id: newGiftId(), kind: 'text', name: legacy.text }] : []
  }
  if (legacy.kind === 'product') {
    return legacy.slug
      ? [{ id: newGiftId(), kind: 'product', slug: legacy.slug, name: legacy.name ?? '', image: legacy.image }]
      : []
  }
  return (legacy.products ?? []).map((g) => ({
    id: newGiftId(),
    kind: 'product' as const,
    slug: g.slug,
    name: g.name,
    image: g.image,
  }))
}

/** Applies `normalizeGifts` across a whole tier table. */
export function normalizeTiers(tiers: unknown): BundleTier[] {
  if (!Array.isArray(tiers)) return defaultTiers()
  return tiers.map((t) => {
    // Deliberately loose: `t` may be a record written by an older build, which
    // carried a single `gift` object where the current shape has `gifts`.
    const tier = t as Partial<BundleTier> & { gift?: unknown }
    return {
      count: tier.count as BundleTierCount,
      discountType: (tier.discountType ?? 'fixed') as BundleDiscountType,
      discountValue: tier.discountValue ?? 0,
      gifts: normalizeGifts(tier.gifts ?? tier.gift),
      giftLimit: clampGiftLimit(tier.giftLimit),
    }
  })
}

/** Keeps a stored/edited limit inside 1..MAX_GIFT_PICKS. */
export function clampGiftLimit(value: unknown): number {
  const n = Math.round(Number(value))
  if (!Number.isFinite(n)) return 1
  return Math.max(1, Math.min(MAX_GIFT_PICKS, n))
}

/**
 * How many gifts the customer actually gets to keep.
 *
 * Capped by the pool: promising 3 picks from a 2-gift list would render a slot
 * that can never be filled.
 */
export function giftPickLimit(gifts: BundleGiftItem[], giftLimit?: number): number {
  return Math.min(clampGiftLimit(giftLimit), gifts.length)
}

/** A blank tier set covering every supported product count. */
export function defaultTiers(): BundleTier[] {
  return BUNDLE_TIER_COUNTS.map((count) => ({
    count,
    discountType: 'fixed' as BundleDiscountType,
    discountValue: 0,
    gifts: [],
    giftLimit: 1,
  }))
}

/** The tier matching an exact product count, if the admin configured one. */
export function tierForCount(tiers: BundleTier[], count: number): BundleTier | undefined {
  return tiers.find((t) => t.count === count)
}

export type BundlePricing = {
  /** Sum of regular prices — what the items cost outside the bundle. */
  regularTotal: number
  /** Sum of selling prices before the tier discount. */
  subtotal: number
  /** Money saved by product-level pricing alone. */
  productDiscount: number
  /** Money saved by the bundle tier. */
  tierDiscount: number
  /** Final payable amount. */
  total: number
  /** Tier that applied, if any. */
  tier?: BundleTier
  /** Gifts unlocked by the applied tier — empty when the tier offers none. */
  gifts: BundleGiftItem[]
  /** How many of those gifts the customer keeps. */
  giftLimit: number
}

/**
 * Prices a set of chosen products against the tier table.
 *
 * The tier is matched on the *exact* product count, so a 3-product tier does not leak
 * into a 2-product selection. Counts outside the configured tiers simply get no bonus.
 */
export function computeBundlePricing(products: BundleProduct[], tiers: BundleTier[]): BundlePricing {
  const regularTotal = products.reduce((sum, p) => sum + p.priceOld, 0)
  const subtotal = products.reduce((sum, p) => sum + p.priceNew, 0)
  const tier = tierForCount(tiers, products.length)

  let tierDiscount = 0
  if (tier && subtotal > 0) {
    tierDiscount =
      tier.discountType === 'percent'
        ? Math.round((subtotal * tier.discountValue) / 100)
        : Math.round(tier.discountValue)
    tierDiscount = Math.max(0, Math.min(tierDiscount, subtotal))
  }

  return {
    regularTotal,
    subtotal,
    productDiscount: Math.max(0, regularTotal - subtotal),
    tierDiscount,
    total: Math.max(0, subtotal - tierDiscount),
    tier,
    gifts: tier?.gifts ?? [],
    giftLimit: giftPickLimit(tier?.gifts ?? [], tier?.giftLimit),
  }
}

/**
 * The gifts a bundle line actually carries.
 *
 * When the list is no longer than the allowance every gift is simply granted —
 * there is nothing to choose between, so the customer never has to ask. Once the
 * list is longer their picks decide, falling back to the first few so a bundle is
 * never added to the cart with an empty gift slot.
 */
export function resolveGifts(
  gifts: BundleGiftItem[],
  chosenIds: string[] = [],
  giftLimit?: number,
): BundleGiftItem[] {
  const limit = giftPickLimit(gifts, giftLimit)
  if (limit === 0) return []
  if (gifts.length <= limit) return gifts

  const picked = chosenIds
    .map((id) => gifts.find((g) => g.id === id))
    .filter((g): g is BundleGiftItem => Boolean(g))
    .slice(0, limit)

  if (picked.length === limit) return picked
  // Top up from the front, skipping anything already picked.
  const rest = gifts.filter((g) => !picked.some((x) => x.id === g.id))
  return [...picked, ...rest].slice(0, limit)
}

/** Whether the tier hands out every gift it lists, with nothing to choose. */
export function giftsAreAutomatic(gifts: BundleGiftItem[], giftLimit?: number): boolean {
  return gifts.length > 0 && gifts.length <= giftPickLimit(gifts, giftLimit)
}

/* ------------------------------------------------------------------ seeds */

/**
 * Fixed so server and client render the same value — `new Date()` would not.
 * Also acts as an "untouched" marker: any admin edit stamps a fresh `updatedAt`,
 * so a seed still carrying this date has never been changed and is safe to refresh.
 */
export const SEED_DATE = '2026-01-01T00:00:00.000Z'

/** Resolves a catalog slug into a bundle product so seeds never carry stale prices. */
function seedProduct(slug: string): BundleProduct | undefined {
  for (const catalog of Object.values(categoryProductsMap)) {
    const found = (catalog?.products ?? []).find((p) => p.slug === slug)
    if (!found) continue
    return {
      id: `seed-${slug}`,
      slug,
      name: found.name,
      image: found.image,
      priceOld: found.priceOld || found.priceNew,
      priceNew: found.priceNew,
    }
  }
  return undefined
}

/**
 * Artwork for the shipped "Free T-Shirt" gift.
 *
 * Committed under `public/images/` rather than `public/uploads/` — uploads are
 * written at runtime by the admin, while a seed has to resolve on a fresh clone.
 */
const TSHIRT_GIFT_IMAGE = '/images/bundles/t-shirt-free.png'

/** Seed gift ids are fixed so server and client markup agree. */
function seedTextGift(id: string, text: string, image?: string): BundleGiftItem[] {
  return [{ id: `seed-${id}`, kind: 'text', name: text, image }]
}

function seedTiers(twoOff: number, gifts: BundleGiftItem[]): BundleTier[] {
  return [
    { count: 2, discountType: 'fixed', discountValue: twoOff, gifts },
    { count: 3, discountType: 'percent', discountValue: 8, gifts },
    { count: 4, discountType: 'percent', discountValue: 12, gifts },
  ]
}

const READY_SEEDS: { id: string; name: string; slugs: string[]; off: number; gifts: BundleGiftItem[] }[] = [
  { id: 'am5-starter', name: 'AM5 Starter Combo', slugs: ['Gigabyte-b650m-k-micro-ATX-motherboard', 'oscoo-on901-256gb-ssd', 'oscoo-r500-rgb-16gb-ddr5-5600mhz-ram', 't-wolf--infinity-x10-atx-gaming-case-black'], off: 1500, gifts: seedTextGift('am5-starter', 'Free T-Shirt', TSHIRT_GIFT_IMAGE) },
  { id: 'am4-value', name: 'AM4 Value Combo', slugs: ['gigabyte-A520M-K-V2', 'oscoo-r500-rgb-16gb-ddr5-5600mhz-ram'], off: 2000, gifts: seedTextGift('am4-value', 'Free Mousepad') },
  { id: 'case-psu', name: 'Case + Power Combo', slugs: ['t-wolf--infinity-x10-atx-gaming-case-black', 'k600-80plus-600w-power-supply', 'oscoo-on901-256gb-ssd'], off: 1200, gifts: [] },
  { id: 'gpu-power', name: 'Graphics Power Combo', slugs: ['powercolor-fighter-amd-radeon-rx-7700-xt-12gb-gddr6-graphics-card', 'k600-80plus-600w-power-supply', 't-wolf--infinity-x10-atx-gaming-case-black'], off: 3500, gifts: seedTextGift('gpu-power', 'Free Cable Kit') },
  { id: 'play-station', name: 'Play Station Combo', slugs: ['koorui-g2421v-24-inch-qhd-180hz-gaming-monitor', 'aolion-al-ns2288pro-wh-gaming-controller'], off: 1800, gifts: [] },
  { id: 'stream-setup', name: 'Streamer Setup Combo', slugs: ['koorui-e2721h-120hz-gaming-monitor', 'RK-L98-mechanical-cream-keyboard'], off: 2500, gifts: seedTextGift('stream-setup', 'Free T-Shirt', TSHIRT_GIFT_IMAGE) },
  { id: 'pro-gamer', name: 'Pro Gamer Combo', slugs: ['xiaomi-redmi-g27-27-inch-monitor', 'steelseries-nimbus-plus-wireless-black-gaming-controller'], off: 2200, gifts: [] },
  { id: 'build-base', name: 'Build Base Combo', slugs: ['monarch-mystery-box-x5-gaming-case', 'oscoo-r500-rgb-16gb-ddr5-5600mhz-ram'], off: 2600, gifts: [] },
  { id: 'casual-play', name: 'Casual Play Combo', slugs: ['xiaomi-redmi-g24-240hz-gaming-monitor', 'redragon-pluto-g815-blue-dual-mode-vibration-game-pad'], off: 1400, gifts: seedTextGift('casual-play', 'Free Mouse') },
]

const CUSTOM_SEED_TABS: { key: string; label: string; slugs: string[] }[] = [
  { key: 'motherboard', label: 'Motherboard', slugs: ['Gigabyte-b650m-k-micro-ATX-motherboard', 'gigabyte-A520M-K-V2'] },
  { key: 'storage', label: 'Storage & RAM', slugs: ['oscoo-on901-256gb-ssd', 'oscoo-r500-rgb-16gb-ddr5-5600mhz-ram'] },
  { key: 'monitor', label: 'Monitor', slugs: ['koorui-g2421v-24-inch-qhd-180hz-gaming-monitor', 'xiaomi-redmi-g27-27-inch-monitor', 'xiaomi-redmi-g24-240hz-gaming-monitor'] },
  { key: 'gaming', label: 'Gaming Gear', slugs: ['RK-L98-mechanical-cream-keyboard', 'aolion-al-ns2288pro-wh-gaming-controller', 'redragon-pluto-g815-blue-dual-mode-vibration-game-pad'] },
]

function buildDefaultDB(): BundleDB {
  const ready: Record<string, ReadyBundle> = {}
  for (const seed of READY_SEEDS) {
    const products = seed.slugs.map(seedProduct).filter((p): p is BundleProduct => Boolean(p))
    // Skip a seed whose catalog products have been renamed or removed.
    if (products.length < MIN_BUNDLE_PRODUCTS) continue
    ready[seed.id] = {
      id: seed.id,
      name: seed.name,
      active: true,
      products,
      // Normalised like a stored record, so an editor seeded from this constant
      // is byte-identical to what `readDB` hands back — otherwise every editor
      // opens permanently "dirty".
      tiers: normalizeTiers(seedTiers(seed.off, seed.gifts)),
      createdAt: SEED_DATE,
      updatedAt: SEED_DATE,
    }
  }

  const tabs: CustomBundleTab[] = CUSTOM_SEED_TABS.map((t) => ({
    key: t.key,
    label: t.label,
    products: t.slugs.map(seedProduct).filter((p): p is BundleProduct => Boolean(p)),
  })).filter((t) => t.products.length > 0)

  return {
    ready,
    custom: {
      'build-your-own': {
        id: 'build-your-own',
        name: 'Build Your Own Bundle',
        active: true,
        tabs,
        tiers: normalizeTiers([
          { count: 2, discountType: 'fixed', discountValue: 1500, gifts: [] },
          { count: 3, discountType: 'percent', discountValue: 8, gifts: seedTextGift('custom-3', 'Free T-Shirt', TSHIRT_GIFT_IMAGE) },
          {
            count: 4,
            discountType: 'percent',
            discountValue: 12,
            // Four on offer, two kept: the customer picks which pair they want.
            giftLimit: 2,
            // A mixed pool — catalog products plus custom gifts — so there is a real choice.
            gifts: [
              ...['aolion-al-ns2258-t-wireless-controller', 'rapoo-v600se-black-wireless-game-pad']
                .map(seedProduct)
                .filter((p): p is BundleProduct => Boolean(p))
                .map((p) => ({
                  id: `seed-gift-${p.slug}`,
                  kind: 'product' as const,
                  slug: p.slug,
                  name: p.name,
                  image: p.image,
                })),
              ...seedTextGift('custom-4', 'Free Gaming Mousepad'),
              ...seedTextGift('custom-4-tshirt', 'Free T-Shirt', TSHIRT_GIFT_IMAGE),
            ],
          },
        ]),
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE,
      },
    },
  }
}

export const DEFAULT_BUNDLE_DB: BundleDB = buildDefaultDB()

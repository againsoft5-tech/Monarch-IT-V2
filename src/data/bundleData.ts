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

/** A giftable product reference. */
export type GiftProduct = { slug: string; name: string; image: string }

/**
 * Free gift attached to a tier:
 * - `product` — one fixed store product the customer always receives
 * - `choice`  — a pool of eligible products the customer picks one from
 * - `text`    — free text like "Free T-Shirt", shown but never a cart line
 */
export type BundleGift =
  | { kind: 'none' }
  | ({ kind: 'product' } & GiftProduct)
  | { kind: 'choice'; products: GiftProduct[] }
  | { kind: 'text'; text: string }

/** Discount + optional gift unlocked at an exact selected-product count. */
export type BundleTier = {
  count: BundleTierCount
  discountType: BundleDiscountType
  discountValue: number
  gift: BundleGift
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

export function emptyGift(): BundleGift {
  return { kind: 'none' }
}

/** A blank tier set covering every supported product count. */
export function defaultTiers(): BundleTier[] {
  return BUNDLE_TIER_COUNTS.map((count) => ({
    count,
    discountType: 'fixed' as BundleDiscountType,
    discountValue: 0,
    gift: emptyGift(),
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
  /** Gift unlocked by the applied tier, if any. */
  gift?: BundleGift
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
    gift: tier && tier.gift.kind !== 'none' ? tier.gift : undefined,
  }
}

/** Human label for a gift, for cart lines and summaries. */
export function giftLabel(gift?: BundleGift, chosen?: GiftProduct): string | undefined {
  if (!gift || gift.kind === 'none') return undefined
  if (gift.kind === 'product') return gift.name
  if (gift.kind === 'text') return gift.text
  // A choice gift only has a label once the customer has picked from the pool.
  return chosen?.name
}

/** Whether the customer still has to pick their free product before checking out. */
export function giftNeedsChoice(gift?: BundleGift): boolean {
  return gift?.kind === 'choice' && gift.products.length > 0
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

function seedTiers(twoOff: number, gift: BundleGift): BundleTier[] {
  return [
    { count: 2, discountType: 'fixed', discountValue: twoOff, gift },
    { count: 3, discountType: 'percent', discountValue: 8, gift },
    { count: 4, discountType: 'percent', discountValue: 12, gift },
  ]
}

const READY_SEEDS: { id: string; name: string; slugs: string[]; off: number; gift: BundleGift }[] = [
  { id: 'am5-starter', name: 'AM5 Starter Combo', slugs: ['Gigabyte-b650m-k-micro-ATX-motherboard', 'oscoo-on901-256gb-ssd'], off: 1500, gift: { kind: 'none' } },
  { id: 'am4-value', name: 'AM4 Value Combo', slugs: ['gigabyte-A520M-K-V2', 'oscoo-r500-rgb-16gb-ddr5-5600mhz-ram'], off: 2000, gift: { kind: 'text', text: 'Free Mousepad' } },
  { id: 'case-psu', name: 'Case + Power Combo', slugs: ['t-wolf--infinity-x10-atx-gaming-case-black', 'k600-80plus-600w-power-supply'], off: 1200, gift: { kind: 'none' } },
  { id: 'gpu-power', name: 'Graphics Power Combo', slugs: ['powercolor-fighter-amd-radeon-rx-7700-xt-12gb-gddr6-graphics-card', 'k600-80plus-600w-power-supply', 't-wolf--infinity-x10-atx-gaming-case-black'], off: 3500, gift: { kind: 'text', text: 'Free Cable Kit' } },
  { id: 'play-station', name: 'Play Station Combo', slugs: ['koorui-g2421v-24-inch-qhd-180hz-gaming-monitor', 'aolion-al-ns2288pro-wh-gaming-controller'], off: 1800, gift: { kind: 'none' } },
  { id: 'stream-setup', name: 'Streamer Setup Combo', slugs: ['koorui-e2721h-120hz-gaming-monitor', 'RK-L98-mechanical-cream-keyboard'], off: 2500, gift: { kind: 'text', text: 'Free T-Shirt' } },
  { id: 'pro-gamer', name: 'Pro Gamer Combo', slugs: ['xiaomi-redmi-g27-27-inch-monitor', 'steelseries-nimbus-plus-wireless-black-gaming-controller'], off: 2200, gift: { kind: 'none' } },
  { id: 'build-base', name: 'Build Base Combo', slugs: ['monarch-mystery-box-x5-gaming-case', 'oscoo-r500-rgb-16gb-ddr5-5600mhz-ram'], off: 2600, gift: { kind: 'none' } },
  { id: 'casual-play', name: 'Casual Play Combo', slugs: ['xiaomi-redmi-g24-240hz-gaming-monitor', 'redragon-pluto-g815-blue-dual-mode-vibration-game-pad'], off: 1400, gift: { kind: 'text', text: 'Free Mouse' } },
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
      tiers: seedTiers(seed.off, seed.gift),
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
        tiers: [
          { count: 2, discountType: 'fixed', discountValue: 1500, gift: { kind: 'none' } },
          { count: 3, discountType: 'percent', discountValue: 8, gift: { kind: 'text', text: 'Free T-Shirt' } },
          {
            count: 4,
            discountType: 'percent',
            discountValue: 12,
            gift: {
              kind: 'choice',
              products: ['aolion-al-ns2258-t-wireless-controller', 'rapoo-v600se-black-wireless-game-pad']
                .map(seedProduct)
                .filter((p): p is BundleProduct => Boolean(p))
                .map((p) => ({ slug: p.slug, name: p.name, image: p.image })),
            },
          },
        ],
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE,
      },
    },
  }
}

export const DEFAULT_BUNDLE_DB: BundleDB = buildDefaultDB()

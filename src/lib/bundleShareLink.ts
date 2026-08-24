import {
  BUNDLE_TIER_COUNTS,
  giftPickLimit,
  tierForCount,
  type BundleProduct,
  type BundleTierCount,
  type CustomBundle,
} from '@/data/bundleData'

/**
 * Encoding for a shared custom build.
 *
 * A custom build is not a stored entity — it only exists as the choices someone made
 * in the builder — so the selection has to travel in the URL:
 *
 *   /bundles/build?b=<bundleId>&n=<2|3|4>&p=<slug,slug,…>&g=<giftId,giftId>
 *
 * Everything is re-validated on arrival. A link can outlive the products in it: a tab
 * may have been emptied, a product pulled, a tier reconfigured, or the gift pool
 * changed. Anything that no longer resolves is dropped and reported rather than
 * silently rendering a bundle the sender never built.
 */
export const BUILD_SHARE_PATH = '/bundles/build'

export type ParsedBuild = {
  bundle: CustomBundle
  tierCount: BundleTierCount
  /** Products that still resolve, in the order the link listed them. */
  products: BundleProduct[]
  /** Gift ids that still exist in the tier's pool, capped at the allowance. */
  giftIds: string[]
  /** Slugs the link asked for that no longer resolve — surfaced to the recipient. */
  droppedProducts: string[]
  /** True when the link carried a selection at all (vs. a bare builder link). */
  hasSelection: boolean
}

/** Query shape as Next hands it to a page. */
export type BuildSearchParams = Record<string, string | string[] | undefined>

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function splitList(value: string | string[] | undefined): string[] {
  const raw = firstValue(value)
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => decodeURIComponent(s.trim()))
    .filter(Boolean)
}

/** Every product the bundle offers, flattened across its tabs. */
function catalogue(bundle: CustomBundle): Map<string, BundleProduct> {
  const map = new Map<string, BundleProduct>()
  for (const tab of bundle.tabs) {
    for (const product of tab.products) {
      if (!map.has(product.slug)) map.set(product.slug, product)
    }
  }
  return map
}

/**
 * Resolves a share link against the live bundles.
 *
 * Returns `null` only when there is no usable bundle at all — anything else degrades
 * to "the builder, partly filled in".
 */
export function parseBuildLink(
  bundles: CustomBundle[],
  params: BuildSearchParams,
): ParsedBuild | null {
  const live = bundles.filter((b) => b.active && b.tabs.length > 0)
  if (live.length === 0) return null

  const wantedId = firstValue(params.b)
  const bundle = live.find((b) => b.id === wantedId) ?? live[0]

  const slugs = splitList(params.p)
  const available = catalogue(bundle)

  const seen = new Set<string>()
  const products: BundleProduct[] = []
  const droppedProducts: string[] = []
  for (const slug of slugs) {
    if (seen.has(slug)) continue // A link cannot put the same product in two slots.
    seen.add(slug)
    const product = available.get(slug)
    if (product) products.push(product)
    else droppedProducts.push(slug)
  }

  // The tier the link asked for, falling back to what actually survived.
  const askedCount = Number(firstValue(params.n))
  const tierCount: BundleTierCount = (BUNDLE_TIER_COUNTS as readonly number[]).includes(askedCount)
    ? (askedCount as BundleTierCount)
    : ((BUNDLE_TIER_COUNTS.find((c) => c >= products.length) ?? BUNDLE_TIER_COUNTS[0]) as BundleTierCount)

  const trimmed = products.slice(0, tierCount)

  const tier = tierForCount(bundle.tiers, tierCount)
  const pool = tier?.gifts ?? []
  const limit = giftPickLimit(pool, tier?.giftLimit)
  const giftIds = splitList(params.g)
    .filter((id) => pool.some((g) => g.id === id))
    .slice(0, limit)

  return {
    bundle,
    tierCount,
    products: trimmed,
    giftIds,
    droppedProducts,
    hasSelection: slugs.length > 0,
  }
}

/** Builds the shareable path for a selection — the inverse of `parseBuildLink`. */
export function buildShareLink(input: {
  bundleId: string
  tierCount: number
  slugs: string[]
  giftIds: string[]
}): string {
  const params = new URLSearchParams()
  params.set('b', input.bundleId)
  params.set('n', String(input.tierCount))
  if (input.slugs.length) params.set('p', input.slugs.join(','))
  if (input.giftIds.length) params.set('g', input.giftIds.join(','))
  return `${BUILD_SHARE_PATH}?${params.toString()}`
}

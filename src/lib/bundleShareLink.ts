import {
  BUNDLE_TIER_COUNTS,
  giftPickLimit,
  tierForCount,
  type BundleGiftItem,
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
 *   /bundles/build?b=<code>&n=<2|3|4>&p=<code,code,…>&g=<code,code>
 *
 * Items travel as six-character codes rather than full slugs, because a slug like
 * `koorui-g2421v-24-inch-qhd-180hz-gaming-monitor` alone is longer than the entire
 * rest of the link. Codes are derived from the slug, so they stay stable across
 * edits and reorders — unlike positional indexes, which would silently point at a
 * different product once the admin moves something.
 *
 * Full slugs and gift ids are still accepted so links shared before this change keep
 * working. Everything is re-validated on arrival: a link can outlive the products in
 * it, and anything that no longer resolves is dropped and reported.
 */
export const BUILD_SHARE_PATH = '/bundles/build'

/** FNV-1a — small, dependency-free, and stable across runtimes. */
function shortCode(value: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(36).padStart(6, '0').slice(-6)
}

/**
 * code → item, with collisions marked `null`.
 *
 * A six-character hash could in principle collide inside one bundle; rather than
 * pretend it cannot, an ambiguous code resolves to nothing and the encoder falls
 * back to the full slug for that item.
 */
function codeMap<T>(items: T[], key: (item: T) => string): Map<string, T | null> {
  const map = new Map<string, T | null>()
  for (const item of items) {
    const code = shortCode(key(item))
    map.set(code, map.has(code) ? null : item)
  }
  return map
}

export type ParsedBuild = {
  bundle: CustomBundle
  tierCount: BundleTierCount
  /** Products that still resolve, in the order the link listed them. */
  products: BundleProduct[]
  /** Gift ids that still exist in the tier's pool, capped at the allowance. */
  giftIds: string[]
  /** Tokens the link asked for that no longer resolve — surfaced to the recipient. */
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
function catalogue(bundle: CustomBundle): BundleProduct[] {
  const seen = new Set<string>()
  const out: BundleProduct[] = []
  for (const tab of bundle.tabs) {
    for (const product of tab.products) {
      if (seen.has(product.slug)) continue
      seen.add(product.slug)
      out.push(product)
    }
  }
  return out
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

  const wantedBundle = firstValue(params.b)
  const bundleByCode = codeMap(live, (b) => b.id)
  const bundle =
    live.find((b) => b.id === wantedBundle) ??
    (wantedBundle ? bundleByCode.get(wantedBundle) : undefined) ??
    live[0]

  const tokens = splitList(params.p)
  const products_ = catalogue(bundle)
  const bySlug = new Map(products_.map((p) => [p.slug, p]))
  const byCode = codeMap(products_, (p) => p.slug)

  const seen = new Set<string>()
  const products: BundleProduct[] = []
  const droppedProducts: string[] = []
  for (const token of tokens) {
    const product = bySlug.get(token) ?? byCode.get(token) ?? undefined
    if (!product) {
      droppedProducts.push(token)
      continue
    }
    if (seen.has(product.slug)) continue // A link cannot put the same product in two slots.
    seen.add(product.slug)
    products.push(product)
  }

  // The tier the link asked for, falling back to what actually survived.
  const askedCount = Number(firstValue(params.n))
  const tierCount: BundleTierCount = (BUNDLE_TIER_COUNTS as readonly number[]).includes(askedCount)
    ? (askedCount as BundleTierCount)
    : ((BUNDLE_TIER_COUNTS.find((c) => c >= products.length) ?? BUNDLE_TIER_COUNTS[0]) as BundleTierCount)

  const trimmed = products.slice(0, tierCount)

  const tier = tierForCount(bundle.tiers, tierCount)
  const pool: BundleGiftItem[] = tier?.gifts ?? []
  const limit = giftPickLimit(pool, tier?.giftLimit)
  const giftByCode = codeMap(pool, (g) => g.id)
  const giftIds = splitList(params.g)
    .map((token) => pool.find((g) => g.id === token)?.id ?? giftByCode.get(token)?.id)
    .filter((id): id is string => Boolean(id))
    .slice(0, limit)

  return {
    bundle,
    tierCount,
    products: trimmed,
    giftIds,
    droppedProducts,
    hasSelection: tokens.length > 0,
  }
}

/** Builds the shareable path for a selection — the inverse of `parseBuildLink`. */
export function buildShareLink(input: {
  /** Every live custom bundle, so `b` can be omitted when it is the default. */
  bundles: CustomBundle[]
  bundle: CustomBundle
  tierCount: number
  slugs: string[]
  giftIds: string[]
}): string {
  const live = input.bundles.filter((b) => b.active && b.tabs.length > 0)
  const params = new URLSearchParams()

  // Only name the bundle when it is not the one the parser would pick anyway.
  if (live[0]?.id !== input.bundle.id) params.set('b', shortCode(input.bundle.id))

  const products = catalogue(input.bundle)
  const byCode = codeMap(products, (p) => p.slug)
  const encode = (slug: string) => {
    const code = shortCode(slug)
    // An ambiguous code would resolve to nothing, so spell that one out in full.
    return byCode.get(code)?.slug === slug ? code : slug
  }

  // The parser infers the tier from the product count, so only send it when it differs
  // — a half-filled 4-product build, say.
  if (input.tierCount !== input.slugs.length) params.set('n', String(input.tierCount))
  if (input.slugs.length) params.set('p', input.slugs.map(encode).join(','))

  if (input.giftIds.length) {
    const tier = tierForCount(input.bundle.tiers, input.tierCount)
    const giftByCode = codeMap(tier?.gifts ?? [], (g) => g.id)
    params.set(
      'g',
      input.giftIds
        .map((id) => {
          const code = shortCode(id)
          return giftByCode.get(code)?.id === id ? code : id
        })
        .join(','),
    )
  }

  const query = params.toString()
  return query ? `${BUILD_SHARE_PATH}?${query}` : BUILD_SHARE_PATH
}

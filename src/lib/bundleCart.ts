import type { CartItem } from '@/data/cart'
import { computeBundlePricing, resolveGifts, type BundleProduct, type BundleTier } from '@/data/bundleData'

/**
 * Builds the single cart line that represents a whole bundle.
 *
 * One line (not one per product) so the bundle price, its contents and its gift stay
 * together in the cart. Kept as one shared helper — the older combo module duplicates
 * this logic in two components, which is exactly what we're avoiding here.
 */
export function bundleToCartItem(input: {
  /** Unique per bundle so two different bundles don't merge in the cart. */
  cartId: string
  name: string
  /** Cover image; falls back to the first product's image. */
  image?: string
  /** Where the cart line should link back to. */
  slug: string
  products: BundleProduct[]
  tiers: BundleTier[]
  /** Which gifts the customer picked, when the tier offers more than it grants. */
  chosenGiftIds?: string[]
}): CartItem {
  const { cartId, name, image, slug, products, tiers, chosenGiftIds } = input
  const pricing = computeBundlePricing(products, tiers)
  const gifts = resolveGifts(pricing.gifts, chosenGiftIds, pricing.giftLimit)

  return {
    id: cartId,
    name,
    slug,
    image: image || products[0]?.image || '',
    price: pricing.total,
    priceOld: pricing.regularTotal > pricing.total ? pricing.regularTotal : undefined,
    discountPct:
      pricing.regularTotal > 0 && pricing.regularTotal > pricing.total
        ? Math.round(((pricing.regularTotal - pricing.total) / pricing.regularTotal) * 100)
        : undefined,
    qty: 1,
    bundleItems: products.map((p) => ({
      slug: p.slug,
      name: p.name,
      image: p.image,
      price: p.priceNew,
    })),
    giftItems: gifts.length
      ? gifts.map((g) => ({ name: g.name, image: g.image, slug: g.slug }))
      : undefined,
  }
}

/**
 * Describes a bundle for chat.
 *
 * Carries every product and gift, not just a cover image, so the chat bubble can show
 * what the share link's preview shows.
 */
export function bundleToChatSnapshot(input: {
  name: string
  products: BundleProduct[]
  tiers: BundleTier[]
  giftNames: string[]
  href: string
}) {
  const pricing = computeBundlePricing(input.products, input.tiers)
  return {
    name: input.name,
    products: input.products.map((p) => ({ name: p.name, image: p.image, slug: p.slug })),
    giftNames: input.giftNames,
    priceNew: pricing.total,
    priceOld: pricing.regularTotal,
    discountPct:
      pricing.regularTotal > pricing.total
        ? Math.round(((pricing.regularTotal - pricing.total) / pricing.regularTotal) * 100)
        : 0,
    href: input.href,
  }
}

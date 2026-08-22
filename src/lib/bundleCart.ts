import type { CartItem } from '@/data/cart'
import { computeBundlePricing, giftLabel, type BundleProduct, type BundleTier } from '@/data/bundleData'

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
}): CartItem {
  const { cartId, name, image, slug, products, tiers } = input
  const pricing = computeBundlePricing(products, tiers)
  const gift = pricing.gift

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
    giftLabel: giftLabel(gift),
    giftImage: gift?.kind === 'product' ? gift.image : undefined,
  }
}

/** A product contained inside a bundle cart line. */
export type CartBundleChild = {
  slug: string
  name: string
  image: string
  price: number
}

export type CartItem = {
  id: string
  name: string
  slug: string
  image: string
  price: number
  priceOld?: number
  discountPct?: number
  qty: number
  /**
   * Set when this line is a whole bundle rather than a single product. `price` is then the
   * discounted bundle price and these are the products it contains, shown nested under it.
   */
  bundleItems?: CartBundleChild[]
  /** Free gift unlocked with a bundle line — a product name or custom text. */
  giftLabel?: string
  giftImage?: string
}

export const initialCartItems: CartItem[] = []

import {
  DEMO_CATEGORIES,
  demoCategoryById,
} from '@/lib/live-edit/demo-categories'
import { categoryProductsMap } from '@/data/categoryProducts'
import {
  componentProducts,
  monitorProducts,
  refrigeratorProducts,
  type Product,
  featuredTabs as defaultFeaturedTabs,
} from '@/data/products'

export type FeaturedTab = {
  categoryId: string
  label: string
  products: Product[]
}

const FEATURED_LIST_BY_LABEL: Record<string, Product[]> = {
  monitor: monitorProducts,
  components: componentProducts,
  refrigerator: refrigeratorProducts,
}

function slugFromHref(href: string) {
  return href.replace(/^\//, '').split('/')[0] || ''
}

function toProduct(p: {
  name: string
  slug: string
  image: string
  rating: number
  reviews: number
  priceNew: number
  priceOld: number | null
  discountPct: number | null
}): Product {
  return {
    name: p.name,
    slug: p.slug,
    image: p.image,
    rating: p.rating || 4.9,
    reviews: p.reviews || 80,
    priceNew: p.priceNew,
    priceOld: p.priceOld,
    discountPct: p.discountPct,
  }
}

/** Resolve products for a demo category (featured lists first, then category catalog). */
export function productsForCategoryId(categoryId: string): FeaturedTab | null {
  const cat = demoCategoryById(categoryId)
  if (!cat) return null

  const labelKey = cat.name.trim().toLowerCase()
  const seeded = FEATURED_LIST_BY_LABEL[labelKey]
  if (seeded?.length) {
    return { categoryId, label: cat.name, products: seeded }
  }

  const slug = slugFromHref(cat.href)
  const catalog = categoryProductsMap[slug]
  if (catalog?.products?.length) {
    return {
      categoryId,
      label: cat.name,
      products: catalog.products.slice(0, 12).map((p) =>
        toProduct({
          name: p.name,
          slug: p.slug,
          image: p.image,
          rating: p.rating,
          reviews: p.reviews,
          priceNew: p.priceNew,
          priceOld: p.priceOld,
          discountPct: p.discountPct,
        }),
      ),
    }
  }

  return { categoryId, label: cat.name, products: [] }
}

export const DEFAULT_FEATURED_CATEGORY_IDS = [
  'cat-monitor',
  'cat-components',
  'cat-refrigerator',
]

export function resolveFeaturedTabs(categoryIds?: string[] | null): FeaturedTab[] {
  const ids =
    Array.isArray(categoryIds) && categoryIds.length > 0
      ? categoryIds
      : DEFAULT_FEATURED_CATEGORY_IDS

  const tabs = ids
    .map((id) => productsForCategoryId(id))
    .filter((t): t is FeaturedTab => Boolean(t))

  if (tabs.length > 0) return tabs

  // Absolute fallback — original hard-coded tabs
  return defaultFeaturedTabs.map((t, i) => ({
    categoryId: DEMO_CATEGORIES.find((c) => c.name === t.label)?.id || `legacy-${i}`,
    label: t.label,
    products: t.products,
  }))
}

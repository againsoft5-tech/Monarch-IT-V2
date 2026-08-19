import { categoryProductsMap, type CategoryProduct } from '@/data/categoryProducts'
import { getCategoryInfo } from '@/data/categoryRegistry'
import type { OffersTab } from '@/lib/live-edit/offers-page'

export type OffersCategoryOption = {
  slug: string
  name: string
  /** How many discounted products the category contributes. */
  dealCount: number
}

export type OffersCatalogProduct = CategoryProduct & { categorySlug: string }

/** A product as shown on the offers grid, tagged with the tab it was collected from. */
export type OffersTabProduct = CategoryProduct & { dealLabel: string }

/** Every product in the catalog, tagged with the category it came from. */
function allProducts(): OffersCatalogProduct[] {
  const out: OffersCatalogProduct[] = []
  for (const [categorySlug, catalog] of Object.entries(categoryProductsMap)) {
    for (const product of catalog?.products ?? []) {
      out.push({ ...product, categorySlug })
    }
  }
  return out
}

let productsBySlugCache: Map<string, OffersCatalogProduct> | null = null

function productsBySlug(): Map<string, OffersCatalogProduct> {
  if (!productsBySlugCache) {
    productsBySlugCache = new Map(allProducts().map((p) => [p.slug, p]))
  }
  return productsBySlugCache
}

export function offersProductBySlug(slug: string): OffersCatalogProduct | undefined {
  return productsBySlug().get(slug)
}

/** Category picker options, ordered by how many deals each one brings. */
export function offersCategoryOptions(): OffersCategoryOption[] {
  return Object.entries(categoryProductsMap)
    .map(([slug, catalog]) => ({
      slug,
      name: getCategoryInfo(slug)?.name ?? slug,
      dealCount: (catalog?.products ?? []).filter((p) => p.discountPct > 0).length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** Type-ahead over the whole catalog for the drawer's individual-product picker. */
export function searchOffersProducts(query: string, limit = 20): OffersCatalogProduct[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const out: OffersCatalogProduct[] = []
  for (const product of allProducts()) {
    if (product.name.toLowerCase().includes(q) || product.slug.toLowerCase().includes(q)) {
      out.push(product)
      if (out.length >= limit) break
    }
  }
  return out
}

/** First occurrence wins, so a product keeps the label of the earliest tab that claims it. */
function dedupeById(products: OffersTabProduct[]): OffersTabProduct[] {
  const seen = new Set<string>()
  const out: OffersTabProduct[] = []
  for (const product of products) {
    if (seen.has(product.id)) continue
    seen.add(product.id)
    out.push(product)
  }
  return out
}

/** Discounted products of one category — the same rule the offer pages already use. */
function discountedProducts(categorySlug: string): CategoryProduct[] {
  return (categoryProductsMap[categorySlug]?.products ?? []).filter((p) => p.discountPct > 0)
}

/** A tab's own selection: its categories' deals plus any individually picked products. */
function ownProducts(tab: OffersTab): OffersTabProduct[] {
  const label = (tab.label || '').trim()
  const fromCategories = (tab.categorySlugs ?? []).flatMap(discountedProducts)
  const picked = (tab.productSlugs ?? [])
    .map((slug) => productsBySlug().get(slug))
    .filter((p): p is OffersCatalogProduct => Boolean(p))
  return dedupeById([...picked, ...fromCategories].map((p) => ({ ...p, dealLabel: label })))
}

/**
 * Resolves what a tab shows.
 *
 * A `showAll` tab ("Shop All Deals") aggregates every other visible tab, so the admin
 * never has to maintain the same product list twice. If nothing else is configured yet
 * it falls back to every discounted product in the catalog.
 */
export function productsForTab(tab: OffersTab, allTabs: OffersTab[]): OffersTabProduct[] {
  if (!tab.showAll) return ownProducts(tab)

  // Aggregated products keep their source tab's label, so the grid can badge each card.
  const aggregated = dedupeById(
    allTabs.filter((t) => t.id !== tab.id && !t.showAll && !t.hidden).flatMap(ownProducts),
  )
  if (aggregated.length > 0) return aggregated

  const label = (tab.label || '').trim()
  return dedupeById(
    Object.keys(categoryProductsMap)
      .flatMap(discountedProducts)
      .map((p) => ({ ...p, dealLabel: label })),
  )
}

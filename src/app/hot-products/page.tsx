import type { Metadata } from 'next'
import Breadcrumbs from '@/components/category/Breadcrumbs'
import HotProductsClient, { ALL_TAB, type HotProduct } from '@/components/hot/HotProductsClient'
import type { HotTab } from '@/components/hot/HotProductTabs'
import { categoryProductsMap } from '@/data/categoryProducts'
import { getCategoryInfo } from '@/data/categoryRegistry'

export const metadata: Metadata = {
  title: 'Hot Products | Monarch IT',
  description: 'The most in-demand tech at Monarch IT — biggest savings across every category.',
}

/**
 * How many products the page lists. Set wide enough to cover every discounted
 * category, so each one earns a tab (the grid itself is paginated anyway).
 */
const HOT_LIMIT = 120

/**
 * Shop-facing tab captions. The category registry stores some slugs under different
 * retail names (e.g. `monitor` resolves to "Television"), so the storefront wording
 * is pinned here and falls back to the registry for anything not listed.
 */
const TAB_LABELS: Record<string, string> = {
  desktops: 'Desktop',
  laptop: 'Laptop',
  component: 'PC Components',
  monitor: 'Monitor',
  'ups-ips': 'UPS',
  'office-equipments': 'Office Equipment',
  gaming: 'Gaming',
  'air-conditioner': 'Air Conditioner',
  security: 'Security',
  networking: 'Networking',
  accessories: 'Accessories',
  'mobile-accessories': 'Mobile Accessories',
  'server-and-storage': 'Server & Storage',
  gadget: 'Gadget',
}

/**
 * "Hot" is currently derived from the catalog rather than curated: the biggest
 * discounts across every category, deepest first. The product data carries no
 * rating/review/sales signal yet (all zeroes), so discount is the only real
 * popularity proxy available. Swap this for a curated list when one exists.
 */
function hotProducts(): HotProduct[] {
  return Object.entries(categoryProductsMap)
    .flatMap(([categorySlug, catalog]) =>
      (catalog?.products ?? []).map((p) => ({ ...p, categorySlug })),
    )
    .filter((p) => p.discountPct > 0)
    .sort((a, b) => b.discountPct - a.discountPct || b.priceOld - a.priceOld)
    .slice(0, HOT_LIMIT)
}

/** Only the categories actually represented in the list, so no tab is ever empty. */
function tabsFor(products: HotProduct[]): HotTab[] {
  const slugs = Array.from(new Set(products.map((p) => p.categorySlug)))
  return [
    { slug: ALL_TAB, label: 'All' },
    ...slugs.map((slug) => ({
      slug,
      label: TAB_LABELS[slug] ?? getCategoryInfo(slug)?.name ?? slug,
    })),
  ]
}

export default function HotProductsPage() {
  const products = hotProducts()
  const priceMin = products.length ? Math.min(...products.map((p) => p.priceNew)) : 0
  const priceMax = products.length ? Math.max(...products.map((p) => p.priceNew)) : 0

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Hot Products', href: '/hot-products' }]} />
      <HotProductsClient
        products={products}
        tabs={tabsFor(products)}
        priceMin={priceMin}
        priceMax={priceMax}
        title="Hot Products"
        subtitle="Built for every beat, every space, and every moment."
      />
    </>
  )
}

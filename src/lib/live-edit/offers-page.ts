/**
 * Content contract for the public /offers page ("Monarch Deals").
 *
 * Mirrors the homepage contract (see `homepage.ts`): one typed blob drives both the
 * public page and the live editor, and is persisted through a repository seam so the
 * file store can be swapped for an admin DB later.
 */

export type OffersTab = {
  id: string
  /** Chip caption under the icon. */
  label: string
  /** Inactive (grey) icon. */
  icon: string
  /** Active/hover (red) icon — the chips crossfade between the two. */
  iconActive: string
  hidden?: boolean
  /**
   * "Shop All Deals" behaviour: show every product collected by the other tabs
   * instead of this tab's own selection.
   */
  showAll?: boolean
  /** Catalog categories — every discounted product in them joins this tab. */
  categorySlugs: string[]
  /** Individually picked products (by slug), merged on top of the categories. */
  productSlugs: string[]
}

export type OffersPageContent = {
  title: string
  subtitle: string
  tabs: OffersTab[]
}

const ICON_DIR = '/images/offers/deal-types'

export const DEFAULT_OFFERS_PAGE: OffersPageContent = {
  title: 'Monarch Deals',
  subtitle: 'Built for every beat, every space, and every moment.',
  tabs: [
    {
      id: 'all',
      label: 'Shop All Deals',
      icon: `${ICON_DIR}/shop-all-deals.svg`,
      iconActive: `${ICON_DIR}/shop-all-deals-active.svg`,
      showAll: true,
      categorySlugs: [],
      productSlugs: [],
    },
    {
      id: 'flash-sale',
      label: 'Flash Sale',
      icon: `${ICON_DIR}/flash-sale.svg`,
      iconActive: `${ICON_DIR}/flash-sale-active.svg`,
      categorySlugs: ['component', 'gaming'],
      productSlugs: [],
    },
    {
      id: 'clearance',
      label: 'Clearance',
      icon: `${ICON_DIR}/clearance.svg`,
      iconActive: `${ICON_DIR}/clearance-active.svg`,
      categorySlugs: ['monitor'],
      productSlugs: [],
    },
    {
      id: 'study-hard-game-harder',
      label: 'Study Hard-Game-Harder',
      icon: `${ICON_DIR}/study-hard-game-harder.svg`,
      iconActive: `${ICON_DIR}/study-hard-game-harder-active.svg`,
      categorySlugs: ['laptop', 'desktops'],
      productSlugs: [],
    },
    {
      id: 'bundles',
      label: 'Bundles',
      icon: `${ICON_DIR}/bundles.svg`,
      iconActive: `${ICON_DIR}/bundles-active.svg`,
      categorySlugs: ['office-equipments', 'air-conditioner'],
      productSlugs: [],
    },
    {
      id: 'coupons',
      label: 'Coupons',
      icon: `${ICON_DIR}/coupons.svg`,
      iconActive: `${ICON_DIR}/coupons-active.svg`,
      categorySlugs: ['ups-ips', 'security'],
      productSlugs: [],
    },
  ],
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []
}

export function newTabId(): string {
  return `tab-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

/**
 * Fills every missing field so both the public page and the drawer can rely on
 * the shape. Runs on every read and every write, and is idempotent.
 */
export function ensureOffersContent(content?: Partial<OffersPageContent> | null): OffersPageContent {
  const src = content ?? {}
  const tabs = Array.isArray(src.tabs) ? src.tabs : []

  return {
    title: typeof src.title === 'string' && src.title.trim() ? src.title : DEFAULT_OFFERS_PAGE.title,
    subtitle: typeof src.subtitle === 'string' ? src.subtitle : DEFAULT_OFFERS_PAGE.subtitle,
    tabs: (tabs.length ? tabs : DEFAULT_OFFERS_PAGE.tabs).map((tab, i) => ({
      id: typeof tab?.id === 'string' && tab.id ? tab.id : `tab-${i}`,
      label: typeof tab?.label === 'string' ? tab.label : `Tab ${i + 1}`,
      icon: typeof tab?.icon === 'string' ? tab.icon : '',
      iconActive: typeof tab?.iconActive === 'string' ? tab.iconActive : '',
      hidden: tab?.hidden === true,
      showAll: tab?.showAll === true,
      categorySlugs: asStringArray(tab?.categorySlugs),
      productSlugs: asStringArray(tab?.productSlugs),
    })),
  }
}

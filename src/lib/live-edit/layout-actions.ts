import type {
  HomepageContent,
  HomepageSectionType,
  LayoutBlock,
} from '@/lib/live-edit/homepage'
import { SECTION_TYPES, defaultLayout, isPrimaryId } from '@/lib/live-edit/homepage'
import { DEFAULT_FEATURED_CATEGORY_IDS } from '@/lib/live-edit/featured-products'
import { defaultBrandItems } from '@/lib/live-edit/demo-brands'
import { DEFAULT_FOOTER, DEFAULT_HEADER, DEFAULT_SIDE_MENU } from '@/lib/live-edit/site-chrome'

export type LayoutAction =
  | { action: 'moveUp'; instanceId: string }
  | { action: 'moveDown'; instanceId: string }
  | { action: 'duplicate'; instanceId: string }
  | { action: 'toggleHidden'; instanceId: string }
  | { action: 'delete'; instanceId: string }
  | { action: 'add'; type: HomepageSectionType; afterInstanceId?: string | null }
  | { action: 'edit'; instanceId: string }

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function newInstanceId(type: HomepageSectionType): string {
  return `${type}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function ensureLayout(content: HomepageContent): HomepageContent {
  const layout =
    Array.isArray(content.layout) && content.layout.length > 0
      ? content.layout
      : defaultLayout()
  const promo = content.promo ?? { enabled: true, left: [], right: [] }
  const featured = content.featured ?? {
    title: 'Most Wanted',
    subtitle: 'Explore Our Best-Selling Deal',
    categoryIds: [],
  }
  const brands = content.brands ?? {
    title: 'Brands We Distribute',
    subtitle: 'Official distributor of trusted brands.',
    items: [],
  }
  return {
    ...content,
    layout,
    promo: {
      enabled: promo.enabled !== false,
      left: Array.isArray(promo.left) ? promo.left : [],
      right: Array.isArray(promo.right) ? promo.right : [],
    },
    featured: {
      title: featured.title ?? 'Most Wanted',
      subtitle: featured.subtitle ?? 'Explore Our Best-Selling Deal',
      categoryIds: Array.isArray(featured.categoryIds)
        ? featured.categoryIds
        : [...DEFAULT_FEATURED_CATEGORY_IDS],
    },
    brands: {
      title: brands.title ?? 'Brands We Distribute',
      subtitle: brands.subtitle ?? 'Official distributor of trusted brands.',
      items: Array.isArray(brands.items) ? brands.items : defaultBrandItems(),
    },
    header: content.header
      ? { ...DEFAULT_HEADER, ...content.header }
      : { ...DEFAULT_HEADER },
    footer: content.footer
      ? {
          ...DEFAULT_FOOTER,
          ...content.footer,
          social: Array.isArray(content.footer.social)
            ? content.footer.social
            : DEFAULT_FOOTER.social,
          socialMobile: Array.isArray(content.footer.socialMobile)
            ? content.footer.socialMobile
            : DEFAULT_FOOTER.socialMobile,
          linksCol1: Array.isArray(content.footer.linksCol1)
            ? content.footer.linksCol1
            : DEFAULT_FOOTER.linksCol1,
          linksCol2: Array.isArray(content.footer.linksCol2)
            ? content.footer.linksCol2
            : DEFAULT_FOOTER.linksCol2,
        }
      : { ...DEFAULT_FOOTER },
    sideMenu: content.sideMenu
      ? {
          ...DEFAULT_SIDE_MENU,
          ...content.sideMenu,
          items: Array.isArray(content.sideMenu.items)
            ? content.sideMenu.items
            : DEFAULT_SIDE_MENU.items,
          mobileIds: Array.isArray(content.sideMenu.mobileIds)
            ? content.sideMenu.mobileIds
            : DEFAULT_SIDE_MENU.mobileIds,
        }
      : { ...DEFAULT_SIDE_MENU },
    blocks: content.blocks && typeof content.blocks === 'object' ? content.blocks : {},
  }
}

export function applyLayoutAction(
  content: HomepageContent,
  action: LayoutAction,
): HomepageContent {
  const base = ensureLayout(content)
  const layout = [...base.layout]

  if (action.action === 'edit') return base

  if (action.action === 'add') {
    const entry: LayoutBlock = {
      id: newInstanceId(action.type),
      type: action.type,
      hidden: false,
    }
    const after = action.afterInstanceId
      ? layout.findIndex((b) => b.id === action.afterInstanceId)
      : -1
    if (after >= 0) layout.splice(after + 1, 0, entry)
    else layout.push(entry)
    return { ...base, layout }
  }

  const idx = layout.findIndex((b) => b.id === action.instanceId)
  if (idx < 0) return base
  const block = layout[idx]

  switch (action.action) {
    case 'moveUp': {
      if (idx === 0) return base
      ;[layout[idx - 1], layout[idx]] = [layout[idx], layout[idx - 1]]
      return { ...base, layout }
    }
    case 'moveDown': {
      if (idx >= layout.length - 1) return base
      ;[layout[idx + 1], layout[idx]] = [layout[idx], layout[idx + 1]]
      return { ...base, layout }
    }
    case 'toggleHidden': {
      layout[idx] = { ...block, hidden: !block.hidden }
      return { ...base, layout }
    }
    case 'delete': {
      if (isPrimaryId(block.id, block.type)) {
        layout[idx] = { ...block, hidden: true }
        return { ...base, layout }
      }
      layout.splice(idx, 1)
      const blocks = { ...base.blocks }
      delete blocks[block.id]
      return { ...base, layout, blocks }
    }
    case 'duplicate': {
      const copyId = newInstanceId(block.type)
      const payload = getSectionPayload(base, block)
      layout.splice(idx + 1, 0, { id: copyId, type: block.type, hidden: false })
      return {
        ...base,
        layout,
        blocks: { ...base.blocks, [copyId]: cloneJson(payload) },
      }
    }
    default:
      return base
  }
}

function getSectionPayload(content: HomepageContent, block: LayoutBlock): unknown {
  if (isPrimaryId(block.id, block.type)) {
    switch (block.type) {
      case 'hero':
        return content.hero
      case 'categories':
        return content.categories
      case 'promo':
        return content.promo
      case 'featured':
        return content.featured
      case 'dream_pc':
        return content.dreamPc
      case 'brands':
        return content.brands
      case 'about':
        return content.about
      case 'support':
        return content.support
    }
  }
  return content.blocks?.[block.id] ?? {}
}

export function setPrimarySection(
  content: HomepageContent,
  type: HomepageSectionType,
  data: unknown,
): HomepageContent {
  switch (type) {
    case 'hero':
      return { ...content, hero: data as HomepageContent['hero'] }
    case 'categories':
      return { ...content, categories: data as HomepageContent['categories'] }
    case 'promo':
      return { ...content, promo: data as HomepageContent['promo'] }
    case 'featured':
      return { ...content, featured: data as HomepageContent['featured'] }
    case 'dream_pc':
      return { ...content, dreamPc: data as HomepageContent['dreamPc'] }
    case 'brands':
      return { ...content, brands: data as HomepageContent['brands'] }
    case 'about':
      return { ...content, about: data as HomepageContent['about'] }
    case 'support':
      return { ...content, support: data as HomepageContent['support'] }
    default:
      return content
  }
}

export function resolveSectionData(
  content: HomepageContent,
  block: LayoutBlock,
): unknown {
  if (isPrimaryId(block.id, block.type)) {
    return getSectionPayload(content, block)
  }
  return content.blocks?.[block.id] ?? getSectionPayload(content, { ...block, id: block.type })
}

export function canAddType(type: HomepageSectionType): boolean {
  return SECTION_TYPES.includes(type)
}

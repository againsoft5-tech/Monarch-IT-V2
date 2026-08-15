/**
 * Homepage + site-chrome CMS contract.
 *
 * Design rule for future admin/DB:
 * - Store stable foreign keys on items (`categoryId`, `brandId`, …), not only display copy.
 * - Drawers resolve labels/images from a catalog adapter (today: demo-*.ts; later: admin API).
 * - Presentational components accept props/data from this JSON shape — never hardcode
 *   section content when a CMS field exists.
 * - Persist only through `homepageRepository` (`content-repository.ts`) so file → DB is a
 *   single swap.
 */
export type HomepageSectionType =
  | 'hero'
  | 'categories'
  | 'promo'
  | 'featured'
  | 'dream_pc'
  | 'brands'
  | 'about'
  | 'support'

export type LayoutBlock = {
  id: string
  type: HomepageSectionType
  hidden?: boolean
}

export type HeroImageBox = { x: number; y: number; w: number; h: number; z: number }
export type HeroTextBox = {
  x: number
  y: number
  w: number
  z: number
  size: number
  subSize: number
  align: 'left' | 'center' | 'right'
}
export type HeroSlideLayout = {
  product: HeroImageBox
  logo: HeroImageBox
  text: HeroTextBox
}

export type HeroSlide = {
  id: string
  enabled: boolean
  brandLogo: string
  productImage: string
  title: string
  subtitle: string
  href: string
  titleColor: string
  subtitleColor: string
  desktop: HeroSlideLayout
  mobile: HeroSlideLayout
}

export type HeroSection = {
  enabled: boolean
  bgDesktop: string
  bgMobile: string
  slides: HeroSlide[]
}

export type CategoryItem = {
  id?: string
  /** Stable demo/admin category key for select + future DB link. */
  categoryId?: string
  name: string
  img: string
  href: string
  hidden?: boolean
}
export type CategoriesSection = { items: CategoryItem[] }

export type FeaturedSection = {
  title: string
  subtitle: string
  /** Demo/admin category ids — order = tab order; products load from that category. */
  categoryIds: string[]
}

export type DreamPcSection = {
  image: string
  href: string
  line1: string
  line2: string
}

export type BrandItem = {
  id?: string
  /** Stable demo/admin brand key for select + future DB link. */
  brandId?: string
  name: string
  logo: string
  href: string
  hidden?: boolean
}

export type BrandsSection = {
  title: string
  subtitle: string
  items: BrandItem[]
}

export type AboutSection = {
  title: string
  subtitle: string
  bodyHtml: string
}

export type SupportSection = {
  title: string
  subtitle: string
  phone: string
  whatsapp: string
  hours: string
  storeLabel: string
  storeHref: string
}

export type HeaderSection = {
  logoDesktop: string
  logoMobile: string
  logoAlt: string
  searchPlaceholder: string
  orderTrackLabel: string
  orderTrackHref: string
  orderTrackIcon: string
  pcBuilderLabel: string
  pcBuilderHref: string
}

export type SideMenuItem = {
  id: string
  label: string
  icon: string
  href: string
  /** chat = open chat widget; otherwise navigate */
  action?: 'link' | 'chat'
  /** Highlighted style (e.g. PC Builder) */
  active?: boolean
  hidden?: boolean
  showOnMobile?: boolean
}

export type SideMenuSection = {
  logo: string
  logoHref: string
  logoAlt: string
  items: SideMenuItem[]
  /** Ordered item ids for the mobile bottom bar */
  mobileIds: string[]
}

export type FooterLink = {
  id: string
  name: string
  href: string
  hidden?: boolean
}

export type FooterSocial = {
  id: string
  /** Font Awesome class piece, e.g. fa-facebook-f or fab fa-instagram */
  icon: string
  href: string
  hidden?: boolean
}

export type FooterSection = {
  logo: string
  logoAlt: string
  aboutText: string
  social: FooterSocial[]
  socialMobile: FooterSocial[]
  linksTitle: string
  linksCol1: FooterLink[]
  linksCol2: FooterLink[]
  membershipTitle: string
  membershipLogo: string
  officeLabel: string
  officeAddress: string
  copyrightBefore: string
  copyrightBrand: string
  copyrightAfter: string
  paymentImage: string
}

export type PromoSlide = {
  id: string
  label: string
  title: string
  subtitle: string
  buttonText: string
  buttonLink: string
  image: string
  hidden?: boolean
}

export type PromoSection = {
  enabled: boolean
  left: PromoSlide[]
  right: PromoSlide[]
}

export type HomepageContent = {
  layout: LayoutBlock[]
  hero: HeroSection
  categories: CategoriesSection
  promo: PromoSection
  featured: FeaturedSection
  dreamPc: DreamPcSection
  brands: BrandsSection
  about: AboutSection
  support: SupportSection
  header: HeaderSection
  footer: FooterSection
  sideMenu: SideMenuSection
  blocks?: Record<string, unknown>
}

export const SECTION_TYPES: HomepageSectionType[] = [
  'hero',
  'categories',
  'promo',
  'featured',
  'dream_pc',
  'brands',
  'about',
  'support',
]

export const SECTION_LABELS: Record<HomepageSectionType, string> = {
  hero: 'Hero slider',
  categories: 'Category carousel',
  promo: 'Promo banners',
  featured: 'Most Wanted',
  dream_pc: 'Dream PC',
  brands: 'Brands',
  about: 'About',
  support: 'Support',
}

export function isPrimaryId(id: string, type: HomepageSectionType) {
  return id === type
}

export function defaultLayout(): LayoutBlock[] {
  return SECTION_TYPES.map((type) => ({ id: type, type, hidden: false }))
}

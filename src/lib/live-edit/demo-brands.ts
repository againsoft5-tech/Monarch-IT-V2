/** Demo brand catalog for live-edit selects (later → admin DB). */

export type DemoBrand = {
  id: string
  name: string
  href: string
  logo: string
}

export const DEMO_BRANDS: DemoBrand[] = [
  {
    id: 'brand-sony',
    name: 'Sony',
    href: '/sony',
    logo: '/images/image/cache/catalog/brand-logo/sony-logo-100x100.jpg',
  },
  {
    id: 'brand-apple',
    name: 'Apple',
    href: '/apple',
    logo: '/images/image/cache/catalog/brand-logo/apple-logo-100x100.jpg',
  },
  {
    id: 'brand-edifier',
    name: 'Edifier',
    href: '/edifier-speakers',
    logo: '/images/image/cache/catalog/edifier/Untitled-100x100.png',
  },
  {
    id: 'brand-gree',
    name: 'Gree',
    href: '/gree',
    logo: '/images/image/cache/catalog/brand-logo/gree-logo-100x100.jpg',
  },
  {
    id: 'brand-haier',
    name: 'Haier',
    href: '/haier',
    logo: '/images/image/cache/catalog/Air-Conditioner/haier-brand-logo-1-100x100.jpg',
  },
  {
    id: 'brand-hisense',
    name: 'Hisense',
    href: '/hisense',
    logo: '/images/image/cache/catalog/brand-logo/hisense-100x100.jpg',
  },
  {
    id: 'brand-lg',
    name: 'LG',
    href: '/lg',
    logo: '/images/image/cache/catalog/brand-logo/lg-100x100.jpg',
  },
  {
    id: 'brand-samsung',
    name: 'Samsung',
    href: '/samsung',
    logo: '/images/image/cache/catalog/brand-logo/samsung-logo-100x100.jpg',
  },
  {
    id: 'brand-vision',
    name: 'Vision',
    href: '/vision-1',
    logo: '/images/image/cache/catalog/vision/Screenshot-(60)-100x100.png',
  },
  {
    id: 'brand-baseus',
    name: 'Baseus',
    href: '/baseus-cleaner',
    logo: '/images/image/cache/catalog/brand-logo/baseus-100x100.jpg',
  },
  {
    id: 'brand-benq',
    name: 'BenQ',
    href: '/benq',
    logo: '/images/image/cache/catalog/brand-logo/benq-100x100.jpg',
  },
  {
    id: 'brand-epson',
    name: 'Epson',
    href: '/epson',
    logo: '/images/image/cache/catalog/brand-logo/epson-100x100.jpg',
  },
  {
    id: 'brand-maono',
    name: 'Maono',
    href: '/maono',
    logo: '/images/image/cache/catalog/brand-logo/maono-100x100.jpg',
  },
  {
    id: 'brand-oneplus',
    name: 'Oneplus',
    href: '/oneplus',
    logo: '/images/image/cache/catalog/brand-logo/onepluse-logo-100x100.jpg',
  },
  {
    id: 'brand-oppo',
    name: 'Oppo',
    href: '/oppo',
    logo: '/images/image/cache/catalog/brand-logo/oppo-logo-100x100.jpg',
  },
]

export function demoBrandById(id: string | undefined | null): DemoBrand | undefined {
  if (!id) return undefined
  return DEMO_BRANDS.find((b) => b.id === id)
}

export function demoBrandByName(name: string | undefined | null): DemoBrand | undefined {
  if (!name) return undefined
  const key = name.trim().toLowerCase()
  return DEMO_BRANDS.find((b) => b.name.toLowerCase() === key)
}

export function defaultBrandItems() {
  return DEMO_BRANDS.map((b) => ({
    id: `row-${b.id}`,
    brandId: b.id,
    name: b.name,
    logo: b.logo,
    href: b.href,
    hidden: false,
  }))
}

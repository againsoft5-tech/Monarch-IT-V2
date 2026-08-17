export type DiscountType = 'percent' | 'fixed'

export type ComboProduct = {
  id: string
  name: string
  image: string
  brand: string
  priceOld: number
  discountType: DiscountType
  discountValue: number
  specs?: string[]
  /** Slug of the matching storefront product page, when this item was imported from the catalog. */
  slug?: string
}

export type ComboGroup = {
  key: string
  label: string
  required: boolean
  maxQuantity: number
  products: ComboProduct[]
}

export type ComboBonusTier = {
  minGroups: number
  bonusType: DiscountType
  bonusAmount: number
}

export type ComboCampaign = {
  id: string
  name: string
  active: boolean
  startDate?: string
  endDate?: string
  themeColor?: string
  bannerImage?: string
  groups: ComboGroup[]
  bonusTiers: ComboBonusTier[]
  createdAt: string
  updatedAt: string
}

export function priceNewOf(product: ComboProduct): number {
  const raw =
    product.discountType === 'percent'
      ? product.priceOld * (1 - product.discountValue / 100)
      : product.priceOld - product.discountValue
  return Math.max(0, Math.round(raw))
}

export function discountAmountOf(product: ComboProduct): number {
  return product.priceOld - priceNewOf(product)
}

const PLACEHOLDER_IMG = '/images/pc-builder/icons/storage-active.svg'

export const DEFAULT_CAMPAIGNS: ComboCampaign[] = [
  {
    id: 'nas-combo-builder',
    name: 'NAS Combo Builder',
    active: true,
    themeColor: '#c3272b',
    bannerImage: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bonusTiers: [
      { minGroups: 2, bonusType: 'fixed', bonusAmount: 1500 },
      { minGroups: 3, bonusType: 'fixed', bonusAmount: 3000 },
      { minGroups: 4, bonusType: 'percent', bonusAmount: 5 },
    ],
    groups: [
      {
        key: 'nas',
        label: 'NAS',
        required: true,
        maxQuantity: 1,
        products: [
          {
            id: 'nas-asustor-drivestor-2-lite',
            name: 'Asustor DRIVESTOR 2 Lite AS1102T 2-Bays NAS Storage',
            image:
              '/images/products/storage/drivestor-2-lite.webp',
            brand: 'Asustor',
            priceOld: 30500,
            discountType: 'percent',
            discountValue: 3,
            specs: ['2-Bay', 'Quad-Core 1.7GHz', '1GB RAM'],
          },
          {
            id: 'nas-synology-ds223j',
            name: 'Synology DiskStation DS223j 2-Bays NAS Enclosure',
            image:
              '/images/products/storage/diskstation-ds223j.webp',
            brand: 'Synology',
            priceOld: 39000,
            discountType: 'percent',
            discountValue: 4,
            specs: ['2-Bay', 'Quad-Core 1.7GHz', '1GB DDR4 RAM'],
          },
          {
            id: 'nas-qnap-ts-233',
            name: 'QNAP TS-233 2 Bays NAS Storage',
            image: '/images/products/storage/qnap-ts-233.webp',
            brand: 'QNAP',
            priceOld: 44000,
            discountType: 'percent',
            discountValue: 4,
            specs: ['2-Bay', 'Dual-Core 2.0GHz', '2GB RAM'],
          },
          {
            id: 'nas-asustor-drivestor-4-pro',
            name: 'Asustor DRIVESTOR 4 Pro AS3304T 4-Bays NAS Storage',
            image:
              '/images/products/storage/drivestor-4-pro.jpg',
            brand: 'Asustor',
            priceOld: 48500,
            discountType: 'percent',
            discountValue: 5,
            specs: ['4-Bay', 'Quad-Core 1.7GHz', '2.5GbE LAN'],
          },
          {
            id: 'nas-orico-metabox-pro',
            name: 'ORICO MetaBox Pro 2 Bay NAS Storage',
            image: '/images/products/storage/metabox-pro.webp',
            brand: 'ORICO',
            priceOld: 52000,
            discountType: 'percent',
            discountValue: 5,
            specs: ['2-Bay', 'Quad-Core', '2.5GbE LAN'],
          },
        ],
      },
      {
        key: 'hdd',
        label: 'HDD',
        required: false,
        maxQuantity: 2,
        products: [
          {
            id: 'hdd-seagate-ironwolf-4tb',
            name: 'Seagate IronWolf 4TB 5400RPM SATA NAS HDD',
            image:
              '/images/products/storage/ironwolf-4tb-5400rpm.webp',
            brand: 'Seagate',
            priceOld: 28500,
            discountType: 'percent',
            discountValue: 6,
            specs: ['4TB', '5400RPM', 'NAS Rated'],
          },
          {
            id: 'hdd-wd-purple-8tb',
            name: 'Western Digital 8TB PURPLE Surveillance HDD',
            image:
              '/images/products/storage/western-digital-8tb-purple-wd80puzx.jpeg',
            brand: 'WD',
            priceOld: 40000,
            discountType: 'percent',
            discountValue: 5,
            specs: ['8TB', 'Surveillance Rated'],
          },
          {
            id: 'hdd-seagate-ironwolf-pro-8tb',
            name: 'Seagate IronWolf Pro 8TB 3.5 Inch SATA 7200RPM NAS HDD',
            image: '/images/products/storage/ironwolf-pro-8tb.webp',
            brand: 'Seagate',
            priceOld: 51200,
            discountType: 'fixed',
            discountValue: 1700,
            specs: ['8TB', '7200RPM', '3 Years Warranty'],
          },
        ],
      },
      {
        key: 'ssd',
        label: 'SSD',
        required: false,
        maxQuantity: 2,
        products: [
          {
            id: 'ssd-samsung-980pro-1tb',
            name: 'Samsung 980 PRO 1TB NVMe SSD',
            image: PLACEHOLDER_IMG,
            brand: 'Samsung',
            priceOld: 11900,
            discountType: 'percent',
            discountValue: 12,
            specs: ['1TB', 'NVMe Gen4'],
          },
        ],
      },
      {
        key: 'memory',
        label: 'Memory',
        required: false,
        maxQuantity: 2,
        products: [
          {
            id: 'memory-kingston-16gb',
            name: 'Kingston 16GB DDR4 SODIMM',
            image: PLACEHOLDER_IMG,
            brand: 'Kingston',
            priceOld: 5900,
            discountType: 'fixed',
            discountValue: 300,
            specs: ['16GB', 'DDR4 3200MHz'],
          },
        ],
      },
    ],
  },
]

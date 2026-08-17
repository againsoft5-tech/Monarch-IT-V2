import * as desktops from './categoryData/desktops'
import * as laptop from './categoryData/laptop'
import * as component from './categoryData/component'
import * as monitor from './categoryData/monitor'
import * as upsIps from './categoryData/ups-ips'
import * as officeEquipments from './categoryData/office-equipments'
import * as mobileAccessories from './categoryData/mobile-accessories'
import * as airConditioner from './categoryData/air-conditioner'
import * as security from './categoryData/security'
import * as networking from './categoryData/networking'
import * as accessories from './categoryData/accessories'
import * as serverAndStorage from './categoryData/server-and-storage'
import * as gadget from './categoryData/gadget'
import * as gaming from './categoryData/gaming'
import type { CategoryProduct } from './categoryProducts'
import type { VariantGroup, VariantCombo } from '@/lib/productVariants'

export type ProductImage = {
  large: string
  thumb: string
}

export type SpecGroup = {
  label: string
  lines: string[]
}

export type Review = {
  name: string
  date: string
  rating: number
  body: string
}

export type QaItem = {
  question: string
  askedBy: string
  askedDate: string
  answer: string
}

export type ProductOption = {
  name: string
  values: string[]
}

export type { VariantGroup, VariantCombo, VariantOption } from '@/lib/productVariants'

export type RelatedProduct = {
  slug: string
  name: string
  image: string
  rating: number
  reviews: number
  priceNew: number
  priceOld: number
  discountPct: number
}

export type ProductDetail = {
  slug: string
  name: string
  brand: string
  model?: string
  breadcrumb: { label: string; href: string }[]
  images: ProductImage[]
  /** YouTube video ID — shown as the first gallery slide, autoplaying. */
  videoId?: string
  rating: number
  reviewCount: number
  priceNew: number
  priceOld: number
  discountPct: number
  discountEndsAt?: string
  keyFeatures: string[]
  specGroups: SpecGroup[]
  descriptionTitle: string
  descriptionParagraph: string
  descriptionSections?: { heading: string; points: string[] }[]
  options?: ProductOption[]
  variantGroups?: VariantGroup[]
  variantCombos?: VariantCombo[]
  reviews?: Review[]
  qa?: QaItem[]
  mostViewed?: RelatedProduct
  moreToLove?: RelatedProduct[]
}

const sonyBravia: ProductDetail = {
  slug: 'sony-bravia-8-k-65xr80-65-inch-4k-hdr-oled-google-tv',
  name: 'Sony Bravia 8 K-65XR80 65 Inch 4K HDR OLED Google TV',
  brand: 'Sony',
  model: 'K-65XR80',
  breadcrumb: [
    { label: 'Home', href: '/' },
    { label: 'Television', href: '/smart-tv' },
    { label: 'Sony', href: '/sony-tv' },
    { label: 'Sony Bravia 8 K-65XR80 65 Inch 4K HDR OLED Google TV', href: '/sony-bravia-8-k-65xr80-65-inch-4k-hdr-oled-google-tv' },
  ],
  images: [
    { large: '/images/image/cache/catalog/tv-/sony/K-65XR80/860X740-01-500x500.jpg', thumb: '/images/image/cache/catalog/tv-/sony/K-65XR80/860X740-01-500x500.jpg' },
    { large: '/images/image/cache/catalog/tv-/sony/K-65XR80/860X740-02-500x500.jpg', thumb: '/images/image/cache/catalog/tv-/sony/K-65XR80/860X740-02-74x74.jpg' },
    { large: '/images/image/cache/catalog/tv-/sony/K-65XR80/image4-500x500.jpg', thumb: '/images/image/cache/catalog/tv-/sony/K-65XR80/image4-74x74.jpg' },
    { large: '/images/image/cache/catalog/tv-/sony/K-65XR80/860X740-04-500x500.jpg', thumb: '/images/image/cache/catalog/tv-/sony/K-65XR80/860X740-04-74x74.jpg' },
    { large: '/images/image/cache/catalog/43C350LP/imgi_63_1734935791376668-500x500.jpg', thumb: '/images/image/cache/catalog/43C350LP/imgi_63_1734935791376668-74x74.jpg' },
    { large: '/images/image/cache/catalog/43C350LP/imgi_62_1734935791276668-500x500.jpg', thumb: '/images/image/cache/catalog/43C350LP/imgi_62_1734935791276668-74x74.jpg' },
  ],
  rating: 5,
  reviewCount: 1,
  priceNew: 449900,
  priceOld: 724900,
  discountPct: 38,
  discountEndsAt: '2026-07-30T23:59:59',
  keyFeatures: ['Screen Speaker Technology', 'Harmonic Presence', 'Pure Black OLED', 'Ultimate Gaming Experience'],
  specGroups: [
    {
      label: 'Main Features',
      lines: [
        'Display Type: OLED',
        'Screen Size: 65" (64.5")',
        'Resolution: 3840 x 2160',
        'Refresh Rate: 120 Hz',
        'Contrast Ratio: XR Contrast Booster 15, Dynamic Contrast Enhancer',
        'Viewing Angle: 178°',
        'Aspect Ratio: 16:9',
        'Processor: XR Processor',
        'Graphics: Yes',
        'Storage: 32 GB',
        'Operating System: Android',
      ],
    },
    {
      label: 'Connectivity',
      lines: [
        'USB Ports: 2 (side)',
        'USB Playback Codecs: MPEG1/2/4, AVC, HEVC, Xvid, VC1, VP8, VP9, MotionJPEG, MP3, WMA, AAC, FLAC, LPCM, WAV, JPEG, HEIF',
        'HDMI Ports: 4 (side)',
        'Bluetooth: Version 5.3, HID support',
        'Wi-Fi: 802.11a/b/g/n/ac/ax',
      ],
    },
    {
      label: 'Audio',
      lines: [
        'Audio Output Power: 10 W x 5 (2 Actuators, 2 Tweeters, 1 Subwoofer)',
        'Audio Formats Supported: Dolby Atmos, DTS, DTS Digital Surround, and more',
      ],
    },
    {
      label: 'Power',
      lines: ['Remote Control: Standard Remote', 'Power Consumption: 438 W', 'Standby Power Consumption: 0.5 W'],
    },
    {
      label: 'Physical Specification',
      lines: [
        'Dimensions (W x H x D) Without Stand: 1442 x 829 x 37 mm',
        'Weight Without Stand: 22.3 kg',
        'Weight With Stand: 23.2 kg',
      ],
    },
    {
      label: 'Warranty',
      lines: ['Official Warranty: Parts 2 Years, Panel 2 Years & Service 5 Years (warranty card must be kept for claims)'],
    },
  ],
  descriptionTitle: 'Sony Bravia 8 K-65XR80 65 Inch 4K HDR OLED Google TV',
  descriptionParagraph:
    'A 65-inch OLED TV built around Sony’s XR processor, combining a slim design with deep blacks, wide viewing angles, and screen-driven sound for a cinema-style setup at home.',
  descriptionSections: [
    { heading: 'Design', points: ['Slim profile that blends into most living-room setups', 'Minimal bezel with a clean, understated finish'] },
    { heading: 'Picture Quality', points: ['Pure Black OLED panel for deep contrast', 'XR Processor for upscaling and motion handling'] },
    { heading: 'Sound', points: ['Screen-driven sound so audio tracks the on-screen action', 'Tuned for dialogue clarity and surround effects'] },
    { heading: 'Smart Features', points: ['Google TV interface with unified app/content search', 'Built-in Google Assistant voice control'] },
    { heading: 'Gaming', points: ['Low input lag mode tuned for PlayStation 5 and other consoles'] },
  ],
  reviews: [
    { name: 'Kumar', date: '01 Jul 2026', rating: 5, body: 'This product is good. Thanks for give us best product.' },
  ],
  qa: [
    {
      question: 'Is this product available?',
      askedBy: 'Kumar Bissojit',
      askedDate: '01 Jul 2026',
      answer: 'Yes, this product is available. You can buy now.',
    },
  ],
  mostViewed: {
    slug: 'haier-h43p7ux-43-inch-4k-uhd-google-tv',
    name: 'Haier H43P7UX 43 inch HQLED 4K UHD GOOGLE TV',
    image: '/images/image/cache/catalog/haier/43p7/W020260219648224141470_600-200x200.png',
    rating: 5,
    reviews: 53,
    priceNew: 40990,
    priceOld: 53900,
    discountPct: 24,
  },
  moreToLove: [
    {
      slug: 'sony-bravia-108-cm-43-4k-ultra-hd-smart-led-google-tv',
      name: 'Sony Bravia KD-43X75K 43 Inch 4K UHD Smart LED Google TV',
      image: '/images/image/cache/catalog/tv-/sony/43X75K/image23-200x200.jpg',
      rating: 0,
      reviews: 0,
      priceNew: 63990,
      priceOld: 80000,
      discountPct: 20,
    },
    {
      slug: 'sony-bravia-126-cm-50-4k-ultra-hd-smart-led-google-tv',
      name: 'Sony Bravia KD-50X75K 50 Inch 4K UHD Smart LED',
      image: '/images/image/cache/catalog/tv-/sony/43X75K/image23-200x200.jpg',
      rating: 4,
      reviews: 2,
      priceNew: 72900,
      priceOld: 99900,
      discountPct: 27,
    },
    {
      slug: 'sony-bravia-139-cm-55-4k-ultra-hd-smart-led-google-tv',
      name: 'Sony Bravia KD-55X75K 55 Inch 4K UHD Smart LED',
      image: '/images/image/cache/catalog/tv-/sony/43X75K/image23-200x200.jpg',
      rating: 5,
      reviews: 1,
      priceNew: 84900,
      priceOld: 90900,
      discountPct: 7,
    },
    {
      slug: 'sony-bravia-164-cm-65-inches-4k-ultra-hd-smart-led-google-tv',
      name: 'Sony Bravia KD-65X75K 65 Inch 4K UHD Smart LED',
      image: '/images/image/cache/catalog/tv-/sony/43X75K/image23-200x200.jpg',
      rating: 0,
      reviews: 0,
      priceNew: 124900,
      priceOld: 145000,
      discountPct: 14,
    },
    {
      slug: 'sony-bravia-3-k-55s30-55-inch-4k-uhd-google-tv',
      name: 'Sony Bravia 3 K-55S30 55 Inch 4K UHD Google TV',
      image: '/images/image/cache/catalog/tv-/sony/Bravia-3/k-43s30-001-500x500-200x200.png',
      rating: 0,
      reviews: 0,
      priceNew: 121900,
      priceOld: 131900,
      discountPct: 8,
    },
    {
      slug: 'sony-bravia-3-k-65s30-65-inch-4k-uhd-google-tv',
      name: 'Sony BRAVIA 3 K-65S30 65-Inch 4K UHD Google TV',
      image: '/images/image/cache/catalog/tv-/sony/Bravia-3/k-43s30-001-500x500-200x200.png',
      rating: 0,
      reviews: 0,
      priceNew: 164900,
      priceOld: 174900,
      discountPct: 6,
    },
    {
      slug: 'sony-bravia-3-k-75s30-75-inch-4k-uhd-google-tv',
      name: 'Sony BRAVIA 3 K-75S30 75-Inch 4K UHD Google TV',
      image: '/images/image/cache/catalog/tv-/sony/Bravia-3/k-43s30-001-500x500-200x200.png',
      rating: 0,
      reviews: 0,
      priceNew: 289900,
      priceOld: 310900,
      discountPct: 7,
    },
    {
      slug: 'sony-bravia-8-k-55xr80-55-inch-4k-hdr-oled-google-tv',
      name: 'Sony Bravia 8 K-55XR80 55 Inch 4K HDR OLED Google TV',
      image: '/images/image/cache/catalog/tv-/sony/K-65XR80/860X740-01-200x200.jpg',
      rating: 0,
      reviews: 0,
      priceNew: 340900,
      priceOld: 368900,
      discountPct: 8,
    },
    {
      slug: 'sony-bravia-3-k-85s30-85-inch-4k-uhd-google-tv',
      name: 'Sony BRAVIA 3 K-85S30 85-Inch 4K UHD Google TV',
      image: '/images/image/cache/catalog/tv-/sony/Bravia-3/k-43s30-001-500x500-200x200.png',
      rating: 0,
      reviews: 0,
      priceNew: 414900,
      priceOld: 444900,
      discountPct: 7,
    },
    {
      slug: 'sony-bravia-8-k-75xr80-75-inch-4k-hdr-oled-google-tv',
      name: 'Sony Bravia 8 K-75XR80 75 Inch 4K HDR OLED Google TV',
      image: '/images/image/cache/catalog/tv-/sony/K-65XR80/860X740-01-200x200.jpg',
      rating: 0,
      reviews: 0,
      priceNew: 589900,
      priceOld: 649900,
      discountPct: 9,
    },
  ],
}

const scrapedCategories = [
  desktops,
  laptop,
  component,
  monitor,
  upsIps,
  officeEquipments,
  mobileAccessories,
  airConditioner,
  security,
  networking,
  accessories,
  serverAndStorage,
  gadget,
  gaming,
]

function toRelated(p: CategoryProduct): RelatedProduct {
  return {
    slug: p.slug,
    name: p.name,
    image: p.image,
    rating: p.rating,
    reviews: p.reviews,
    priceNew: p.priceNew,
    priceOld: p.priceOld,
    discountPct: p.discountPct,
  }
}

export const productDetailMap: Record<string, ProductDetail> = {
  [sonyBravia.slug]: sonyBravia,
}

for (const cat of scrapedCategories) {
  const siblings = cat.products
  for (const detail of cat.details) {
    const related = siblings.filter((p) => p.slug !== detail.slug).map(toRelated)
    productDetailMap[detail.slug] = {
      ...detail,
      mostViewed: detail.mostViewed ?? related[0],
      moreToLove: detail.moreToLove ?? related.slice(0, 8),
    }
  }
}

export function getProductDetail(slug: string): ProductDetail | undefined {
  return productDetailMap[slug]
}

'use client'

import { useEffect, useState } from 'react'

/** Which of a slide's three independent layers a setting belongs to. */
export type SlidePart = 'product' | 'logo' | 'text'
export type Device = 'desktop' | 'mobile'

/**
 * Placement of one layer inside the slide.
 * x/y are percentages of the slide box and anchor the element's CENTRE, so
 * 50/50 is dead centre regardless of the element's own size.
 * w/h are percentages of the slide box; 0 means "auto" (keep natural aspect).
 */
export type ImageBox = {
  x: number
  y: number
  w: number
  h: number
  z: number
}

export type TextBox = {
  x: number
  y: number
  /** Block width as % of the slide — controls where the headline wraps. */
  w: number
  z: number
  /** Headline font size, in % of slide width (cqw). */
  size: number
  /** Subtitle font size, in % of slide width (cqw). */
  subSize: number
  align: 'left' | 'center' | 'right'
}

export type SlideLayout = {
  product: ImageBox
  logo: ImageBox
  text: TextBox
}

export type HeroSlide = {
  id: string
  brandLogo: string
  productImage: string
  title: string
  subtitle: string
  href: string
  /** Text colours. Shared by both devices — only geometry differs per device. */
  titleColor: string
  subtitleColor: string
  /** Independent layout per device — mobile never inherits desktop geometry. */
  desktop: SlideLayout
  mobile: SlideLayout
}

export type HeroSliderDB = {
  /** Shared background behind every slide — 16:9 desktop artwork. */
  bgDesktop: string
  /** Shared background for the 1:1 mobile layout. Falls back to bgDesktop when empty. */
  bgMobile: string
  slides: HeroSlide[]
}

const DB_KEY = 'monarch_hero_slider'
const VERSION_KEY = 'monarch_hero_slider_seed_version'
const CHANNEL_NAME = 'monarch-hero-slider-sync'
const LOCAL_EVENT = 'monarch-hero-slider-local-change'

// Bump when seedDB() gains new default slides so already-seeded browsers pick
// them up instead of being stuck on whatever was saved on their first visit.
const SEED_VERSION = 5

const DEFAULT_BG = '/images/hero-slider/slider-bg.jpg'

export const DEFAULT_TITLE_COLOR = '#ee1c25'
export const DEFAULT_SUBTITLE_COLOR = '#3f3f46'

/**
 * Default stacking order, bottom to top: product image → brand logo → text.
 * Admins can override any of these per slide, per device.
 */
export const DEFAULT_LAYOUT: Record<Device, SlideLayout> = {
  // Tuned for the 1350x600 desktop box. The product is sized and nudged down so
  // its top clears the site's fixed 72px transparent header.
  desktop: {
    product: { x: 72, y: 53, w: 36, h: 0, z: 1 },
    logo: { x: 14.5, y: 30, w: 11, h: 0, z: 2 },
    text: { x: 27.5, y: 60, w: 37, z: 3, size: 7.6, subSize: 1.55, align: 'left' },
  },
  mobile: {
    product: { x: 50, y: 67, w: 52, h: 0, z: 1 },
    logo: { x: 50, y: 14.5, w: 15, h: 0, z: 2 },
    text: { x: 50, y: 32, w: 88, z: 3, size: 13, subSize: 2.9, align: 'center' },
  },
}

/**
 * Desktop boxes earlier versions handed out automatically. A saved slide still
 * carrying one of these exactly was never adjusted by an admin, so migrations
 * may re-tune it; anything else is a deliberate edit and is left alone.
 */
const SUPERSEDED_DESKTOP: SlideLayout[] = [
  // The short-lived 16:9 build.
  {
    product: { x: 73, y: 50, w: 52, h: 0, z: 1 },
    logo: { x: 14.5, y: 40, w: 11, h: 0, z: 2 },
    text: { x: 27.5, y: 59, w: 37, z: 3, size: 7.6, subSize: 1.55, align: 'left' },
  },
  // First 1350x600 pass, before the CURL 7.1 composition was tuned.
  {
    product: { x: 72, y: 53, w: 36, h: 0, z: 1 },
    logo: { x: 14.5, y: 30, w: 11, h: 0, z: 2 },
    text: { x: 27.5, y: 60, w: 37, z: 3, size: 7.6, subSize: 1.55, align: 'left' },
  },
]

export function defaultLayout(device: Device): SlideLayout {
  const d = DEFAULT_LAYOUT[device]
  return { product: { ...d.product }, logo: { ...d.logo }, text: { ...d.text } }
}

let channel: BroadcastChannel | null = null
function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME)
  return channel
}

function makeId() {
  return `hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Seed ids are stable (not generated) so the server render and the first client
// render agree — HeroSlider paints these defaults before localStorage is read.
export function seedDB(): HeroSliderDB {
  return {
    bgDesktop: DEFAULT_BG,
    bgMobile: DEFAULT_BG,
    slides: [
      {
        id: 'hero-seed-hyperx-cloud-ii',
        brandLogo: '/images/hero-slider/brand-hyperx.png',
        productImage: '/images/hero-slider/hyperx-cloud-ii.png',
        title: 'CLOUD II',
        subtitle: '',
        href: '/offers',
        titleColor: DEFAULT_TITLE_COLOR,
        subtitleColor: DEFAULT_SUBTITLE_COLOR,
        // The HyperX wordmark is wider than the FANTECH mark and the CLOUD II
        // cut-out sits lower in its frame, so this slide carries its own boxes
        // rather than the shared defaults.
        desktop: {
          product: { x: 66.5, y: 55, w: 40, h: 0, z: 1 },
          logo: { x: 26, y: 35, w: 17, h: 0, z: 2 },
          text: { x: 40, y: 49, w: 45, z: 3, size: 8, subSize: 1.55, align: 'left' },
        },
        mobile: {
          product: { x: 50, y: 68, w: 58, h: 0, z: 1 },
          logo: { x: 50, y: 15, w: 34, h: 0, z: 2 },
          text: { x: 50, y: 32, w: 88, z: 3, size: 13, subSize: 2.9, align: 'center' },
        },
      },
      {
        id: 'hero-seed-fantech-curl-71',
        brandLogo: '/images/hero-slider/brand-fantech.png',
        productImage: '/images/hero-slider/fantech-curl-7-1.png',
        title: 'CURL 7.1',
        subtitle: 'RGB Gaming Headset',
        href: '/offers',
        titleColor: DEFAULT_TITLE_COLOR,
        subtitleColor: DEFAULT_SUBTITLE_COLOR,
        // Desktop composition as set in the admin panel: logo and text shifted
        // right and the product pulled left, closing the gap in the middle.
        desktop: {
          product: { x: 61.5, y: 53, w: 36, h: 0, z: 1 },
          logo: { x: 29, y: 39, w: 11, h: 0, z: 2 },
          text: { x: 41, y: 59, w: 37, z: 3, size: 7.6, subSize: 1.55, align: 'left' },
        },
        mobile: defaultLayout('mobile'),
      },
    ],
  }
}

/**
 * Adds seed slides the saved DB has never seen, each at the index it holds in
 * the seed — so a new slide added to the front of seedDB() shows up first for
 * existing visitors too, not tacked on the end.
 */
function mergeSeedSlides(existing: HeroSlide[], seed: HeroSlide[]): HeroSlide[] {
  const have = new Set(existing.map((s) => s.productImage))
  const merged = [...existing]
  seed.forEach((s, i) => {
    if (have.has(s.productImage)) return
    merged.splice(Math.min(i, merged.length), 0, s)
  })
  return merged
}

/** Moves untouched slides onto the current seed composition for their product. */
function retuneStaleDesktop(slide: HeroSlide): HeroSlide {
  if (!slide.desktop) return slide
  const saved = JSON.stringify(slide.desktop)
  if (!SUPERSEDED_DESKTOP.some((l) => JSON.stringify(l) === saved)) return slide
  const seeded = seedDB().slides.find((s) => s.productImage === slide.productImage)
  return { ...slide, desktop: seeded ? seeded.desktop : defaultLayout('desktop') }
}

/** Fills in any layout a slide is missing so older saved DBs keep working. */
function normalizeSlide(slide: HeroSlide): HeroSlide {
  const fill = (device: Device): SlideLayout => {
    const base = defaultLayout(device)
    const saved = slide[device]
    if (!saved) return base
    return {
      product: { ...base.product, ...saved.product },
      logo: { ...base.logo, ...saved.logo },
      text: { ...base.text, ...saved.text },
    }
  }
  return {
    ...slide,
    titleColor: slide.titleColor || DEFAULT_TITLE_COLOR,
    subtitleColor: slide.subtitleColor || DEFAULT_SUBTITLE_COLOR,
    desktop: fill('desktop'),
    mobile: fill('mobile'),
  }
}

function readDB(): HeroSliderDB {
  if (typeof window === 'undefined') return seedDB()
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (!raw) {
      const seeded = seedDB()
      localStorage.setItem(DB_KEY, JSON.stringify(seeded))
      localStorage.setItem(VERSION_KEY, String(SEED_VERSION))
      return seeded
    }
    const parsed = JSON.parse(raw) as Partial<HeroSliderDB>
    if (!Array.isArray(parsed.slides)) return seedDB()

    const storedVersion = Number(localStorage.getItem(VERSION_KEY) ?? '0')
    if (storedVersion < SEED_VERSION) {
      const seed = seedDB()
      const migrated: HeroSliderDB = {
        bgDesktop: parsed.bgDesktop || seed.bgDesktop,
        bgMobile: parsed.bgMobile || seed.bgMobile,
        slides: mergeSeedSlides(parsed.slides, seed.slides).map(normalizeSlide).map(retuneStaleDesktop),
      }
      localStorage.setItem(DB_KEY, JSON.stringify(migrated))
      localStorage.setItem(VERSION_KEY, String(SEED_VERSION))
      return migrated
    }

    return {
      bgDesktop: parsed.bgDesktop ?? '',
      bgMobile: parsed.bgMobile ?? '',
      slides: parsed.slides.map(normalizeSlide),
    }
  } catch {
    return seedDB()
  }
}

function writeDB(db: HeroSliderDB) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
  getChannel()?.postMessage({ kind: 'db' })
  window.dispatchEvent(new Event(LOCAL_EVENT))
}

export function useHeroSliderStore(): { db: HeroSliderDB; ready: boolean } {
  const [db, setDb] = useState<HeroSliderDB>(seedDB)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setDb(readDB())
    setReady(true)
    const refresh = () => setDb(readDB())
    const ch = getChannel()
    const onMessage = (e: MessageEvent<{ kind: string }>) => {
      if (e.data?.kind === 'db') refresh()
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === DB_KEY) refresh()
    }
    ch?.addEventListener('message', onMessage)
    window.addEventListener(LOCAL_EVENT, refresh)
    window.addEventListener('storage', onStorage)
    return () => {
      ch?.removeEventListener('message', onMessage)
      window.removeEventListener(LOCAL_EVENT, refresh)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return { db, ready }
}

export function updateBackground(patch: Partial<Pick<HeroSliderDB, 'bgDesktop' | 'bgMobile'>>) {
  writeDB({ ...readDB(), ...patch })
}

export function addSlide() {
  const db = readDB()
  const slide: HeroSlide = {
    id: makeId(),
    brandLogo: '',
    productImage: '',
    title: 'PRODUCT NAME',
    subtitle: 'Short tagline',
    href: '/',
    titleColor: DEFAULT_TITLE_COLOR,
    subtitleColor: DEFAULT_SUBTITLE_COLOR,
    desktop: defaultLayout('desktop'),
    mobile: defaultLayout('mobile'),
  }
  db.slides = [...db.slides, slide]
  writeDB(db)
  return slide
}

export function updateSlide(slideId: string, patch: Partial<Omit<HeroSlide, 'id'>>) {
  const db = readDB()
  db.slides = db.slides.map((s) => (s.id === slideId ? { ...s, ...patch } : s))
  writeDB(db)
}

/** Patch one layer's geometry for one device, leaving the other device untouched. */
export function updateLayout(
  slideId: string,
  device: Device,
  part: SlidePart,
  patch: Partial<ImageBox> | Partial<TextBox>
) {
  const db = readDB()
  db.slides = db.slides.map((s) => {
    if (s.id !== slideId) return s
    const layout = s[device]
    return {
      ...s,
      [device]: { ...layout, [part]: { ...layout[part], ...patch } },
    }
  })
  writeDB(db)
}

export function resetLayout(slideId: string, device: Device, part: SlidePart) {
  const db = readDB()
  db.slides = db.slides.map((s) =>
    s.id === slideId ? { ...s, [device]: { ...s[device], [part]: defaultLayout(device)[part] } } : s
  )
  writeDB(db)
}

export function removeSlide(slideId: string) {
  const db = readDB()
  db.slides = db.slides.filter((s) => s.id !== slideId)
  writeDB(db)
}

export function reorderSlide(slideId: string, direction: -1 | 1) {
  const db = readDB()
  const list = [...db.slides]
  const index = list.findIndex((s) => s.id === slideId)
  const target = index + direction
  if (index === -1 || target < 0 || target >= list.length) return
  ;[list[index], list[target]] = [list[target], list[index]]
  db.slides = list
  writeDB(db)
}

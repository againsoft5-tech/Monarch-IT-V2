/** Demo category catalog for live-edit selects (later → admin DB). */

export type DemoCategory = {
  id: string
  name: string
  img: string
  href: string
}

export const DEMO_CATEGORIES: DemoCategory[] = [
  {
    id: 'cat-desktop',
    name: 'Desktop',
    img: '/images/image/cache/catalog/website/featured-category/desktop-3d.png',
    href: '/desktops',
  },
  {
    id: 'cat-laptop',
    name: 'Laptop',
    img: '/images/image/cache/catalog/website/featured-category/laptop-3d.png',
    href: '/laptop',
  },
  {
    id: 'cat-components',
    name: 'Components',
    img: '/images/image/cache/catalog/website/featured-category/graphics-card-3d.png',
    href: '/component',
  },
  {
    id: 'cat-monitor',
    name: 'Monitor',
    img: '/images/image/cache/catalog/website/featured-category/monitor-500x400.png',
    href: '/monitor',
  },
  {
    id: 'cat-mobile-accessories',
    name: 'Mobile Accessories',
    img: '/images/image/cache/catalog/website/featured-category/smartphone-500x400.png',
    href: '/mobile-accessories',
  },
  {
    id: 'cat-security',
    name: 'Security',
    img: '/images/image/cache/catalog/website/featured-category/camera-icon-images-500x400.png',
    href: '/security',
  },
  {
    id: 'cat-gadget',
    name: 'Gadget',
    img: '/images/image/cache/catalog/website/featured-category/drone-icon-500x400.png',
    href: '/gadget',
  },
  {
    id: 'cat-ups',
    name: 'UPS',
    img: '/images/image/cache/catalog/website/featured-category/desktop-3d.png',
    href: '/ups-ips',
  },
  {
    id: 'cat-networking',
    name: 'Networking',
    img: '/images/image/cache/catalog/website/featured-category/graphics-card-3d.png',
    href: '/networking',
  },
  {
    id: 'cat-gaming',
    name: 'Gaming',
    img: '/images/image/cache/catalog/website/featured-category/drone-icon-500x400.png',
    href: '/gaming',
  },
  {
    id: 'cat-office',
    name: 'Office Equipment',
    img: '/images/image/cache/catalog/website/featured-category/monitor-500x400.png',
    href: '/office-equipments',
  },
  {
    id: 'cat-server',
    name: 'Server & Storage',
    img: '/images/image/cache/catalog/website/featured-category/desktop-3d.png',
    href: '/server-and-storage',
  },
  {
    id: 'cat-refrigerator',
    name: 'Refrigerator',
    img: '/images/image/cache/catalog/website/featured-category/desktop-3d.png',
    href: '/refrigerator',
  },
]

export function demoCategoryById(id: string | undefined | null): DemoCategory | undefined {
  if (!id) return undefined
  return DEMO_CATEGORIES.find((c) => c.id === id)
}

export function demoCategoryByName(name: string | undefined | null): DemoCategory | undefined {
  if (!name) return undefined
  const key = name.trim().toLowerCase()
  return DEMO_CATEGORIES.find((c) => c.name.toLowerCase() === key)
}

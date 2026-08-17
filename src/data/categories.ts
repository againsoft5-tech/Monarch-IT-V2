export const featuredCategories = [
  { name: 'Desktop',         img: '/images/image/cache/catalog/website/featured-category/desktop-3d.png',              href: '/desktops' },
  { name: 'Laptop',          img: '/images/image/cache/catalog/website/featured-category/laptop-3d.png',               href: '/laptop' },
  { name: 'Components',      img: '/images/image/cache/catalog/website/featured-category/graphics-card-3d.png',        href: '/component' },
  { name: 'Monitor',         img: '/images/image/cache/catalog/website/featured-category/monitor-500x400.png',         href: '/monitor' },
  { name: 'Mobile',           img: '/images/image/cache/catalog/website/featured-category/smartphone-500x400.png',   href: '/mobile-accessories' },
  { name: 'Security',        img: '/images/image/cache/catalog/website/featured-category/camera-icon-images-500x400.png', href: '/security' },
  { name: 'Gadget',          img: '/images/image/cache/catalog/website/featured-category/drone-icon-500x400.png',      href: '/gadget' },
]

// Top-level "Shop" categories mirroring monarchit.com.bd's IT/electronics catalog.
// Categories that already exist above (Monitor, Air Conditioner) are intentionally
// left out here since they're already registered with their own slug/subs.
export const shopTopCategories = [
  { name: 'Desktop', href: '/desktops' },
  { name: 'Laptop', href: '/laptop' },
  { name: 'Components', href: '/component' },
  { name: 'UPS', href: '/ups-ips' },
  { name: 'Office Equipment', href: '/office-equipments' },
  { name: 'Mobile Accessories', href: '/mobile-accessories' },
  { name: 'Security', href: '/security' },
  { name: 'Networking', href: '/networking' },
  { name: 'Accessories', href: '/accessories' },
  { name: 'Server & Storage', href: '/server-and-storage' },
  { name: 'Gadget', href: '/gadget' },
  { name: 'Gaming', href: '/gaming' },
]

export type ShopSub = { name: string; href: string }
export type ShopCategory = { name: string; href: string; sub: ShopSub[] }

export const shopCategories: ShopCategory[] = [
  {
    name: 'Desktop',
    href: '/desktops',
    sub: [
      { name: 'All Desktop', href: '/desktops' },
      { name: 'Gaming Desktop', href: '/desktops' },
      { name: 'Mini PC', href: '/desktops' },
      { name: 'All in One PC', href: '/desktops' },
      { name: 'Workstation', href: '/desktops' },
    ],
  },
  {
    name: 'Laptop',
    href: '/laptop',
    sub: [
      { name: 'All Laptop', href: '/laptop' },
      { name: 'Gaming Laptop', href: '/laptop' },
      { name: 'Laptop Accessories', href: '/laptop' },
      { name: 'Laptop Bag', href: '/laptop' },
      { name: 'Premium Ultrabook', href: '/laptop' },
    ],
  },
  {
    name: 'PC Components',
    href: '/component',
    sub: [
      { name: 'Processor', href: '/component' },
      { name: 'Motherboard', href: '/component' },
      { name: 'Graphics Card', href: '/component' },
      { name: 'RAM', href: '/component' },
      { name: 'SSD & HDD', href: '/component' },
      { name: 'Power Supply', href: '/component' },
      { name: 'Casing', href: '/component' },
      { name: 'CPU Cooler', href: '/component' },
    ],
  },
  {
    name: 'Monitor',
    href: '/monitor',
    sub: [
      { name: 'Gaming Monitor', href: '/monitor' },
      { name: 'Office Monitor', href: '/monitor' },
      { name: 'Curved Monitor', href: '/monitor' },
      { name: 'Portable Monitor', href: '/monitor' },
    ],
  },
  {
    name: 'UPS',
    href: '/ups-ips',
    sub: [
      { name: 'Online UPS', href: '/ups-ips' },
      { name: 'Offline UPS', href: '/ups-ips' },
      { name: 'IPS', href: '/ups-ips' },
      { name: 'Stabilizer', href: '/ups-ips' },
    ],
  },
  {
    name: 'Office Equipment',
    href: '/office-equipments',
    sub: [
      { name: 'Printer', href: '/office-equipments' },
      { name: 'Scanner', href: '/office-equipments' },
      { name: 'Photocopier', href: '/office-equipments' },
      { name: 'Projector', href: '/office-equipments' },
      { name: 'Shredder', href: '/office-equipments' },
    ],
  },
  {
    name: 'Mobile Accessories',
    href: '/mobile-accessories',
    sub: [
      { name: 'Power Bank', href: '/mobile-accessories' },
      { name: 'Mobile Cover', href: '/mobile-accessories' },
      { name: 'Charger', href: '/mobile-accessories' },
      { name: 'Earphone', href: '/mobile-accessories' },
      { name: 'Smart Watch', href: '/mobile-accessories' },
    ],
  },
  {
    name: 'AC',
    href: '/air-conditioner',
    sub: [{ name: 'All Air Conditioner', href: '/air-conditioner' }],
  },
  {
    name: 'Security',
    href: '/security',
    sub: [
      { name: 'CCTV Camera', href: '/security' },
      { name: 'DVR & NVR', href: '/security' },
      { name: 'Access Control', href: '/security' },
      { name: 'Door Lock', href: '/security' },
    ],
  },
  {
    name: 'Networking',
    href: '/networking',
    sub: [
      { name: 'Router', href: '/networking' },
      { name: 'Switch', href: '/networking' },
      { name: 'Access Point', href: '/networking' },
      { name: 'Network Cable', href: '/networking' },
    ],
  },
  {
    name: 'Accessories',
    href: '/accessories',
    sub: [{ name: 'All Accessories', href: '/accessories' }],
  },
  {
    name: 'Server & Storage',
    href: '/server-and-storage',
    sub: [{ name: 'All Server & Storage', href: '/server-and-storage' }],
  },
  {
    name: 'Gadget',
    href: '/gadget',
    sub: [{ name: 'All Gadget', href: '/gadget' }],
  },
  {
    name: 'Gaming',
    href: '/gaming',
    sub: [{ name: 'All Gaming', href: '/gaming' }],
  },
]

export const drawerCategories = [
  {
    name: 'Television', icon: 'tv', href: '/monitor',
    sub: [
      { name: 'TCL',               href: '/tcl-tv' },
      { name: 'Haier',             href: '/haier-tv' },
      { name: 'Samsung',           href: '/samsung-tv' },
      { name: 'Sony',              href: '/sony-tv' },
      { name: 'LG',                href: '/lg-television' },
      { name: 'Hisense',           href: '/hisense-tv' },
      { name: 'Daewoo',            href: '/daewoo-television' },
      { name: 'More Brands',       href: '/more-brands' },
      { name: 'TV Stand & Wall Mount', href: '/tv-stand-wall-mount' },
    ],
  },
  {
    name: 'Interactive Flat Panel', icon: 'aspect_ratio', href: '/interactive-flat-panel-display',
    sub: [
      { name: 'Dahua',    href: '/dahua' },
      { name: 'Optoma',   href: '/optoma-1' },
      { name: 'BenQ',     href: '/benq-interactive-flat-panel' },
      { name: 'Newline',  href: '/newline-interactive-flat-panels' },
      { name: 'Armor',    href: '/armor-interactive-flat-panel' },
      { name: 'Hitachi',  href: '/hitachi-interactive-flat-panel' },
      { name: 'Boxlight', href: '/boxlight-interactive-flat-panel' },
      { name: 'Trolly',   href: '/flat-panel-trolly' },
    ],
  },
  {
    name: 'Air Conditioner', icon: 'ac_unit', href: '/air-conditioner',
    sub: [
      { name: 'Haier',       href: '/haier-air-conditioner' },
      { name: 'Gree',        href: '/gree-ac-price-in-bd' },
      { name: 'Samsung',     href: '/samsung-ac' },
      { name: 'Midea',       href: '/air-conditioner' },
      { name: 'Hisense',     href: '/hisense-air-conditioners' },
      { name: 'More Brands', href: '/more-ac-brands' },
    ],
  },
  {
    name: 'Washing Machine', icon: 'local_laundry_service', href: '/washing-machine',
    sub: [
      { name: 'Haier',     href: '/haier-washing-machine' },
      { name: 'LG',        href: '/lg-washing-machine' },
      { name: 'Sharp',     href: '/sharp-washing-machine' },
      { name: 'Samsung',   href: '/samsung-washing-machine' },
      { name: 'Whirlpool', href: '/whirlpool-washing-machine' },
      { name: 'Hisense',   href: '/hisense-washing-machine' },
    ],
  },
  {
    name: 'Refrigerator', icon: 'kitchen', href: '/refrigerator',
    sub: [
      { name: 'Haier',   href: '/haier-refrigerator' },
      { name: 'Samsung', href: '/samsung-refrigerator' },
      { name: 'Sharp',   href: '/sharp-refrigerator' },
      { name: 'Hisense', href: '/hisense-refrigerator' },
    ],
  },
  {
    name: 'Home Appliance', icon: 'local_cafe', href: '/home-appliance',
    sub: [
      { name: 'Microwave Oven',  href: '/oven' },
      { name: 'Mixer Grinder',   href: '/mixer-grinder' },
      { name: 'Daily Lifestyle', href: '/home-appliance-daily-products' },
      { name: 'Iron',            href: '/iron-machine' },
      { name: 'Air Fryer',       href: '/air-fryer' },
      { name: 'Vacuum Cleaner',  href: '/vacuum-cleaner' },
    ],
  },
  {
    name: 'Monitor', icon: 'desktop_windows', href: '/monitor',
    sub: [
      { name: 'BENQ',    href: '/benq-monitor' },
      { name: 'Dahua',   href: '/dahua-monitors' },
      { name: 'Dell',    href: '/dell-monitor' },
      { name: 'HP',      href: '/hp-monitor' },
      { name: 'LG',      href: '/lg-monitors' },
      { name: 'Xiaomi',  href: '/Xiaomi-Monitor' },
    ],
  },
  {
    name: 'Computer Items', icon: 'memory', href: '/computer-accessories',
    sub: [
      { name: 'Router',    href: '/router' },
      { name: 'Combo',     href: '/combo' },
      { name: 'Keyboard',  href: '/keyboard' },
      { name: 'Mouse',     href: '/computer-mouse' },
      { name: 'Pendrives', href: '/pendrives' },
      { name: 'Projector', href: '/projector' },
      { name: 'RAM',       href: '/ram' },
      { name: 'SSD',       href: '/ssd' },
    ],
  },
  {
    name: 'Home Theatre', icon: 'movie', href: '/home-theatre',
    sub: [
      { name: 'Soundbar',          href: '/soundbar-price-in-bd' },
      { name: 'Speakers',          href: '/speakers' },
      { name: 'Portable Speakers', href: '/portable-bluetooth-speakers' },
    ],
  },
  {
    name: 'Water Heater', icon: 'hot_tub', href: '/water-heater',
    sub: [
      { name: 'Haier',    href: '/water-heater-haier' },
      { name: 'Konka',    href: '/water-heater-konka' },
      { name: 'Midea',    href: '/water-heater-midea' },
      { name: 'Panasonic', href: '/panasonic-water-heater' },
    ],
  },
  {
    name: 'IoT', icon: 'settings_input_antenna', href: '/iot',
    sub: [
      { name: 'Home Security',              href: '/home-security' },
      { name: 'Activity Trackers',          href: '/activity-trackers' },
      { name: 'Industrial Security & Safety', href: '/industrial-security-and-safety' },
      { name: 'Augmented Reality Glasses',  href: '/augmented-reality-glasses' },
      { name: 'Motion Detection',           href: '/motion-detection' },
    ],
  },
]

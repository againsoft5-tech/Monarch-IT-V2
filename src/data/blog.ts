/**
 * Blog content.
 *
 * PLACEHOLDER CONTENT: only "how-to-select-memory-cards-for-my-pc-build" carries
 * real copy (transcribed from the design). Every other post here exists so the
 * category filter, search and pagination have something to work against — swap
 * the array for the real feed when the CMS lands. The shape is what matters:
 * anything that satisfies `BlogPost` renders.
 */

/** The twelve filter chips, in the order the artwork lists them (column-major). */
export const BLOG_CATEGORIES = [
  'Technology',
  'Gaming',
  'PC & Components',
  'Laptop & Accessories',
  'Networking',
  'Software & Apps',
  'Buying Guide',
  'How-To & Tips',
  'Product Reviews',
  'Tech News',
  'Productivity',
  'Troubleshooting',
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

/** A bullet may lead with a bold label, as the article body does throughout. */
export type Bullet = { label?: string; text: string }
export type BlogBlock = { p: string } | { ul: Bullet[] }

export type BlogPost = {
  slug: string
  title: string
  author: string
  /** ISO date; rendered as "September 5, 2026". */
  date: string
  categories: BlogCategory[]
  image: string
  featured?: boolean
  excerpt: string
  body: BlogBlock[]
}

const IMG = '/images/blog/memory-cards-pc-build.jpg'
const AUTHOR = 'Arabi Rayan'

/** Stand-in body for the seeded posts that have no real copy yet. */
function placeholderBody(topic: string): BlogBlock[] {
  return [
    {
      p: `This article covers ${topic}. Replace this copy with the real article body — the layout renders paragraphs and bulleted lists, with an optional bold label at the start of each bullet.`,
    },
    {
      ul: [
        { label: 'What you need:', text: 'the parts and tools worth having on hand before you start.' },
        { label: 'Where people go wrong:', text: 'the mistakes that cost the most time to undo.' },
        { label: 'Our recommendation:', text: 'what we would fit in a build we were keeping.' },
      ],
    },
    { p: 'Talk to the Monarch IT team if you would like a second opinion before you buy.' },
  ]
}

const memoryCardsPost: BlogPost = {
  slug: 'how-to-select-memory-cards-for-my-pc-build',
  title: 'How to select Memory cards for my PC Build',
  author: AUTHOR,
  date: '2026-09-05',
  categories: ['PC & Components', 'How-To & Tips'],
  image: IMG,
  featured: true,
  excerpt:
    'How many RAM modules your build actually needs, why pairs beat singles, and how much memory each kind of workload really wants.',
  body: [
    {
      p: 'When selecting the number of memory cards (RAM modules) for your PC, consider the number of RAM slots available on your motherboard, aiming to fill as many as possible with identical modules for optimal performance, while also taking into account your usage needs: for basic tasks, 8GB might be sufficient, while heavy gaming or professional applications could require 16GB or more per slot; always check your motherboard manual for compatibility and recommended configurations. Key points to remember:',
    },
    {
      ul: [
        { label: 'Check your motherboard:', text: 'Identify how many RAM slots your motherboard has.' },
        {
          label: 'Dual-channel benefit:',
          text: 'For best performance, try to fill the slots in pairs with identical RAM modules to activate dual-channel mode.',
        },
        { label: 'Consider your usage:', text: '' },
        { label: 'Basic tasks:', text: '8GB might be enough.' },
        { label: 'Gaming:', text: '16GB is generally recommended.' },
        { label: 'Heavy applications:', text: '32GB or more may be necessary.' },
        {
          label: 'Future-proofing:',
          text: 'If you plan to upgrade later, consider buying less RAM now but with the option to add more modules in the same slots.',
        },
      ],
    },
    { p: 'Example scenarios:' },
    {
      ul: [
        { label: 'Standard PC user with basic needs:', text: 'A single 8GB RAM module might suffice.' },
        { label: 'Gamer:', text: 'Two 8GB RAM modules (16GB total) for optimal gaming experience.' },
        {
          label: 'Professional video editor:',
          text: 'Two 16GB RAM modules (32GB total) to handle large video files smoothly.',
        },
      ],
    },
    { p: 'more - https://www.shacknews.com/article/103317/selecting-the-best-memory-for-your-gaming-pc' },
  ],
}

/** Seeded stand-ins: [title, categories, daysBeforeTheLeadPost, featured]. */
const seeds: [string, BlogCategory[], number, boolean?][] = [
  ['Picking the right power supply for a gaming build', ['PC & Components', 'Buying Guide'], 2, true],
  ['SSD vs HDD: what still makes sense in 2026', ['PC & Components', 'Buying Guide'], 4, true],
  ['Five laptop upgrades that are actually worth it', ['Laptop & Accessories', 'How-To & Tips'], 6, true],
  ['Setting up mesh Wi-Fi in a concrete flat', ['Networking', 'How-To & Tips'], 8, true],
  ['A first look at the newest DDR5 kits', ['Tech News', 'Product Reviews'], 10],
  ['Mechanical keyboards, explained without the jargon', ['Product Reviews', 'Gaming'], 12],
  ['Keeping your PC cool through a Dhaka summer', ['Troubleshooting', 'How-To & Tips'], 14],
  ['The monitor spec sheet, decoded', ['Buying Guide', 'Technology'], 16],
  ['Free software every new PC owner should install', ['Software & Apps', 'Productivity'], 18],
  ['Why your machine slows down, and what fixes it', ['Troubleshooting', 'Productivity'], 20],
  ['Building a quiet workstation for long sessions', ['PC & Components', 'Productivity'], 22],
  ['Graphics cards: reading the numbers that matter', ['Gaming', 'Buying Guide'], 24],
  ['Backing up your work without thinking about it', ['Software & Apps', 'How-To & Tips'], 26],
  ['What changed in Wi-Fi 7', ['Networking', 'Tech News'], 28],
  ['Choosing a laptop for university', ['Laptop & Accessories', 'Buying Guide'], 30],
  ['Cable management that survives the next upgrade', ['How-To & Tips', 'Technology'], 32],
  ['Is it time to move to a 2K monitor?', ['Product Reviews', 'Technology'], 34],
  ['Small-office networking on a budget', ['Networking', 'Productivity'], 36],
]

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Dates count back from the lead post so the feed reads newest-first. */
function dateBefore(days: number) {
  const d = new Date('2026-09-05T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

export const blogPosts: BlogPost[] = [
  memoryCardsPost,
  ...seeds.map(([title, categories, days, featured]) => ({
    slug: slugify(title),
    title,
    author: AUTHOR,
    date: dateBefore(days),
    categories,
    image: IMG,
    featured,
    excerpt: `${title} — placeholder summary.`,
    body: placeholderBody(title.toLowerCase()),
  })),
]

export const featuredPosts = blogPosts.filter((p) => p.featured)

export function getPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug)
}

/** Neighbours for the Previous / Next buttons on an article. */
export function getPostNeighbours(slug: string) {
  const i = blogPosts.findIndex((p) => p.slug === slug)
  return { prev: i > 0 ? blogPosts[i - 1] : undefined, next: i >= 0 ? blogPosts[i + 1] : undefined }
}

export function formatPostDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

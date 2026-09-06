import Link from 'next/link'
import { brandList, type BrandInfo } from '@/data/brandIndex'

/**
 * The house brands, in the order the artwork lists them. Any that carry no
 * products yet are dropped rather than linked to an empty page — Silicon Power
 * is the current example, and it reappears here on its own once stock lands.
 */
const TOP_BRAND_SLUGS = [
  'royal-kludge',
  't-wolf',
  'onikuma',
  'arctic',
  'oscoo',
  'silicon-power',
  'powercolor',
  'aiwa',
  'manli',
  'koorui',
]

const LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']

/** Anything that doesn't start with a letter files under "#". */
function bucketOf(brand: BrandInfo) {
  const first = brand.name.trim().charAt(0).toUpperCase()
  return first >= 'A' && first <= 'Z' ? first : '#'
}

type Section = { id: string; label: string; brands: BrandInfo[] }

function buildSections(): Section[] {
  const bySlug = new Map(brandList.map((b) => [b.slug, b]))
  const top = TOP_BRAND_SLUGS.map((slug) => bySlug.get(slug)).filter((b): b is BrandInfo => Boolean(b))

  const sections: Section[] = [{ id: 'top', label: 'Top Brands', brands: top }]

  for (const letter of LETTERS) {
    const brands = brandList.filter((b) => bucketOf(b) === letter)
    sections.push({ id: letter === '#' ? 'num' : letter, label: letter, brands })
  }

  // An empty grey header over an empty white row reads as broken, so a letter we
  // stock nothing under is dimmed in the jump bar instead of given a section.
  return sections.filter((s) => s.brands.length > 0)
}

export default function BrandsPage() {
  const sections = buildSections()
  const filled = new Map(sections.map((s) => [s.label, s.id]))

  const jumpItems = [{ label: 'Top Brands', bold: true }, ...LETTERS.map((l) => ({ label: l, bold: false }))]

  return (
    <div className="bg-white">
      <div className="container mx-auto pt-6 pb-14 md:pt-8 md:pb-20">
        <div className="max-w-[1240px] mx-auto">
          <h1 className="text-center text-[24px] md:text-[30px] font-bold text-[#4d4d4d] m-0">
            Shop our favourite brands
          </h1>

          {/* Jump bar. Narrow screens can't fit 28 stops, so it scrolls sideways. */}
          <nav aria-label="Jump to a letter" className="mt-7 md:mt-9 overflow-x-auto no-scrollbar">
            <div className="min-w-[760px] flex items-center justify-between gap-x-1 h-[34px] md:h-[38px] px-5 rounded-full bg-[#d32f2f]">
              {jumpItems.map((item) => {
                const id = filled.get(item.label)
                const className = `text-[12.5px] md:text-[13.5px] leading-none ${item.bold ? 'font-bold' : ''}`

                return id ? (
                  <Link
                    key={item.label}
                    href={`#brand-${id}`}
                    className={`${className} text-white no-underline transition-opacity hover:opacity-70`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span key={item.label} className={`${className} text-white/40`} aria-disabled>
                    {item.label}
                  </span>
                )
              })}
            </div>
          </nav>

          <div className="mt-5 md:mt-6 rounded-[10px] border border-[#e2e2e2] divide-y divide-[#e2e2e2] overflow-hidden">
            {sections.map((section) => (
              <section key={section.id} id={`brand-${section.id}`} className="scroll-mt-28">
                <h2 className="m-0 px-5 md:px-6 py-2.5 bg-[#f5f5f7] border-b border-[#e8e8e8] text-[13px] md:text-[13.5px] font-normal text-[#4d4d4d]">
                  {section.label}
                </h2>

                <ul className="list-none m-0 px-5 md:px-8 py-5 md:py-6 grid gap-x-4 gap-y-3.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                  {section.brands.map((brand) => (
                    <li key={brand.slug} className="min-w-0">
                      <Link
                        href={`/brands/${brand.slug}`}
                        title={`${brand.name} — ${brand.productCount} product${brand.productCount === 1 ? '' : 's'}`}
                        className="block truncate text-[13px] md:text-[13.5px] text-[#3d3d3d] no-underline transition-colors hover:text-[#d32f2f]"
                      >
                        {brand.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

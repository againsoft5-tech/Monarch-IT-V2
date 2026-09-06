import Link from 'next/link'
import type { Block, PolicyDoc } from '@/data/policies/types'

const BN_DIGITS = '০১২৩৪৫৬৭৮৯'

/** Numbering is shown in Bengali digits, as in the artwork and the source documents. */
function bn(n: number) {
  return String(n)
    .split('')
    .map((d) => BN_DIGITS[Number(d)])
    .join('')
}

const RULE = 'h-px bg-[#e6e6e6]'

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        if ('ul' in block) {
          return (
            <ul key={i} className="list-none m-0 mt-1 p-0">
              {block.ul.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-[10px] w-[3px] h-[3px] shrink-0 rounded-full bg-[#3d3d3d]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )
        }
        if ('ol' in block) {
          return (
            <ol key={i} className="list-none m-0 mt-1 p-0">
              {block.ol.map((item, j) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="shrink-0">{bn(j + 1)}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          )
        }
        if ('b' in block) {
          return (
            <p key={i} className="m-0 mt-3 first:mt-0 font-bold text-[#2b2b2b]">
              {block.b}
            </p>
          )
        }
        return (
          <p key={i} className="m-0 mt-1.5 first:mt-0">
            {block.p}
          </p>
        )
      })}
    </>
  )
}

export default function PolicyPage({ doc }: { doc: PolicyDoc }) {
  return (
    <div className="bg-white">
      <div className="container mx-auto pt-4 pb-16 md:pt-6 md:pb-24">
        <div className="max-w-[1240px] mx-auto">
          <h1 className="text-[26px] md:text-[32px] font-bold text-[#2b2b2b] m-0">{doc.title}</h1>
          <p className="mt-2 m-0 text-[12px] md:text-[12.5px] text-[#6b6b6b]">
            Updated {doc.updated} &nbsp;&bull;&nbsp; Reviewed by{' '}
            <span className="font-bold text-[#3d3d3d]">{doc.reviewer}</span> {doc.reviewerSuffix}
          </p>

          <div className={`${RULE} mt-4`} />

          {/* Everything below the masthead is set in Kalpurush, which carries both
              the Bengali and the Latin letterforms the artwork uses. */}
          <div className="font-bn text-[13.5px] md:text-[14.5px] leading-[1.7] text-[#3d3d3d]">
            <nav aria-labelledby="policy-index" className="mt-5">
              <p id="policy-index" className="m-0 font-bold text-[#2b2b2b]">
                Index:
              </p>
              <ol className="list-none m-0 mt-4 p-0 pl-6 md:pl-12">
                {doc.sections.map((s) => (
                  <li key={s.n}>
                    {!s.unnumbered && <span className="text-[#3d3d3d]">{bn(s.n)}. </span>}
                    <Link
                      href={`#section-${s.n}`}
                      className="text-[#3d3d3d] underline underline-offset-[3px] decoration-[#b9b9b9] transition-colors hover:text-[#d32f2f] hover:decoration-[#d32f2f]"
                    >
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>

            <div className={`${RULE} mt-7`} />

            {doc.intro.length > 0 && (
              <div className="mt-5 space-y-1.5">
                {doc.intro.map((text) => (
                  <p key={text} className="m-0">
                    {text}
                  </p>
                ))}
              </div>
            )}

            {doc.sections.map((section) => (
              <section key={section.n} id={`section-${section.n}`} className="scroll-mt-28">
                <div className={`${RULE} mt-7`} />
                <h2 className="m-0 py-4 text-[15.5px] md:text-[17px] font-normal text-[#2b2b2b]">
                  {section.unnumbered ? section.title : `${bn(section.n)}. ${section.title}`}
                </h2>
                <div className={RULE} />
                <div className="mt-6">
                  <Blocks blocks={section.blocks} />
                </div>
              </section>
            ))}
          </div>

          <div className="mt-14 md:mt-20 flex justify-center">
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2.5 h-[42px] md:h-[46px] px-6 md:px-7 rounded-full border-2 border-[#d32f2f] text-[#d32f2f] text-[15px] md:text-[16px] font-medium no-underline transition-colors hover:bg-[#d32f2f] hover:text-white"
            >
              <span className="mi text-[20px] md:text-[22px]">call</span>
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

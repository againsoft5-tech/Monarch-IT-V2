/* eslint-disable @next/next/no-img-element -- local SVG art; next/image cannot
   optimise SVG without `dangerouslyAllowSVG`, and these files are already tiny. */
import Link from 'next/link'

const ART = '/images/about'

const keyFacts = [
  { label: 'Established', value: '1991' },
  { label: 'Industry', value: 'Information Technology' },
  { label: 'Business Type', value: 'Distribution, Retail & E-commerce' },
  { label: 'Coverage', value: 'Nationwide' },
  { label: 'Tagline', value: 'Create The Future' },
]

const brandAssurances = [
  { icon: 'official-distributor', label: 'Official Distributor' },
  { icon: 'authentic-products', label: 'Authentic Products' },
  { icon: 'nationwide-service', label: 'Nationwide Service' },
]

const businessItems = [
  { icon: 'laptop_mac', label: 'Laptops & Desktops' },
  { icon: 'sports_esports', label: 'Custom Gaming PCs' },
  { icon: 'memory', label: 'Components & Accessories' },
  { icon: 'monitor', label: 'Monitors & Displays' },
  { icon: 'wifi', label: 'Networking Solutions' },
  { icon: 'watch', label: 'Smart Gadgets' },
  { icon: 'settings', label: 'Professional Technology Solutions' },
]

/**
 * Our Mission dial geometry. Everything hangs off one centre: the red half-ring,
 * the dotted ring the spokes start from, and the outer ring their end bullets sit on.
 */
const DIAL = { cx: 230, cy: 270, ringOuter: 115, ringInner: 80, dotR: 169, spokeR: 236 }

/** Each spoke is purely radial — same angle for its start bullet, line and end bullet. */
const missionItems = [
  { angle: -60, bold: 'Deliver', rest: 'authentic', line2: 'technology products' },
  { angle: -30, bold: 'Ensure', rest: 'exceptional', line2: 'customer service' },
  { angle: 0, bold: 'Build', rest: 'strong global', line2: 'partnerships' },
  { angle: 30, bold: 'Empower', rest: 'creators,', line2: 'gamers & businesses' },
  { angle: 60, bold: 'Support', rest: 'Bangladesh’s', line2: 'digital transformation' },
]

function polar(angleDeg: number, radius: number) {
  const a = (angleDeg * Math.PI) / 180
  return { x: DIAL.cx + radius * Math.cos(a), y: DIAL.cy + radius * Math.sin(a) }
}

const spokeAngles = new Set(missionItems.map((s) => s.angle))

/** Small grey dots every 10°, minus the slots the spoke bullets occupy. */
const dialDots = Array.from({ length: 19 }, (_, i) => -90 + i * 10)
  .filter((angle) => !spokeAngles.has(angle))
  .map((angle) => ({
    angle,
    ...polar(angle, DIAL.dotR),
    r: Math.abs(angle) === 90 ? 6.5 : 3,
    fill: Math.abs(angle) === 90 ? '#b5b5b5' : '#cbcbcb',
  }))

/** The grey crescent that sits behind each section label. */
function SectionSwoosh() {
  return (
    <img
      src={`${ART}/left-top-shape.svg`}
      alt=""
      aria-hidden
      className="pointer-events-none absolute left-0 top-[-26px] w-[46px] h-[46px] desk:top-[-30px] desk:w-[62px] desk:h-[62px] z-0"
    />
  )
}

/** The Our Mission dial — red half-ring, dotted outer ring, five labelled spokes. */
function MissionDial() {
  return (
    <svg viewBox="88 34 552 478" className="w-full max-w-[620px] h-auto" role="img" aria-label="Our Mission">
      <text x="258" y="282" textAnchor="end" fontSize="26" fontWeight="700" fill="#1a1a1a">
        Our Mission
      </text>

      {/* red half-ring, open to the left */}
      <path
        d={`M${DIAL.cx} ${DIAL.cy - DIAL.ringOuter}
            A${DIAL.ringOuter} ${DIAL.ringOuter} 0 0 1 ${DIAL.cx} ${DIAL.cy + DIAL.ringOuter}
            L${DIAL.cx} ${DIAL.cy + DIAL.ringInner}
            A${DIAL.ringInner} ${DIAL.ringInner} 0 0 0 ${DIAL.cx} ${DIAL.cy - DIAL.ringInner} Z`}
        fill="#c1272d"
      />

      {dialDots.map((d) => (
        <circle key={d.angle} cx={d.x} cy={d.y} r={d.r} fill={d.fill} />
      ))}

      {missionItems.map((item) => {
        const start = polar(item.angle, DIAL.dotR)
        const end = polar(item.angle, DIAL.spokeR)
        const lineFrom = polar(item.angle, DIAL.dotR + 7)
        const lineTo = polar(item.angle, DIAL.spokeR - 7)
        return (
          <g key={item.bold}>
            <line
              x1={lineFrom.x}
              y1={lineFrom.y}
              x2={lineTo.x}
              y2={lineTo.y}
              stroke="#b5b5b5"
              strokeWidth="1.2"
            />
            <circle cx={start.x} cy={start.y} r="6" fill="#a9a9a9" />
            <circle cx={end.x} cy={end.y} r="6" fill="#ffffff" stroke="#b0b0b0" strokeWidth="1.5" />
            <text x={end.x + 16} y={end.y - 9} fontSize="15" fill="#1a1a1a">
              <tspan fontWeight="700">{item.bold}</tspan>
              {` ${item.rest}`}
            </text>
            <text x={end.x + 16} y={end.y + 14} fontSize="15" fill="#1a1a1a">
              {item.line2}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function AboutUsPage() {
  return (
    <div className="bg-white">
      <div className="container mx-auto max-w-[1240px] pt-8 pb-16 md:pt-10 md:pb-20">
        {/* Stacked logo */}
        <div className="flex justify-center">
          <img
            src={`${ART}/monarch-it-logo-about-us-page.svg`}
            alt="Monarch IT Limited"
            className="w-[175px] md:w-[210px] h-auto"
          />
        </div>

        {/* About Us */}
        <section className="relative mt-12 md:mt-16 pl-[30px] desk:pl-[35px]">
          <SectionSwoosh />

          <div className="relative z-10">
            <p className="text-[12px] md:text-[13px] font-bold uppercase tracking-[0.12em] text-[#d32f2f] m-0">
              About Us
            </p>
            <h1 className="mt-1 text-[19px] md:text-[22px] text-[#1a1a1a] font-normal">
              About <span className="font-bold">Monarch IT</span>
            </h1>
          </div>

          <div className="relative z-10 mt-5 max-w-[1000px] space-y-4 text-[14.5px] md:text-[15.5px] leading-[1.8] text-[#444]">
            <p>
              Founded in 1991, Monarch IT Limited is one of Bangladesh&rsquo;s trusted technology distributors and
              retailers.
            </p>
            <p>
              For over <span className="font-bold text-[#1a1a1a]">35 years</span>, we have been delivering authentic
              technology products, innovative solutions, and reliable customer support across the country.
            </p>
            <p>
              Through distribution, retail and e-commerce operations, we serve consumers, businesses, creators,
              educational institutions, and corporate organizations.
            </p>
          </div>

          {/* Key Facts */}
          <div className="mt-9 md:mt-11 flex md:justify-center">
            <div>
              <h2 className="text-[14.5px] md:text-[15.5px] font-bold text-[#1a1a1a] m-0 mb-3">Key Facts</h2>
              <div className="border-l border-[#cfcfcf] pl-5">
                {keyFacts.map((f) => (
                  <div
                    key={f.label}
                    className="relative flex items-start gap-1.5 py-[5px] text-[13.5px] md:text-[14.5px]"
                  >
                    {/* 20px parent padding + 1px border + half the 8px dot, less half the
                        border, lands the dot centred on the rule rather than beside it. */}
                    <span className="absolute -left-[24.5px] top-[11px] w-[8px] h-[8px] rounded-full bg-[#d32f2f]" />
                    <span className="w-[96px] md:w-[112px] shrink-0 text-[#4a4a4a]">{f.label}</span>
                    <span className="text-[#4a4a4a] shrink-0">:</span>
                    <span className="font-bold text-[#1a1a1a]">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About our business */}
        <section className="relative mt-14 md:mt-20 pl-[30px] desk:pl-[35px]">
          <SectionSwoosh />

          <div className="relative z-10">
            <p className="text-[14px] md:text-[15px] uppercase tracking-[0.02em] text-[#1a1a1a] m-0">About Our</p>
            <h2 className="mt-0.5 text-[22px] md:text-[26px] font-bold uppercase text-[#d32f2f] m-0">Business</h2>
          </div>

          <p className="relative z-10 mt-3 max-w-[520px] text-[14.5px] md:text-[15.5px] leading-[1.75] text-[#444]">
            Monarch IT Limited bridges global technology innovation with the growing needs of Bangladesh.
          </p>

          <div className="mt-7 flex items-start gap-7 md:gap-12">
            <div className="w-[92px] h-[86px] md:w-[104px] md:h-[96px] shrink-0 rounded-[14px] bg-[#c1272d] flex items-center justify-center">
              <i className="fa-solid fa-gears text-white text-[38px] md:text-[44px]" />
            </div>

            <ul className="list-none p-0 m-0 space-y-3.5 md:space-y-4">
              {businessItems.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <span className="w-[26px] h-[26px] shrink-0 rounded-full border-[1.5px] border-[#d32f2f] flex items-center justify-center">
                    <span className="mi text-[14px] text-[#d32f2f]">{item.icon}</span>
                  </span>
                  <span className="text-[14.5px] md:text-[15.5px] font-bold text-[#1a1a1a]">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-14 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4">
          <div className="text-center">
            <div className="h-[72px] flex items-end justify-center">
              <span className="font-price text-[38px] md:text-[44px] font-bold leading-none text-[#d32f2f]">35+</span>
            </div>
            <p className="mt-3 text-[14px] md:text-[15px] font-bold text-[#1a1a1a] m-0">Years Experience</p>
          </div>

          <div className="text-center">
            <div className="h-[72px] flex items-end justify-center">
              <span className="font-price text-[38px] md:text-[44px] font-bold leading-none text-[#d32f2f]">9+</span>
            </div>
            <p className="mt-3 text-[14px] md:text-[15px] text-[#1a1a1a] m-0">
              Exclusive <span className="font-bold">Brands</span>
            </p>
          </div>

          <div className="text-center">
            <div className="h-[72px] flex items-end justify-center">
              <img src={`${ART}/map-logo.svg`} alt="" aria-hidden className="h-[68px] w-auto" />
            </div>
            <p className="mt-3 text-[14px] md:text-[15px] text-[#1a1a1a] m-0">64 District Coverage</p>
          </div>

          <div className="text-center">
            <div className="h-[72px] flex items-end justify-center">
              <img
                src={`${ART}/thousands-of-product-shape.svg`}
                alt=""
                aria-hidden
                className="h-[62px] w-auto"
              />
            </div>
            <p className="mt-3 text-[14px] md:text-[15px] text-[#1a1a1a] m-0">Thousands of Products</p>
          </div>
        </section>

        {/* Our Leadership */}
        <section className="mt-16 md:mt-24">
          <div className="text-center">
            <h2 className="text-[22px] md:text-[28px] font-bold text-[#d32f2f] m-0">Our Leadership</h2>
            <span className="mt-2.5 block w-[46px] h-[3px] rounded-full bg-[#d32f2f] mx-auto" />
          </div>

          {/* Founder */}
          <div className="mt-10 md:mt-14 grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-start">
            {/* The artwork carries ~57px of transparent space below the rings at this
                width. Harmless beside the text on desktop, but once the block stacks it
                reads as a gap, so it is pulled back out of the flow on mobile. */}
            <img
              src={`${ART}/babul-chandra-shaha.svg`}
              alt="Engr. Babul Chandra Saha, founder of Monarch IT Limited"
              className="w-[220px] md:w-[260px] h-auto mx-auto md:mx-0 -mb-[56px] md:mb-0"
            />
            <div className="max-w-[620px] text-[14px] md:text-[15px] leading-[1.75] text-[#444] md:pt-8">
              <p className="m-0">Monarch IT was founded by</p>
              <p className="mt-1 mb-4 text-[16px] md:text-[18px] font-bold uppercase text-[#d32f2f]">
                Engr. Babul Chandra Saha
              </p>
              <p className="mb-4">
                With a belief that technology should empower people and businesses, he established{' '}
                <span className="font-bold text-[#1a1a1a]">Monarch IT</span> with a mission to build trust, create
                opportunities, and contribute to Bangladesh&rsquo;s technological advancement.
              </p>
              <p className="m-0">
                His principles of integrity, reliability, and customer-first service continue to guide the
                organization today.
              </p>
            </div>
          </div>

          {/* Chairman */}
          <div className="mt-12 md:mt-16 grid md:grid-cols-[1fr_auto] gap-6 md:gap-10 items-start">
            <div className="order-2 md:order-1 max-w-[620px] md:ml-auto md:text-right text-[14px] md:text-[15px] leading-[1.75] text-[#444] md:pt-10">
              <p className="m-0 text-[16px] md:text-[18px] font-bold uppercase text-[#d32f2f]">Rama Saha</p>
              <p className="mt-0.5 mb-4 text-[13px] md:text-[14px] text-[#666]">Chairman</p>
              <p className="mb-4">
                At <span className="font-bold text-[#1a1a1a]">Monarch IT Limited</span>, we believe that technology is
                more than innovation it is a catalyst for progress, opportunity, and sustainable growth. Since our
                journey began, we have remained committed to delivering authentic technology products, building strong
                global partnerships, and creating lasting value for our customers and business partners.
              </p>
              <p className="mb-4">
                Our success is driven by integrity, innovation, and an unwavering commitment to excellence. As the
                technology landscape continues to evolve, we remain focused on expanding our portfolio, strengthening
                our nationwide presence, and contributing to Bangladesh&rsquo;s digital transformation.
              </p>
              <p className="m-0">
                I sincerely thank our customers, partners, and dedicated team members for their trust and continued
                support. Together, we will continue shaping a smarter and more connected future.
              </p>
            </div>
            <img
              src={`${ART}/rama-shaha.svg`}
              alt="Rama Saha, Chairman of Monarch IT Limited"
              className="order-1 md:order-2 w-[250px] md:w-[300px] h-auto mx-auto md:mx-0"
            />
          </div>
        </section>

        {/* Our Vision */}
        <section className="relative mt-16 md:mt-24 pl-[30px] desk:pl-[35px]">
          <SectionSwoosh />
          <h2 className="relative z-10 text-[18px] md:text-[22px] font-bold uppercase text-[#d32f2f] m-0">
            Our Vision
          </h2>
          <p className="relative z-10 mt-3 max-w-[600px] text-[14.5px] md:text-[15.5px] leading-[1.8] text-[#444]">
            To become Bangladesh&rsquo;s most trusted and innovative technology company by enabling people and
            businesses through world-class technology solutions.
          </p>
        </section>

        {/* Our Mission */}
        <section className="mt-12 md:mt-16">
          <div className="hidden md:flex justify-center">
            <MissionDial />
          </div>

          {/* The dial is unreadable at phone widths, so the same five points list out instead. */}
          <div className="md:hidden">
            <h2 className="text-[20px] font-bold text-[#1a1a1a] m-0 mb-4">Our Mission</h2>
            <ul className="list-none p-0 m-0 space-y-3">
              {missionItems.map((item) => (
                <li key={item.bold} className="flex items-start gap-3 text-[14.5px] leading-[1.7] text-[#1a1a1a]">
                  <span className="mt-[7px] w-[8px] h-[8px] shrink-0 rounded-full bg-[#c1272d]" />
                  <span>
                    <span className="font-bold">{item.bold}</span> {item.rest} {item.line2}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Our Global Brands */}
        <section className="mt-16 md:mt-24">
          <div className="relative pl-[30px] desk:pl-[35px]">
            <SectionSwoosh />
            <h2 className="relative z-10 text-[18px] md:text-[22px] font-bold uppercase text-[#d32f2f] m-0">
              Our Global Brands
            </h2>
            <p className="relative z-10 mt-1.5 text-[14px] md:text-[15px] text-[#1a1a1a] m-0">
              Proudly Partnering with Globally Trusted Technology Brands
            </p>
          </div>

          <img
            src={`${ART}/our-global-brands.svg`}
            alt="PowerColor, Manli, Koorui, Arctic, Aiwa, Royal Kludge, Oscoo, Silicon Power, Onikuma and T-Wolf"
            className="mt-10 md:mt-14 w-full max-w-[1100px] mx-auto h-auto"
          />

          <div className="mt-12 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-4">
            <div className="text-center">
              <div className="h-[80px] md:h-[92px] flex items-end justify-center">
                <span className="font-price text-[40px] md:text-[48px] font-bold leading-none text-[#d32f2f]">
                  9+
                </span>
              </div>
              <p className="mt-3 text-[14px] md:text-[15px] text-[#1a1a1a] m-0">
                Exclusive <span className="font-bold">Brands</span>
              </p>
            </div>

            {brandAssurances.map((a) => (
              <div key={a.label} className="text-center">
                <div className="h-[80px] md:h-[92px] flex items-end justify-center">
                  <img
                    src={`${ART}/${a.icon}.svg`}
                    alt=""
                    aria-hidden
                    className="h-[72px] md:h-[86px] w-auto"
                  />
                </div>
                <p className="mt-3 text-[14px] md:text-[15px] text-[#1a1a1a] m-0">{a.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 md:mt-16 flex justify-center">
            <Link
              href="#"
              className="inline-flex items-center gap-3 h-[56px] md:h-[64px] px-8 md:px-11 rounded-full border-2 border-[#d32f2f] text-[#d32f2f] text-[20px] md:text-[25px] no-underline transition-colors hover:bg-[#d32f2f] hover:text-white"
            >
              <span className="mi text-[26px] md:text-[30px]">call</span>
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

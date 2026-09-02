'use client'

import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Breadcrumbs from '@/components/category/Breadcrumbs'
import { compareProducts, type CompareProduct } from '@/data/compareProducts'
import { useCompare } from '@/context/CompareContext'
import { useCart } from '@/context/CartContext'

/**
 * One table at every width: a frozen feature column plus product columns wide
 * enough to overflow, so phones scroll the products sideways instead of
 * getting a different layout. Every track — the frozen feature column
 * included — is one equal share, so the column boundaries sit at the same
 * fractions of the table no matter how many products are being compared.
 * `minW` must equal the sum of the track minimums — the row boxes have to be
 * as wide as their tracks, or their backgrounds and borders stop short once
 * you scroll.
 */
const GRID_COLS_3 = {
  grid: 'grid-cols-[repeat(4,minmax(190px,1fr))] md:grid-cols-[repeat(4,minmax(180px,1fr))]',
  minW: 'min-w-[760px] md:min-w-[720px]',
}
const GRID_COLS_2 = {
  grid: 'grid-cols-[repeat(3,minmax(206px,1fr))] md:grid-cols-[repeat(3,minmax(240px,1fr))]',
  minW: 'min-w-[618px] md:min-w-[720px]',
}

/**
 * The feature-name column is frozen while the product columns scroll under it,
 * so every value stays lined up with its label. Applied per row rather than to
 * one column element, because each row is its own grid — that is also what
 * keeps the vertical alignment exact.
 *
 * Each cell must set its own background: scrolled content passes behind it.
 * The divider is a plain border rather than a drop shadow — a shadow with any
 * vertical spread fades out near each row boundary, which reads as a gap in
 * the line down the left edge of every value cell.
 */
const STICKY_LABEL = 'sticky left-0 z-10 border-r border-gray-100'

const COLLAPSE_MS = 280

/**
 * Height-animated disclosure for a spec section.
 *
 * The height is measured rather than transitioned from `auto`, which no engine
 * animates yet. Clipping while it moves uses `overflow-y: clip` and not
 * `hidden` on purpose: `hidden` would make this a scroll container, and the
 * frozen feature column inside sticks to the nearest scroll container — it
 * would stop tracking the table's own horizontal scroll and drift away with
 * the rows. `clip` cuts the overflow without becoming one. Once the section
 * has settled open, the height goes back to `auto` so rows can reflow.
 */
function CollapsibleRows({ open, children }: { open: boolean; children: ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<string>(open ? 'auto' : '0px')
  // Skips the entrance animation on first paint: sections that start open
  // should just be open, not slide down as the page loads.
  const firstRun = useRef(true)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return

    if (firstRun.current) {
      firstRun.current = false
      setHeight(open ? 'auto' : '0px')
      return
    }

    if (open) {
      setHeight(`${el.offsetHeight}px`)
      const done = setTimeout(() => setHeight('auto'), COLLAPSE_MS)
      return () => clearTimeout(done)
    }

    // Collapsing needs a concrete starting height, so pin the measured one and
    // only drop to zero on the next frame — otherwise the browser sees a single
    // auto-to-zero change and skips straight to the end.
    setHeight(`${el.offsetHeight}px`)
    const raf = requestAnimationFrame(() => setHeight('0px'))
    return () => cancelAnimationFrame(raf)
  }, [open])

  const settledOpen = height === 'auto'

  return (
    <div
      aria-hidden={!open}
      style={{ height, overflowY: settledOpen ? 'visible' : 'clip', transitionDuration: `${COLLAPSE_MS}ms` }}
      className="transition-[height] ease-out motion-reduce:transition-none"
    >
      <div ref={innerRef}>{children}</div>
    </div>
  )
}

/** Product columns divide from each other; the frozen column draws its own. */
const DIVIDER = (i: number) => (i === 0 ? '' : 'border-l border-gray-50')

function RamIllustration({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 240 76" className="w-[86%] h-auto">
      <rect x="8" y="8" width="224" height="36" rx="4" fill="#1f2430" />
      <rect x="24" y="17" width="72" height="9" rx="2" fill={accent} />
      <text x="24" y="40" fill="#fff" fontSize="9" fontFamily="Arial, sans-serif" fontWeight="700" letterSpacing="0.5">
        OSCOO
      </text>
      <rect x="8" y="44" width="224" height="12" rx="2" fill="#111318" />
      {Array.from({ length: 26 }).map((_, i) => (
        <rect key={i} x={13 + i * 8.5} y="50" width="4" height="8" fill="#d4af37" />
      ))}
    </svg>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-[#ffcb39] text-base leading-none">
      {'★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))}
    </span>
  )
}

function ProductSummary({ product }: { product: CompareProduct }) {
  return (
    <>
      <div className="w-full aspect-square max-w-[140px] flex items-center justify-center bg-gray-50 rounded-xl mb-3">
        <RamIllustration accent={product.accent} />
      </div>
      <p className="text-[14px] font-semibold text-gray-900 leading-snug mb-1.5 line-clamp-2">{product.name}</p>
      <div className="flex items-center justify-center gap-1 mb-1.5">
        <Stars rating={product.rating} />
        <span className="text-[12px] text-gray-600">
          {product.rating.toFixed(2)} ({product.reviews}
          <Image
            src="/images/catalog/view/theme/default/image/verified.svg"
            alt="Verified"
            width={11}
            height={11}
            className="inline w-[11px] h-[11px] mb-0.5 ml-0.5"
          />
          )
        </span>
      </div>
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        <span className="text-[15px] font-bold text-[#c3272b]"><span className="font-medium">৳</span><span className="font-price">{product.priceNew.toLocaleString()}</span></span>
        {product.priceOld && (
          <span className="text-[11px] text-gray-400 line-through">৳{product.priceOld.toLocaleString()}</span>
        )}
        {product.discountPct && (
          <span className="text-[10.5px] font-bold text-[#00c68b]">{product.discountPct}% OFF</span>
        )}
      </div>
    </>
  )
}

function ramImageDataUri(accent: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 76">
    <rect x="8" y="8" width="224" height="36" rx="4" fill="#1f2430"/>
    <rect x="24" y="17" width="72" height="9" rx="2" fill="${accent}"/>
    <text x="24" y="40" fill="#fff" font-size="9" font-family="Arial, sans-serif" font-weight="700" letter-spacing="0.5">OSCOO</text>
    <rect x="8" y="44" width="224" height="12" rx="2" fill="#111318"/>
    ${Array.from({ length: 26 }, (_, i) => `<rect x="${13 + i * 8.5}" y="50" width="4" height="8" fill="#d4af37"/>`).join('')}
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function EmptySlot() {
  return (
    <div className="text-gray-400 flex flex-col items-center gap-2">
      <span className="mi text-[32px]">add_box</span>
      <p className="text-[12.5px] m-0">Search and add a product</p>
    </div>
  )
}

function ComparePageInner() {
  const { slots, setSlot, reset } = useCompare()
  const { addItems } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [started, setStarted] = useState(() => Boolean(slots[0] && slots[1]))
  const [queries, setQueries] = useState<string[]>(() => slots.map((s) => s?.name ?? ''))
  const [openSlot, setOpenSlot] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Key Features': true,
    'Physical dimension': false,
    'Warranty Information': false,
  })

  const reference = slots[0] ?? compareProducts[0]

  // Hydrate the comparison from a shared link (?p1=slug&p2=slug&p3=slug)
  useEffect(() => {
    const found = [0, 1, 2].map((i) => {
      const slug = searchParams.get(`p${i + 1}`)
      return slug ? compareProducts.find((p) => p.slug === slug) ?? null : null
    })
    found.forEach((product, i) => {
      if (product) setSlot(i, product)
    })
    if (found[0] && found[1]) setStarted(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep the URL in sync with the active comparison so it stays shareable
  useEffect(() => {
    if (!started) return
    const params = new URLSearchParams()
    ;[0, 1, 2].forEach((i) => {
      const slug = slots[i]?.slug
      if (slug) params.set(`p${i + 1}`, slug)
    })
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [started, slots, pathname, router])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(timer)
  }, [toast])

  const resultsFor = useMemo(() => {
    return (index: number) => {
      const q = queries[index].trim().toLowerCase()
      if (!q) return compareProducts
      return compareProducts.filter((p) => p.name.toLowerCase().includes(q))
    }
  }, [queries])

  const selectProduct = (index: number, product: CompareProduct) => {
    setSlot(index, product)
    setQueries((prev) => prev.map((q, i) => (i === index ? product.name : q)))
    setOpenSlot(null)
  }

  const clearSlot = (index: number) => {
    setSlot(index, null)
    setQueries((prev) => prev.map((q, i) => (i === index ? '' : q)))
  }

  const resetAll = () => {
    reset()
    setQueries(['', '', ''])
    setOpenSlot(null)
    setStarted(false)
    router.replace(pathname, { scroll: false })
  }

  const handleBuyNow = (product: CompareProduct) => {
    addItems([
      {
        id: product.slug,
        name: product.name,
        slug: product.slug,
        image: ramImageDataUri(product.accent),
        price: product.priceNew,
        priceOld: product.priceOld ?? undefined,
        discountPct: product.discountPct ?? undefined,
        qty: 1,
      },
    ])
    router.push('/checkout')
  }

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  const handleShare = async () => {
    const url = window.location.href
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Product Comparison', text: 'Check out this product comparison on Monarch IT', url })
      } catch {
        // user dismissed the native share sheet
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setToast('Link copied to clipboard')
    } catch {
      setToast('Could not copy the link')
    }
  }

  const handlePrint = () => {
    const filledIndexes = visibleIndexes.filter((i) => slots[i])
    const products = filledIndexes.map((i) => slots[i]!)
    if (products.length === 0) return

    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

    const priceCell = (p: CompareProduct) => {
      const old = p.priceOld ? ` <span class="old">৳${p.priceOld.toLocaleString()}</span>` : ''
      const off = p.discountPct ? ` <span class="off">${p.discountPct}% OFF</span>` : ''
      return `৳${p.priceNew.toLocaleString()}${old}${off}`
    }
    const ratingCell = (p: CompareProduct) =>
      `<span class="stars">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))}</span> ${p.rating.toFixed(2)} (${p.reviews} Reviews)`
    const summaryCell = (p: CompareProduct) => {
      const first = p.sections[0]
      if (!first) return '-'
      return `<ul>${first.rows.map(([label, value]) => `<li>${esc(label)}: ${esc(value)}</li>`).join('')}</ul>`
    }

    const headerCells = products.map((p) => `<th>${esc(p.name)}</th>`).join('')

    const topRows: [string, string[]][] = [
      ['Price', products.map(priceCell)],
      ['Model', products.map((p) => esc(p.model))],
      ['Rating', products.map(ratingCell)],
      ['Summary', products.map(summaryCell)],
    ]
    const topRowsHtml = topRows
      .map(([label, cells]) => `<tr><th class="row-label">${label}</th>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`)
      .join('')

    const sectionsHtml = (reference?.sections ?? [])
      .map((section, si) => {
        const sectionHeader = `<tr><td class="section-title" colspan="${products.length + 1}">${esc(section.title)}</td></tr>`
        const specRows = section.rows
          .map(([label], ri) => {
            const cells = filledIndexes
              .map((i) => `<td>${esc(slots[i]?.sections[si]?.rows[ri]?.[1] ?? '-')}</td>`)
              .join('')
            return `<tr><th class="row-label">${esc(label)}</th>${cells}</tr>`
          })
          .join('')
        return sectionHeader + specRows
      })
      .join('')

    const printedAt = new Date().toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Product Comparison</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1f2937; margin: 0; padding: 32px; }
  .timestamp { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
  .page-title { text-align: center; font-size: 12px; color: #6b7280; margin-bottom: 18px; }
  .brand-row { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #d32f2f; padding-bottom: 14px; margin-bottom: 20px; }
  .brand-row img { height: 42px; width: auto; }
  .brand-meta { font-size: 12px; color: #4b5563; text-align: right; line-height: 1.6; }
  .brand-name { font-size: 22px; font-weight: 800; color: #d32f2f; margin: 0 0 4px; }
  table { width: 100%; border-collapse: collapse; }
  /* prevent the browser from repeating the product-name header row on every printed page */
  thead { display: table-row-group; }
  th, td { border: 1px solid #d1d5db; padding: 10px 12px; font-size: 13px; text-align: left; vertical-align: top; }
  thead th { background: #fff; font-size: 14px; font-weight: 700; color: #1f2937; }
  .row-label { width: 140px; font-weight: 700; color: #374151; background: #f9fafb; }
  .section-title { background: #fdecea; color: #d32f2f; font-weight: 800; font-size: 13px; }
  .old { text-decoration: line-through; color: #9ca3af; font-size: 11px; margin-left: 6px; }
  .off { color: #00a76a; font-size: 11px; font-weight: 700; margin-left: 6px; }
  .stars { color: #ffb400; }
  ul { margin: 0; padding-left: 18px; }
  li { margin-bottom: 3px; }
  a { color: inherit; text-decoration: none; }
  @media print { body { padding: 12px; } }
</style>
</head>
<body>
  <div class="timestamp">${printedAt}</div>
  <div class="page-title">Product Comparison</div>
  <div class="brand-row">
    <img src="${window.location.origin}/images/image/catalog/website/logo/monarch-it-logo.png" alt="Monarch IT" />
    <div class="brand-meta">
      <div class="brand-name">Monarch IT Limited</div>
      Phone: +8801332-812759<br />
      <a href="${window.location.origin}">${window.location.origin.replace(/^https?:\/\//, '')}</a>
    </div>
  </div>
  <table>
    <thead>
      <tr><th></th>${headerCells}</tr>
    </thead>
    <tbody>
      ${topRowsHtml}
      ${sectionsHtml}
    </tbody>
  </table>
</body>
</html>`

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      setToast('Please allow pop-ups to print the comparison')
      return
    }
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.onload = () => printWindow.print()
  }

  const renderSearchCell = (i: number, opts: { hideRemove?: boolean; hideName?: boolean } = {}) => {
    const { hideRemove = false, hideName = false } = opts
    const displayValue = hideName ? '' : queries[i]

    return (
      <div className="relative px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 h-10 md:h-11 flex items-center bg-white border border-gray-200 focus-within:border-gray-400 transition-colors rounded-full px-3">
            <Image src="/images/compare-icons/search-icon.svg" alt="" width={20} height={20} className="w-5 h-5 mr-1.5 shrink-0" />
            <input
              type="text"
              value={displayValue}
              onChange={(e) => {
                setQueries((prev) => prev.map((q, idx) => (idx === i ? e.target.value : q)))
                setOpenSlot(i)
              }}
              onFocus={() => setOpenSlot(i)}
              placeholder="Search Products"
              autoComplete="off"
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-[13px] text-gray-700 placeholder-gray-400"
            />
          </div>
          {slots[i] && !hideRemove && (
            <button
              type="button"
              onClick={() => clearSlot(i)}
              aria-label="Remove product"
              className="shrink-0 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
            >
              <Image src="/images/compare-icons/cross-icon.svg" alt="" width={36} height={36} className="w-9 h-9" />
            </button>
          )}
        </div>

        {openSlot === i && (
          <div className="absolute left-3 right-3 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.13)] z-20 max-h-64 overflow-y-auto py-1.5">
            {resultsFor(i).length === 0 && (
              <p className="px-3.5 py-2.5 text-[13px] text-gray-400 m-0">No products found.</p>
            )}
            {resultsFor(i).map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => selectProduct(i, p)}
                className="w-full text-left flex items-center gap-2 px-3.5 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span className="text-[13px] text-gray-700 truncate">{p.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const canStart = Boolean(slots[0] && slots[1])
  const showThirdColumn = Boolean(slots[1])
  const visibleIndexes = showThirdColumn ? [0, 1, 2] : [0, 1]
  const cols = showThirdColumn ? GRID_COLS_3 : GRID_COLS_2

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Product Comparison', href: '/compare' }]} />

      <div className="container mx-auto px-4 min-[992px]:px-14 py-8 md:py-10">
        {started && (
          <div className="text-center mb-7">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 m-0">Product Comparison</h1>
            <p className="text-[14px] text-gray-500 mt-1.5">Select items to compare side by side.</p>
          </div>
        )}

        {!started ? (
          <div className="max-w-sm mx-auto bg-white rounded-[24px] shadow-[0_2px_16px_var(--tw-shadow-color,#00000014)] p-6 md:p-7">
            <h2 className="text-[17px] font-bold text-gray-900 text-center m-0">Product Comparison</h2>
            <p className="text-[13px] text-gray-500 text-center mt-2 mb-4">
              You have not chosen any products to compare.
            </p>

            <div className="flex flex-col gap-2.5 mb-4">
              {renderSearchCell(0)}
              {renderSearchCell(1)}
            </div>

            <button
              type="button"
              disabled={!canStart}
              onClick={() => setStarted(true)}
              className="w-full bg-[#d32f2f] text-white text-[14px] font-semibold py-3 rounded-full shadow-[0_6px_18px_rgba(211,47,47,0.25)] hover:bg-[#b71c1c] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#d32f2f]"
            >
              View Comparison
            </button>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-[35px] shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-x-auto no-scrollbar">
            <div className={cols.minW}>
              {/* Search row */}
              <div className={`grid ${cols.grid} items-center border-b bg-gray-100 border-gray-100`}>
                <div className={`${STICKY_LABEL} self-stretch bg-gray-100 flex items-center justify-center gap-3 md:gap-1 py-4`}>
                  <button
                    type="button"
                    onClick={resetAll}
                    title="Reset comparison"
                    className="flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <Image src="/images/compare-icons/refresh-icon.svg" alt="Reset" width={36} height={36} className="w-8 h-8 md:w-9 md:h-9" />
                  </button>
                  {/* On phones the actions ride up here — the bottom row is
                      too far to reach past a long spec list. */}
                  <button
                    type="button"
                    onClick={handleShare}
                    title="Share comparison"
                    className="md:hidden flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <Image src="/images/compare-icons/share-icon.svg" alt="Share" width={32} height={32} className="w-8 h-8" />
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    title="Print comparison"
                    className="md:hidden flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <Image src="/images/compare-icons/download-icon.svg" alt="Print" width={32} height={32} className="w-8 h-8" />
                  </button>
                </div>
                {renderSearchCell(0, { hideRemove: true, hideName: true })}
                {renderSearchCell(1, { hideName: true })}
                {showThirdColumn && renderSearchCell(2, { hideName: true })}
              </div>

              {/* Product card row */}
              <div className={`grid ${cols.grid} border-b border-gray-100`}>
                <div className={`${STICKY_LABEL} bg-white`} />
                {visibleIndexes.map((i) => {
                  const product = slots[i]
                  return (
                    <div key={i} className={`px-2.5 md:px-4 py-4 md:py-5 ${DIVIDER(i)} flex flex-col items-center text-center min-h-[190px] md:min-h-[210px] justify-center`}>
                      {product ? <ProductSummary product={product} /> : <EmptySlot />}
                    </div>
                  )
                })}
              </div>

              {/* Model row */}
              <div className={`grid ${cols.grid} border-b border-gray-100`}>
                <div className={`${STICKY_LABEL} bg-white px-3 md:px-4 py-3.5 text-[12px] md:text-[13px] font-semibold text-gray-700 flex items-center`}>
                  Model
                </div>
                {visibleIndexes.map((i) => (
                  <div key={i} className={`px-3 md:px-4 py-3.5 ${DIVIDER(i)} text-[12.5px] md:text-[13px] text-gray-600 flex items-center justify-center text-center`}>
                    {slots[i]?.model ?? '—'}
                  </div>
                ))}
              </div>

              {/* Spec sections */}
              {reference?.sections.map((section, si) => {
                const isOpen = openSections[section.title]
                return (
                  <div key={section.title}>
                    {/* A grid row, not a full-width bar, so the section name
                        rides along in the frozen column. The whole row is the
                        toggle, which is why the button itself carries the grid:
                        the title can stay frozen on the left while the chevron
                        sits at the far right edge of the table. */}
                    <button
                      type="button"
                      onClick={() => toggleSection(section.title)}
                      aria-expanded={isOpen}
                      className={`group grid ${cols.grid} w-full bg-gray-50 hover:bg-gray-100 border-b border-gray-100 text-left cursor-pointer transition-colors`}
                    >
                      <span className={`${STICKY_LABEL} bg-gray-50 group-hover:bg-gray-100 transition-colors flex items-center px-3 md:px-4 py-3`}>
                        <span className="text-[12.5px] md:text-[14px] font-bold text-[#d32f2f] leading-tight">{section.title}</span>
                      </span>
                      {visibleIndexes.map((i, n) => (
                        <span key={i} className={`${DIVIDER(i)} flex items-center justify-end px-3 md:px-4`}>
                          {n === visibleIndexes.length - 1 && (
                            <span className={`mi shrink-0 text-[18px] md:text-[20px] text-[#d32f2f] transition-transform ${!isOpen ? 'rotate-180' : ''}`}>
                              expand_more
                            </span>
                          )}
                        </span>
                      ))}
                    </button>

                    <CollapsibleRows open={Boolean(isOpen)}>
                      {section.rows.map(([label], ri) => (
                        <div key={label} className={`grid ${cols.grid} border-b border-gray-100`}>
                          <div className={`${STICKY_LABEL} bg-white px-3 md:px-4 py-3 text-[12px] md:text-[13px] text-gray-700 flex items-center`}>
                            {label}
                          </div>
                          {visibleIndexes.map((i) => (
                            <div
                              key={i}
                              className={`px-3 md:px-4 py-3 ${DIVIDER(i)} text-[12.5px] md:text-[13px] text-gray-600 flex items-center justify-center text-center`}
                            >
                              {slots[i]?.sections[si]?.rows[ri]?.[1] ?? '—'}
                            </div>
                          ))}
                        </div>
                      ))}
                    </CollapsibleRows>
                  </div>
                )
              })}

              {/* Actions row */}
              <div className={`grid ${cols.grid} items-center`}>
                <div className={`${STICKY_LABEL} self-stretch bg-white flex items-center justify-center gap-2 py-4`}>
                  <button
                    type="button"
                    onClick={handleShare}
                    title="Share comparison"
                    className="hidden md:flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <Image src="/images/compare-icons/share-icon.svg" alt="Share" width={36} height={36} className="w-9 h-9" />
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    title="Print comparison"
                    className="hidden md:flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <Image src="/images/compare-icons/download-icon.svg" alt="Print" width={36} height={36} className="w-9 h-9" />
                  </button>
                </div>
                {visibleIndexes.map((i) => {
                  const product = slots[i]
                  return (
                    <div key={i} className={`px-2.5 md:px-4 py-4 ${DIVIDER(i)} flex items-center justify-center`}>
                      <button
                        type="button"
                        disabled={!product}
                        onClick={() => product && handleBuyNow(product)}
                        className="bg-white text-[#c3272b] border border-[#c3272b] rounded-full py-2 px-6 text-[13px] font-bold hover:bg-[#c3272b] hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#c3272b]"
                      >
                        Buy now
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {openSlot !== null && <div className="fixed inset-0 z-10" onClick={() => setOpenSlot(null)} />}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-[13px] font-medium px-4 py-2.5 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
          {toast}
        </div>
      )}
    </>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <ComparePageInner />
    </Suspense>
  )
}

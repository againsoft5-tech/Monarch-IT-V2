'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import BlogCard from './BlogCard'
import { BLOG_CATEGORIES, blogPosts, featuredPosts, type BlogCategory } from '@/data/blog'

const PER_PAGE = 8

/** The dropdown is drawn as two columns; the artwork fills them column-major. */
const COL_LEN = Math.ceil(BLOG_CATEGORIES.length / 2)
const CATEGORY_COLUMNS = [BLOG_CATEGORIES.slice(0, COL_LEN), BLOG_CATEGORIES.slice(COL_LEN)]

function Arrow({ dir, onClick, disabled }: { dir: 'left' | 'right'; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'left' ? 'Previous featured posts' : 'Next featured posts'}
      className={`absolute top-1/2 -translate-y-1/2 z-10 grid place-items-center w-9 h-9 rounded-full bg-white text-[#d32f2f] border border-[#ececec] shadow-[0_2px_10px_rgba(0,0,0,0.12)] cursor-pointer transition-opacity ${
        dir === 'left' ? 'left-1' : 'right-1'
      } ${disabled ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-[#d32f2f] hover:text-white'}`}
    >
      <span className="mi text-[22px] leading-none">{dir === 'left' ? 'chevron_left' : 'chevron_right'}</span>
    </button>
  )
}

function FeaturedCarousel() {
  const scroller = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const sync = () => {
    const el = scroller.current
    if (!el) return
    setEdges({
      start: el.scrollLeft <= 2,
      end: el.scrollLeft >= el.scrollWidth - el.clientWidth - 2,
    })
  }

  useEffect(() => {
    sync()
    const el = scroller.current
    if (!el) return
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /** Scroll by one card, measured off the first child so gaps stay in sync. */
  const nudge = (dir: 1 | -1) => {
    const el = scroller.current
    if (!el) return
    const card = el.firstElementChild as HTMLElement | null
    const step = card ? card.offsetWidth + 24 : el.clientWidth / 3
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <Arrow dir="left" onClick={() => nudge(-1)} disabled={edges.start} />
      <Arrow dir="right" onClick={() => nudge(1)} disabled={edges.end} />

      {/* `contain: paint` is what actually stops the off-screen cards from
          extending the document's scroll width — the scroller's own overflow-x
          did not, which gave the whole page a hidden 500px of horizontal scroll. */}
      <div className="overflow-hidden [contain:paint]">
        <div
          ref={scroller}
          onScroll={sync}
          className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          {featuredPosts.map((post) => (
            <div
              key={post.slug}
              className="snap-start shrink-0 w-full sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)]"
            >
              <BlogCard post={post} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function BlogIndex() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<BlogCategory[]>([])
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const menu = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hover open/close. The panel is a DOM child of the wrapper, so re-entering it
  // across the gap cancels the pending close; the delay covers the gap itself.
  const hoverOpen = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }
  const hoverClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(false), 180)
  }

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current) }, [])

  // Click-away and Escape, so the panel behaves like a real menu.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (menu.current && !menu.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return blogPosts.filter((post) => {
      // Several categories selected reads as "any of these", not "all of these".
      const byCategory = selected.length === 0 || post.categories.some((c) => selected.includes(c))
      const byQuery = !q || post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q)
      return byCategory && byQuery
    })
  }, [query, selected])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const current = Math.min(page, pageCount)
  const shown = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  const toggle = (category: BlogCategory) => {
    setSelected((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]))
    setPage(1)
  }

  /** 1 2 3 … last, collapsing the middle once there are more than five pages. */
  const pageNumbers = useMemo(() => {
    if (pageCount <= 5) return Array.from({ length: pageCount }, (_, i) => i + 1)
    if (current <= 3) return [1, 2, 3, '…', pageCount]
    if (current >= pageCount - 2) return [1, '…', pageCount - 2, pageCount - 1, pageCount]
    return [1, '…', current, '…', pageCount]
  }, [pageCount, current])

  return (
    <div className="bg-white">
      <div className="container mx-auto pt-4 pb-14 md:pt-6 md:pb-20">
        <div className="max-w-[1240px] mx-auto">
          <h1 className="text-center text-[26px] md:text-[32px] font-bold text-[#3d3d3d] m-0">Blog</h1>
          <p className="mt-1.5 text-center text-[13.5px] md:text-[15px] text-[#6b6b6b]">
            Stay updated with the latest articles, guides, and news from{' '}
            <span className="font-bold text-[#3d3d3d]">Monarch</span>
          </p>

          <h2 className="mt-8 md:mt-10 mb-4 text-[16px] md:text-[18px] font-bold text-[#3d3d3d]">Featured Posts</h2>
          <FeaturedCarousel />

          {/* All Posts toolbar */}
          <div className="mt-10 md:mt-14 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <h2 className="m-0 text-[16px] md:text-[18px] font-bold text-[#3d3d3d] lg:w-[190px] shrink-0">
              All Posts
            </h2>

            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-[420px] flex items-center gap-2.5 h-[42px] px-5 rounded-full bg-[#f5f5f7]">
                <Image
                  src="/images/compare-icons/search-icon.svg"
                  alt=""
                  width={18}
                  height={18}
                  className="w-[18px] h-[18px] shrink-0"
                />
                <label htmlFor="blog-search" className="sr-only">
                  Search Blog
                </label>
                <input
                  id="blog-search"
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Search Blog"
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-[13.5px] text-[#3d3d3d] placeholder:text-[#8b8b90]"
                />
              </div>
            </div>

            <div
              ref={menu}
              onMouseEnter={hoverOpen}
              onMouseLeave={hoverClose}
              className="relative lg:w-[190px] shrink-0 flex lg:justify-end"
            >
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="inline-flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer text-[16px] md:text-[18px] font-bold text-[#3d3d3d]"
              >
                Categories
                <span className={`mi text-[22px] text-[#d32f2f] transition-transform ${open ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {open && (
                // The 14px offset is padding on this wrapper rather than a gap, so the
                // hover region stays contiguous from the toggle down into the panel.
                <div className="absolute top-full right-0 z-30 pt-[14px]">
                  <div className="relative w-[min(92vw,460px)] rounded-[20px] border border-[#e2e2e2] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-5 md:p-6">
                  {/* Notch pointing back at the toggle. */}
                  <span className="absolute -top-[7px] right-9 w-3 h-3 rotate-45 bg-white border-l border-t border-[#e2e2e2]" />
                  <div className="grid grid-cols-2 gap-x-5 gap-y-3.5">
                    {CATEGORY_COLUMNS.map((column, i) => (
                      <ul key={i} className="list-none m-0 p-0 space-y-3.5">
                        {column.map((category) => {
                          const on = selected.includes(category)
                          return (
                            <li key={category}>
                              <button
                                type="button"
                                onClick={() => toggle(category)}
                                aria-pressed={on}
                                className={`inline-flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer text-left text-[13px] md:text-[14px] transition-colors ${
                                  on ? 'text-[#d32f2f]' : 'text-[#3d3d3d] hover:text-[#d32f2f]'
                                }`}
                              >
                                {category}
                                {on && <span aria-hidden>&times;</span>}
                                {on && <span className="sr-only">(selected — click to remove)</span>}
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    ))}
                  </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {shown.length > 0 ? (
            <div className="mt-5 grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {shown.map((post) => (
                <BlogCard key={post.slug} post={post} compact />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-[14px] text-[#6b6b6b]">
              No posts match that search. Try a different word, or clear the selected categories.
            </p>
          )}

          {pageCount > 1 && (
            <nav aria-label="Blog pages" className="mt-9 md:mt-12 flex items-center justify-center gap-4 md:gap-6">
              {pageNumbers.map((n, i) =>
                typeof n === 'number' ? (
                  <button
                    key={`${n}-${i}`}
                    type="button"
                    onClick={() => setPage(n)}
                    aria-current={n === current ? 'page' : undefined}
                    className={`border-none p-0 cursor-pointer text-[14px] md:text-[15px] font-medium transition-colors ${
                      n === current
                        ? 'grid place-items-center w-[30px] h-[30px] rounded-full bg-[#d32f2f] text-white'
                        : 'bg-transparent text-[#3d3d3d] hover:text-[#d32f2f]'
                    }`}
                  >
                    {n}
                  </button>
                ) : (
                  <span key={`gap-${i}`} className="text-[14px] text-[#8b8b90]">
                    &hellip;
                  </span>
                ),
              )}
              {current < pageCount && (
                <button
                  type="button"
                  onClick={() => setPage(current + 1)}
                  className="bg-transparent border-none p-0 cursor-pointer text-[14px] md:text-[15px] font-medium text-[#3d3d3d] hover:text-[#d32f2f] transition-colors"
                >
                  Next &raquo;
                </button>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}

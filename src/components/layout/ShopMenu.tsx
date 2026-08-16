'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { shopCategories, type ShopSub } from '@/data/categories'

export default function ShopMenu({ headerBottom }: { headerBottom: number }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [triggerPos, setTriggerPos] = useState({ left: 0, top: 0 })
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (open) setActiveIndex(0)
  }, [open])

  useEffect(() => {
    if (!open || !triggerRef.current) return
    const updatePos = () => {
      const rect = triggerRef.current!.getBoundingClientRect()
      setTriggerPos({ left: rect.left + rect.width / 2, top: rect.bottom })
    }
    updatePos()
    window.addEventListener('resize', updatePos)
    return () => window.removeEventListener('resize', updatePos)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      const insideWrapper = wrapperRef.current?.contains(target)
      const insidePanel = panelRef.current?.contains(target)
      if (!insideWrapper && !insidePanel) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleScroll = () => setOpen(false)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [open])

  const active = shopCategories[activeIndex]
  const subRows: ShopSub[][] = []
  for (let i = 0; i < active.sub.length; i += 3) subRows.push(active.sub.slice(i, i + 3))

  return (
    <>
      <div
        ref={wrapperRef}
        className="relative ml-5"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-[5px] font-semibold text-[15px] whitespace-nowrap select-none cursor-pointer transition-colors ${
            open ? 'text-[#d32f2f]' : 'text-[#333] hover:text-[#d32f2f]'
          }`}
        >
          <span>SHOP</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/*
          The overlay + panel are portaled to <body> instead of rendered inline here.
          Header has its own stacking context (position + z-index), so a z-index set
          on a descendant only wins against other elements *inside* that same context —
          it can never out-rank SideMenu's z-[9999], which lives at the body level.
          Portaling escapes Header's stacking context so the blur can sit above SideMenu.
        */}
        {mounted &&
          open &&
          createPortal(
            <>
              <div
                className="fixed inset-x-0 bottom-0 z-[10000] bg-white/10 backdrop-blur-[2px] transition-opacity"
                style={{ top: headerBottom }}
                onClick={() => setOpen(false)}
                onMouseEnter={() => setOpen(false)}
              />

              <div
                ref={panelRef}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                // Padding (not margin) keeps this element's own hit-box contiguous
                // with the trigger button, so the cursor never crosses a dead gap
                // on the way down to the panel and closes the menu early.
                className="fixed -translate-x-1/2 pt-4 z-[10010]"
                style={{ left: triggerPos.left, top: triggerPos.top }}
              >
                <div className="w-[760px] bg-white border border-[#eccccc] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex overflow-hidden">
                  <div className="w-[210px] shrink-0 max-h-[336px] overflow-y-auto thin-scroll-red border-r border-gray-200 py-2">
                    {shopCategories.map((cat, i) => (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        onMouseEnter={() => setActiveIndex(i)}
                        onClick={() => setOpen(false)}
                        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-[14px] text-left whitespace-nowrap no-underline transition-colors cursor-pointer ${
                          i === activeIndex
                            ? 'text-[#d32f2f] bg-[#fdecea] font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {cat.name}
                        <span className="mi text-[16px] shrink-0">chevron_right</span>
                      </Link>
                    ))}
                  </div>

                  <div className="flex-1 p-5">
                    {subRows.map((row, ri) => (
                      <div
                        key={ri}
                        className={`grid grid-cols-3 gap-x-6 ${
                          ri < subRows.length - 1 ? 'pb-4 mb-4 border-b border-gray-100' : ''
                        }`}
                      >
                        {row.map((s) => (
                          <Link
                            key={s.name}
                            href={s.href}
                            onClick={() => setOpen(false)}
                            className="text-[13.5px] text-gray-700 no-underline whitespace-nowrap hover:text-[#d32f2f] transition-colors"
                          >
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>,
            document.body
          )}
      </div>
    </>
  )
}

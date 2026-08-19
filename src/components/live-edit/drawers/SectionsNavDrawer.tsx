'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import type { HomepageContent, HomepageSectionType } from '@/lib/live-edit/homepage'
import { SECTION_LABELS } from '@/lib/live-edit/homepage'

export type SectionsNavTarget =
  | { kind: 'chrome'; id: 'header' | 'footer' | 'sideMenu' }
  | { kind: 'section'; id: string; type: HomepageSectionType }

type Props = {
  open: boolean
  content: HomepageContent
  onClose: () => void
  onOpen: (target: SectionsNavTarget) => void
}

const CHROME_ITEMS: { id: 'header' | 'sideMenu' | 'footer'; label: string; hint: string }[] = [
  { id: 'header', label: 'Header', hint: 'Logo · search · CTAs' },
  { id: 'sideMenu', label: 'Side menu', hint: 'Icons · links · mobile bar' },
  { id: 'footer', label: 'Footer', hint: 'Links · social · copyright' },
]

/** Default open groups — add page keys here as more pages join live edit. */
const DEFAULT_OPEN: Record<string, boolean> = {
  chrome: true,
  'page:home': true,
  'page:offers': true,
}

/** Pages with their own editor route (own content blob + save endpoint). */
const OTHER_PAGES: { href: string; title: string; meta: string; hint: string }[] = [
  {
    href: '/website/live-edit/offers',
    title: 'Offers & Deals page',
    meta: '/offers-and-deals · own editor',
    hint: 'Title · subtitle · deal tabs · products',
  },
]

function CollapsibleGroup({
  title,
  meta,
  open,
  onToggle,
  children,
}: {
  title: string
  meta?: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-none border border-[#e5e5e5] bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-[#f5f5f7]"
      >
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#666] transition-transform ${open ? 'rotate-0' : '-rotate-90'}`}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#444]">
            {title}
          </span>
          {meta ? <span className="block text-[11px] text-[#888]">{meta}</span> : null}
        </span>
      </button>
      {open ? <div className="border-t border-[#eee]">{children}</div> : null}
    </div>
  )
}

export default function SectionsNavDrawer({ open, content, onClose, onOpen }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(DEFAULT_OPEN)

  if (!open) return null

  const layout = content.layout ?? []

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !(prev[id] ?? false) }))
  }

  const isOpen = (id: string) => expanded[id] ?? false

  return (
    <aside className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-[420px] flex-col border-l border-[#e5e5e5] bg-[#eceff3] shadow-xl">
      <div className="flex items-center justify-between border-b border-[#ddd] bg-white px-4 py-3">
        <div>
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#888]">Live edit</p>
          <h2 className="m-0 text-[16px] font-bold text-[#222]">Sections</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-[#ddd] bg-white text-[#444]"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="thin-scroll-gray min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <CollapsibleGroup
          title="Site chrome"
          meta={`${CHROME_ITEMS.length} items · shared across pages`}
          open={isOpen('chrome')}
          onToggle={() => toggle('chrome')}
        >
          {CHROME_ITEMS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpen({ kind: 'chrome', id: item.id })}
              className={`flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-[#f5f5f7] ${
                i > 0 ? 'border-t border-[#eee]' : ''
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-[#e5e5e5] bg-[#fafafa] text-[11px] font-bold text-[#888]">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-[#222]">{item.label}</span>
                <span className="block text-[11px] text-[#888]">{item.hint}</span>
              </span>
              <span className="text-[12px] text-[#bd2026]">Edit →</span>
            </button>
          ))}
        </CollapsibleGroup>

        {/* Add more CollapsibleGroup pages here (e.g. page:shop, page:about) as live edit grows. */}
        <CollapsibleGroup
          title="Homepage"
          meta={`${layout.length} sections · page order`}
          open={isOpen('page:home')}
          onToggle={() => toggle('page:home')}
        >
          {layout.length === 0 ? (
            <p className="m-0 px-3 py-4 text-center text-[12px] text-[#888]">No sections in layout</p>
          ) : (
            layout.map((block, i) => (
              <button
                key={block.id}
                type="button"
                onClick={() => onOpen({ kind: 'section', id: block.id, type: block.type })}
                className={`flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-[#f5f5f7] ${
                  i > 0 ? 'border-t border-[#eee]' : ''
                } ${block.hidden ? 'opacity-55' : ''}`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-[#e5e5e5] bg-[#fafafa] text-[11px] font-bold text-[#888]">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-[#222]">
                    {SECTION_LABELS[block.type] || block.type}
                    {block.hidden ? (
                      <span className="ml-1.5 text-[10px] font-normal text-[#888]">(hidden)</span>
                    ) : null}
                  </span>
                  <span className="block truncate text-[11px] text-[#888]">
                    {block.id === block.type ? 'Primary' : `Instance · ${block.id}`}
                  </span>
                </span>
                <span className="text-[12px] text-[#bd2026]">Edit →</span>
              </button>
            ))
          )}
        </CollapsibleGroup>

        {OTHER_PAGES.map((page) => (
          <CollapsibleGroup
            key={page.href}
            title={page.title}
            meta={page.meta}
            open={isOpen(`page:${page.href}`)}
            onToggle={() => toggle(`page:${page.href}`)}
          >
            <a
              href={page.href}
              className="flex w-full items-center gap-3 px-3 py-3 text-left no-underline hover:bg-[#f5f5f7]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-[#e5e5e5] bg-[#fafafa] text-[11px] font-bold text-[#888]">
                1
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-[#222]">Deals</span>
                <span className="block text-[11px] text-[#888]">{page.hint}</span>
              </span>
              <span className="text-[12px] text-[#bd2026]">Open →</span>
            </a>
          </CollapsibleGroup>
        ))}
      </div>
    </aside>
  )
}

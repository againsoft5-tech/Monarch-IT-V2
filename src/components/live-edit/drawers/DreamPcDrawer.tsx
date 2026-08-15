'use client'

import type { DreamPcSection } from '@/lib/live-edit/homepage'
import { DrawerHeader } from '@/components/live-edit/drawers/DrawerHeader'

type Props = {
  open: boolean
  value: DreamPcSection
  onChange: (next: DreamPcSection) => void
  onClose: () => void
  onBack?: () => void
}

export default function DreamPcDrawer({ open, value, onChange, onClose, onBack }: Props) {
  if (!open) return null

  const patch = (partial: Partial<DreamPcSection>) => onChange({ ...value, ...partial })

  return (
    <aside className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-[420px] flex-col border-l border-[#e5e5e5] bg-[#eceff3] shadow-xl">
      <DrawerHeader title="Dream PC" onClose={onClose} onBack={onBack} />

      <div className="thin-scroll-gray min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div className="space-y-2 rounded-none border border-[#e5e5e5] bg-white p-3">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            Banner image
          </p>
          <div className="relative flex aspect-square max-h-[220px] items-center justify-center overflow-hidden rounded-none border border-[#e5e5e5] bg-[#f5f5f7]">
            {value.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value.image}
                alt=""
                className="max-h-full max-w-full object-contain p-3"
              />
            ) : (
              <div className="text-[12px] text-[#999]">No image</div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#555]">Image URL</label>
            <input
              value={value.image ?? ''}
              onChange={(e) => patch({ image: e.target.value })}
              placeholder="/images/... or https://..."
              className="h-9 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
            />
          </div>
        </div>

        <div className="space-y-2 rounded-none border border-[#e5e5e5] bg-white p-3">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            Content
          </p>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#555]">Line 1</label>
            <input
              value={value.line1 ?? ''}
              onChange={(e) => patch({ line1: e.target.value })}
              placeholder="Build Your"
              className="h-9 w-full rounded-none border border-[#ddd] px-2 text-[13px]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#555]">Line 2</label>
            <input
              value={value.line2 ?? ''}
              onChange={(e) => patch({ line2: e.target.value })}
              placeholder="Dream PC"
              className="h-9 w-full rounded-none border border-[#ddd] px-2 text-[13px]"
            />
          </div>
        </div>

        <div className="space-y-2 rounded-none border border-[#e5e5e5] bg-white p-3">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">Link</p>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#555]">Button / banner link</label>
            <input
              value={value.href ?? ''}
              onChange={(e) => patch({ href: e.target.value })}
              placeholder="/pc-builder"
              className="h-9 w-full rounded-none border border-[#ddd] px-2 text-[13px]"
            />
          </div>
        </div>

        <div className="space-y-2 rounded-none border border-[#e5e5e5] bg-white p-3">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            Preview
          </p>
          <div className="flex items-center justify-center overflow-hidden py-2">
            <div className="relative z-[2] w-[88px] shrink-0">
              {value.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={value.image} alt="" className="block h-auto w-full" />
              ) : (
                <div className="aspect-square bg-[#f0f0f0]" />
              )}
            </div>
            <div className="relative z-[1] -ml-4 flex items-center">
              <div className="h-[56px] w-[28px] rounded-none border border-r-0 border-[#bd2026] border-l-0" />
              <a
                href={value.href || '#'}
                className="absolute -right-6 z-[3] block whitespace-nowrap rounded-none border border-[#bd2026] bg-white px-2 py-1 text-center text-[#bd2026] no-underline"
                onClick={(e) => e.preventDefault()}
              >
                <span className="block text-[9px] font-light leading-tight">{value.line1 || 'Line 1'}</span>
                <span className="block text-[11px] font-bold leading-tight">{value.line2 || 'Line 2'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

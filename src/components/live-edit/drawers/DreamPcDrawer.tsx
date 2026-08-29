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
      <DrawerHeader title="Build Your Own PC" onClose={onClose} onBack={onBack} />

      <div className="thin-scroll-gray min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div className="space-y-2 rounded-none border border-[#e5e5e5] bg-white p-3">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            Banner image
          </p>
          {/* Wide, like the banner itself — a square frame made the artwork look
              cropped in the drawer when it is not. */}
          <div className="relative flex aspect-[1366/600] items-center justify-center overflow-hidden rounded-none border border-[#e5e5e5] bg-[#f5f5f7]">
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
            <label className="mb-1 block text-[11px] font-semibold text-[#555]">Title</label>
            <input
              value={value.title ?? ''}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder="Build Your Own PC"
              className="h-9 w-full rounded-none border border-[#ddd] px-2 text-[13px]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#555]">Subtitle</label>
            <input
              value={value.subtitle ?? ''}
              onChange={(e) => patch({ subtitle: e.target.value })}
              placeholder="Pick your parts"
              className="h-9 w-full rounded-none border border-[#ddd] px-2 text-[13px]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#555]">Button label</label>
            <input
              value={value.buttonLabel ?? ''}
              onChange={(e) => patch({ buttonLabel: e.target.value })}
              placeholder="Build Now"
              className="h-9 w-full rounded-none border border-[#ddd] px-2 text-[13px]"
            />
          </div>
          <p className="m-0 text-[11px] text-[#888]">
            Leave a field empty to hide that line — an empty button label removes the button.
          </p>
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
          <div className="py-2 text-center">
            {value.title ? (
              <p className="m-0 text-[13px] font-bold uppercase text-[#333]">{value.title}</p>
            ) : null}
            {value.subtitle ? (
              <p className="m-0 text-[11px] text-[#777]">{value.subtitle}</p>
            ) : null}
            {value.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value.image} alt="" className="mt-2 block h-auto w-full" />
            ) : (
              <div className="mt-2 aspect-[1366/600] bg-[#f0f0f0]" />
            )}
            {value.buttonLabel ? (
              <span className="mt-2 inline-block rounded-full bg-[#bd2026] px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {value.buttonLabel}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  )
}

'use client'

import type { HeaderSection } from '@/lib/live-edit/homepage'
import { DrawerHeader } from '@/components/live-edit/drawers/DrawerHeader'

type Props = {
  open: boolean
  value: HeaderSection
  onChange: (next: HeaderSection) => void
  onClose: () => void
  onBack?: () => void
}

export default function HeaderDrawer({ open, value, onChange, onClose, onBack }: Props) {
  if (!open) return null

  const patch = (partial: Partial<HeaderSection>) => onChange({ ...value, ...partial })

  return (
    <aside className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-[420px] flex-col border-l border-[#e5e5e5] bg-[#eceff3] shadow-xl">
      <DrawerHeader eyebrow="Chrome" title="Header" onClose={onClose} onBack={onBack} />

      <div className="thin-scroll-gray min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div className="space-y-2 rounded-none border border-[#e5e5e5] bg-white p-3">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">Logos</p>
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col items-center gap-1 rounded-none border border-[#eee] bg-[#f5f5f7] p-2">
              {value.logoDesktop ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={value.logoDesktop} alt="" className="h-10 w-auto max-w-full object-contain" />
              ) : (
                <span className="text-[11px] text-[#999]">Desktop</span>
              )}
              <span className="text-[10px] text-[#888]">Desktop</span>
            </div>
            <div className="flex flex-1 flex-col items-center gap-1 rounded-none border border-[#eee] bg-[#f5f5f7] p-2">
              {value.logoMobile ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={value.logoMobile} alt="" className="h-10 w-auto max-w-full object-contain" />
              ) : (
                <span className="text-[11px] text-[#999]">Mobile</span>
              )}
              <span className="text-[10px] text-[#888]">Mobile</span>
            </div>
          </div>
          {(
            [
              ['logoDesktop', 'Desktop logo URL'],
              ['logoMobile', 'Mobile logo URL'],
              ['logoAlt', 'Logo alt text'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">{label}</label>
              <input
                value={value[key] ?? ''}
                onChange={(e) => patch({ [key]: e.target.value })}
                className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
              />
            </div>
          ))}
        </div>

        <div className="space-y-2 rounded-none border border-[#e5e5e5] bg-white p-3">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">Search</p>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#555]">Placeholder</label>
            <input
              value={value.searchPlaceholder ?? ''}
              onChange={(e) => patch({ searchPlaceholder: e.target.value })}
              className="h-9 w-full rounded-none border border-[#ddd] px-2 text-[13px]"
            />
          </div>
        </div>

        <div className="space-y-2 rounded-none border border-[#e5e5e5] bg-white p-3">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            Order Track
          </p>
          {(
            [
              ['orderTrackLabel', 'Label'],
              ['orderTrackHref', 'URL'],
              ['orderTrackIcon', 'Icon URL'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">{label}</label>
              <input
                value={value[key] ?? ''}
                onChange={(e) => patch({ [key]: e.target.value })}
                className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
              />
            </div>
          ))}
        </div>

        <div className="space-y-2 rounded-none border border-[#e5e5e5] bg-white p-3">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            PC Builder CTA
          </p>
          {(
            [
              ['pcBuilderLabel', 'Label'],
              ['pcBuilderHref', 'URL'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">{label}</label>
              <input
                value={value[key] ?? ''}
                onChange={(e) => patch({ [key]: e.target.value })}
                className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
              />
            </div>
          ))}
        </div>

        <p className="m-0 text-[12px] text-[#777]">
          Shop menu still uses catalog categories. Cart / account stay app-driven.
        </p>
      </div>
    </aside>
  )
}

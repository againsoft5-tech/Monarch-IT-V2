'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import type { BundleGiftItem } from '@/data/bundleData'

type Props = {
  open: boolean
  gifts: BundleGiftItem[]
  /** How many the customer may keep. */
  limit: number
  selectedIds: string[]
  onChange: (ids: string[]) => void
  onClose: () => void
}

/**
 * Free-gift chooser for a bundle that offers several.
 *
 * A bundle card has no room to show gift artwork inline, so the card carries a
 * compact button and the actual choosing happens here, where each option gets a
 * proper tile. Picking closes the dialog — there is nothing else to confirm.
 */
export default function GiftChoiceModal({ open, gifts, limit, selectedIds, onChange, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose your free gift"
      className="fixed inset-0 z-[10020] flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div className="min-w-0">
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#0f7a43]">
              <span className="mi text-[15px] leading-none">redeem</span> Free gift
            </span>
            <h3 className="m-0 mt-0.5 text-[16px] font-bold text-gray-900">
              {limit > 1 ? `Choose ${limit} free gifts` : 'Choose your free gift'}
            </h3>
            <p className="m-0 mt-0.5 text-[12px] text-gray-500">
              {selectedIds.length} of {limit} selected
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            <span className="mi text-[20px] leading-none">close</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            {gifts.map((g) => {
              const on = selectedIds.includes(g.id)
              // With the allowance used up, only the chosen ones stay clickable —
              // picking a fourth from a "keep 3" offer has no sensible meaning.
              const full = !on && selectedIds.length >= limit
              return (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={on}
                  disabled={full}
                  onClick={() => {
                    const next = on ? selectedIds.filter((id) => id !== g.id) : [...selectedIds, g.id]
                    onChange(next)
                    // A single-pick offer has nothing left to decide.
                    if (limit === 1 && !on) onClose()
                  }}
                  className={`flex flex-col items-center justify-start gap-2 rounded-2xl border-2 bg-[#f5f6fa] px-3 py-3 text-center transition-colors disabled:opacity-40 ${
                    on ? 'border-[#0f7a43]' : 'border-transparent hover:border-[#0f7a43]/50'
                  }`}
                >
                  <span className="flex h-[86px] w-full items-center justify-center">
                    {g.image ? (
                      <Image
                        src={g.image}
                        alt={g.name}
                        width={110}
                        height={110}
                        className="max-h-[86px] w-auto max-w-full object-contain"
                      />
                    ) : (
                      <span className="mi text-[34px] leading-none text-[#0f7a43]">redeem</span>
                    )}
                  </span>
                  <span className="line-clamp-3 text-[12px] font-bold text-[#0f7a43]">{g.name}</span>
                  {on ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#0f7a43]">
                      Selected
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        {limit > 1 ? (
          <div className="flex items-center justify-end border-t border-gray-100 px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-full bg-[#c3272b] px-6 text-[13px] font-bold text-white transition-colors hover:bg-[#a5121c]"
            >
              Done
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

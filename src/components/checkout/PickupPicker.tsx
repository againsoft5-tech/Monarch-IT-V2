'use client'

import { useState } from 'react'

const RED = '#d32f2f'

export type PickupPoint = {
  key: string
  label: string
  address: string
  phone: string
  Icon: (props: { className?: string }) => React.ReactElement
}

function OfficeIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M3 21V7a1 1 0 0 1 .6-.92l7-3A1 1 0 0 1 12 4v3.4l5.4-2.3A1 1 0 0 1 19 6v15h1a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2h0Zm2-1h5V5.5L5 7.66V20Zm7 0h5V7.5l-5 2.14V20ZM6.5 9h2v2h-2V9Zm0 4h2v2h-2v-2Zm7-2h2v2h-2v-2Zm0 4h2v2h-2v-2Z" />
    </svg>
  )
}

function StoreIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M4 3h16a1 1 0 0 1 .95.68l1.5 4.5A1 1 0 0 1 21.5 9.5H21v10a1 1 0 0 1-1 1h-6v-6h-4v6H4a1 1 0 0 1-1-1v-10h-.5a1 1 0 0 1-.95-1.32l1.5-4.5A1 1 0 0 1 4 3Zm1.72 2-.84 2.5h14.24L18.28 5H5.72ZM5 9.5V19h4v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6h4V9.5H5Z" />
    </svg>
  )
}

export function PickupIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M13.5 5.5a2 2 0 1 1-2-2 2 2 0 0 1 2 2ZM9.8 8.9 7.2 22h2.1l1.7-7.4 2 2.1V22h2v-6.2l-2.1-2.2.6-3a7 7 0 0 0 5 2.4v-2a5 5 0 0 1-4.2-2.4l-1-1.6a2 2 0 0 0-1.7-1 2 2 0 0 0-.7.1L5.5 7.8V12h2V9.1l2.3-.2Z" />
    </svg>
  )
}

/** Both counters are the company's own; addresses match the site footer. */
export const PICKUP_POINTS: PickupPoint[] = [
  {
    key: 'head-office',
    label: 'Head Office',
    address: 'Shop-SGR-23, Ground Floor, BCS\nComputer City,\nIDB Bhaban, Agargaon, Dhaka-1207',
    phone: '+880 1332 812 757',
    Icon: OfficeIcon,
  },
  {
    key: 'store',
    label: 'Store',
    address: 'Bs Bhaban, 2nd Floor, 75-76,\nNew Elephant Road, Dhaka-1205',
    phone: '+880 1332 812 758',
    Icon: StoreIcon,
  },
]

/** The little pointer tying a popup back to the control that opened it. */
function Caret() {
  return (
    <span className="absolute -top-[6px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 rounded-[2px] border-l border-t border-gray-200 bg-white" />
  )
}

/**
 * Where the customer will collect their order.
 *
 * Floats over the form rather than expanding it: the pickup counters are a detour off
 * the payment choice, and pushing the agree-and-order block down each time the method
 * changed made the form jump under the cursor.
 */
export default function PickupPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (key: string) => void
}) {
  const [openKey, setOpenKey] = useState<string | null>(value || PICKUP_POINTS[0].key)

  return (
    // Centred on the Pickup pill, and capped so it cannot run off a narrow screen.
    <div className="absolute left-1/2 top-full z-30 mt-3 w-max max-w-[min(420px,calc(100vw-2rem))] -translate-x-1/2">
      <div className="relative rounded-full border border-gray-200 bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        <Caret />
        <div className="flex gap-2">
          {PICKUP_POINTS.map((point) => {
            const active = value === point.key
            const open = active && openKey === point.key
            return (
              <div key={point.key} className="relative flex-1">
                <button
                  type="button"
                  onClick={() => {
                    onChange(point.key)
                    setOpenKey(open ? null : point.key)
                  }}
                  aria-expanded={open}
                  className={`flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 py-2.5 text-[12px] font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'border-[1.5px] border-[#d32f2f] text-[#d32f2f]'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                      active ? 'border-[#d32f2f]' : 'border-gray-300'
                    }`}
                  >
                    {active ? <span className="h-2.5 w-2.5 rounded-full bg-[#d32f2f]" /> : null}
                  </span>
                  <point.Icon className="h-4 w-4 shrink-0" />
                  {point.label}
                  <i
                    className={`fa-solid fa-chevron-down text-[10px] transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Each counter opens its own card, anchored under its own pill. */}
                {open ? (
                  <div className="absolute left-1/2 top-full z-40 mt-2.5 w-max max-w-[min(320px,calc(100vw-2.5rem))] -translate-x-1/2">
                    <div className="relative rounded-2xl border border-gray-100 bg-white p-3.5 shadow-[0_10px_28px_rgba(0,0,0,0.12)]">
                      <Caret />
                      <p className="m-0 flex items-start gap-2 text-[12px] leading-relaxed text-gray-700">
                        <i className="fa-solid fa-location-dot mt-0.5 shrink-0" style={{ color: RED }} />
                        <span className="whitespace-pre-line">{point.address}</span>
                      </p>
                      <p className="m-0 mt-2 flex items-center gap-2 text-[12px] text-gray-700">
                        <i className="fa-solid fa-phone shrink-0" style={{ color: RED }} />
                        Call: {point.phone}
                      </p>
                      <div className="mt-3 flex justify-center">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            point.address.replace(/\n/g, ' '),
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#d32f2f] px-4 py-1.5 text-[12px] font-semibold text-[#d32f2f] no-underline transition-colors hover:bg-[#fdecec]"
                        >
                          <i className="fa-regular fa-paper-plane text-[11px]" />
                          See in Map
                        </a>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

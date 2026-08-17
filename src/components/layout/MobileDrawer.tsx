'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { shopCategories } from '@/data/categories'

const IMG_BASE = '/images'

export default function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!open) setExpanded(null)
  }, [open])

  return (
    <>
      <div
        onClick={onClose}
        className={`desk:hidden fixed inset-0 bg-black/50 z-[9998] transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <div
        className={`desk:hidden fixed top-0 right-0 h-full w-[85%] max-w-[340px] bg-white z-[9999] shadow-2xl transition-transform duration-300 flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-center px-4 pt-4 pb-3">
          <Link
            href="/order-track"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 border-[1.5px] border-[#d32f2f] text-[#d32f2f] rounded-full px-4 py-1.5 font-semibold text-[13px] no-underline hover:bg-[#d32f2f] hover:text-white transition-colors"
          >
            <Image
              src={`${IMG_BASE}/catalog/view/theme/default/image/svg/order-track-icon.svg`}
              alt=""
              width={15}
              height={15}
              className="w-[15px] h-[15px]"
            />
            Order Track
          </Link>
        </div>

        <div className="px-4 pb-2">
          <h3 className="text-[15px] font-bold text-gray-900 uppercase tracking-wide m-0">Shop</h3>
        </div>
        <div className="border-b border-gray-200 mx-4" />

        <div className="flex-1 overflow-y-auto px-4 py-2">
          {shopCategories.map((cat) => {
            const isOpen = expanded === cat.name
            return (
              <div
                key={cat.name}
                className={`my-1 rounded-2xl transition-colors outline-none [-webkit-tap-highlight-color:transparent] ${
                  isOpen ? 'border border-[#a8a9ad] bg-gray-50' : ''
                }`}
              >
                <div
                  onClick={() => setExpanded(isOpen ? null : cat.name)}
                  className={`flex items-center justify-between px-3 py-3 cursor-pointer outline-none select-none [-webkit-tap-highlight-color:transparent] ${
                    isOpen ? 'border-b border-[#a8a9ad]' : ''
                  }`}
                >
                  <Link
                    href={cat.href}
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpanded(null)
                      onClose()
                    }}
                    className="text-[15px] text-gray-800 no-underline"
                  >
                    {cat.name}
                  </Link>
                  <span className="mi text-[#a8a9ad]">{isOpen ? 'remove' : 'add'}</span>
                </div>

                {isOpen && (
                  <div className="flex flex-col pb-3 px-3">
                    {cat.sub.map((s) => (
                      <Link
                        key={s.name}
                        href={s.href}
                        onClick={() => {
                          setExpanded(null)
                          onClose()
                        }}
                        className="py-2 text-[13px] text-gray-600 no-underline hover:text-[#d32f2f]"
                      >
                        {s.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

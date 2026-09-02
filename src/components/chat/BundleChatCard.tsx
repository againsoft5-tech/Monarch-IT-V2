'use client'

import Image from 'next/image'
import ProductImage from '@/components/ui/ProductImage'
import Link from 'next/link'
import type { BundleSnapshot } from '@/lib/chatStore'

/**
 * A bundle as it appears inside a chat bubble.
 *
 * A bundle is several products plus its gifts, so the single-thumbnail product card
 * misrepresents it — the recipient could not tell what they were being sent. This
 * shows every product, the free gifts and the combined price, mirroring the link
 * preview people see when the same bundle is shared to WhatsApp.
 *
 * Shared by the customer widget and the admin console so both sides see the same thing.
 */
export default function BundleChatCard({
  bundle,
  onNavigate,
}: {
  bundle: BundleSnapshot
  /** Lets the customer widget close itself when the card is followed. */
  onNavigate?: () => void
}) {
  const saving = Math.max(0, bundle.priceOld - bundle.priceNew)

  const inner = (
    <>
      <div className="flex items-center gap-1.5">
        <span className="rounded-full bg-[#fdecec] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-[#c3272b]">
          Monarch Bundle
        </span>
        <span className="text-[10px] font-semibold text-gray-400">
          {bundle.products.length} products
        </span>
      </div>

      <p className="m-0 mt-1.5 line-clamp-2 text-[13px] font-semibold text-gray-800">{bundle.name}</p>

      {bundle.products.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {bundle.products.map((p, i) => (
            <span
              key={`${p.slug ?? p.name}-${i}`}
              title={p.name}
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-[#f5f6fa]"
            >
              {p.image ? (
                <ProductImage src={p.image} alt="" width={44} height={44} className="max-h-[42px] max-w-[42px] object-contain" />
              ) : (
                <span className="mi text-[18px] text-gray-300">inventory_2</span>
              )}
            </span>
          ))}
        </div>
      ) : null}

      {bundle.giftNames.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {bundle.giftNames.map((name) => (
            <span
              key={name}
              className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full bg-[#e8f6ee] px-2 py-0.5 text-[10.5px] font-bold text-[#0f7a43]"
            >
              <span className="mi shrink-0 text-[12px] leading-none">redeem</span>
              <span className="min-w-0 truncate">Free: {name}</span>
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-2">
        <span className="text-[14px] font-bold text-[#c3272b]">
          <span className="font-medium">৳</span>
          <span className="font-price">{bundle.priceNew.toLocaleString()}</span>
        </span>
        {saving > 0 ? (
          <>
            <span className="text-[11px] text-gray-400 line-through">
              ৳{bundle.priceOld.toLocaleString()}
            </span>
            <span className="rounded-md bg-[#ecfdf5] px-1.5 py-0.5 text-[10px] font-semibold text-[#10b981]">
              Save ৳{saving.toLocaleString()}
            </span>
          </>
        ) : null}
      </div>
    </>
  )

  const cls =
    'block w-[300px] sm:w-[340px] rounded-[22px] border border-gray-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]'

  return bundle.href ? (
    <Link
      href={bundle.href}
      onClick={onNavigate}
      className={`${cls} no-underline text-inherit transition-colors hover:border-[#d92128]`}
    >
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  )
}

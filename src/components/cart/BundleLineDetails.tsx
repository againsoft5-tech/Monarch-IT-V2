'use client'

import Link from 'next/link'
import { catalogProductByName } from '@/lib/bundleStore'
import type { CartItem } from '@/data/cart'

/**
 * What a bundle line contains, under its title.
 *
 * A bundle is one cart line, so without this it reads as a single opaque product:
 * the customer cannot see which items they are buying or which free gifts they
 * chose. Shared by the drawer, the cart page and checkout so all three agree.
 */
export default function BundleLineDetails({ item }: { item: CartItem }) {
  if (!item.bundleItems?.length && !item.giftItems?.length) return null

  return (
    <>
      {item.bundleItems?.length ? (
        <ul className="m-0 mt-1.5 flex min-w-0 list-none flex-col gap-0.5 border-l-2 border-gray-100 pl-2.5 p-0">
          {item.bundleItems.map((child) => (
            <li key={child.slug} className="min-w-0 text-[11.5px]">
              <Link
                href={`/${child.slug}`}
                title={child.name}
                // inline-block, not block: the hit area should hug the text rather than
                // stretch across the row. max-w-full keeps truncation working.
                className="inline-block max-w-full truncate align-bottom text-gray-500 no-underline transition-colors hover:text-[#c3272b]"
              >
                {child.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {item.giftItems?.length ? (
        <span className="mt-1.5 flex min-w-0 flex-wrap gap-1">
          {item.giftItems.map((gift) => {
            const body = (
              <>
                <span className="mi shrink-0 text-[13px] leading-none">redeem</span>
                <span className="min-w-0 truncate">Free: {gift.name}</span>
              </>
            )
            const cls =
              'inline-flex min-w-0 items-center gap-1 rounded-full bg-[#e8f6ee] px-2 py-0.5 text-[11px] font-bold text-[#0f7a43]'

            // Only a product gift has a page to link to; custom text gifts do not.
            // Older cart lines predate stored gift slugs, so fall back to a name lookup.
            const slug = gift.slug ?? catalogProductByName(gift.name)?.slug

            return slug ? (
              <Link
                key={gift.name}
                href={`/${slug}`}
                title={gift.name}
                className={`${cls} no-underline transition-colors hover:bg-[#d8efe2]`}
              >
                {body}
              </Link>
            ) : (
              <span key={gift.name} className={cls}>
                {body}
              </span>
            )
          })}
        </span>
      ) : null}
    </>
  )
}

import Image from 'next/image'
import type { CartItem } from '@/data/cart'

/**
 * The thumbnail for a cart line.
 *
 * A bundle is one line holding several products, so a single cover image hides
 * most of what the customer is buying. Bundle lines therefore show one tile per
 * product inside the same square footprint: 2 side by side, 3 as two-plus-one,
 * 4 as a 2x2. Ordinary lines keep their single image.
 */
export default function CartLineThumb({ item, size }: { item: CartItem; size: number }) {
  const children = item.bundleItems ?? []

  if (children.length < 2) {
    return (
      <Image
        src={item.image}
        alt={item.name}
        width={size}
        height={size}
        className="h-full w-full object-contain"
      />
    )
  }

  return (
    <span
      className="grid h-full w-full gap-[2px]"
      style={{
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        // Two products sit in one row; three or four need a second.
        gridTemplateRows: children.length > 2 ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
      }}
    >
      {children.map((child, i) => (
        <span
          key={child.slug}
          className={`flex min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-[3px] bg-white ${
            // An odd third product centres across the bottom row.
            children.length === 3 && i === 2 ? 'col-span-2 mx-auto w-1/2' : ''
          }`}
        >
          <Image
            src={child.image}
            alt={child.name}
            width={size}
            height={size}
            className="max-h-full max-w-full object-contain"
          />
        </span>
      ))}
    </span>
  )
}

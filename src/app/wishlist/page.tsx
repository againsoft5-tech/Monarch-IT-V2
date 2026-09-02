'use client'

import ProductImage from '@/components/ui/ProductImage'
import Link from 'next/link'
import Breadcrumbs from '@/components/category/Breadcrumbs'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { formatCurrency } from '@/lib/currency'
import { categoryProductsMap, type CategoryProduct } from '@/data/categoryProducts'

const wishlistCatalog: CategoryProduct[] = Object.values(categoryProductsMap).flatMap((c) => c.products)

function WishlistCard({
  item,
  onRemove,
  onAddToCart,
}: {
  item: CategoryProduct
  onRemove: () => void
  onAddToCart: () => void
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)]">
      <button
        type="button"
        title="Remove from wishlist"
        onClick={onRemove}
        className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-500 shadow-sm transition-colors hover:border-[#d32f2f] hover:bg-[#d32f2f] hover:text-white cursor-pointer"
      >
        <span className="mi text-[18px] leading-none">close</span>
      </button>

      <Link href={`/${item.slug}`} className="block bg-[#fafbfc]">
        <div className="relative aspect-square w-full">
          <ProductImage
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        {item.rating > 0 ? (
          <div className="mb-1 flex items-center gap-1">
            <span className="text-[13px] leading-none text-[#ffcb39]">
              {'★'.repeat(Math.round(item.rating)) + '☆'.repeat(5 - Math.round(item.rating))}
            </span>
            <span className="text-[11px] text-gray-500">{item.rating.toFixed(1)}</span>
          </div>
        ) : null}

        <Link
          href={`/${item.slug}`}
          className="mb-2 line-clamp-2 flex-1 text-[13px] font-semibold leading-snug text-[#4d4d4d] no-underline hover:text-[#d32f2f]"
        >
          {item.name}
        </Link>

        <div className="mb-2.5 flex flex-wrap items-baseline gap-1.5">
          <span className="text-[15px] font-bold text-[#d32f2f] tabular-nums">
            {formatCurrency(item.priceNew)}
          </span>
          {item.priceOld > item.priceNew ? (
            <span className="text-[11px] text-gray-400 line-through tabular-nums">
              {formatCurrency(item.priceOld)}
            </span>
          ) : null}
          {item.discountPct > 0 ? (
            <span className="text-[10.5px] font-bold text-[#00c68b]">{item.discountPct}% OFF</span>
          ) : null}
        </div>

        <div className="mt-auto flex gap-1.5">
          <button
            type="button"
            onClick={onAddToCart}
            className="flex-1 rounded-full border-2 border-[#d32f2f] bg-white py-1.5 px-2 text-[12px] font-bold text-[#d32f2f] transition-colors hover:bg-[#d32f2f] hover:text-white cursor-pointer"
          >
            Add to Cart
          </button>
          <Link
            href={`/${item.slug}`}
            className="flex shrink-0 items-center justify-center rounded-full bg-[#d32f2f] px-3 text-[12px] font-bold text-white no-underline transition-colors hover:bg-[#b71c1c]"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function WishlistPage() {
  const { wishedIds, removeWish, clearWishlist } = useWishlist()
  const { addItems } = useCart()

  const items = wishlistCatalog.filter((p) => wishedIds.includes(p.id))
  const count = items.length

  const handleAddToCart = (item: CategoryProduct) => {
    addItems([
      {
        id: item.id,
        name: item.name,
        slug: item.slug,
        image: item.image,
        price: item.priceNew,
        priceOld: item.priceOld,
        discountPct: item.discountPct,
        qty: 1,
      },
    ])
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Wishlist', href: '/wishlist' },
        ]}
      />

      <div className="min-h-[50vh] bg-[#f6f7f9]">
        <div className="container mx-auto px-4 min-[992px]:px-14 py-5 md:py-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 md:mb-6">
            <div>
              <h1 className="m-0 text-[20px] font-bold text-gray-900 md:text-[22px]">Wishlist</h1>
              <p className="mt-1 mb-0 text-[13px] text-gray-500">
                {count === 0
                  ? 'Save products you love and buy them later.'
                  : `${count} item${count === 1 ? '' : 's'} saved`}
              </p>
            </div>
            {count > 0 ? (
              <button
                type="button"
                onClick={clearWishlist}
                className="text-[12px] font-semibold text-[#d32f2f] hover:underline cursor-pointer bg-transparent border-0 p-0"
              >
                Clear all
              </button>
            ) : null}
          </div>

          {count === 0 ? (
            <div className="mx-auto max-w-[440px] rounded-[20px] border border-gray-100 bg-white px-6 py-14 text-center shadow-[0_8px_28px_rgba(0,0,0,0.04)] md:rounded-[26px] md:py-16">
              <span className="mi mb-3 block text-[52px] text-[#f5c6c8]">favorite_border</span>
              <h2 className="m-0 text-[16px] font-bold text-gray-800">Your wishlist is empty</h2>
              <p className="mt-2 mb-6 text-[13px] leading-relaxed text-gray-500">
                Browse products and tap the heart icon to save them here.
              </p>
              <Link
                href="/"
                className="inline-flex h-10 items-center justify-center rounded-full bg-[#d32f2f] px-6 text-[13px] font-bold text-white no-underline transition-colors hover:bg-[#b71c1c]"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {items.map((item) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  onRemove={() => removeWish(item.id)}
                  onAddToCart={() => handleAddToCart(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

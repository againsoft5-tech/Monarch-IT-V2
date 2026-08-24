import Image from 'next/image'
import Link from 'next/link'
import type { CategoryProduct } from '@/data/categoryProducts'
import CouponBadge from '@/components/ui/CouponBadge'

/** Ribbon captions are capped by character count so every band truncates at the same point. */
const RIBBON_LABEL_MAX = 10

function clipRibbonLabel(label: string) {
  const text = label.trim()
  return text.length > RIBBON_LABEL_MAX ? `${text.slice(0, RIBBON_LABEL_MAX)}...` : text
}

export default function ProductCard({
  product: p,
  onBuyNow,
  onCompare,
  onChat,
  ribbonLabel,
  ribbonEyebrow = 'Deals',
}: {
  product: CategoryProduct
  onBuyNow: (product: CategoryProduct) => void
  onCompare: (product: CategoryProduct) => void
  onChat: () => void
  /** Corner ribbon caption, e.g. the deal tab this product came from. Hidden when empty. */
  ribbonLabel?: string
  ribbonEyebrow?: string
}) {
  return (
    <div className="flex flex-col">
      <Link
        href={`/${p.slug}`}
        className="relative overflow-hidden aspect-square bg-[#f5f6fa] rounded-2xl md:rounded-[35px] flex items-center justify-center"
      >
        <Image src={p.image} alt={p.name} width={228} height={228} className="w-[78%] h-[78%] object-contain" />
        {ribbonLabel ? (
          // Clip box is half the card; the band is rotated across its diagonal (classic corner ribbon).
          <span className="pointer-events-none absolute top-0 right-0 h-1/2 w-1/2 overflow-hidden">
            <span className="absolute top-[10%] left-[1%] w-[140%] rotate-45 text-center shadow-md">
              {/* 18px on desktop; scaled down on mobile where the card is ~half the width. */}
              <span className="block bg-white py-[2px] text-[11px] md:text-[18px] font-semibold leading-tight text-[#c3272b]">
                {ribbonEyebrow}
              </span>
              <span className="block whitespace-nowrap bg-[#c3272b] px-2 py-[2px] text-[11px] md:text-[18px] font-semibold leading-tight text-white">
                {clipRibbonLabel(ribbonLabel)}
              </span>
            </span>
          </span>
        ) : null}
      </Link>
      <div className="pt-3 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-2 flex-wrap">
          <span className="text-[#ffcb39] text-[13px] md:text-lg leading-none">
            {'★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating))}
          </span>
          <span className="text-[10px] md:text-[12px] text-gray-600">{p.rating.toFixed(1)}</span>
          <span className="inline-flex items-center gap-0.5 text-[10px] md:text-[12px] text-gray-600">
            ({p.reviews}
            <Image
              src="/images/catalog/view/theme/default/image/verified.svg"
              alt="Verified Icon"
              width={12}
              height={12}
              className="w-2.5 h-2.5 md:w-3 md:h-3 mb-0.5"
            />
            )
          </span>
        </div>
        <div className="text-[12px] md:text-[14px] font-bold leading-[1.45] mb-3 flex-1 line-clamp-2 min-h-[2.9em]">
          <Link href={`/${p.slug}`} className="text-[#4d4d4d] no-underline hover:text-[#c3272b]">
            {p.name}
          </Link>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap mb-3.5">
          <span className="text-[13px] md:text-base font-bold text-[#c3272b]"><span className="font-medium">৳</span><span className="font-price">{p.priceNew.toLocaleString()}</span></span>
          {p.priceOld > p.priceNew && (
            <span className="text-[10px] md:text-[11px] text-gray-400 line-through">৳{p.priceOld.toLocaleString()}</span>
          )}
          {p.discountPct > 0 && (
            <span className="text-[9.5px] md:text-[10.5px] font-bold text-[#00c68b]">{p.discountPct}% OFF</span>
          )}
        </div>

        {/* Advertises the best live coupon; the cart applies it on its own. */}
        <div className="mb-2 flex md:mb-2.5">
          <CouponBadge product={p} />
        </div>

        <div className="flex items-center gap-1.5 md:gap-2.5">
          <button
            type="button"
            onClick={() => onBuyNow(p)}
            className="flex-1 h-9 md:h-10 bg-white text-[#c3272b] border border-[#c3272b] rounded-full px-1 md:px-2 text-[11px] md:text-[13px] font-bold hover:bg-[#c3272b] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Buy now
          </button>
          <button
            type="button"
            title="Chat with us"
            onClick={onChat}
            className="group w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full border bg-[#f5f6fa] border-[#ebebeb] hover:bg-[#c3272b] hover:border-[#c3272b] flex items-center justify-center transition-colors cursor-pointer"
          >
            <Image
              src="/images/catalog/view/theme/default/image/message-icon.svg"
              alt="Chat with us"
              width={20}
              height={20}
              className="w-4 h-4 md:w-5 md:h-5 transition-all group-hover:brightness-0 group-hover:invert"
            />
          </button>
          <button
            type="button"
            title="Compare this Product"
            onClick={() => onCompare(p)}
            className="group w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-[#f5f6fa] border border-[#ebebeb] flex items-center justify-center hover:bg-[#c3272b] hover:border-[#c3272b] transition-colors cursor-pointer"
          >
            <Image
              src="/images/catalog/view/theme/default/image/compare-icon-svg.svg"
              alt="Compare this Product"
              width={20}
              height={20}
              className="w-4 h-4 md:w-5 md:h-5 transition-all group-hover:brightness-0 group-hover:invert"
            />
          </button>
        </div>
      </div>
    </div>
  )
}

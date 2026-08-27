'use client'

import { useMemo, useState } from 'react'
import ProductGallery from './ProductGallery'
import ProductInfo from './ProductInfo'
import ProductMeta from './ProductMeta'
import ProductTabs, { type ProductTab } from './ProductTabs'
import ProductSidebar from './ProductSidebar'
import MoreToLove from './MoreToLove'
import ProductBundlePanel, { useProductBundles } from './ProductBundlePanel'
import type { ProductDetail, RelatedProduct } from '@/data/productDetail'
import { applySelection, defaultSelection, findCombo, resolveGalleryImages } from '@/lib/productVariants'

export default function ProductDetailPage({ product }: { product: ProductDetail }) {
  const [tab, setTab] = useState<ProductTab>('spec')
  const variantGroups = useMemo(() => product.variantGroups ?? [], [product.variantGroups])
  const variantCombos = useMemo(() => product.variantCombos ?? [], [product.variantCombos])
  const [selection, setSelection] = useState(() => defaultSelection(variantGroups, variantCombos))
  /* Asked here rather than inside the panel: the third grid column only exists when
     there is a bundle to put in it, so a product in none keeps the original two-column
     layout instead of leaving 310px of empty rail. */
  const hasBundle = useProductBundles(product.slug).length > 0

  const pairedProducts = useMemo(() => {
    const candidates = [product.mostViewed, ...(product.moreToLove ?? [])].filter(
      (p): p is RelatedProduct => Boolean(p),
    )
    const seen = new Set<string>()
    return candidates.filter((p) => (seen.has(p.slug) ? false : (seen.add(p.slug), true))).slice(0, 6)
  }, [product.mostViewed, product.moreToLove])

  const goToTab = (target: ProductTab) => {
    setTab(target)
    document.getElementById('tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const activeCombo = findCombo(variantCombos, selection)
  const galleryImages = resolveGalleryImages(variantGroups, selection, product.images)

  return (
    <div className="bg-[#f6f7f9]">
      <div className="bg-white">
        <div className="container mx-auto px-4 min-[992px]:px-14 py-6">
          {/*
            The rail starts at 1200px and stays deliberately narrow there — the panel
            is built on container queries, so it re-lays itself out for whatever width
            it gets instead of demanding a fixed one. It widens twice as the screen
            does, and the gallery (not the info column) pays for it, since info carries
            the title, price, key features and the buy row.

            Below 1200px — tablets and small laptops — the panel drops under the info
            block, where it has the whole width to itself.

            All three steps are in rem: Tailwind v4 emits px-based media queries BEFORE
            rem-based ones, so a `min-[1200px]` rule would lose to `md:`.
          */}
          <div
            className={`grid grid-cols-1 md:grid-cols-[40%_60%] gap-5 items-start ${
              hasBundle
                ? 'min-[75rem]:grid-cols-[28%_1fr_200px] min-[85rem]:grid-cols-[29%_1fr_230px] min-[100rem]:grid-cols-[32%_1fr_280px]'
                : ''
            }`}
          >
            {/*
              Meta and Info used to sit in separate grid rows beside a
              row-spanning gallery. CSS Grid sizes a row-spanning item's
              tracks off their *combined* height, so on short products
              (no variants) it inflated the meta row to make up the
              difference — a visible gap between the meta line and the
              title. Grouping them into one flex column removes that:
              they're always tight against each other regardless of the
              gallery's height. `contents` on mobile lets the gallery
              still land between them in source order.
            */}
            <div className="contents md:flex md:flex-col md:gap-2 md:col-start-2 md:row-start-1 md:pt-4">
              <div className="order-1 md:order-none">
                <ProductMeta product={product} onShowReviews={() => goToTab('rev')} />
              </div>
              <div className="order-3 md:order-none">
                <ProductInfo
                  product={product}
                  onShowSpecs={() => goToTab('spec')}
                  variantGroups={variantGroups}
                  variantCombos={variantCombos}
                  selection={selection}
                  onSelectVariant={(groupKey, optionId) =>
                    setSelection((prev) => applySelection(variantGroups, variantCombos, prev, groupKey, optionId))
                  }
                  activeCombo={activeCombo}
                />
              </div>
            </div>
            <div className="order-2 md:order-none md:col-start-1 md:row-start-1">
              <ProductGallery images={galleryImages} name={product.name} videoId={product.videoId} />
            </div>
            {/* Spans both columns at md so it reads as a full-width block under the
                fold, then becomes the rail at xl. Left out entirely when there is no
                bundle — an empty cell would still add a row and its gap. */}
            {hasBundle ? (
              <div className="order-4 md:order-none md:col-span-2 md:mx-auto md:w-full md:max-w-[560px] min-[75rem]:col-span-1 min-[75rem]:col-start-3 min-[75rem]:row-start-1 min-[75rem]:max-w-none">
                <ProductBundlePanel slug={product.slug} />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 min-[992px]:px-14 pt-6 pb-2.5">
        <div className="flex flex-col lg:flex-row gap-5 items-stretch">
          <div className="flex-1 min-w-0 flex flex-col">
            <ProductTabs product={product} tab={tab} onTabChange={setTab} />
          </div>
          {pairedProducts.length > 0 && <ProductSidebar products={pairedProducts} />}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="order-2 md:order-1 container mx-auto px-4 min-[992px]:px-14 py-2.5">
          <div className="bg-white border-[1.5px] border-gray-100 rounded-[40px] p-5 md:p-6">
            <h2 className="text-[17px] font-bold text-gray-900 mb-2">
              What is the price of {product.name}?
            </h2>
            <p className="text-[13px] text-gray-600 leading-[1.8]">
              The latest price of {product.name} in Bangladesh is ৳{product.priceNew.toLocaleString()}. You can buy
              it at the best price from our website or visit any of our showrooms.
            </p>
          </div>
        </div>

        {product.moreToLove && product.moreToLove.length > 0 && (
          <div className="order-1 md:order-2">
            <MoreToLove products={product.moreToLove} />
          </div>
        )}
      </div>
    </div>
  )
}

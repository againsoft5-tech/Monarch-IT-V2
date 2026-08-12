'use client'

import { useMemo, useState } from 'react'
import ProductGallery from './ProductGallery'
import ProductInfo from './ProductInfo'
import ProductMeta from './ProductMeta'
import ProductTabs, { type ProductTab } from './ProductTabs'
import ProductSidebar from './ProductSidebar'
import MoreToLove from './MoreToLove'
import ProductComboSection from './ProductComboSection'
import type { ProductDetail, RelatedProduct } from '@/data/productDetail'
import { applySelection, defaultSelection, findCombo, resolveGalleryImages } from '@/lib/productVariants'

export default function ProductDetailPage({ product }: { product: ProductDetail }) {
  const [tab, setTab] = useState<ProductTab>('spec')
  const variantGroups = useMemo(() => product.variantGroups ?? [], [product.variantGroups])
  const variantCombos = useMemo(() => product.variantCombos ?? [], [product.variantCombos])
  const [selection, setSelection] = useState(() => defaultSelection(variantGroups, variantCombos))

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
          <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-5 md:gap-y-2 items-start">
            <div className="order-1 md:order-2 md:col-start-2 md:row-start-1 md:pt-4">
              <ProductMeta product={product} onShowReviews={() => goToTab('rev')} />
            </div>
            <div className="order-2 md:order-1 md:col-start-1 md:row-start-1 md:row-span-2">
              <ProductGallery images={galleryImages} name={product.name} />
            </div>
            <div className="order-3 md:order-3 md:col-start-2 md:row-start-2">
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
        </div>
      </div>

      <ProductComboSection slug={product.slug} />

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

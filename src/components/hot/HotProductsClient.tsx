'use client'

import { useMemo, useState } from 'react'
import CategoryPage from '@/components/category/CategoryPage'
import HotProductsHero from '@/components/hot/HotProductsHero'
import HotProductTabs, { type HotTab } from '@/components/hot/HotProductTabs'
import type { CategoryProduct } from '@/data/categoryProducts'

export type HotProduct = CategoryProduct & { categorySlug: string }

type Props = {
  products: HotProduct[]
  tabs: HotTab[]
  priceMin: number
  priceMax: number
  title: string
  subtitle: string
}

export const ALL_TAB = 'all'

export default function HotProductsClient({ products, tabs, priceMin, priceMax, title, subtitle }: Props) {
  const [active, setActive] = useState(ALL_TAB)

  const filtered = useMemo(
    () => (active === ALL_TAB ? products : products.filter((p) => p.categorySlug === active)),
    [products, active],
  )

  return (
    <>
      {/* Banner and tabs live outside the keyed CategoryPage below, so switching tabs
          doesn't remount the strip and scroll the active pill out of view. The container
          classes mirror CategoryPage's own wrapper to keep everything aligned. */}
      <div className="container mx-auto px-4 min-[992px]:px-14 pt-6">
        <HotProductsHero title={title} subtitle={subtitle} />
        <HotProductTabs tabs={tabs} active={active} onChange={setActive} />
      </div>

      <CategoryPage
        // Remounting on tab change resets pagination and the brand/price filters, which
        // would otherwise carry over to a tab where those brands don't exist.
        key={active}
        categoryName="Hot Products"
        products={filtered}
        priceMinDefault={priceMin}
        priceMaxDefault={priceMax}
        // Empty (not omitted) so CategoryPage renders no heading — the banner above is it.
        hero={<></>}
        about={{
          title: 'About Hot Products',
          body: (
            <p className="text-[13px] text-gray-600 leading-[1.8] mb-3">
              Hot Products gathers the fastest-moving tech at Monarch IT — the deals with the deepest savings
              across desktops, laptops, gaming gear, monitors, ACs, UPS and office equipment. Prices already
              include the discount, so there is nothing extra to apply at checkout. The list refreshes as
              pricing changes, so check back often.
            </p>
          ),
        }}
      />
    </>
  )
}

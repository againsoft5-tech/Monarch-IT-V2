'use client'

import { useState } from 'react'
import Breadcrumbs from '@/components/category/Breadcrumbs'
import ShopYourBundles from '@/components/bundles/ShopYourBundles'
import BuildYourOwnBundle from '@/components/bundles/BuildYourOwnBundle'
import { useBundleStore } from '@/lib/bundleStore'
import { MIN_BUNDLE_PRODUCTS } from '@/data/bundleData'

type Tab = 'shop' | 'build'

const TABS: { key: Tab; label: string }[] = [
  { key: 'shop', label: 'Shop Your Bundles' },
  { key: 'build', label: 'Build Your Own Bundle' },
]

type Props = {
  /**
   * Rendered inside another page (the Offers & Deals "Bundles" tab), which
   * already supplies the breadcrumbs and page container.
   */
  embedded?: boolean
}

export default function BundlesPage({ embedded = false }: Props = {}) {
  const db = useBundleStore()
  const [tab, setTab] = useState<Tab>('shop')

  // A ready bundle needs at least the minimum product count to be sellable.
  const ready = Object.values(db.ready).filter(
    (b) => b.active && b.products.length >= MIN_BUNDLE_PRODUCTS,
  )
  const custom = Object.values(db.custom).filter((b) => b.active && b.tabs.length > 0)

  return (
    <>
      {embedded ? null : (
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Bundles', href: '/bundles' }]} />
      )}

      <div className={embedded ? 'bundles-module' : 'bundles-module container mx-auto px-4 py-8 min-[992px]:px-14'}>
        {/* Tab pills — the whole page below switches with these. */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {TABS.map((t) => {
            const active = tab === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                aria-pressed={active}
                className={`rounded-full px-6 py-2.5 text-[14px] font-bold transition-colors ${
                  active
                    ? 'bg-[#c3272b] text-white'
                    : 'border border-[#c3272b] bg-white text-[#c3272b] hover:bg-[#fdecec]'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>

        {tab === 'shop' ? <ShopYourBundles bundles={ready} /> : <BuildYourOwnBundle bundles={custom} />}
      </div>
    </>
  )
}

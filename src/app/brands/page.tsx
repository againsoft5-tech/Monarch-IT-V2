import type { Metadata } from 'next'
import Breadcrumbs from '@/components/category/Breadcrumbs'
import BrandsPage from '@/components/brands/BrandsPage'
import { brandList } from '@/data/brandIndex'

export const metadata: Metadata = {
  title: 'Shop our favourite brands | Monarch IT Ltd',
  description: `Browse all ${brandList.length} brands stocked at Monarch IT — jump straight to a brand by letter, or start with our top brands.`,
}

export default function Brands() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Brands', href: '/brands' }]} />
      <BrandsPage />
    </>
  )
}

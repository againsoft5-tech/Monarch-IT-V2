import type { Metadata } from 'next'
import Breadcrumbs from '@/components/category/Breadcrumbs'
import PolicyPage from '@/components/legal/PolicyPage'
import { warrantyPolicy } from '@/data/policies/warranty'

export const metadata: Metadata = {
  title: 'Warranty Policy | Monarch IT Ltd',
  description:
    'Monarch IT Limited-এর Warranty Policy — ওয়ারেন্টির মেয়াদ, আওতায় যা থাকবে ও থাকবে না, warranty claim করার নিয়ম, diagnosis, repair/replacement এবং data backup সম্পর্কে বিস্তারিত।',
}

export default function WarrantyPolicy() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Warranty Policy', href: '/warranty-policy' }]} />
      <PolicyPage doc={warrantyPolicy} />
    </>
  )
}

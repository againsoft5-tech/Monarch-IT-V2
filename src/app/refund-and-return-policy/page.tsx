import type { Metadata } from 'next'
import Breadcrumbs from '@/components/category/Breadcrumbs'
import PolicyPage from '@/components/legal/PolicyPage'
import { refundReturnPolicy } from '@/data/policies/refund-return'

export const metadata: Metadata = {
  title: 'Refund & Return Policy | Monarch IT Ltd',
  description:
    'Monarch IT Limited-এর Refund & Return Policy — Return করার যোগ্যতা ও সময়সীমা, Return-এর শর্ত, Replacement, Refund সময় এবং order cancellation সম্পর্কে বিস্তারিত।',
}

export default function RefundAndReturnPolicy() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Refund & Return Policy', href: '/refund-and-return-policy' },
        ]}
      />
      <PolicyPage doc={refundReturnPolicy} />
    </>
  )
}

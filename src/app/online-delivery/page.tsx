import type { Metadata } from 'next'
import Breadcrumbs from '@/components/category/Breadcrumbs'
import PolicyPage from '@/components/legal/PolicyPage'
import { onlineDeliveryPolicy } from '@/data/policies/online-delivery'

export const metadata: Metadata = {
  title: 'Online Delivery Policy | Monarch IT Ltd',
  description:
    'Monarch IT Limited-এর Online Delivery Policy — অর্ডার কনফার্মেশন, ডেলিভারি সময় ও চার্জ, ক্যাশ অন ডেলিভারি, অর্ডার বাতিল এবং ঢাকার ভিতরে ও বাইরের ডেলিভারি সম্পর্কে বিস্তারিত।',
}

export default function OnlineDelivery() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Online Delivery', href: '/online-delivery' }]} />
      <PolicyPage doc={onlineDeliveryPolicy} />
    </>
  )
}

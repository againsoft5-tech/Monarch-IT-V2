import type { Metadata } from 'next'
import Breadcrumbs from '@/components/category/Breadcrumbs'
import PolicyPage from '@/components/legal/PolicyPage'
import { privacyPolicy } from '@/data/policies/privacy'

export const metadata: Metadata = {
  title: 'Privacy Policy | Monarch IT Ltd',
  description:
    'Monarch IT Limited-এর Privacy Policy — আমরা কী তথ্য সংগ্রহ করি, কীভাবে ব্যবহার করি, কার সঙ্গে শেয়ার করা হতে পারে এবং আপনার তথ্যের অধিকার সম্পর্কে বিস্তারিত।',
}

export default function Privacy() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy', href: '/privacy' }]} />
      <PolicyPage doc={privacyPolicy} />
    </>
  )
}

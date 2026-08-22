import type { Metadata } from 'next'
import BundlesPage from '@/components/bundles/BundlesPage'

export const metadata: Metadata = {
  title: 'Bundles | Monarch IT',
  description: 'Ready-made and build-your-own product bundles at Monarch IT.',
}

export default function Page() {
  return <BundlesPage />
}

import type { Metadata } from 'next'
import Breadcrumbs from '@/components/category/Breadcrumbs'
import AboutUsPage from '@/components/about/AboutUsPage'

export const metadata: Metadata = {
  title: 'About Us | Monarch IT Ltd',
  description:
    "Monarch IT Limited has been a trusted computer distributor and retailer in Bangladesh since January 1991 — laptops, desktops, gaming PCs, components, gadgets and office technology, delivered to all 64 districts.",
}

export default function About() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About Us', href: '/about-us' }]} />
      <AboutUsPage />
    </>
  )
}

import type { Metadata } from 'next'
import Breadcrumbs from '@/components/category/Breadcrumbs'
import OutletsPage from '@/components/outlets/OutletsPage'

export const metadata: Metadata = {
  title: 'Find our Stores | Monarch IT Ltd',
  description:
    'Monarch IT Limited outlets in Dhaka — head office and RMA/warranty counter at Bs Bhaban, New Elephant Road, Dhaka-1205, and the IDB branch at BCS Computer City, Agargaon, Dhaka-1207.',
}

export default function Outlets() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Find us', href: '/outlets' }]} />
      <OutletsPage />
    </>
  )
}

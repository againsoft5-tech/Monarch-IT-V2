import type { Metadata } from 'next'
import Breadcrumbs from '@/components/category/Breadcrumbs'
import ContactUsPage from '@/components/contact/ContactUsPage'

export const metadata: Metadata = {
  title: 'Contact Us | Monarch IT Ltd',
  description:
    'Call, WhatsApp or message Monarch IT Limited — head office at Bs Bhaban, New Elephant Road, Dhaka-1205 and our store at BCS Computer City, IDB Bhaban, Agargaon, Dhaka-1207. Open 10:00 AM – 08:00 PM.',
}

export default function Contact() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Contact Us', href: '/contact-us' }]} />
      <ContactUsPage />
    </>
  )
}

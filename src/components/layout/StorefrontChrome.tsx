'use client'

import { usePathname } from 'next/navigation'
import SideMenu from './SideMenu'
import Header from './Header'
import MobileHeader from './MobileHeader'
import Footer from './Footer'
import BackToTop from './BackToTop'
import CartDrawer from '@/components/ui/CartDrawer'
import type { FooterSection, HeaderSection, SideMenuSection } from '@/lib/live-edit/homepage'

type Props = {
  children: React.ReactNode
  header?: HeaderSection | null
  footer?: FooterSection | null
  sideMenu?: SideMenuSection | null
}

export default function StorefrontChrome({ children, header, footer, sideMenu }: Props) {
  const pathname = usePathname()

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/website/live-edit')) {
    return <>{children}</>
  }

  const isHome = pathname === '/'

  return (
    <>
      <SideMenu data={sideMenu} />
      <div className="flex-1 flex flex-col desk:pb-0 relative">
        <Header data={header} />
        <MobileHeader data={header} />
        <main className={`flex-1 ${isHome ? '' : 'desk:pt-[72px]'}`}>{children}</main>
        <Footer data={footer} />
      </div>
      <CartDrawer />
      <BackToTop />
    </>
  )
}

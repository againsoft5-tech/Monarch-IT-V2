import OffersPreviewDocument from '@/components/live-edit/OffersPreviewDocument'
import { offersPageRepository } from '@/lib/live-edit/offers-repository'
import { homepageRepository } from '@/lib/live-edit/content-repository'

export default async function LiveEditOffersPreviewPage() {
  const [content, site] = await Promise.all([offersPageRepository.read(), homepageRepository.read()])

  return (
    <OffersPreviewDocument
      initial={content}
      chrome={{ header: site.header, footer: site.footer, sideMenu: site.sideMenu }}
    />
  )
}

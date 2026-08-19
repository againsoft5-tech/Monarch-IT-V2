import DealsPage from '@/components/offers/DealsPage'
import { offersPageRepository } from '@/lib/live-edit/offers-repository'

export default async function OffersAndDealsPage() {
  const content = await offersPageRepository.read()
  return <DealsPage content={content} />
}

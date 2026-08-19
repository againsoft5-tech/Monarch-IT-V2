import OffersLiveEditShell from '@/components/live-edit/OffersLiveEditShell'
import { offersPageRepository } from '@/lib/live-edit/offers-repository'

export default async function LiveEditOffersPage() {
  const content = await offersPageRepository.read()
  return <OffersLiveEditShell initial={content} />
}

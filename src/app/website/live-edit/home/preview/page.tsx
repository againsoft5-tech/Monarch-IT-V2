import LiveEditPreviewDocument from '@/components/live-edit/LiveEditPreviewDocument'
import { homepageRepository } from '@/lib/live-edit/content-repository'

export default async function LiveEditPreviewPage() {
  const content = await homepageRepository.read()
  return <LiveEditPreviewDocument initial={content} />
}

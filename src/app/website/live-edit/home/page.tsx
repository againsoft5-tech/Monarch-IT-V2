import LiveEditShell from '@/components/live-edit/LiveEditShell'
import { homepageRepository } from '@/lib/live-edit/content-repository'

export default async function LiveEditHomePage() {
  const content = await homepageRepository.read()
  return <LiveEditShell initial={content} />
}

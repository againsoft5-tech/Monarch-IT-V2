import HomepageCanvas from '@/components/live-edit/HomepageCanvas'
import { homepageRepository } from '@/lib/live-edit/content-repository'

export default async function HomePage() {
  const content = await homepageRepository.read()
  return <HomepageCanvas content={content} />
}

import type { Metadata } from 'next'
import Breadcrumbs from '@/components/category/Breadcrumbs'
import BlogIndex from '@/components/blog/BlogIndex'

export const metadata: Metadata = {
  title: 'Blog | Monarch IT Ltd',
  description:
    'Stay updated with the latest articles, guides, and news from Monarch IT — buying guides, how-tos, product reviews and tech news.',
}

export default function Blog() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }]} />
      <BlogIndex />
    </>
  )
}

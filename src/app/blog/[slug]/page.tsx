import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/category/Breadcrumbs'
import BlogPostPage from '@/components/blog/BlogPostPage'
import { blogPosts, getPost } from '@/data/blog'

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return { title: 'Blog | Monarch IT Ltd' }
  return {
    title: `${post.title} | Monarch IT Ltd`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: [post.image], type: 'article' },
  }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: post.title, href: `/blog/${post.slug}` },
        ]}
      />
      <BlogPostPage post={post} />
    </>
  )
}

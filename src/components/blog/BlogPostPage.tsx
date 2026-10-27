import Image from 'next/image'
import Link from 'next/link'
import { formatPostDate, getPostNeighbours, type BlogPost } from '@/data/blog'

export default function BlogPostPage({ post }: { post: BlogPost }) {
  const { prev, next } = getPostNeighbours(post.slug)

  return (
    <div className="bg-white">
      <div className="container mx-auto pt-4 pb-14 md:pt-5 md:pb-20">
        <div className="max-w-[760px] mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-[13.5px] md:text-[15px] font-medium text-[#3d3d3d] no-underline hover:text-[#d32f2f] transition-colors"
          >
            <span className="mi text-[18px]">chevron_left</span>
            Blog
          </Link>

          <h1 className="mt-3 text-[20px] md:text-[24px] font-bold text-[#3d3d3d] m-0 leading-[1.3]">{post.title}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] md:text-[13px] text-[#6b6b6b]">
            <span className="flex items-center gap-1.5">
              <span className="mi text-[15px]">edit</span>
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="mi text-[15px]">schedule</span>
              {formatPostDate(post.date)}
            </span>
          </div>

          <Image
            src={post.image}
            alt={post.title}
            width={1600}
            height={900}
            priority
            sizes="(min-width: 800px) 760px, 100vw"
            className="mt-5 w-full h-auto rounded-[16px] object-cover"
          />

          <div className="mt-7 text-[13.5px] md:text-[14.5px] leading-[1.9] text-[#5b5b5b]">
            {post.body.map((block, i) =>
              'ul' in block ? (
                <ul key={i} className="list-none m-0 mt-4 p-0">
                  {block.ul.map((item) => (
                    <li key={(item.label ?? '') + item.text} className="flex items-start gap-2">
                      <span className="mt-[11px] w-[3px] h-[3px] shrink-0 rounded-full bg-[#5b5b5b]" />
                      <span>
                        {item.label && <strong className="font-bold text-[#3d3d3d]">{item.label}</strong>}
                        {item.label && item.text ? ' ' : ''}
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p key={i} className="m-0 mt-4 first:mt-0 break-words">
                  {block.p}
                </p>
              ),
            )}
          </div>

          <div className="mt-12 md:mt-16 flex items-center justify-between gap-4">
            {prev ? (
              <Link
                href={`/blog/${prev.slug}`}
                className="inline-flex items-center gap-1 h-[38px] px-5 rounded-full bg-[#f5f5f7] text-[13.5px] font-medium text-[#3d3d3d] no-underline hover:bg-[#ececf0] transition-colors"
              >
                <span className="mi text-[18px]">chevron_left</span>
                Previous
              </Link>
            ) : (
              <span />
            )}

            {next ? (
              <Link
                href={`/blog/${next.slug}`}
                className="inline-flex items-center gap-1 h-[38px] px-5 rounded-full bg-[#d32f2f] text-[13.5px] font-medium text-white no-underline hover:bg-[#b71c1c] transition-colors"
              >
                Next
                <span className="mi text-[18px]">chevron_right</span>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

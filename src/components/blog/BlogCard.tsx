import Image from 'next/image'
import Link from 'next/link'
import { formatPostDate, type BlogPost } from '@/data/blog'

/**
 * Post card. `compact` is the smaller type used in the All Posts grid (4-up);
 * the default size is the Featured carousel's (3-up).
 */
export default function BlogCard({ post, compact = false }: { post: BlogPost; compact?: boolean }) {
  return (
    <article className="h-full flex flex-col rounded-[16px] bg-[#f5f5f7] overflow-hidden">
      <Link href={`/blog/${post.slug}`} className="block" tabIndex={-1} aria-hidden>
        <Image
          src={post.image}
          alt=""
          width={1600}
          height={900}
          sizes={compact ? '(min-width: 1025px) 25vw, (min-width: 640px) 50vw, 100vw' : '(min-width: 1025px) 33vw, 90vw'}
          className="w-full h-auto aspect-[16/9] object-cover"
        />
      </Link>

      <div className={`flex-1 flex flex-col ${compact ? 'px-4 pt-3 pb-4' : 'px-5 pt-4 pb-5'}`}>
        <h3 className={`m-0 font-bold text-[#3d3d3d] ${compact ? 'text-[12.5px] leading-[1.35]' : 'text-[15px] leading-[1.35]'}`}>
          <Link href={`/blog/${post.slug}`} className="text-inherit no-underline hover:text-[#d32f2f] transition-colors">
            {post.title}
          </Link>
        </h3>

        <p className={`m-0 flex items-center gap-1.5 text-[#6b6b6b] ${compact ? 'mt-2 text-[10.5px]' : 'mt-3 text-[12px]'}`}>
          <span className={`mi ${compact ? 'text-[12px]' : 'text-[14px]'}`}>edit</span>
          {post.author}
        </p>
        <p className={`m-0 flex items-center gap-1.5 text-[#6b6b6b] ${compact ? 'mt-0.5 text-[10.5px]' : 'mt-1 text-[12px]'}`}>
          <span className={`mi ${compact ? 'text-[12px]' : 'text-[14px]'}`}>schedule</span>
          {formatPostDate(post.date)}
        </p>

        {/* Spacer, so the buttons line up across cards whose titles run to a
            different number of lines. */}
        <div className={compact ? 'flex-1 min-h-[16px]' : 'flex-1 min-h-[20px]'} />

        <Link
          href={`/blog/${post.slug}`}
          className={`flex items-center justify-center rounded-full bg-white text-[#3d3d3d] font-medium no-underline transition-colors hover:bg-[#d32f2f] hover:text-white ${
            compact ? 'h-[32px] text-[12px]' : 'h-[40px] text-[14px]'
          }`}
        >
          Read More
          <span className="sr-only">: {post.title}</span>
        </Link>
      </div>
    </article>
  )
}

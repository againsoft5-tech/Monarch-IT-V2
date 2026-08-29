import Image from 'next/image'
import Link from 'next/link'

type Props = {
  image?: string
  href?: string
  title?: string
  subtitle?: string
  buttonLabel?: string
}

/**
 * "Build your own PC" banner on the homepage.
 *
 * The artwork is a plain wide image, so the heading and the call to action are
 * rendered around it rather than baked in: the same banner then reads correctly at
 * any width, stays translatable, and the button is a real link rather than a hotspot
 * the customer has to guess at.
 */
export default function DreamPcBanner({
  image = '/images/banners/pc-builder-home-page-banner.png',
  href = '/pc-builder',
  title = 'Build Your Own PC',
  subtitle = 'Pick your parts',
  buttonLabel = 'Build Now',
}: Props) {
  return (
    <div className="container mx-auto px-4 min-[992px]:px-14 py-10">
      {title || subtitle ? (
        <div className="mb-[15px] text-center">
          {title ? (
            <h2 className="m-0 mb-1 text-2xl font-bold uppercase text-[#333] md:text-[28px]">
              {title}
            </h2>
          ) : null}
          {subtitle ? <p className="m-0 text-[15px] text-[#777]">{subtitle}</p> : null}
        </div>
      ) : null}

      <Link href={href} className="block" aria-label={title || buttonLabel}>
        <Image
          src={image}
          alt={title || 'Build your own PC'}
          width={1920}
          height={1023}
          /* Intrinsic size drives the aspect ratio, so the banner scales without
             reserving the wrong height while it loads. */
          className="mx-auto block h-auto w-full max-w-[1920px]"
          sizes="(max-width: 1920px) 100vw, 1920px"
          priority={false}
        />
      </Link>

      {buttonLabel ? (
        <div className="mt-4 flex justify-center md:mt-6">
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-full bg-[#bd2026] px-9 py-3 text-[13px] font-bold uppercase tracking-wide text-white no-underline transition-colors hover:bg-[#a5121c] md:px-11 md:text-[14px]"
          >
            {buttonLabel}
          </Link>
        </div>
      ) : null}
    </div>
  )
}

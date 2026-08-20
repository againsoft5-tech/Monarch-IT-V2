import Image from 'next/image'

type Props = {
  title: string
  subtitle: string
}

/**
 * Banner hero for /hot-products.
 *
 * The artwork carries its own illustration on the left and a flame on the right with an
 * empty middle, so the copy sits centred and is padded clear of both on small screens.
 */
export default function HotProductsHero({ title, subtitle }: Props) {
  return (
    // 100px radius from md up; on mobile the banner is only ~130px tall, so a 100px
    // radius would clamp to half the height and turn the ends into a pill.
    <div className="relative overflow-hidden rounded-[36px] md:rounded-[100px] mb-6">
      <Image
        src="/images/banners/hot-products-banner.png"
        alt=""
        width={1557}
        height={303}
        priority
        className="w-full h-[130px] sm:h-[180px] md:h-[230px] object-cover"
      />

      {/* Keeps the headline readable where the artwork is busiest (narrow viewports). */}
      <div className="absolute inset-0 bg-[#c3272b]/35 sm:bg-transparent" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-[16%] sm:px-[18%]">
        <h1 className="text-white font-bold leading-tight text-[20px] sm:text-[30px] md:text-[40px]">
          {title}
        </h1>
        <p className="mt-0.5 md:mt-1 text-white text-[12px] sm:text-[17px] md:text-[22px] leading-snug">
          {subtitle}
        </p>
      </div>
    </div>
  )
}

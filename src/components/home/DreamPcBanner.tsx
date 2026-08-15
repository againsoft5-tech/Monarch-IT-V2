import Image from 'next/image'

type Props = {
  image?: string
  href?: string
  line1?: string
  line2?: string
}

export default function DreamPcBanner({
  image = '/images/image/cache/catalog/website/dream-pc/pc-builder-280x280.png',
  href = '/pc-builder',
  line1 = 'Build Your',
  line2 = 'Dream PC',
}: Props) {
  return (
    <div className="container mx-auto px-4 min-[992px]:px-14 mt-10 overflow-hidden">
      <div className="flex items-center justify-center">
        <div className="relative z-[2]">
          <Image
            src={image}
            alt="Gaming PC"
            width={280}
            height={280}
            className="block w-[230px] h-auto min-[769px]:w-[300px] min-[993px]:w-[400px]"
          />
        </div>

        <div className="relative z-[1] flex items-center -ml-10 min-[769px]:-ml-[60px] min-[993px]:-ml-[150px]">
          <div className="h-[150px] w-[72px] rounded-r-[10px] border border-red-600 border-l-0 min-[481px]:border-[1.5px] min-[769px]:h-[200px] min-[769px]:w-[200px] min-[769px]:rounded-r-[20px] min-[769px]:border-2 min-[993px]:h-[280px] min-[993px]:w-[280px] min-[993px]:rounded-r-[30px]" />

          <a
            href={href}
            className="absolute -right-10 z-[3] block whitespace-nowrap rounded-full border border-red-600 bg-white px-[13px] py-[3px] text-center text-red-600 no-underline transition-colors hover:bg-red-600 hover:text-white min-[481px]:-right-[50px] min-[481px]:border-[1.5px] min-[481px]:px-5 min-[481px]:py-[10px] min-[769px]:-right-[70px] min-[769px]:px-[30px] min-[769px]:py-[15px] min-[993px]:-right-[100px] min-[993px]:border-2 min-[993px]:px-10 min-[993px]:py-5"
          >
            <span className="block text-[10px] font-light leading-tight min-[481px]:text-sm min-[769px]:text-lg min-[993px]:text-2xl">
              {line1}
            </span>
            <span className="block text-xs font-bold leading-tight min-[481px]:text-lg min-[769px]:text-2xl min-[993px]:text-[32px]">
              {line2}
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}

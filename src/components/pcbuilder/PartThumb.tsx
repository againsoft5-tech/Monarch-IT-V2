import Image from 'next/image'
import ProductImage from '@/components/ui/ProductImage'

type Props = {
  icon: string
  iconSvg?: string
  image?: string
  accent?: boolean
  size?: 'sm' | 'lg'
}

export default function PartThumb({ icon, iconSvg, image, accent, size = 'lg' }: Props) {
  const box = size === 'lg' ? 'w-full aspect-square rounded-[14px]' : 'w-9 h-9 shrink-0 rounded-[10px]'
  const iconSize = size === 'lg' ? 'text-[46px]' : 'text-[16px]'
  const svgSize = size === 'lg' ? 56 : 18
  const accentPad = size === 'lg' ? 'p-2.5' : 'p-1.5'

  if (image) {
    return (
      <div className={`${box} bg-[#f4f5f7] flex items-center justify-center relative overflow-hidden`}>
        <ProductImage src={image} alt="" fill sizes="200px" className="object-contain p-1.5" />
      </div>
    )
  }

  return (
    <div className={`${box} bg-[#f4f5f7] flex items-center justify-center relative overflow-hidden`}>
      {accent && (
        <span
          className="absolute w-[70%] aspect-square rounded-full opacity-90"
          style={{
            background:
              'conic-gradient(from 0deg, #ff4d4d, #ffd24d, #4dff88, #4dd2ff, #a64dff, #ff4d4d)',
            filter: 'blur(2px)',
          }}
        />
      )}
      {iconSvg ? (
        <Image
          src={iconSvg}
          alt=""
          width={svgSize}
          height={svgSize}
          className={`relative z-10 object-contain ${accent ? `bg-white/80 rounded-full ${accentPad}` : ''}`}
          style={{ width: svgSize, height: svgSize }}
        />
      ) : (
        <span
          className={`mi ${iconSize} relative z-10 ${accent ? `text-gray-900 bg-white/70 rounded-full ${accentPad}` : 'text-gray-500'}`}
        >
          {icon}
        </span>
      )}
    </div>
  )
}

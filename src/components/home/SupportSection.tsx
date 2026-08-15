import Image from 'next/image'

const IMG_BASE = '/images/image/cache/catalog/website/custom'

type Props = {
  title?: string
  subtitle?: string
  phone?: string
  whatsapp?: string
  hours?: string
  storeLabel?: string
  storeHref?: string
}

export default function SupportSection({
  title = 'Support',
  subtitle = 'Official distributor of trusted brands.',
  phone = '+8801332-812759',
  whatsapp = '+8801332-812764',
  hours = '10:00 AM - 08:00 PM',
  storeLabel = 'Find our Stores',
  storeHref = '/outlets',
}: Props = {}) {
  const phoneTel = phone.replace(/[^\d+]/g, '')
  const wa = whatsapp.replace(/[^\d]/g, '')

  return (
    <section className="py-5">
      <div className="container mx-auto text-center mb-10">
        <h2 className="m-0 text-3xl md:text-5xl font-bold leading-none text-[#3b3b3b]">{title}</h2>
        <p className="mt-2 text-[15px] md:text-lg text-[#6f6f6f]">{subtitle}</p>
      </div>

      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 flex-wrap">
        <div className="order-1 md:hidden">
          <div className="w-[100px] h-[100px] rounded-full flex items-center justify-center">
            <Image
              src={`${IMG_BASE}/support-us-image-140x140.png`}
              alt="Support Agent"
              width={140}
              height={140}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="order-2 md:order-none flex-1 max-w-[420px] w-full border-2 border-[#e53935] rounded-full md:rounded-[60px] px-6 md:px-[30px] py-3 md:py-5 flex items-center gap-3 md:gap-5 bg-white">
          <Image
            src={`${IMG_BASE}/support-phone-image-60x60.png`}
            alt="Phone"
            width={60}
            height={60}
            className="w-[35px] h-[35px] md:w-[60px] md:h-[60px] object-contain"
          />
          <div>
            <a href={`tel:${phoneTel}`} className="block no-underline">
              <strong className="block text-lg max-[400px]:text-[13px] font-bold text-[#444] leading-[1.4]">
                {phone}
              </strong>
            </a>
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="block no-underline">
              <strong className="block text-lg max-[400px]:text-[13px] font-bold text-[#444] leading-[1.4]">
                {whatsapp} <span className="italic font-normal text-[#666]">(WhatsApp)</span>
              </strong>
            </a>
            <p className="m-0 text-[#666] max-[400px]:text-[12px]">{hours}</p>
          </div>
        </div>

        <div className="hidden md:block">
          <Image
            src={`${IMG_BASE}/support-us-image-140x140.png`}
            alt="Support Agent"
            width={140}
            height={140}
            className="w-[110px] md:w-[140px] h-auto block"
          />
        </div>

        <a
          href={storeHref}
          className="order-3 md:order-none flex-1 max-w-[420px] w-full border-2 border-[#e53935] rounded-full md:rounded-[60px] px-6 md:px-[30px] py-5 flex items-center gap-3 md:gap-5 bg-white no-underline text-inherit"
        >
          <Image
            src={`${IMG_BASE}/support-location-60x60.png`}
            alt="Store Locator"
            width={60}
            height={60}
            className="w-[35px] h-[35px] md:w-[60px] md:h-[60px] object-contain"
          />
          <div>
            <small className="block text-[#777] text-[15px] max-[400px]:text-[12px] mb-1">Store Locator</small>
            <strong className="block text-lg max-[400px]:text-[13px] font-bold text-[#444] leading-[1.4]">
              {storeLabel}
            </strong>
          </div>
        </a>
      </div>
    </section>
  )
}

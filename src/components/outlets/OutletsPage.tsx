import Image from 'next/image'
import SeeInMap from '@/components/ui/SeeInMap'
import { MAPS } from '@/data/locations'

const PHOTO = '/images/outlets'

const outlets = [
  {
    photo: `${PHOTO}/head-office.jpg`,
    alt: 'Reception at the Monarch IT head office, Bs Bhaban, New Elephant Road',
    icon: 'corporate_fare',
    filled: true,
    name: 'Head Office',
    address: ['Bs Bhaban, 2nd Floor, 75-76,', 'New Elephant Road, Dhaka-1205'],
    phone: '+880 1332 812 758',
    hours: '10.00 AM–8.00 PM',
    note: '',
    map: MAPS.headOffice,
  },
  {
    photo: `${PHOTO}/rma.jpg`,
    alt: 'A boxed product being handed in at the Monarch IT RMA and warranty counter',
    icon: 'settings',
    filled: false,
    name: 'RMA/Warranty',
    address: ['Bs Bhaban, 3rd Floor, 75-76,', 'New Elephant Road, Dhaka-1205'],
    phone: '+880 1332 812 744',
    hours: '10.00 AM–8.00 PM',
    note: 'Tuesday Off',
    map: MAPS.headOffice,
  },
  {
    photo: `${PHOTO}/idb-branch.jpg`,
    alt: 'The Monarch IT Ltd shopfront at BCS Computer City, IDB Bhaban, Agargaon',
    icon: 'storefront',
    filled: true,
    name: 'IDB Branch',
    address: ['Shop-SGR-23, Ground Floor, BCS Computer City,', 'IDB Bhaban, Agargaon, Dhaka-1207'],
    phone: '+880 1332 812 757',
    hours: '10.00 AM–8.00 PM',
    note: 'Sunday Closed',
    map: MAPS.idb,
  },
]

export default function OutletsPage() {
  return (
    <div className="bg-white">
      <div className="container mx-auto pt-6 pb-14 md:pt-8 md:pb-20">
        <div className="max-w-[1240px] mx-auto">
          <h1 className="text-center text-[26px] md:text-[32px] font-bold text-[#1a1a1a] m-0">Find us</h1>

          {/* `lg` rather than the site's `desk` (1025px): Tailwind emits the custom
              breakpoint ahead of `sm`, so `sm:grid-cols-2` would win at every width. */}
          <div className="mt-8 md:mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {outlets.map((o) => (
              <article key={o.name} className="rounded-[26px] md:rounded-[28px] bg-[#d32f2f] flex flex-col">
                {/* Rounded on all four corners, so the card's red shows through beneath
                    the photo's bottom corners exactly as the artwork has it. */}
                <Image
                  src={o.photo}
                  alt={o.alt}
                  width={1240}
                  height={700}
                  sizes="(min-width: 1025px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="w-full h-auto rounded-[26px] md:rounded-[28px] object-cover"
                />

                <div className="flex-1 flex flex-col px-5 pt-4 pb-5">
                  <div className="flex items-start gap-3">
                    <span className={`mi ${o.filled ? 'mi-fill' : ''} text-[28px] md:text-[30px] text-white shrink-0`}>
                      {o.icon}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-[15px] md:text-[16.5px] font-bold text-white m-0">{o.name}</h2>

                      {/* The address runs the full width of the card; only the Call
                          line shares its row with the pill, as drawn. */}
                      <p className="mt-2 m-0 flex items-start gap-1.5 text-white text-[12.5px] md:text-[13.5px] leading-[1.5]">
                        <span className="mi mi-fill text-[15px] leading-[1.3] shrink-0">location_on</span>
                        <span>
                          {o.address.map((line) => (
                            <span key={line} className="block">
                              {line}
                            </span>
                          ))}
                        </span>
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-2.5 gap-y-2.5">
                        <p className="m-0 flex items-center gap-1.5 whitespace-nowrap text-white text-[12.5px] md:text-[13px]">
                          <span className="mi text-[15px] shrink-0">call</span>
                          <a
                            href={`tel:${o.phone.replace(/\s/g, '')}`}
                            className="text-white no-underline hover:underline"
                          >
                            Call: {o.phone}
                          </a>
                        </p>

                        <SeeInMap href={o.map} label={o.name} />
                      </div>
                    </div>
                  </div>

                  {/* Pinned to the bottom so the hours line up across cards whose
                      addresses run to different numbers of lines. */}
                  <p className="mt-auto pt-5 m-0 text-center text-white text-[12.5px] font-bold">
                    Business Hours: {o.hours}
                    {o.note && <span className="font-normal italic"> ({o.note})</span>}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

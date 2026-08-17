'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  title?: string
  subtitle?: string
  bodyHtml?: string
}

export default function AboutBox({
  title = 'Monarch IT Ltd',
  subtitle = 'A Trusted Computer Distributor & Retailer in Bangladesh',
  bodyHtml,
}: Props = {}) {
  const [open, setOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    const measure = () => {
      if (contentRef.current) setContentHeight(contentRef.current.scrollHeight)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [bodyHtml, open])

  return (
    <div className="container mx-auto mt-10">
    <div className="bg-white border border-[#e5e5e5] rounded-[25px] px-[25px] pt-[25px] pb-[30px] relative shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <h2 className="text-center text-[#d52b2b] text-2xl md:text-[28px] font-bold mb-[5px]">{title}</h2>
      <div className="text-center text-[#666] text-[15px] mb-[15px]">
        {subtitle}
      </div>
      <div className="h-px bg-[#e7e7e7] mb-5" />

      <div className="relative text-center">
        <div
          ref={contentRef}
          className="text-[#666] text-[13px] md:text-base leading-[1.7] text-left overflow-hidden transition-[height] duration-500 ease-in-out [&_h3]:text-[15px] [&_h3]:md:text-lg [&_h3]:font-semibold [&_h3]:text-[#333] [&_h3]:mt-0 [&_h3]:mb-2 [&_p]:mb-4 [&_a]:text-[#d52b2b] [&_a]:hover:underline"
          style={{ height: open ? contentHeight : 110 }}
        >
          {bodyHtml ? (
            <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          ) : (
            <>
          <h3 className="text-[15px] md:text-lg font-semibold text-[#333] mt-0 mb-2">
            Leading Computer, Laptop &amp; Gaming PC Retail and Online Shop in Bangladesh
          </h3>
          <p className="mb-4">
            Technology has become an indispensable part of our daily lives, shaping how we work, learn, and entertain
            ourselves. In Bangladesh, where almost every household relies on tech products, the demand for quality
            and reliability is at an all-time high.{' '}
            <a href="https://www.monarchit.com.bd/" className="text-[#d52b2b] hover:underline">
              Monarch IT Limited
            </a>
            , a trusted name since its inception in January 1991, has emerged as the best computer shop in
            Bangladesh. Guided by the motto &ldquo;Create the Future,&rdquo; Monarch IT Limited has earned the trust
            and loyalty of countless customers nationwide, offering a wide range of tech products and services.
          </p>

          <h3 className="text-[15px] md:text-lg font-semibold text-[#333] mb-2">
            Monarch IT – Authorized Importer &amp; Exclusive Distributor in Bangladesh
          </h3>
          <p className="mb-4">
            Monarch IT Limited is a major importer and distributor in Bangladesh&rsquo;s technology sector. The
            company proudly holds exclusive distributorships for several renowned international brands, including
            ROYAL KLUDGE, ONIKUMA, T-WOLF, OSCOO, POWERCOLOR, MANLI, ARCTIC, and AIWA monitor.
          </p>
          <p className="mb-4">
            As an authorized distributor in Bangladesh, Monarch IT ensures that every product is sourced directly
            from manufacturers, guaranteeing authenticity, full warranty support, and competitive pricing. This
            strategic partnership with global brands allows Monarch IT to introduce cutting-edge products — from
            high-performance gaming peripherals and storage solutions to professional-grade components and display
            technologies — directly to Bangladeshi consumers and businesses.
          </p>
          <p className="mb-4">
            With its strong supply chain, technical expertise, and nationwide distribution network, Monarch IT
            continues to strengthen Bangladesh&rsquo;s access to world-class technology, supporting both retail
            customers and corporate clients with reliable and original tech solutions.
          </p>

          <h3 className="text-[15px] md:text-lg font-semibold text-[#333] mb-2">Best Laptop Shop in Bangladesh</h3>
          <p className="mb-4">
            When it comes to finding the best laptop shop in Bangladesh, Monarch IT Limited is the ultimate
            destination. Whether you&rsquo;re a freelancer, office professional, student, or gamer, Monarch IT
            Limited has the perfect laptop to suit your needs. Gamers, in particular, will appreciate the extensive
            collection of gaming laptops in Bangladesh, featuring the latest technology and high-performance specs.
          </p>
          <p className="mb-4">
            As the most popular laptop shop in Bangladesh, Monarch IT Limited caters to all budgets. From entry-level
            to advanced models, they offer the latest Intel laptops in Bangladesh and AMD laptops in Bangladesh.
            Renowned brands like HP, Dell, Asus, Apple MacBook, MSI, Razer, Lenovo, and Gigabyte are all available
            under one roof.
          </p>
          <p className="mb-4">
            For Apple enthusiasts, Monarch IT Limited provides official Apple MacBook Air and MacBook Pro models with
            reliable warranties. Whether you&rsquo;re looking for the best gaming laptop in Bangladesh or a
            budget-friendly option, Monarch IT Limited ensures expert guidance to help you make informed decisions.
          </p>

          <h3 className="text-[15px] md:text-lg font-semibold text-[#333] mb-2">Best Desktop PC Shop in Bangladesh</h3>
          <p className="mb-4">
            For those seeking the best desktop PC shop in Bangladesh, Monarch IT Limited stands out as the most
            trusted retailer. They offer a wide variety of options, including Custom PCs, Brand PCs, All-in-One PCs,
            and Portable Mini PCs. Need an iMac or Apple Mac Mini? Monarch IT Limited has you covered with
            international warranties and service plans.
          </p>
          <p className="mb-4">
            Gaming enthusiasts and professional content creators will find top-tier Gaming PCs and Editing PCs
            designed to deliver unmatched performance. With their unique PC Builder feature, customers can easily
            select PC parts online, customize builds, and receive an estimated budget and performance breakdown.
            Alternatively, you can visit any Monarch IT outlet to create a custom gaming PC in Bangladesh live,
            guided by experienced professionals.
          </p>

          <h3 className="text-[15px] md:text-lg font-semibold text-[#333] mb-2">Gaming PC Shop in Bangladesh</h3>
          <p className="mb-4">
            Gaming is at the heart of Monarch IT Limited. Their specialized Gaming PC shop in Bangladesh, located at
            the IDB Bhaban &amp; Elephant Road, is a paradise for gamers. Monarch IT Limited offers an extensive
            collection of high-end gaming components, including Gaming Motherboards, Graphics Cards, Liquid Coolers,
            Custom Water-Cooling setups, RGB Gaming Casings, and more.
          </p>
          <p className="mb-4">
            Partnering with world-renowned gaming brands like Razer, ASUS, Corsair, Cooler Master, SteelSeries,
            Logitech, Redragon, Royal Kludge, Powercolor, Aiwa, Xraypad, Arctic, Oscco, Onikuma and Gigabyte, Monarch
            IT Limited provides the ultimate gaming experience. Their shop features a vast selection of Gaming
            Laptops, Gaming Consoles (Xbox &amp; PlayStation), and gaming accessories such as RGB Mousepads, Gaming
            Chairs, Headphones, and more. Whether you&rsquo;re looking to buy a gaming PC in Bangladesh or upgrade
            your existing setup, Monarch IT Limited is the go-to destination.
          </p>

          <h3 className="text-[15px] md:text-lg font-semibold text-[#333] mb-2">Best Office Equipment Shop in Bangladesh</h3>
          <p className="mb-4">
            For over 34 years, Monarch IT Limited has been the best office equipment shop in BD, offering reliable
            solutions for home offices, startups, and corporate workspaces. Their comprehensive inventory includes
            laptops, desktops, printers, scanners, routers, attendance machines, conference systems, CCTV and IP
            cameras, photocopiers, server equipment, and more. With a focus on affordability and quality, Monarch IT
            Limited ensures your workspace is equipped with the latest technology for seamless operations.
          </p>

          <h3 className="text-[15px] md:text-lg font-semibold text-[#333] mb-2">Largest Gadget Shop in Bangladesh</h3>
          <p className="mb-4">
            Monarch IT Limited has earned its reputation as the largest gadget shop in Bangladesh. From daily
            lifestyle gadgets like smartwatches, earbuds, and power banks to professional equipment like drones, DSLR
            cameras, gimbals, and studio gear, Monarch IT Limited offers it all. They partner with top global brands
            such as DJI drones Bangladesh, Blackmagic, Zhiyun, Corsair gaming accessories BD, Xiaomi, Anker, Samsung,
            and Apple to bring the latest and most innovative gadgets to the Bangladeshi market. Whether you need
            accessories for your smartphone or specialized tools for creative projects, Monarch IT Limited is your
            one-stop solution.
          </p>

          <h3 className="text-[15px] md:text-lg font-semibold text-[#333] mb-2">Best Home Appliance Shop in Bangladesh</h3>
          <p className="mb-4">
            Monarch IT Limited is committed to meeting the needs of modern households with a wide range of
            high-quality home appliances. From air conditioners and refrigerators to washing machines, ovens, and
            electric room heaters, Monarch IT Limited has you covered. They feature appliances from trusted brands
            like Samsung, LG, Whirlpool, Walton, and Hitachi, ensuring top-notch quality and performance at
            competitive prices.
          </p>

          <h3 className="text-[15px] md:text-lg font-semibold text-[#333] mb-2">Trusted Online Shopping Experience in Bangladesh</h3>
          <p className="mb-4">
            Monarch IT Limited takes pride in providing a seamless and secure online shopping experience in
            Bangladesh. Their eCommerce website is highly regarded for its user-friendly interface and efficient
            search engine, allowing customers to find desired products effortlessly. The site also features the
            innovative PC Builder App, which enables users to customize their PCs, save builds, and view performance
            estimates.
          </p>
          <p className="mb-4">
            Monarch IT Limited regularly hosts exciting campaigns, including Mystery Boxes, Flash Sales, Anniversary
            Offers, and eSports tournaments in collaboration with renowned gaming brands like ASUS ROG and Razer. As
            one of the top eCommerce websites in Bangladesh, Monarch IT Limited ensures a hassle-free shopping
            experience.
          </p>

          <h3 className="text-[15px] md:text-lg font-semibold text-[#333] mb-2">Best Price, Service, and Fastest Delivery in Bangladesh</h3>
          <p className="mb-4">
            Customer satisfaction has always been a top priority for Monarch IT Limited. They ensure the best price
            tech shop BD, offering competitive prices, extended after-sales support, and exceptional customer
            service. With a nationwide presence covering all 64 districts and dedicated service centers in Dhaka,
            Monarch IT Limited delivers products quickly and efficiently.
          </p>

          <h3 className="text-[15px] md:text-lg font-semibold text-[#333] mb-2">Why Choose Monarch IT Limited?</h3>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>
              <strong>Best computer shop in Bangladesh</strong>: Offering a wide range of laptops, desktops, and
              accessories.
            </li>
            <li>
              <strong>Best gaming PC shop in Bangladesh</strong>: Specialized gaming components and setups.
            </li>
            <li>
              <strong>Best gadget shop in Bangladesh</strong>: From smartwatches to drones, they have it all.
            </li>
            <li>
              <strong>Trusted online shop in Bangladesh</strong>: Secure and user-friendly eCommerce platform.
            </li>
            <li>
              <strong>Best home appliance shop in Bangladesh</strong>: High-quality appliances for modern households.
            </li>
          </ul>

          <h3 className="text-[15px] md:text-lg font-semibold text-[#333] mb-2">FAQs About Monarch IT Limited</h3>
          <ol className="list-decimal pl-5 mb-4 space-y-3">
            <li>
              <strong>What makes Monarch IT Limited the best laptop shop in Bangladesh?</strong>
              <br />
              Monarch IT Limited offers a wide range of laptops from top brands like HP, Dell, Asus, Apple, and
              Razer, catering to all budgets and needs.
            </li>
            <li>
              <strong>Where can I buy a gaming PC in Bangladesh?</strong>
              <br />
              Monarch IT Limited is the best destination for buying or customizing a gaming PC in Bangladesh, with
              high-end components and expert guidance.
            </li>
            <li>
              <strong>Does Monarch IT Limited offer Apple products?</strong>
              <br />
              Yes, Monarch IT Limited offers official Apple MacBook Air, MacBook Pro, and iMac models with reliable
              warranties.
            </li>
            <li>
              <strong>What is the PC Builder feature?</strong>
              <br />
              The PC Builder feature allows customers to select PC parts online, customize builds, and receive an
              estimated budget and performance breakdown.
            </li>
            <li>
              <strong>Does Monarch IT Limited deliver nationwide?</strong>
              <br />
              Yes, Monarch IT Limited delivers products across all 64 districts in Bangladesh with fast and
              efficient service.
            </li>
            <li>
              <strong>Are there any ongoing offers or campaigns?</strong>
              <br />
              Monarch IT Limited regularly hosts campaigns like Mystery Boxes, Flash Sales, and Anniversary Offers,
              providing great deals for customers.
            </li>
            <li>
              <strong>Can I buy gaming accessories in Bangladesh from Monarch IT Limited?</strong>
              <br />
              Yes, Monarch IT Limited offers a wide range of gaming accessories from brands like Logitech, Corsair,
              and Razer.
            </li>
            <li>
              <strong>What brands are available at Monarch IT Limited?</strong>
              <br />
              Monarch IT Limited partners with top brands like HP, Dell, Asus, Apple, MSI, Razer, Lenovo, Gigabyte,
              DJI, and more.
            </li>
            <li>
              <strong>Is Monarch IT Limited a trusted online shop in Bangladesh?</strong>
              <br />
              Yes, Monarch IT Limited is highly regarded for its secure and user-friendly eCommerce platform.
            </li>
            <li>
              <strong>Does Monarch IT Limited offer after-sales support?</strong>
              <br />
              Yes, Monarch IT Limited provides extended after-sales support and has dedicated service centers in
              Dhaka.
            </li>
          </ol>

          <p>
            <strong>Monarch IT Limited</strong> continues to set the standard for tech retail and online shopping in
            Bangladesh. With a focus on quality, innovation, and customer satisfaction, they remain the top choice
            for all your technology needs. Experience the difference with Monarch IT Limited — where technology
            meets excellence.
          </p>
            </>
          )}
        </div>

        {!open && (
          <div className="h-[60px] -mt-[60px] relative pointer-events-none bg-gradient-to-b from-white/0 to-white" />
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Collapse description' : 'Expand description'}
          className="w-[40px] h-[40px] rounded-full bg-[#f5f5f7] shadow-[0_2px_8px_rgba(0,0,0,0.08)] mt-[15px] inline-flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/promo-banner/down-arrow.svg"
            alt=""
            className={`w-5 transition-transform duration-400 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
    </div>
    </div>
  )
}

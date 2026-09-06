'use client'

import { useState } from 'react'
import SeeInMap from '@/components/ui/SeeInMap'
import { MAPS } from '@/data/locations'

/** The head-office listing embedded, so the pin below the form is the office itself. */
const MAP_EMBED =
  'https://www.google.com/maps?q=Monarch+IT+Limited%2C+New+Elephant+Road%2C+Dhaka-1205&z=16&hl=en&output=embed'

const branches = [
  {
    icon: 'corporate_fare',
    name: 'Head Office',
    address: ['Bs Bhaban, 2nd Floor, 75-76,', 'New Elephant Road, Dhaka-1205'],
    phone: '+880 1332 812 758',
    map: MAPS.headOffice,
  },
  {
    icon: 'storefront',
    name: 'Store',
    address: ['Shop-SGR-23, Ground Floor, BCS Computer City,', 'IDB Bhaban, Agargaon, Dhaka-1207'],
    phone: '+880 1332 812 757',
    map: MAPS.idb,
  },
]

const fieldClass =
  'w-full h-[48px] md:h-[52px] px-6 rounded-full bg-[#f5f5f7] border-none outline-none text-[14px] md:text-[15px] text-[#333] placeholder:text-[#6f6f74] focus:ring-2 focus:ring-[#d32f2f]/25'

export default function ContactUsPage() {
  const [sent, setSent] = useState(false)

  // No contact endpoint exists yet, so the form acknowledges locally rather than
  // pretending to deliver. Swap this for the POST once the backend lands.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.currentTarget.reset()
    setSent(true)
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto pt-6 pb-10 md:pt-8 md:pb-12">
        <div className="max-w-[1240px] mx-auto">
          <h1 className="text-center text-[26px] md:text-[32px] font-bold text-[#1a1a1a] m-0">Contact Us</h1>

          <div className="mt-8 md:mt-10 grid gap-9 desk:gap-12 desk:grid-cols-[1fr_0.9fr] items-start">
            {/* Send us a message */}
            <section>
              <h2 className="text-[19px] md:text-[21px] font-bold text-[#1a1a1a] m-0">Send us a message</h2>
              <p className="mt-2 max-w-[475px] text-[14px] md:text-[15px] leading-[1.6] text-[#4d4d4d]">
                Have a question, need help, or looking for the right Monarch product? Feel free to reach
                out&mdash;we&rsquo;re here to help.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 md:mt-7" onChange={() => setSent(false)}>
                <label htmlFor="contact-name" className="sr-only">
                  Name
                </label>
                <input id="contact-name" name="name" type="text" required placeholder="Name" className={fieldClass} />

                <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="contact-email" className="sr-only">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      placeholder="Email"
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="sr-only">
                      Phone number
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      placeholder="+880"
                      className={fieldClass}
                    />
                  </div>
                </div>

                <label htmlFor="contact-message" className="sr-only">
                  Your message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={6}
                  placeholder="Enter your message"
                  className="mt-3.5 w-full min-h-[180px] md:min-h-[200px] px-6 py-4 rounded-[26px] md:rounded-[30px] bg-[#f5f5f7] border-none outline-none resize-none text-[14px] md:text-[15px] leading-[1.6] text-[#333] placeholder:text-[#6f6f74] focus:ring-2 focus:ring-[#d32f2f]/25"
                />

                <div className="mt-5 flex items-center justify-end gap-4">
                  {sent && (
                    <p role="status" className="m-0 text-[13.5px] text-[#4d4d4d]">
                      Thanks &mdash; we&rsquo;ll get back to you shortly.
                    </p>
                  )}
                  <button
                    type="submit"
                    className="h-[48px] md:h-[52px] px-8 md:px-10 rounded-full bg-[#d32f2f] text-white text-[15px] md:text-[16px] font-medium border-none cursor-pointer transition-colors hover:bg-[#b71c1c]"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </section>

            {/* Always here to help */}
            <aside className="rounded-[26px] md:rounded-[32px] bg-[#d32f2f] p-5 md:p-7">
              <h2 className="text-[16px] md:text-[18px] font-bold text-white m-0">
                Hi! We are always here to help you.
              </h2>

              <div className="mt-5 rounded-[22px] md:rounded-[26px] bg-[#ff5555] px-5 py-5 md:px-6 flex items-start gap-4">
                <span className="mi text-[30px] md:text-[34px] text-white shrink-0">phone_in_talk</span>
                <div className="min-w-0 text-white text-[14px] md:text-[15px] leading-[1.55]">
                  <a href="tel:+8801332812759" className="block font-bold text-white no-underline hover:underline">
                    +8801332-812759
                  </a>
                  <p className="m-0">
                    <a
                      href="https://wa.me/8801332812764"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-white no-underline hover:underline"
                    >
                      +8801332-812764
                    </a>{' '}
                    <span className="italic">(What&rsquo;s App)</span>
                  </p>
                  <p className="m-0">10:00 AM &ndash; 08:00 PM</p>
                </div>
              </div>

              {branches.map((b) => (
                <div
                  key={b.name}
                  className="mt-4 md:mt-5 rounded-[22px] md:rounded-[26px] bg-[#ff5555] px-5 py-5 md:px-6 flex items-start gap-4"
                >
                  <span className="mi mi-fill text-[30px] md:text-[34px] text-white shrink-0">{b.icon}</span>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] md:text-[16.5px] font-bold text-white m-0">{b.name}</h3>

                    {/* Below sm the card is too narrow to hold the pill beside the address
                        without shredding it into two-word lines, so it drops underneath. */}
                    <div className="mt-2.5 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0 flex-1 text-white text-[12.5px] md:text-[13.5px] leading-[1.5]">
                        <p className="m-0 flex items-start gap-1.5">
                          <span className="mi mi-fill text-[15px] leading-[1.3] shrink-0">location_on</span>
                          <span>
                            {b.address.map((line) => (
                              <span key={line} className="block">
                                {line}
                              </span>
                            ))}
                          </span>
                        </p>
                        <p className="mt-2.5 m-0 flex items-center gap-1.5">
                          <span className="mi text-[15px] shrink-0">call</span>
                          <a href={`tel:${b.phone.replace(/\s/g, '')}`} className="text-white no-underline hover:underline">
                            Call: {b.phone}
                          </a>
                        </p>
                      </div>

                      <SeeInMap href={b.map} label={b.name} />
                    </div>
                  </div>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </div>

      {/* Full-bleed map, flush against the footer as in the design. */}
      <section aria-label="Monarch IT Limited on Google Maps" className="w-full">
        <iframe
          src={MAP_EMBED}
          title="Monarch IT Limited, New Elephant Road, Dhaka-1205"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="block w-full h-[260px] md:h-[340px] desk:h-[380px] border-none"
        />
      </section>
    </div>
  )
}

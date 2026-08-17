'use client'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { FooterSection } from '@/lib/live-edit/homepage'
import { DEFAULT_FOOTER } from '@/lib/live-edit/site-chrome'

type Props = {
  data?: Partial<FooterSection> | null
}

function AccordionSection({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-5 text-left cursor-pointer"
      >
        <span className="text-lg font-bold uppercase tracking-wide text-white">{title}</span>
        <span
          className={`text-2xl font-light leading-none text-white transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
        >
          +
        </span>
      </button>
      <div
        className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pb-6">{children}</div>
        </div>
      </div>
      <div className="border-t border-white/15" />
    </div>
  )
}

function socialIconClass(icon: string) {
  if (icon.includes(' ')) return icon
  return `fab ${icon}`
}

export default function Footer({ data }: Props) {
  const cfg = { ...DEFAULT_FOOTER, ...data }
  const social = (cfg.social ?? []).filter((s) => !s.hidden)
  const socialMobile = (cfg.socialMobile ?? []).filter((s) => !s.hidden)
  const linksCol1 = (cfg.linksCol1 ?? []).filter((l) => !l.hidden)
  const linksCol2 = (cfg.linksCol2 ?? []).filter((l) => !l.hidden)

  return (
    <footer className="bg-[#1d1d1d] text-white pb-[76px] desk:pb-0">
      <div className="hidden md:grid container mx-auto py-[70px] grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1.5fr_1fr] gap-10 lg:gap-[60px] text-center md:text-left">
        <div>
          <Image
            src={cfg.logo}
            alt={cfg.logoAlt}
            width={180}
            height={50}
            className="max-w-[180px] mb-5 mx-auto md:mx-0"
            style={{ height: 'auto' }}
          />
          <p className="text-[#d0d0d0] leading-[1.7] text-[15px] my-5">{cfg.aboutText}</p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {social.map((s) => (
              <a
                key={s.id}
                href={s.href}
                className="w-[38px] h-[38px] border border-white/15 rounded-full flex items-center justify-center text-white no-underline transition-all hover:bg-[#e53935] hover:border-[#e53935] hover:-translate-y-[3px]"
              >
                <i className={`${socialIconClass(s.icon)} text-base`} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[22px] mb-[25px] font-semibold text-white">{cfg.linksTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[30px]">
            <ul className="list-none p-0">
              {linksCol1.map((l) => (
                <li key={l.id} className="mb-4">
                  <Link href={l.href} className="text-[#d6d6d6] no-underline transition-all hover:text-[#ff3d3d]">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="list-none p-0">
              {linksCol2.map((l) => (
                <li key={l.id} className="mb-4">
                  <Link href={l.href} className="text-[#d6d6d6] no-underline transition-all hover:text-[#ff3d3d]">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-[22px] mb-[25px] font-semibold text-white">{cfg.membershipTitle}</h3>
          <div className="flex justify-center md:justify-start">
            <Image
              src={cfg.membershipLogo}
              alt="Partnership Logo"
              width={160}
              height={60}
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
          <div className="text-[#d7d7d7] leading-[1.8] mt-5">
            <strong className="text-white">{cfg.officeLabel}</strong> {cfg.officeAddress}
          </div>
        </div>
      </div>

      <div className="md:hidden container mx-auto px-5 pt-6">
        <AccordionSection title="Company">
          <Image
            src={cfg.logo}
            alt={cfg.logoAlt}
            width={180}
            height={50}
            className="max-w-[160px] mb-4"
            style={{ height: 'auto' }}
          />
          <p className="text-[#d0d0d0] leading-[1.7] text-[15px] m-0">{cfg.aboutText}</p>
        </AccordionSection>

        <AccordionSection title={cfg.linksTitle || 'Important Links'}>
          <div className="grid grid-cols-2 gap-6">
            <ul className="list-none p-0 m-0">
              {linksCol1.map((l) => (
                <li key={l.id} className="mb-4">
                  <Link href={l.href} className="text-[#d6d6d6] no-underline transition-all hover:text-[#ff3d3d]">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="list-none p-0 m-0">
              {linksCol2.map((l) => (
                <li key={l.id} className="mb-4">
                  <Link href={l.href} className="text-[#d6d6d6] no-underline transition-all hover:text-[#ff3d3d]">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </AccordionSection>

        <AccordionSection title={cfg.membershipTitle || 'Membership'}>
          <Image
            src={cfg.membershipLogo}
            alt="Partnership Logo"
            width={160}
            height={60}
            style={{ width: 'auto', height: 'auto' }}
            className="mb-4"
          />
          <div className="text-[#d7d7d7] leading-[1.8]">
            <strong className="text-white">{cfg.officeLabel}</strong> {cfg.officeAddress}
          </div>
        </AccordionSection>

        <div className="flex flex-wrap gap-3 justify-center py-6 border-b border-white/15">
          {socialMobile.map((s) => (
            <a
              key={s.id}
              href={s.href}
              className="w-[38px] h-[38px] border border-white/15 rounded-full flex items-center justify-center text-white no-underline transition-all hover:bg-[#e53935] hover:border-[#e53935] hover:-translate-y-[3px]"
            >
              <i className={`${socialIconClass(s.icon)} text-base`} />
            </a>
          ))}
        </div>
      </div>

      <div className="md:border-t border-white/10 text-center px-5 desk:px-28 py-[25px] container mx-auto">
        <p className="mb-[15px] text-[#d0d0d0]">
          {cfg.copyrightBefore}
          <span className="text-[#ff3d3d]">{cfg.copyrightBrand}</span>
          {cfg.copyrightAfter}
        </p>
        <div className="hidden md:flex justify-center">
          <Image
            src={cfg.paymentImage}
            alt="Payment Methods"
            width={1231}
            height={35}
            className="w-full h-auto"
            style={{ height: 'auto' }}
          />
        </div>
      </div>
    </footer>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCompare } from '@/context/CompareContext'
import { useAuth } from '@/context/AuthContext'
import ChatWidget from '@/components/chat/ChatWidget'
import { useToast, Toast } from '@/components/ui/Toast'

const IMG_BASE = '/images'

const menuItems = [
  { icon: `${IMG_BASE}/catalog/view/theme/default/image/svg/phone-black-icon.svg`, href: '#', label: 'Phone' },
  { icon: `${IMG_BASE}/catalog/view/theme/default/image/message-icon.svg`, href: '#', label: 'Message', action: 'chat' },
  { icon: `${IMG_BASE}/catalog/view/theme/default/image/compare-icon-svg.svg`, href: '/compare', label: 'Compare' },
  { icon: `${IMG_BASE}/catalog/view/theme/default/image/svg/gift-black-icon.svg`, href: '/offers', label: 'Gift' },
  { icon: `${IMG_BASE}/catalog/view/theme/default/image/svg/fire-black-icon.svg`, href: '#', label: 'Hot Deals' },
  { icon: `${IMG_BASE}/catalog/view/theme/default/image/svg/pc-icon.svg`, href: '/pc-builder', label: 'PC Builder', active: true },
]

const mobileOrder = ['Message', 'Compare', 'PC Builder', 'Gift', 'Hot Deals']
const mobileMenuItems = mobileOrder.map((label) => menuItems.find((m) => m.label === label)!)

function renderMobileItem(item: (typeof menuItems)[number], count: number, handleChatClick: () => void) {
  const content = (
    <>
      <div
        className={`rounded-full flex items-center justify-center transition-all duration-200 ${
          item.active
            ? 'w-[76px] h-[76px] bg-[#e0272e] shadow-[0_0_12px_2px_rgba(224,39,46,0.9)]'
            : 'w-11 h-11 bg-white shadow-[0_2px_5px_rgba(0,0,0,0.08)]'
        }`}
      >
        <Image
          src={item.icon}
          alt={item.label}
          width={item.active ? 36 : 22}
          height={item.active ? 36 : 22}
          className={`object-contain ${item.active ? 'w-9 h-9 brightness-0 invert' : 'w-[22px] h-[22px]'}`}
        />
      </div>
      {item.label === 'Compare' &&
        (count > 0 ? (
          <span className="absolute -top-1 right-0.5 min-w-[19px] h-[19px] px-1 bg-[#e0272e] text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-[#F0F0F2] leading-none">
            {count}
          </span>
        ) : (
          <span className="absolute top-0 right-0.5 w-3.5 h-3.5 bg-[#e0272e] rounded-full border-2 border-[#F0F0F2]" />
        ))}
    </>
  )

  if (item.action === 'chat') {
    return (
      <button
        key={item.label}
        type="button"
        onClick={handleChatClick}
        className="relative flex items-center justify-center cursor-pointer shrink-0"
      >
        {content}
      </button>
    )
  }

  const isPlaceholder = item.href === '#'
  const LinkTag = isPlaceholder ? 'a' : Link
  return (
    <LinkTag key={item.label} href={item.href} className="relative flex items-center justify-center no-underline shrink-0">
      {content}
    </LinkTag>
  )
}

export default function SideMenu() {
  const { count } = useCompare()
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const { toast, showToast } = useToast()
  const [chatOpen, setChatOpen] = useState(false)

  const handleChatClick = () => {
    if (!isLoggedIn) {
      showToast('Please login to start chatting')
      router.push('/login')
      return
    }
    setChatOpen(true)
  }

  return (
    <>
      <div className="hidden md:flex fixed left-0 top-0 z-[9999] w-24 h-screen pointer-events-none items-center">
        <div className="flex flex-col items-center gap-3 py-3 px-3 pointer-events-auto bg-[#F5F5F7]/70 backdrop-blur-md rounded-[40px] border border-[#eee] ml-3.5 shadow-[5px_5px_15px_rgba(0,0,0,0.05)]">
          <Link href="/" className="shrink-0 transition-transform duration-200 hover:scale-105">
            <Image
              src={`${IMG_BASE}/catalog/view/theme/default/image/monarch-it-icon.png`}
              alt="Monarch IT"
              width={36}
              height={36}
              className="h-9 w-auto object-contain"
            />
          </Link>

          {menuItems.map((item) => {
            const content = (
              <>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-[0_2px_5px_rgba(0,0,0,0.05)] transition-all duration-200 ${
                    item.active
                      ? 'bg-[#d92128] shadow-[0_4px_10px_rgba(217,33,40,0.3)]'
                      : 'bg-white group-hover:bg-[#d92128] group-hover:shadow-[0_4px_10px_rgba(217,33,40,0.3)]'
                  }`}
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={22}
                    height={22}
                    className={`w-[22px] h-[22px] object-contain transition-all ${
                      item.active ? 'brightness-0 invert' : 'group-hover:brightness-0 group-hover:invert'
                    }`}
                  />
                </div>
                {item.label === 'Compare' &&
                  (count > 0 ? (
                    <span className="absolute -top-1.5 right-0 min-w-[18px] h-[18px] px-1 bg-[#d92128] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white leading-none">
                      {count}
                    </span>
                  ) : (
                    <span className="absolute -top-0.5 right-0 w-4 h-4 bg-[#d92128] rounded-full border-2 border-white" />
                  ))}
              </>
            )

            if (item.action === 'chat') {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={handleChatClick}
                  className="relative group shrink-0 transition-transform duration-200 hover:scale-105 cursor-pointer"
                >
                  {content}
                </button>
              )
            }

            const isPlaceholder = item.href === '#'
            const LinkTag = isPlaceholder ? 'a' : Link
            return (
              <LinkTag key={item.label} href={item.href} className="relative group shrink-0 transition-transform duration-200 hover:scale-105">
                {content}
              </LinkTag>
            )
          })}
        </div>
      </div>

      <div className="md:hidden fixed inset-x-0 bottom-0 z-[9999] pointer-events-none pb-3 px-[10px]">
        <div className="flex items-center justify-between h-16 px-[10px] pointer-events-auto bg-[#f4f5f7]/70 backdrop-blur-md rounded-full shadow-[0_6px_20px_rgba(0,0,0,0.12)]">
          {mobileMenuItems.map((item) => renderMobileItem(item, count, handleChatClick))}
        </div>
      </div>

      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
      <Toast message={toast} />
    </>
  )
}

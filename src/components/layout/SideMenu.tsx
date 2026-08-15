'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCompare } from '@/context/CompareContext'
import { useAuth } from '@/context/AuthContext'
import ChatWidget from '@/components/chat/ChatWidget'
import { useToast, Toast } from '@/components/ui/Toast'
import type { SideMenuItem, SideMenuSection } from '@/lib/live-edit/homepage'
import { DEFAULT_SIDE_MENU } from '@/lib/live-edit/site-chrome'

type Props = {
  data?: Partial<SideMenuSection> | null
  /** Only the rail pill — parent owns fixed/centered positioning (live-edit). */
  embedded?: boolean
}

function renderMobileItem(
  item: SideMenuItem,
  count: number,
  handleChatClick: () => void,
) {
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
        key={item.id}
        type="button"
        onClick={handleChatClick}
        className="relative flex items-center justify-center cursor-pointer shrink-0"
      >
        {content}
      </button>
    )
  }

  const isPlaceholder = !item.href || item.href === '#'
  const LinkTag = isPlaceholder ? 'a' : Link
  return (
    <LinkTag key={item.id} href={item.href || '#'} className="relative flex items-center justify-center no-underline shrink-0">
      {content}
    </LinkTag>
  )
}

export default function SideMenu({ data, embedded = false }: Props) {
  const cfg = useMemo(() => {
    const base = { ...DEFAULT_SIDE_MENU, ...data }
    return {
      ...base,
      items: Array.isArray(data?.items) ? data!.items! : DEFAULT_SIDE_MENU.items,
      mobileIds: Array.isArray(data?.mobileIds) ? data!.mobileIds! : DEFAULT_SIDE_MENU.mobileIds,
    }
  }, [data])

  const desktopItems = useMemo(
    () => (cfg.items ?? []).filter((i) => !i.hidden),
    [cfg.items],
  )

  const mobileItems = useMemo(() => {
    const byId = new Map((cfg.items ?? []).map((i) => [i.id, i]))
    const fromIds = (cfg.mobileIds ?? [])
      .map((id) => byId.get(id))
      .filter((i): i is SideMenuItem => i != null && !i.hidden)
    if (fromIds.length > 0) return fromIds
    return (cfg.items ?? []).filter((i) => !i.hidden && i.showOnMobile !== false)
  }, [cfg.items, cfg.mobileIds])

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

  const rail = (
    <div className="ml-0 flex flex-col items-center gap-3 rounded-[40px] border border-[#eee] bg-[#F5F5F7]/70 px-3 py-3 shadow-[5px_5px_15px_rgba(0,0,0,0.05)] pointer-events-auto backdrop-blur-md">
      <Link
        href={cfg.logoHref || '/'}
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        <Image
          src={cfg.logo}
          alt={cfg.logoAlt}
          width={36}
          height={36}
          className="h-9 w-auto object-contain"
        />
      </Link>

      {desktopItems.map((item) => {
        const content = (
          <>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.05)] transition-all duration-200 ${
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
                className={`h-[22px] w-[22px] object-contain transition-all ${
                  item.active
                    ? 'brightness-0 invert'
                    : 'group-hover:brightness-0 group-hover:invert'
                }`}
              />
            </div>
            {item.label === 'Compare' &&
              (count > 0 ? (
                <span className="absolute -top-1.5 right-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#d92128] px-1 text-[10px] font-bold leading-none text-white">
                  {count}
                </span>
              ) : (
                <span className="absolute -top-0.5 right-0 h-4 w-4 rounded-full border-2 border-white bg-[#d92128]" />
              ))}
          </>
        )

        if (item.action === 'chat') {
          return (
            <button
              key={item.id}
              type="button"
              onClick={handleChatClick}
              className="group relative shrink-0 cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              {content}
            </button>
          )
        }

        const isPlaceholder = !item.href || item.href === '#'
        const LinkTag = isPlaceholder ? 'a' : Link
        return (
          <LinkTag
            key={item.id}
            href={item.href || '#'}
            className="group relative shrink-0 transition-transform duration-200 hover:scale-105"
          >
            {content}
          </LinkTag>
        )
      })}
    </div>
  )

  if (embedded) {
    return (
      <>
        {rail}
        <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
        <Toast message={toast} />
      </>
    )
  }

  return (
    <>
      <div className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-screen w-24 items-center md:flex">
        <div className="ml-3.5">{rail}</div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[9999] px-[10px] pb-3 md:hidden">
        <div className="pointer-events-auto flex h-16 items-center justify-between rounded-full bg-[#f4f5f7]/70 px-[10px] shadow-[0_6px_20px_rgba(0,0,0,0.12)] backdrop-blur-md">
          {mobileItems.map((item) => renderMobileItem(item, count, handleChatClick))}
        </div>
      </div>

      <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
      <Toast message={toast} />
    </>
  )
}

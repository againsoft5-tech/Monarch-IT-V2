'use client'

import { type ReactNode, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useChatStore } from '@/lib/chatStore'
import { useComboStore } from '@/lib/comboStore'

const RED = '#bd2026'
const RED_GRADIENT = 'linear-gradient(135deg, #ef4a23 0%, #bd2026 100%)'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { key: 'live-chat', label: 'Live Chat', href: '/admin/live-chat', icon: 'forum' },
  { key: 'combo', label: 'Combo Campaign', href: '/admin/combo', icon: 'inventory_2' },
  { key: 'hero-slider', label: 'Hero Slider', href: '/admin/hero-slider', icon: 'slideshow' },
  { key: 'promo-banner', label: 'Promo Banner', href: '/admin/promo-banner', icon: 'view_carousel' },
] as const

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logoutAdmin } = useAdminAuth()
  const chatDb = useChatStore()
  const comboDb = useComboStore()
  const [collapsed, setCollapsed] = useState(false)

  const unread = useMemo(
    () =>
      Object.values(chatDb).reduce(
        (sum, convo) => sum + convo.messages.filter((m) => m.sender === 'customer' && !m.read).length,
        0
      ),
    [chatDb]
  )
  const activeCombos = useMemo(() => Object.values(comboDb).filter((c) => c.active).length, [comboDb])

  if (pathname === '/admin/login') return <>{children}</>

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href))

  const handleLogout = () => {
    logoutAdmin()
    router.push('/admin/login')
  }

  return (
    <div className="h-screen w-screen flex bg-[#eef0f3] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`hidden md:flex ${collapsed ? 'w-[84px]' : 'w-[260px]'} shrink-0 flex-col bg-[#15161c] transition-[width] duration-200`}
      >
        <div className={`flex items-center gap-3 py-6 ${collapsed ? 'px-4 justify-center' : 'px-6'}`}>
          <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shrink-0">
            <span className="mi text-[22px]" style={{ color: RED }}>
              bolt
            </span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-white m-0 leading-tight truncate">Monarch IT</p>
              <p className="text-[11px] text-gray-400 m-0 leading-tight truncate">Admin Panel</p>
            </div>
          )}
        </div>

        <div className={`flex ${collapsed ? 'justify-center' : 'justify-end px-4'} pb-2`}>
          <button
            type="button"
            title={collapsed ? 'Expand menu' : 'Collapse menu'}
            onClick={() => setCollapsed((v) => !v)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <span className="mi text-[18px]">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
          </button>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto thin-scroll-gray px-4 pt-2">
          {!collapsed && <p className="text-[11px] font-semibold tracking-wider text-gray-500 px-3 mb-3">MENU</p>}
          <div className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href)
              const badge = item.key === 'live-chat' ? unread : item.key === 'combo' ? activeCombos : 0
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center rounded-2xl py-3 text-[13.5px] font-semibold no-underline transition-colors ${
                    collapsed ? 'justify-center px-0' : 'gap-3 px-4'
                  }`}
                  style={active ? { background: RED_GRADIENT, color: '#fff' } : { color: '#c7c9d1' }}
                >
                  <span className="mi text-[19px] relative">
                    {item.icon}
                    {collapsed && badge > 0 && (
                      <span
                        className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#15161c]"
                        style={{ backgroundColor: active ? '#fff' : RED }}
                      />
                    )}
                  </span>
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && badge > 0 && (
                    <span
                      className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                      style={{ backgroundColor: active ? 'rgba(255,255,255,0.28)' : RED }}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="px-4 py-5 border-t border-white/5">
          <button
            type="button"
            title={collapsed ? 'Logout' : undefined}
            onClick={handleLogout}
            className={`w-full flex items-center rounded-2xl py-3 text-[13.5px] font-semibold text-gray-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer ${
              collapsed ? 'justify-center px-0' : 'gap-3 px-4'
            }`}
          >
            <span className="mi text-[19px]">logout</span>
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Desktop topbar */}
        <header className="hidden md:flex shrink-0 items-center gap-4 h-[76px] px-6 bg-white border-b border-gray-100">
          <div className="relative flex-1 max-w-md">
            <span className="mi absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">search</span>
            <input
              type="text"
              placeholder="Type to search..."
              className="w-full bg-[#f5f5f7] rounded-full pl-11 pr-4 py-2.5 text-[13px] font-medium text-gray-700 placeholder-gray-400 outline-none"
            />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Link
              href="/admin/live-chat"
              title="Live Chat"
              className="relative w-11 h-11 rounded-full bg-[#f5f5f7] hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
            >
              <span className="mi text-[19px]">forum</span>
              {unread > 0 && (
                <span
                  className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                  style={{ backgroundColor: RED }}
                />
              )}
            </Link>
            <div className="flex items-center gap-2.5 pl-1">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
                style={{ background: RED_GRADIENT }}
              >
                A
              </div>
              <div className="leading-tight hidden lg:block">
                <p className="text-[13px] font-semibold text-gray-800 m-0">Admin</p>
                <p className="text-[11px] text-gray-400 m-0">Monarch IT</p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile topbar + nav */}
        <header className="md:hidden shrink-0 flex items-center justify-between px-4 py-3 bg-[#15161c]">
          <p className="text-[15px] font-bold text-white m-0">Monarch IT Admin</p>
          <button type="button" onClick={handleLogout} className="text-[12px] font-semibold text-gray-300 cursor-pointer">
            Logout
          </button>
        </header>
        <nav className="md:hidden shrink-0 flex bg-white border-b border-gray-100">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            const badge = item.key === 'live-chat' ? unread : item.key === 'combo' ? activeCombos : 0
            return (
              <Link
                key={item.key}
                href={item.href}
                className="relative flex-1 text-center py-3 text-[12px] font-semibold no-underline"
                style={active ? { color: RED, borderBottom: `2px solid ${RED}` } : { color: '#6b7280' }}
              >
                {item.label}
                {badge > 0 && (
                  <span
                    className="absolute top-1.5 right-[18%] min-w-[16px] h-[16px] px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: RED }}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

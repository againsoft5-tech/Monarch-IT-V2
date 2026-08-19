'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ExternalLink,
  LayoutList,
  Lock,
  LockOpen,
  LogOut,
  Monitor,
  Save,
  Smartphone,
  Tablet,
} from 'lucide-react'
import type { OffersPageContent } from '@/lib/live-edit/offers-page'
import OffersDealsDrawer from '@/components/live-edit/drawers/OffersDealsDrawer'
import { DrawerResizeHandle, useResizableDrawer } from '@/components/live-edit/useResizableDrawer'
import {
  OFFERS_EDIT_MSG_SOURCE,
  isOffersEditMessage,
  publishOffersDraft,
  type OffersEditMeta,
} from '@/lib/live-edit/offers-draft-sync'

type DeviceId = 'desktop' | 'tablet' | 'mobile'

const DEVICES: { id: DeviceId; label: string; width: string; Icon: typeof Monitor }[] = [
  { id: 'desktop', label: 'Desktop', width: '100%', Icon: Monitor },
  { id: 'tablet', label: 'Tablet', width: '1024px', Icon: Tablet },
  { id: 'mobile', label: 'Mobile', width: '390px', Icon: Smartphone },
]

const iconBtn =
  'inline-flex h-8 items-center gap-1.5 rounded-none border border-white/20 bg-white/10 px-2.5 text-[12px] font-medium text-white hover:bg-white/20'

type Props = {
  initial: OffersPageContent
}

export default function OffersLiveEditShell({ initial }: Props) {
  const router = useRouter()
  const [draft, setDraft] = useState<OffersPageContent>(initial)
  const [selected, setSelected] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sectionsNavOpen, setSectionsNavOpen] = useState(false)
  const [locked, setLocked] = useState(false)
  const [device, setDevice] = useState<DeviceId>('desktop')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const navResize = useResizableDrawer('monarch-offers-nav-width')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const lockedRef = useRef(false)
  const syncIdRef = useRef(0)
  const draftRef = useRef(draft)
  const selectedRef = useRef(selected)
  draftRef.current = draft
  selectedRef.current = selected
  // Do NOT sync lockedRef from React state here — a stale render can overwrite a fresh toggle.

  const liveMeta: OffersEditMeta = useMemo(() => ({ locked, selected }), [locked, selected])

  const pushDraftToFrame = useCallback((metaOverride?: Partial<OffersEditMeta>) => {
    const syncId = ++syncIdRef.current
    const meta: OffersEditMeta = {
      locked: lockedRef.current,
      selected: selectedRef.current,
      ...metaOverride,
      syncId,
    }
    const content = draftRef.current
    publishOffersDraft(content, meta)
    const frame = iframeRef.current?.contentWindow
    if (!frame) return
    frame.postMessage({ source: OFFERS_EDIT_MSG_SOURCE, type: 'draft', content, meta }, window.location.origin)
  }, [])

  useEffect(() => {
    pushDraftToFrame()
  }, [draft, liveMeta, pushDraftToFrame])

  const flash = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/live-edit/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draft }),
      })
      if (!res.ok) throw new Error('Save failed')
      setDirty(false)
      flash('Saved')
    } catch {
      flash('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const logout = async () => {
    await fetch('/api/live-edit/logout', { method: 'POST' })
    router.push('/website/live-edit')
    router.refresh()
  }

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (!isOffersEditMessage(event.data)) return
      const data = event.data
      if (data.type === 'ready') {
        pushDraftToFrame()
        return
      }
      if (data.type === 'select') {
        if (lockedRef.current) return
        setSectionsNavOpen(false)
        setSelected(true)
        setDrawerOpen(true)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [pushDraftToFrame])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void save()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  const toggleEditingLock = () => {
    const next = !lockedRef.current
    lockedRef.current = next
    setLocked(next)
    if (next) {
      setDrawerOpen(false)
      setSectionsNavOpen(false)
      setSelected(false)
      selectedRef.current = false
      pushDraftToFrame({ locked: true, selected: false })
      flash('Locked — browsing only')
    } else {
      pushDraftToFrame({ locked: false })
      flash('Unlocked — live edit on')
    }
  }

  const closeEditDrawer = () => setDrawerOpen(false)

  const dismissPanels = () => {
    setDrawerOpen(false)
    setSectionsNavOpen(false)
    setSelected(false)
  }

  const backToSectionsNav = () => {
    setDrawerOpen(false)
    setSelected(false)
    setSectionsNavOpen(true)
  }

  const frameWidth = DEVICES.find((d) => d.id === device)?.width ?? '100%'

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#eceff3]">
      <header className="sticky top-0 z-[70] flex h-12 items-center gap-1.5 border-b border-[#ddd] bg-[#1f1f1f] px-3 text-white">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="relative inline-flex h-8 items-center gap-1.5 rounded-none border-0 bg-[#bd2026] px-2.5 text-[12px] font-semibold text-white disabled:opacity-60"
          title={saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
          aria-label={saving ? 'Saving' : 'Save'}
        >
          <Save className={`h-4 w-4 shrink-0 ${saving ? 'animate-pulse' : ''}`} />
          <span>{saving ? 'Saving…' : dirty ? 'Save *' : 'Save'}</span>
        </button>
        <button
          type="button"
          onClick={toggleEditingLock}
          className={`${iconBtn} ${locked ? 'border-amber-400/80 bg-amber-500/20 text-amber-100' : ''}`}
          title={locked ? 'Locked — click to unlock live editing' : 'Unlocked — click to lock (browse only)'}
          aria-label={locked ? 'Unlock live editing' : 'Lock live editing'}
          aria-pressed={locked}
        >
          {locked ? <Lock className="h-4 w-4 shrink-0" /> : <LockOpen className="h-4 w-4 shrink-0" />}
          <span>{locked ? 'Locked' : 'Editing'}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (locked) {
              flash('Unlock to edit sections')
              return
            }
            setDrawerOpen(false)
            setSectionsNavOpen(true)
          }}
          className={`${iconBtn} ${locked ? 'opacity-40' : ''}`}
          title={locked ? 'Unlock to open sections' : 'All sections'}
          aria-label="Sections"
          disabled={locked}
        >
          <LayoutList className="h-4 w-4 shrink-0" />
          <span>Sections</span>
        </button>

        <div className="mx-auto flex items-center gap-1">
          {DEVICES.map((d) => {
            const active = device === d.id
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDevice(d.id)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-none border ${
                  active
                    ? 'border-white bg-white text-[#111]'
                    : 'border-white/20 bg-transparent text-white/80 hover:bg-white/10'
                }`}
                title={d.label}
                aria-label={d.label}
                aria-pressed={active}
              >
                <d.Icon className="h-4 w-4" />
              </button>
            )
          })}
        </div>

        <a href="/offers-and-deals" className={iconBtn} title="View page" aria-label="View page">
          <ExternalLink className="h-4 w-4 shrink-0" />
          <span>View page</span>
        </a>
        <button type="button" onClick={() => void logout()} className={iconBtn} title="Logout" aria-label="Logout">
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>
      </header>

      {toast ? (
        <div className="fixed bottom-4 left-1/2 z-[90] -translate-x-1/2 rounded-none bg-[#111] px-3 py-2 text-[12px] text-white">
          {toast}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 justify-center overflow-hidden p-4">
        <iframe
          ref={iframeRef}
          title="Offers live edit preview"
          src="/website/live-edit/offers/preview"
          className="block h-full max-w-full border-0 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)] transition-[width] duration-200"
          style={{ width: frameWidth }}
        />
      </div>

      {sectionsNavOpen ? (
        <aside
          className={`fixed right-0 top-0 z-[80] flex h-full w-full flex-col border-l border-[#e5e5e5] bg-[#eceff3] shadow-xl ${
            navResize.dragging ? 'select-none' : ''
          }`}
          style={{ maxWidth: navResize.width }}
        >
          <DrawerResizeHandle
            dragging={navResize.dragging}
            onPointerDown={navResize.onPointerDown}
            onDoubleClick={navResize.onDoubleClick}
            onKeyDown={navResize.onKeyDown}
          />
          <div className="flex items-center justify-between border-b border-[#ddd] bg-white px-4 py-3">
            <div>
              <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#888]">Live edit</p>
              <h2 className="m-0 text-[16px] font-bold text-[#222]">Sections</h2>
            </div>
            <button
              type="button"
              onClick={dismissPanels}
              className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-[#ddd] bg-white text-[#444]"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="thin-scroll-gray min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <div className="overflow-hidden rounded-none border border-[#e5e5e5] bg-white">
              <div className="px-3 py-2.5">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#444]">
                  Offers page
                </span>
                <span className="block text-[11px] text-[#888]">{draft.tabs.length} tabs</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSectionsNavOpen(false)
                  setSelected(true)
                  setDrawerOpen(true)
                }}
                className="flex w-full items-center gap-3 border-t border-[#eee] px-3 py-3 text-left hover:bg-[#f5f5f7]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-[#e5e5e5] bg-[#fafafa] text-[11px] font-bold text-[#888]">
                  1
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-[#222]">Deals</span>
                  <span className="block text-[11px] text-[#888]">Title · subtitle · tabs · products</span>
                </span>
                <span className="text-[12px] text-[#bd2026]">Edit →</span>
              </button>
            </div>

            <div className="overflow-hidden rounded-none border border-[#e5e5e5] bg-white">
              <div className="px-3 py-2.5">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#444]">
                  Site chrome
                </span>
                <span className="block text-[11px] text-[#888]">Header · side menu · footer</span>
              </div>
              <p className="m-0 border-t border-[#eee] px-3 py-3 text-[11px] leading-snug text-[#888]">
                Chrome is shared across every page — edit it in the{' '}
                <a href="/website/live-edit/home" className="font-semibold text-[#bd2026] underline">
                  homepage editor
                </a>
                . Changes appear here automatically.
              </p>
            </div>
          </div>
        </aside>
      ) : null}

      {(drawerOpen || sectionsNavOpen) ? (
        <button
          type="button"
          aria-label="Close panel"
          className="fixed inset-x-0 bottom-0 top-12 z-[75] cursor-default border-0 bg-black/25 p-0"
          onClick={dismissPanels}
        />
      ) : null}

      {drawerOpen ? (
        <OffersDealsDrawer
          open
          value={draft}
          onChange={(next) => {
            setDraft(next)
            setDirty(true)
          }}
          onClose={closeEditDrawer}
          onBack={backToSectionsNav}
        />
      ) : null}
    </div>
  )
}

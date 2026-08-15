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
import type { HomepageContent, HomepageSectionType } from '@/lib/live-edit/homepage'
import { SECTION_LABELS, SECTION_TYPES } from '@/lib/live-edit/homepage'
import { applyLayoutAction, setPrimarySection } from '@/lib/live-edit/layout-actions'
import type { LayoutActionName } from '@/components/live-edit/LiveEditSection'
import HeroDrawer from '@/components/live-edit/drawers/HeroDrawer'
import CategoriesDrawer from '@/components/live-edit/drawers/CategoriesDrawer'
import PromoDrawer from '@/components/live-edit/drawers/PromoDrawer'
import FeaturedDrawer from '@/components/live-edit/drawers/FeaturedDrawer'
import DreamPcDrawer from '@/components/live-edit/drawers/DreamPcDrawer'
import BrandsDrawer from '@/components/live-edit/drawers/BrandsDrawer'
import HeaderDrawer from '@/components/live-edit/drawers/HeaderDrawer'
import FooterDrawer from '@/components/live-edit/drawers/FooterDrawer'
import SideMenuDrawer from '@/components/live-edit/drawers/SideMenuDrawer'
import SimpleFieldsDrawer from '@/components/live-edit/drawers/SimpleFieldsDrawer'
import SectionsNavDrawer, {
  type SectionsNavTarget,
} from '@/components/live-edit/drawers/SectionsNavDrawer'
import {
  LIVE_EDIT_MSG_SOURCE,
  isLiveEditMessage,
  publishDraft,
  type LiveEditMeta,
} from '@/lib/live-edit/draft-sync'

type DeviceId = 'desktop' | 'tablet' | 'mobile'

const DEVICES: {
  id: DeviceId
  label: string
  width: string
  Icon: typeof Monitor
}[] = [
  { id: 'desktop', label: 'Desktop', width: '100%', Icon: Monitor },
  { id: 'tablet', label: 'Tablet', width: '1024px', Icon: Tablet },
  { id: 'mobile', label: 'Mobile', width: '390px', Icon: Smartphone },
]

const iconBtn =
  'inline-flex h-8 items-center gap-1.5 rounded-none border border-white/20 bg-white/10 px-2.5 text-[12px] font-medium text-white hover:bg-white/20'

type Props = {
  initial: HomepageContent
}

export default function LiveEditShell({ initial }: Props) {
  const router = useRouter()
  const [draft, setDraft] = useState<HomepageContent>(initial)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [chromeEdit, setChromeEdit] = useState<'header' | 'footer' | 'sideMenu' | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sectionsNavOpen, setSectionsNavOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [addAfterId, setAddAfterId] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)
  const [device, setDevice] = useState<DeviceId>('desktop')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const lockedRef = useRef(false)
  const syncIdRef = useRef(0)
  const draftRef = useRef(draft)
  const selectedIdRef = useRef(selectedId)
  const chromeEditRef = useRef(chromeEdit)
  draftRef.current = draft
  selectedIdRef.current = selectedId
  chromeEditRef.current = chromeEdit
  // Do NOT sync lockedRef from React state here — a stale render can overwrite a fresh toggle.

  const liveMeta: LiveEditMeta = useMemo(
    () => ({
      locked,
      selectedId,
      chromeEdit,
    }),
    [locked, selectedId, chromeEdit],
  )

  const pushDraftToFrame = useCallback((metaOverride?: Partial<LiveEditMeta>) => {
    const syncId = ++syncIdRef.current
    const meta: LiveEditMeta = {
      locked: lockedRef.current,
      selectedId: selectedIdRef.current,
      chromeEdit: chromeEditRef.current,
      ...metaOverride,
      syncId,
    }
    const content = draftRef.current
    publishDraft(content, meta)
    const frame = iframeRef.current?.contentWindow
    if (!frame) return
    frame.postMessage(
      {
        source: LIVE_EDIT_MSG_SOURCE,
        type: 'draft',
        content,
        meta,
      },
      window.location.origin,
    )
  }, [])

  useEffect(() => {
    pushDraftToFrame()
  }, [draft, liveMeta, pushDraftToFrame])

  const selectedBlock = useMemo(
    () => draft.layout.find((b) => b.id === selectedId) ?? null,
    [draft.layout, selectedId],
  )

  const flash = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/live-edit/homepage', {
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

  const onAction = useCallback(
    (action: LayoutActionName, sectionId: string, sectionType: HomepageSectionType) => {
      if (action === 'edit') {
        setChromeEdit(null)
        setSelectedId(sectionId)
        setDrawerOpen(true)
        return
      }
      if (action === 'add') {
        setAddAfterId(sectionId)
        setAddOpen(true)
        return
      }
      setDraft((prev) => {
        const next = applyLayoutAction(prev, {
          action,
          instanceId: sectionId,
          type: sectionType,
        } as Parameters<typeof applyLayoutAction>[1])
        return next
      })
      setDirty(true)
    },
    [],
  )

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (!isLiveEditMessage(event.data)) return
      const data = event.data
      if (data.type === 'ready') {
        pushDraftToFrame()
        return
      }
      if (data.type === 'resize') {
        // Preview scrolls inside the iframe — ignore content-height sync (avoids runaway growth).
        return
      }
      if (data.type === 'select') {
        if (lockedRef.current) return
        setSectionsNavOpen(false)
        setChromeEdit(null)
        setSelectedId(data.id)
        setDrawerOpen(true)
        return
      }
      if (data.type === 'chrome') {
        if (lockedRef.current) return
        setSectionsNavOpen(false)
        setSelectedId(null)
        setChromeEdit(data.id)
        setDrawerOpen(true)
        return
      }
      if (data.type === 'action') {
        if (lockedRef.current) return
        if (data.action === 'edit') {
          setSectionsNavOpen(false)
          setChromeEdit(null)
          setSelectedId(data.sectionId)
          setDrawerOpen(true)
          return
        }
        onAction(data.action, data.sectionId, data.sectionType)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [onAction, pushDraftToFrame])

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
      setSelectedId(null)
      setChromeEdit(null)
      selectedIdRef.current = null
      chromeEditRef.current = null
      pushDraftToFrame({ locked: true, selectedId: null, chromeEdit: null })
      flash('Locked — browsing only')
    } else {
      pushDraftToFrame({ locked: false })
      flash('Unlocked — live edit on')
    }
  }

  const openFromSectionsNav = (target: SectionsNavTarget) => {
    if (lockedRef.current) return
    setSectionsNavOpen(false)
    if (target.kind === 'chrome') {
      setSelectedId(null)
      setChromeEdit(target.id)
      setDrawerOpen(true)
      return
    }
    setChromeEdit(null)
    setSelectedId(target.id)
    setDrawerOpen(true)
  }

  const closeEditDrawer = () => {
    setDrawerOpen(false)
  }

  const dismissPanels = () => {
    setDrawerOpen(false)
    setSectionsNavOpen(false)
    setSelectedId(null)
    setChromeEdit(null)
  }

  const backToSectionsNav = () => {
    setDrawerOpen(false)
    setSelectedId(null)
    setChromeEdit(null)
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
          title={
            locked
              ? 'Locked — click to unlock live editing'
              : 'Unlocked — click to lock (browse only)'
          }
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

        <a href="/" className={iconBtn} title="View site" aria-label="View site">
          <ExternalLink className="h-4 w-4 shrink-0" />
          <span>View site</span>
        </a>
        <button
          type="button"
          onClick={() => void logout()}
          className={iconBtn}
          title="Logout"
          aria-label="Logout"
        >
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
          title="Live edit preview"
          src="/website/live-edit/home/preview"
          className="block h-full max-w-full border-0 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)] transition-[width] duration-200"
          style={{
            width: frameWidth,
          }}
        />
      </div>

      <SectionsNavDrawer
        open={sectionsNavOpen}
        content={draft}
        onClose={dismissPanels}
        onOpen={openFromSectionsNav}
      />

      {(drawerOpen || sectionsNavOpen) && !addOpen ? (
        <button
          type="button"
          aria-label="Close panel"
          className="fixed inset-x-0 bottom-0 top-12 z-[75] cursor-default border-0 bg-black/25 p-0"
          onClick={dismissPanels}
        />
      ) : null}

      {chromeEdit === 'sideMenu' && drawerOpen ? (
        <SideMenuDrawer
          open
          value={draft.sideMenu}
          onChange={(sideMenu) => {
            setDraft((prev) => ({ ...prev, sideMenu }))
            setDirty(true)
          }}
          onClose={closeEditDrawer}
          onBack={backToSectionsNav}
        />
      ) : null}

      {chromeEdit === 'header' && drawerOpen ? (
        <HeaderDrawer
          open
          value={draft.header}
          onChange={(header) => {
            setDraft((prev) => ({ ...prev, header }))
            setDirty(true)
          }}
          onClose={closeEditDrawer}
          onBack={backToSectionsNav}
        />
      ) : null}

      {chromeEdit === 'footer' && drawerOpen ? (
        <FooterDrawer
          open
          value={draft.footer}
          onChange={(footer) => {
            setDraft((prev) => ({ ...prev, footer }))
            setDirty(true)
          }}
          onClose={closeEditDrawer}
          onBack={backToSectionsNav}
        />
      ) : null}

      {selectedBlock?.type === 'hero' && drawerOpen && !chromeEdit ? (
        <HeroDrawer
          open
          value={draft.hero}
          onChange={(hero) => {
            setDraft((prev) => setPrimarySection(prev, 'hero', hero))
            setDirty(true)
          }}
          onClose={closeEditDrawer}
          onBack={backToSectionsNav}
        />
      ) : null}

      {selectedBlock?.type === 'featured' && drawerOpen ? (
        <FeaturedDrawer
          open
          value={{
            title: draft.featured.title,
            subtitle: draft.featured.subtitle,
            categoryIds: draft.featured.categoryIds ?? [],
          }}
          onChange={(featured) => {
            setDraft((prev) => setPrimarySection(prev, 'featured', featured))
            setDirty(true)
          }}
          onClose={closeEditDrawer}
          onBack={backToSectionsNav}
        />
      ) : null}

      {selectedBlock?.type === 'brands' && drawerOpen ? (
        <BrandsDrawer
          open
          value={{
            title: draft.brands.title,
            subtitle: draft.brands.subtitle,
            items: draft.brands.items ?? [],
          }}
          onChange={(brands) => {
            setDraft((prev) => setPrimarySection(prev, 'brands', brands))
            setDirty(true)
          }}
          onClose={closeEditDrawer}
          onBack={backToSectionsNav}
        />
      ) : null}

      {selectedBlock?.type === 'dream_pc' && drawerOpen ? (
        <DreamPcDrawer
          open
          value={{
            image: draft.dreamPc.image,
            href: draft.dreamPc.href,
            line1: draft.dreamPc.line1,
            line2: draft.dreamPc.line2,
          }}
          onChange={(dreamPc) => {
            setDraft((prev) => setPrimarySection(prev, 'dream_pc', dreamPc))
            setDirty(true)
          }}
          onClose={closeEditDrawer}
          onBack={backToSectionsNav}
        />
      ) : null}

      {selectedBlock?.type === 'about' && drawerOpen ? (
        <SimpleFieldsDrawer
          open
          title="About"
          values={{
            title: draft.about.title,
            subtitle: draft.about.subtitle,
            bodyHtml: draft.about.bodyHtml,
          }}
          fields={[
            { key: 'title', label: 'Title' },
            { key: 'subtitle', label: 'Subtitle' },
            { key: 'bodyHtml', label: 'Body HTML', multiline: true },
          ]}
          onChange={(key, value) => {
            setDraft((prev) => ({
              ...prev,
              about: { ...prev.about, [key]: value },
            }))
            setDirty(true)
          }}
          onClose={closeEditDrawer}
          onBack={backToSectionsNav}
        />
      ) : null}

      {selectedBlock?.type === 'support' && drawerOpen ? (
        <SimpleFieldsDrawer
          open
          title="Support"
          values={{
            title: draft.support.title,
            subtitle: draft.support.subtitle,
            phone: draft.support.phone,
            whatsapp: draft.support.whatsapp,
            hours: draft.support.hours,
            storeLabel: draft.support.storeLabel,
            storeHref: draft.support.storeHref,
          }}
          fields={[
            { key: 'title', label: 'Title' },
            { key: 'subtitle', label: 'Subtitle' },
            { key: 'phone', label: 'Phone' },
            { key: 'whatsapp', label: 'WhatsApp' },
            { key: 'hours', label: 'Hours' },
            { key: 'storeLabel', label: 'Store label' },
            { key: 'storeHref', label: 'Store href' },
          ]}
          onChange={(key, value) => {
            setDraft((prev) => ({
              ...prev,
              support: { ...prev.support, [key]: value },
            }))
            setDirty(true)
          }}
          onClose={closeEditDrawer}
          onBack={backToSectionsNav}
        />
      ) : null}

      {selectedBlock?.type === 'categories' && drawerOpen ? (
        <CategoriesDrawer
          open
          value={draft.categories}
          onChange={(categories) => {
            setDraft((prev) => setPrimarySection(prev, 'categories', categories))
            setDirty(true)
          }}
          onClose={closeEditDrawer}
          onBack={backToSectionsNav}
        />
      ) : null}

      {selectedBlock?.type === 'promo' && drawerOpen ? (
        <PromoDrawer
          open
          value={{
            enabled: draft.promo.enabled !== false,
            left: draft.promo.left ?? [],
            right: draft.promo.right ?? [],
          }}
          onChange={(promo) => {
            setDraft((prev) => setPrimarySection(prev, 'promo', promo))
            setDirty(true)
          }}
          onClose={closeEditDrawer}
          onBack={backToSectionsNav}
        />
      ) : null}

      {addOpen ? (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-none border border-[#ddd] bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="m-0 text-[15px] font-bold">Add section</h3>
              <button type="button" onClick={() => setAddOpen(false)} className="h-8 w-8 border border-[#ddd]">
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SECTION_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  className="rounded-none border border-[#ddd] bg-[#fafafa] px-2 py-3 text-left text-[12px] font-semibold hover:border-[#bd2026]"
                  onClick={() => {
                    setDraft((prev) =>
                      applyLayoutAction(prev, {
                        action: 'add',
                        type,
                        afterInstanceId: addAfterId,
                      }),
                    )
                    setDirty(true)
                    setAddOpen(false)
                  }}
                >
                  {SECTION_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

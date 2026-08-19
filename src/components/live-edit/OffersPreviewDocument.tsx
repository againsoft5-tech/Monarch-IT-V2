'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { HeaderSection, FooterSection, SideMenuSection } from '@/lib/live-edit/homepage'
import type { OffersPageContent } from '@/lib/live-edit/offers-page'
import { ensureOffersContent } from '@/lib/live-edit/offers-page'
import {
  OFFERS_EDIT_MSG_SOURCE,
  isOffersEditMessage,
  readOffersDraftFromSession,
  type OffersEditFrameMessage,
  type OffersEditMeta,
} from '@/lib/live-edit/offers-draft-sync'
import { LiveEditRegion } from '@/components/live-edit/LiveEditRegion'
import DealsPage from '@/components/offers/DealsPage'
import SideMenu from '@/components/layout/SideMenu'
import Header from '@/components/layout/Header'
import MobileHeader from '@/components/layout/MobileHeader'
import Footer from '@/components/layout/Footer'

function postToParent(msg: OffersEditFrameMessage) {
  if (typeof window === 'undefined' || window.parent === window) return
  window.parent.postMessage(msg, window.location.origin)
}

type Props = {
  initial: OffersPageContent
  /** Shared site chrome, rendered read-only here — edit it from the homepage editor. */
  chrome: { header: HeaderSection; footer: FooterSection; sideMenu: SideMenuSection }
}

export default function OffersPreviewDocument({ initial, chrome }: Props) {
  const [content, setContent] = useState<OffersPageContent>(() => ensureOffersContent(initial))
  const [meta, setMeta] = useState<OffersEditMeta>({ locked: false, selected: false })
  const lastSyncIdRef = useRef(0)

  const applyHostPayload = useCallback(
    (nextContent: OffersPageContent | null, nextMeta: OffersEditMeta) => {
      const syncId = nextMeta.syncId ?? 0
      if (syncId > 0 && syncId < lastSyncIdRef.current) return
      if (syncId > 0) lastSyncIdRef.current = syncId
      if (nextContent) setContent(ensureOffersContent(nextContent))
      setMeta(nextMeta)
    },
    [],
  )

  useEffect(() => {
    const fromSession = readOffersDraftFromSession()
    if (fromSession.content) setContent(ensureOffersContent(fromSession.content))
    // Never apply session lock — the parent pushes the real lock on ready.

    postToParent({ source: OFFERS_EDIT_MSG_SOURCE, type: 'ready' })

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (!isOffersEditMessage(event.data)) return
      const data = event.data
      if (data.type === 'draft') applyHostPayload(data.content, data.meta)
      else if (data.type === 'meta') applyHostPayload(null, data.meta)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [applyHostPayload])

  // Block in-preview navigation while editing so product cards don't navigate away.
  useEffect(() => {
    if (meta.locked) return
    const onClickCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      if (target.closest('[data-live-ignore]')) return
      const anchor = target.closest('a')
      if (!anchor) return
      e.preventDefault()
      e.stopPropagation()
    }
    document.addEventListener('click', onClickCapture, true)
    return () => document.removeEventListener('click', onClickCapture, true)
  }, [meta.locked])

  const onEdit = useCallback(() => {
    postToParent({ source: OFFERS_EDIT_MSG_SOURCE, type: 'select' })
  }, [])

  const locked = meta.locked

  return (
    <div className="min-h-screen bg-white" data-live-locked={locked ? '1' : '0'}>
      <SideMenu data={chrome.sideMenu} />

      <div className="flex min-h-screen flex-col pb-[76px] desk:pb-0">
        <Header data={chrome.header} />
        <MobileHeader data={chrome.header} />

        {/* desk:pt-[72px] mirrors StorefrontChrome's offset for non-home pages (clears the fixed header). */}
        <main className="flex-1 desk:pt-[72px]">
          <LiveEditRegion label="Deals" liveEdit locked={locked} selected={meta.selected} onEdit={onEdit}>
            <DealsPage content={content} />
          </LiveEditRegion>
        </main>

        <Footer data={chrome.footer} />
      </div>
    </div>
  )
}

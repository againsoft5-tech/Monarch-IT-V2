'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { HomepageContent, HomepageSectionType } from '@/lib/live-edit/homepage'
import {
  LIVE_EDIT_MSG_SOURCE,
  isLiveEditMessage,
  readDraftFromSession,
  type LiveEditFrameMessage,
  type LiveEditMeta,
} from '@/lib/live-edit/draft-sync'
import { ensureLayout } from '@/lib/live-edit/layout-actions'
import HomepageCanvas from '@/components/live-edit/HomepageCanvas'
import { LiveEditChrome } from '@/components/live-edit/LiveEditChrome'
import type { LayoutActionName } from '@/components/live-edit/LiveEditSection'
import SideMenu from '@/components/layout/SideMenu'
import Header from '@/components/layout/Header'
import MobileHeader from '@/components/layout/MobileHeader'
import Footer from '@/components/layout/Footer'

function postToParent(msg: LiveEditFrameMessage) {
  if (typeof window === 'undefined' || window.parent === window) return
  window.parent.postMessage(msg, window.location.origin)
}

type Props = {
  initial: HomepageContent
}

export default function LiveEditPreviewDocument({ initial }: Props) {
  const [content, setContent] = useState<HomepageContent>(() => ensureLayout(initial))
  const [meta, setMeta] = useState<LiveEditMeta>({
    locked: false,
    selectedId: null,
    chromeEdit: null,
  })
  const lastSyncIdRef = useRef(0)

  const applyHostPayload = useCallback((nextContent: HomepageContent | null, nextMeta: LiveEditMeta) => {
    const syncId = nextMeta.syncId ?? 0
    if (syncId > 0 && syncId < lastSyncIdRef.current) return
    if (syncId > 0) lastSyncIdRef.current = syncId
    if (nextContent) setContent(ensureLayout(nextContent))
    setMeta(nextMeta)
  }, [])

  useEffect(() => {
    const fromSession = readDraftFromSession()
    if (fromSession.content) setContent(ensureLayout(fromSession.content))
    // Never apply session lock — parent pushes real lock on ready.

    postToParent({ source: LIVE_EDIT_MSG_SOURCE, type: 'ready' })

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (!isLiveEditMessage(event.data)) return
      const data = event.data
      if (data.type === 'draft') {
        applyHostPayload(data.content, data.meta)
      } else if (data.type === 'meta') {
        applyHostPayload(null, data.meta)
      }
    }
    window.addEventListener('message', onMessage)

    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [applyHostPayload])

  // Block in-preview navigation while editing (hero slides are full-bleed <Link>s).
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

  const onSelect = useCallback((id: string) => {
    postToParent({ source: LIVE_EDIT_MSG_SOURCE, type: 'select', id })
  }, [])

  const onAction = useCallback(
    (action: LayoutActionName, sectionId: string, sectionType: HomepageSectionType) => {
      postToParent({
        source: LIVE_EDIT_MSG_SOURCE,
        type: 'action',
        action,
        sectionId,
        sectionType,
      })
    },
    [],
  )

  const onChrome = useCallback((id: 'header' | 'footer' | 'sideMenu') => {
    postToParent({ source: LIVE_EDIT_MSG_SOURCE, type: 'chrome', id })
  }, [])

  // Always in live-edit preview chrome; `locked` only toggles browse vs edit.
  const liveEdit = true
  const locked = meta.locked

  return (
    <div className="min-h-screen bg-white" data-live-locked={locked ? '1' : '0'}>
      <SideMenu data={content.sideMenu} />

      {!locked ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center gap-2 p-2 desk:justify-start desk:px-28">
          <button
            type="button"
            data-live-ignore
            className={`pointer-events-auto rounded-none border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-lg ${
              meta.chromeEdit === 'header'
                ? 'border-[#bd2026] bg-[#bd2026] text-white'
                : 'border-white/10 bg-[#1f1f1f] text-white/80'
            }`}
            onClick={() => onChrome('header')}
          >
            Header
          </button>
          <button
            type="button"
            data-live-ignore
            className={`pointer-events-auto rounded-none border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-lg ${
              meta.chromeEdit === 'sideMenu'
                ? 'border-[#bd2026] bg-[#bd2026] text-white'
                : 'border-white/10 bg-[#1f1f1f] text-white/80'
            }`}
            onClick={() => onChrome('sideMenu')}
          >
            Side menu
          </button>
          <button
            type="button"
            data-live-ignore
            className={`pointer-events-auto rounded-none border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-lg ${
              meta.chromeEdit === 'footer'
                ? 'border-[#bd2026] bg-[#bd2026] text-white'
                : 'border-white/10 bg-[#1f1f1f] text-white/80'
            }`}
            onClick={() => onChrome('footer')}
          >
            Footer
          </button>
        </div>
      ) : null}

      <div className="flex min-h-screen flex-col pb-[76px] desk:pb-0">
        <Header data={content.header} />
        <MobileHeader data={content.header} />

        <main className="flex-1">
          <HomepageCanvas
            content={content}
            liveEdit={liveEdit}
            locked={locked}
            selectedId={meta.selectedId}
            onSelect={onSelect}
            onAction={onAction}
          />
        </main>

        <LiveEditChrome
          chromeId="footer"
          label="Footer"
          liveEdit={liveEdit}
          locked={locked}
          selected={meta.chromeEdit === 'footer'}
          onSelect={onChrome}
          onEdit={onChrome}
        >
          <Footer data={content.footer} />
        </LiveEditChrome>
      </div>
    </div>
  )
}

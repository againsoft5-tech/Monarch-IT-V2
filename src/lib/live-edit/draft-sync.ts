import type { HomepageContent } from '@/lib/live-edit/homepage'
import type { LayoutActionName } from '@/components/live-edit/LiveEditSection'
import type { HomepageSectionType } from '@/lib/live-edit/homepage'

export const LIVE_EDIT_STORAGE_KEY = 'monarch-live-edit-draft'
export const LIVE_EDIT_META_KEY = 'monarch-live-edit-meta'
export const LIVE_EDIT_CHANNEL = 'monarch-live-edit'
export const LIVE_EDIT_MSG_SOURCE = 'monarch-live-edit'

export type LiveEditMeta = {
  locked: boolean
  selectedId: string | null
  chromeEdit: 'header' | 'footer' | 'sideMenu' | null
  /** Monotonic id so the iframe can ignore stale postMessage / BroadcastChannel races. */
  syncId?: number
}

export type LiveEditHostMessage =
  | { source: typeof LIVE_EDIT_MSG_SOURCE; type: 'draft'; content: HomepageContent; meta: LiveEditMeta }
  | { source: typeof LIVE_EDIT_MSG_SOURCE; type: 'meta'; meta: LiveEditMeta }

export type LiveEditFrameMessage =
  | {
      source: typeof LIVE_EDIT_MSG_SOURCE
      type: 'ready'
    }
  | {
      source: typeof LIVE_EDIT_MSG_SOURCE
      type: 'select'
      id: string
    }
  | {
      source: typeof LIVE_EDIT_MSG_SOURCE
      type: 'chrome'
      id: 'header' | 'footer' | 'sideMenu'
    }
  | {
      source: typeof LIVE_EDIT_MSG_SOURCE
      type: 'action'
      action: LayoutActionName
      sectionId: string
      sectionType: HomepageSectionType
    }
  | {
      source: typeof LIVE_EDIT_MSG_SOURCE
      type: 'resize'
      height: number
    }

export function isLiveEditMessage(data: unknown): data is LiveEditHostMessage | LiveEditFrameMessage {
  return Boolean(
    data &&
      typeof data === 'object' &&
      (data as { source?: string }).source === LIVE_EDIT_MSG_SOURCE,
  )
}

export function writeDraftToSession(content: HomepageContent, meta: LiveEditMeta) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(LIVE_EDIT_STORAGE_KEY, JSON.stringify(content))
    // Never persist lock — shell owns it; stale locked:true was blocking unlock after reload/handshake.
    sessionStorage.setItem(
      LIVE_EDIT_META_KEY,
      JSON.stringify({ ...meta, locked: false } satisfies LiveEditMeta),
    )
  } catch {
    /* quota */
  }
}

export function readDraftFromSession(): {
  content: HomepageContent | null
  meta: LiveEditMeta | null
} {
  if (typeof window === 'undefined') return { content: null, meta: null }
  try {
    const raw = sessionStorage.getItem(LIVE_EDIT_STORAGE_KEY)
    const metaRaw = sessionStorage.getItem(LIVE_EDIT_META_KEY)
    return {
      content: raw ? (JSON.parse(raw) as HomepageContent) : null,
      meta: metaRaw ? (JSON.parse(metaRaw) as LiveEditMeta) : null,
    }
  } catch {
    return { content: null, meta: null }
  }
}

export function publishDraft(content: HomepageContent, meta: LiveEditMeta) {
  writeDraftToSession(content, meta)
  try {
    const ch = new BroadcastChannel(LIVE_EDIT_CHANNEL)
    ch.postMessage({
      source: LIVE_EDIT_MSG_SOURCE,
      type: 'draft',
      content,
      meta,
    } satisfies LiveEditHostMessage)
    ch.close()
  } catch {
    /* BroadcastChannel unavailable */
  }
}

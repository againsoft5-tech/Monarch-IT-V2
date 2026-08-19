import type { OffersPageContent } from '@/lib/live-edit/offers-page'

/**
 * Parent ↔ iframe transport for the offers editor.
 *
 * Keys and the message `source` are namespaced separately from the homepage editor
 * (`draft-sync.ts`) so the two editors can be open at once without clobbering each
 * other's sessionStorage draft or BroadcastChannel traffic.
 */
export const OFFERS_EDIT_STORAGE_KEY = 'monarch-offers-edit-draft'
export const OFFERS_EDIT_META_KEY = 'monarch-offers-edit-meta'
export const OFFERS_EDIT_CHANNEL = 'monarch-offers-edit'
export const OFFERS_EDIT_MSG_SOURCE = 'monarch-offers-edit'

export type OffersEditMeta = {
  locked: boolean
  selected: boolean
  /** Monotonic id so the iframe can ignore stale postMessage races. */
  syncId?: number
}

export type OffersEditHostMessage =
  | {
      source: typeof OFFERS_EDIT_MSG_SOURCE
      type: 'draft'
      content: OffersPageContent
      meta: OffersEditMeta
    }
  | { source: typeof OFFERS_EDIT_MSG_SOURCE; type: 'meta'; meta: OffersEditMeta }

export type OffersEditFrameMessage =
  | { source: typeof OFFERS_EDIT_MSG_SOURCE; type: 'ready' }
  | { source: typeof OFFERS_EDIT_MSG_SOURCE; type: 'select' }

export function isOffersEditMessage(
  data: unknown,
): data is OffersEditHostMessage | OffersEditFrameMessage {
  return Boolean(
    data && typeof data === 'object' && (data as { source?: string }).source === OFFERS_EDIT_MSG_SOURCE,
  )
}

export function writeOffersDraftToSession(content: OffersPageContent, meta: OffersEditMeta) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(OFFERS_EDIT_STORAGE_KEY, JSON.stringify(content))
    // Never persist lock — the shell owns it; a stale locked:true blocks unlock after reload.
    sessionStorage.setItem(
      OFFERS_EDIT_META_KEY,
      JSON.stringify({ ...meta, locked: false } satisfies OffersEditMeta),
    )
  } catch {
    /* quota */
  }
}

export function readOffersDraftFromSession(): {
  content: OffersPageContent | null
  meta: OffersEditMeta | null
} {
  if (typeof window === 'undefined') return { content: null, meta: null }
  try {
    const raw = sessionStorage.getItem(OFFERS_EDIT_STORAGE_KEY)
    const metaRaw = sessionStorage.getItem(OFFERS_EDIT_META_KEY)
    return {
      content: raw ? (JSON.parse(raw) as OffersPageContent) : null,
      meta: metaRaw ? (JSON.parse(metaRaw) as OffersEditMeta) : null,
    }
  } catch {
    return { content: null, meta: null }
  }
}

export function publishOffersDraft(content: OffersPageContent, meta: OffersEditMeta) {
  writeOffersDraftToSession(content, meta)
  try {
    const ch = new BroadcastChannel(OFFERS_EDIT_CHANNEL)
    ch.postMessage({
      source: OFFERS_EDIT_MSG_SOURCE,
      type: 'draft',
      content,
      meta,
    } satisfies OffersEditHostMessage)
    ch.close()
  } catch {
    /* BroadcastChannel unavailable */
  }
}

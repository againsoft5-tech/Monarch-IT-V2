/** Demo live-edit auth (no ERP). Env overrides: LIVE_EDIT_USER, LIVE_EDIT_PASS, LIVE_EDIT_SECRET */

export const LIVE_EDIT_COOKIE = 'monarch_live_edit'

export const DEMO_LIVE_EDIT_USER = process.env.LIVE_EDIT_USER || 'liveedit'
export const DEMO_LIVE_EDIT_PASS = process.env.LIVE_EDIT_PASS || 'monarch123'

function secret(): string {
  return process.env.LIVE_EDIT_SECRET || 'monarch-live-edit-demo-secret'
}

/** Stable token for the demo session cookie. */
export function liveEditSessionToken(): string {
  const raw = `${DEMO_LIVE_EDIT_USER}:${DEMO_LIVE_EDIT_PASS}:${secret()}`
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0
  }
  return `le_${hash.toString(16)}_${DEMO_LIVE_EDIT_USER}`
}

export function verifyLiveEditCredentials(user: string, pass: string): boolean {
  return (
    user.trim().toLowerCase() === DEMO_LIVE_EDIT_USER.toLowerCase() &&
    pass === DEMO_LIVE_EDIT_PASS
  )
}

export function isValidLiveEditToken(token: string | undefined | null): boolean {
  return Boolean(token && token === liveEditSessionToken())
}

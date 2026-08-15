import { NextResponse } from 'next/server'
import {
  DEMO_LIVE_EDIT_USER,
  LIVE_EDIT_COOKIE,
  liveEditSessionToken,
  verifyLiveEditCredentials,
} from '@/lib/live-edit/auth'

export async function POST(req: Request) {
  let body: { user?: string; password?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }
  const user = body.user ?? ''
  const password = body.password ?? ''
  if (!verifyLiveEditCredentials(user, password)) {
    return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 })
  }
  const res = NextResponse.json({
    ok: true,
    user: DEMO_LIVE_EDIT_USER,
  })
  res.cookies.set(LIVE_EDIT_COOKIE, liveEditSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}

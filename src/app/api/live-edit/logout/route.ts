import { NextResponse } from 'next/server'
import { LIVE_EDIT_COOKIE } from '@/lib/live-edit/auth'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(LIVE_EDIT_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}

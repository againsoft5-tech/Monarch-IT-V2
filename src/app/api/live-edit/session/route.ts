import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { DEMO_LIVE_EDIT_USER, LIVE_EDIT_COOKIE, isValidLiveEditToken } from '@/lib/live-edit/auth'

export async function GET() {
  const jar = await cookies()
  const token = jar.get(LIVE_EDIT_COOKIE)?.value
  const ok = isValidLiveEditToken(token)
  return NextResponse.json({
    ok,
    user: ok ? DEMO_LIVE_EDIT_USER : null,
  })
}

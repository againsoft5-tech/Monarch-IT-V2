import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { LIVE_EDIT_COOKIE, isValidLiveEditToken } from '@/lib/live-edit/auth'
import type { HomepageContent } from '@/lib/live-edit/homepage'
import { ensureLayout } from '@/lib/live-edit/layout-actions'
import { homepageRepository } from '@/lib/live-edit/content-repository'

export async function GET() {
  const content = await homepageRepository.read()
  return NextResponse.json({ data: content })
}

export async function POST(req: Request) {
  const jar = await cookies()
  if (!isValidLiveEditToken(jar.get(LIVE_EDIT_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  let body: { content?: HomepageContent } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body.content || typeof body.content !== 'object') {
    return NextResponse.json({ ok: false, error: 'content required' }, { status: 400 })
  }
  const next = await homepageRepository.write(ensureLayout(body.content))
  return NextResponse.json({ ok: true, data: next })
}

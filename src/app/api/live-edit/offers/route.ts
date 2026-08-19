import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { LIVE_EDIT_COOKIE, isValidLiveEditToken } from '@/lib/live-edit/auth'
import type { OffersPageContent } from '@/lib/live-edit/offers-page'
import { ensureOffersContent } from '@/lib/live-edit/offers-page'
import { offersPageRepository } from '@/lib/live-edit/offers-repository'

export async function GET() {
  const content = await offersPageRepository.read()
  return NextResponse.json({ data: content })
}

export async function POST(req: Request) {
  const jar = await cookies()
  if (!isValidLiveEditToken(jar.get(LIVE_EDIT_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  let body: { content?: OffersPageContent } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body.content || typeof body.content !== 'object') {
    return NextResponse.json({ ok: false, error: 'content required' }, { status: 400 })
  }
  const next = await offersPageRepository.write(ensureOffersContent(body.content))
  return NextResponse.json({ ok: true, data: next })
}

import { NextResponse } from 'next/server'
import { bundleRepository } from '@/lib/bundle-repository'
import type { BundleDB } from '@/data/bundleData'

/** Always hit the store: an admin save must be visible on the next read. */
export const dynamic = 'force-dynamic'

export async function GET() {
  const db = await bundleRepository.read()
  return NextResponse.json(db, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PUT(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const db = body as Partial<BundleDB> | null
  if (!db || typeof db !== 'object' || !db.ready || !db.custom) {
    return NextResponse.json({ error: 'Expected { ready, custom }' }, { status: 400 })
  }

  const saved = await bundleRepository.write({ ready: db.ready, custom: db.custom })
  return NextResponse.json(saved, { headers: { 'Cache-Control': 'no-store' } })
}

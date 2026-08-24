import { NextResponse } from 'next/server'
import { couponRepository } from '@/lib/coupon-repository'
import type { CouponDB } from '@/data/couponData'

/** Always hit the store: an admin save must be visible on the next read. */
export const dynamic = 'force-dynamic'

export async function GET() {
  const db = await couponRepository.read()
  return NextResponse.json(db, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PUT(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const db = body as Partial<CouponDB> | null
  if (!db || typeof db !== 'object' || !db.coupons) {
    return NextResponse.json({ error: 'Expected { coupons }' }, { status: 400 })
  }

  const saved = await couponRepository.write({ coupons: db.coupons })
  return NextResponse.json(saved, { headers: { 'Cache-Control': 'no-store' } })
}

'use client'

import { useEffect, useState } from 'react'
import {
  DEFAULT_COUPON_DB,
  ensureCoupon,
  normalizeCode,
  type Coupon,
  type CouponDB,
} from '@/data/couponData'

/**
 * Client-side view of the coupon store — the same shape as `bundleStore`.
 *
 * Reads come from `/api/coupons`; mutations act on an in-memory snapshot, notify
 * listeners immediately, then persist in the background. That keeps the admin editor
 * responsive without every call site becoming async.
 */
const API_URL = '/api/coupons'
const CHANNEL_NAME = 'monarch-coupon-sync'
const LOCAL_EVENT = 'monarch-coupon-local-change'

let channel: BroadcastChannel | null = null
function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME)
  return channel
}

function nowIso() {
  return new Date().toISOString()
}

let snapshot: CouponDB = DEFAULT_COUPON_DB
let inFlight: Promise<CouponDB> | null = null

function notify() {
  getChannel()?.postMessage({ kind: 'db' })
  window.dispatchEvent(new Event(LOCAL_EVENT))
}

function readDB(): CouponDB {
  return snapshot
}

async function refreshDB(): Promise<CouponDB> {
  if (typeof window === 'undefined') return snapshot
  if (inFlight) return inFlight

  inFlight = (async () => {
    try {
      const res = await fetch(API_URL, { cache: 'no-store' })
      if (!res.ok) throw new Error(`GET ${API_URL} -> ${res.status}`)
      const db = (await res.json()) as CouponDB
      snapshot = { coupons: db.coupons ?? {} }
    } catch (err) {
      // Keep whatever we already have rather than blanking every coupon badge.
      console.error('[coupons] failed to load', err)
    } finally {
      inFlight = null
    }
    return snapshot
  })()

  return inFlight
}

function writeDB(db: CouponDB) {
  snapshot = db
  notify()
  void (async () => {
    try {
      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(db),
      })
      if (!res.ok) throw new Error(`PUT ${API_URL} -> ${res.status}`)
      snapshot = (await res.json()) as CouponDB
      notify()
    } catch (err) {
      console.error('[coupons] failed to save', err)
      await refreshDB()
      notify()
    }
  })()
}

export function useCouponStore(): CouponDB {
  const [db, setDb] = useState<CouponDB>(snapshot)

  useEffect(() => {
    void refreshDB().then(setDb)

    const onLocal = () => setDb(readDB())
    const onMessage = (e: MessageEvent<{ kind: string }>) => {
      if (e.data?.kind === 'db') void refreshDB().then(setDb)
    }

    const ch = getChannel()
    ch?.addEventListener('message', onMessage)
    window.addEventListener(LOCAL_EVENT, onLocal)
    return () => {
      ch?.removeEventListener('message', onMessage)
      window.removeEventListener(LOCAL_EVENT, onLocal)
    }
  }, [])

  return db
}

/** Every coupon, newest first — the admin list order. */
export function useCoupons(): Coupon[] {
  const db = useCouponStore()
  return Object.values(db.coupons).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/* --------------------------------------------------------------- mutations */

export function getCoupon(id: string): Coupon | undefined {
  return readDB().coupons[id]
}

export function createCoupon(code = ''): Coupon {
  const db = readDB()
  const id = `c-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
  const coupon = ensureCoupon(
    {
      id,
      code: normalizeCode(code),
      type: 'flat',
      value: 0,
      // New coupons start as drafts: a half-configured code must not reach the storefront.
      active: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    id,
  )
  writeDB({ coupons: { ...db.coupons, [id]: coupon } })
  return coupon
}

export function saveCoupon(coupon: Coupon): Coupon | undefined {
  const db = readDB()
  if (!db.coupons[coupon.id]) return undefined
  const next = ensureCoupon({ ...coupon, updatedAt: nowIso() }, coupon.id)
  writeDB({ coupons: { ...db.coupons, [coupon.id]: next } })
  return next
}

export function deleteCoupon(id: string) {
  const db = readDB()
  const coupons = { ...db.coupons }
  delete coupons[id]
  writeDB({ coupons })
}

export function setCouponActive(id: string, active: boolean) {
  const coupon = getCoupon(id)
  if (coupon) saveCoupon({ ...coupon, active })
}

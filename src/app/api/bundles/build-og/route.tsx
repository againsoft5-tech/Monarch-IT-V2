import type { NextRequest } from 'next/server'
import { bundleRepository } from '@/lib/bundle-repository'
import { bundleOgFallback, bundleOgResponse } from '@/lib/bundleOgCard'
import { parseBuildLink, type BuildSearchParams } from '@/lib/bundleShareLink'
import { computeBundlePricing, resolveGifts } from '@/data/bundleData'

/** fs access for locally-hosted artwork, so keep this off the edge runtime. */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Link preview for a shared custom build.
 *
 * This is a route handler rather than an `opengraph-image` file because the file
 * convention only receives route params — and a custom build carries its selection
 * in the query string. `/bundles/build` points its `openGraph.images` here.
 */
export async function GET(request: NextRequest) {
  const db = await bundleRepository.read()
  const params: BuildSearchParams = Object.fromEntries(request.nextUrl.searchParams.entries())
  const parsed = parseBuildLink(Object.values(db.custom), params)
  if (!parsed || parsed.products.length === 0) return bundleOgFallback()

  const pricing = computeBundlePricing(parsed.products, parsed.bundle.tiers)
  const gifts = resolveGifts(pricing.gifts, parsed.giftIds, pricing.giftLimit)

  return bundleOgResponse({
    title: `${parsed.tierCount}-Product Bundle`,
    products: parsed.products,
    giftNames: gifts.map((g) => g.name),
    total: pricing.total,
    regularTotal: pricing.regularTotal,
  })
}

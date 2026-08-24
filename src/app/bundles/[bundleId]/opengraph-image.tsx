import { bundleRepository } from '@/lib/bundle-repository'
import { OG_SIZE, bundleOgFallback, bundleOgResponse } from '@/lib/bundleOgCard'
import { computeBundlePricing, resolveGifts } from '@/data/bundleData'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Monarch IT bundle'

/** fs access for locally-hosted artwork, so keep this off the edge runtime. */
export const runtime = 'nodejs'

/** Link preview for a ready bundle. The card itself lives in `bundleOgCard`. */
export default async function Image({ params }: { params: Promise<{ bundleId: string }> }) {
  const { bundleId } = await params
  const db = await bundleRepository.read()
  const bundle = db.ready[bundleId]
  if (!bundle) return bundleOgFallback()

  const pricing = computeBundlePricing(bundle.products, bundle.tiers)

  return bundleOgResponse({
    title: bundle.name,
    products: bundle.products,
    giftNames: resolveGifts(pricing.gifts, [], pricing.giftLimit).map((g) => g.name),
    total: pricing.total,
    regularTotal: pricing.regularTotal,
  })
}

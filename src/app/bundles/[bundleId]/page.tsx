import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/components/category/Breadcrumbs'
import BundleDetail from '@/components/bundles/BundleDetail'
import { bundleRepository } from '@/lib/bundle-repository'
import { MIN_BUNDLE_PRODUCTS, computeBundlePricing, type ReadyBundle } from '@/data/bundleData'

/** A share link must reflect the latest admin save, so never cache the page. */
export const dynamic = 'force-dynamic'

/**
 * One ready bundle on its own URL.
 *
 * This is what makes a bundle shareable: server-rendered from the bundle store, so
 * the recipient sees the same bundle the sender did, with real metadata for the link
 * preview in WhatsApp / Messenger.
 */
async function getBundle(bundleId: string): Promise<ReadyBundle | undefined> {
  const db = await bundleRepository.read()
  const bundle = db.ready[bundleId]
  // A draft or under-filled bundle has no public page.
  if (!bundle || !bundle.active || bundle.products.length < MIN_BUNDLE_PRODUCTS) return undefined
  return bundle
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bundleId: string }>
}): Promise<Metadata> {
  const { bundleId } = await params
  const bundle = await getBundle(bundleId)

  if (!bundle) return { title: 'Bundle not found | Monarch IT' }

  const pricing = computeBundlePricing(bundle.products, bundle.tiers)
  const saving = Math.max(0, pricing.regularTotal - pricing.total)
  const title = `${bundle.name} | Monarch IT`
  const description =
    bundle.description ||
    `${bundle.products.length} products for ৳${pricing.total.toLocaleString()}${
      saving > 0 ? ` — save ৳${saving.toLocaleString()}` : ''
    }. ${bundle.products.map((p) => p.name).join(' + ')}`

  return {
    title,
    description,
    // Explicit canonical so a link shared with tracking params still unfurls as one page.
    alternates: { canonical: `/bundles/${bundle.id}` },
    openGraph: { title: bundle.name, description, type: 'website', url: `/bundles/${bundle.id}` },
    twitter: { card: 'summary_large_image', title: bundle.name, description },
  }
}

export default async function BundlePage({ params }: { params: Promise<{ bundleId: string }> }) {
  const { bundleId } = await params
  const bundle = await getBundle(bundleId)
  if (!bundle) notFound()

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Bundles', href: '/bundles' },
          { label: bundle.name, href: `/bundles/${bundle.id}` },
        ]}
      />
      <BundleDetail bundle={bundle} />
    </>
  )
}

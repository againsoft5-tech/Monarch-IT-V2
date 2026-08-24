import { ImageResponse } from 'next/og'
import { bundleRepository } from '@/lib/bundle-repository'
import { computeBundlePricing } from '@/data/bundleData'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Monarch IT bundle'

/**
 * Prices read "BDT" rather than ৳: the OG renderer's default font carries no Bengali
 * glyphs, so the taka sign would come out as a tofu box.
 */
const taka = (n: number) => `BDT ${n.toLocaleString('en-US')}`

/**
 * Link preview card for a shared bundle.
 *
 * Typographic rather than photographic on purpose: product images are remote URLs,
 * and fetching several of them per render makes the preview slow and prone to
 * failing silently — a broken unfurl costs more than a missing photo.
 */
export default async function Image({ params }: { params: Promise<{ bundleId: string }> }) {
  const { bundleId } = await params
  const db = await bundleRepository.read()
  const bundle = db.ready[bundleId]

  if (!bundle) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            color: '#c3272b',
            fontSize: 56,
            fontWeight: 700,
          }}
        >
          Monarch IT
        </div>
      ),
      size,
    )
  }

  const pricing = computeBundlePricing(bundle.products, bundle.tiers)
  const saving = Math.max(0, pricing.regularTotal - pricing.total)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#ffffff',
          padding: '52px 68px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              background: '#c3272b',
              color: '#ffffff',
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 2,
              padding: '10px 24px',
              borderRadius: 999,
            }}
          >
            MONARCH BUNDLE
          </div>

          <div style={{ display: 'flex', fontSize: 54, fontWeight: 800, color: '#111827', marginTop: 24 }}>
            {bundle.name}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 20 }}>
            {bundle.products.slice(0, 4).map((p, i) => (
              <div
                key={p.id}
                style={{ display: 'flex', alignItems: 'center', fontSize: 27, color: '#4b5563', marginTop: 10 }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    background: '#333333',
                    color: '#ffffff',
                    fontSize: 18,
                    fontWeight: 700,
                    marginRight: 14,
                  }}
                >
                  {i + 1}
                </div>
                {p.name.length > 52 ? `${p.name.slice(0, 52)}…` : p.name}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 26, color: '#6b7280' }}>Bundle price</div>
            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 8 }}>
              <div style={{ display: 'flex', fontSize: 66, fontWeight: 800, color: '#c3272b' }}>
                {taka(pricing.total)}
              </div>
              {saving > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    fontSize: 32,
                    color: '#9ca3af',
                    textDecoration: 'line-through',
                    marginLeft: 18,
                  }}
                >
                  {taka(pricing.regularTotal)}
                </div>
              ) : null}
            </div>
          </div>

          {saving > 0 ? (
            <div
              style={{
                display: 'flex',
                background: '#e8f6ee',
                color: '#0f7a43',
                fontSize: 30,
                fontWeight: 800,
                padding: '16px 30px',
                borderRadius: 999,
              }}
            >
              Save {taka(saving)}
            </div>
          ) : null}
        </div>
      </div>
    ),
    size,
  )
}

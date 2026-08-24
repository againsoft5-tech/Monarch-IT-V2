import { promises as fs } from 'fs'
import path from 'path'
import { ImageResponse } from 'next/og'
import { bundleRepository } from '@/lib/bundle-repository'
import { computeBundlePricing, resolveGifts } from '@/data/bundleData'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Monarch IT bundle'

/** fs access for locally-hosted artwork, so keep this off the edge runtime. */
export const runtime = 'nodejs'

/**
 * Prices read "BDT" rather than ৳: the OG renderer's default font carries no Bengali
 * glyphs, so the taka sign would come out as a tofu box.
 */
const taka = (n: number) => `BDT ${n.toLocaleString('en-US')}`

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
}

/**
 * Inlines artwork as a data URI.
 *
 * The renderer cannot resolve a site-relative path and will abort the whole image if
 * a remote fetch hangs or 404s — which would leave the link with no preview at all.
 * So every source is loaded defensively here and a failure simply drops that one
 * thumbnail instead of the card.
 */
async function loadImage(src: string | undefined): Promise<string | null> {
  if (!src) return null
  const ext = path.extname(src.split('?')[0]).toLowerCase()
  const mime = MIME[ext]
  if (!mime) return null // SVG/WebP are unreliable in the renderer.

  try {
    if (src.startsWith('/')) {
      const buf = await fs.readFile(path.join(process.cwd(), 'public', src))
      return `data:${mime};base64,${buf.toString('base64')}`
    }
    const res = await fetch(src, { signal: AbortSignal.timeout(4000) })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    return `data:${mime};base64,${buf.toString('base64')}`
  } catch {
    return null
  }
}

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
  const gifts = resolveGifts(pricing.gifts, [], pricing.giftLimit)

  const products = bundle.products.slice(0, 4)
  const thumbs = (await Promise.all(products.map((p) => loadImage(p.image)))).filter(
    (src): src is string => Boolean(src),
  )

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
          padding: '46px 60px',
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
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 2,
              padding: '9px 22px',
              borderRadius: 999,
            }}
          >
            MONARCH BUNDLE
          </div>

          <div style={{ display: 'flex', fontSize: 50, fontWeight: 800, color: '#111827', marginTop: 20 }}>
            {bundle.name}
          </div>

          {/* Photos when they loaded; the name list is the fallback so the card is
              never empty just because a remote image was unreachable. */}
          {thumbs.length > 0 ? (
            <div style={{ display: 'flex', marginTop: 22 }}>
              {thumbs.map((src, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 172,
                    height: 172,
                    borderRadius: 26,
                    background: '#f5f6fa',
                    marginRight: 18,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" width={132} height={132} style={{ objectFit: 'contain' }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 18 }}>
              {products.map((p, i) => (
                <div
                  key={p.id}
                  style={{ display: 'flex', fontSize: 26, color: '#4b5563', marginTop: 8 }}
                >
                  {i + 1}. {p.name.length > 54 ? `${p.name.slice(0, 54)}…` : p.name}
                </div>
              ))}
            </div>
          )}

          {gifts.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 18 }}>
              {gifts.slice(0, 3).map((g) => (
                <div
                  key={g.id}
                  style={{
                    display: 'flex',
                    background: '#e8f6ee',
                    color: '#0f7a43',
                    fontSize: 24,
                    fontWeight: 700,
                    padding: '10px 22px',
                    borderRadius: 999,
                    marginRight: 12,
                  }}
                >
                  Free: {g.name.length > 34 ? `${g.name.slice(0, 34)}…` : g.name}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 24, color: '#6b7280' }}>Bundle price</div>
            <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 6 }}>
              <div style={{ display: 'flex', fontSize: 62, fontWeight: 800, color: '#c3272b' }}>
                {taka(pricing.total)}
              </div>
              {saving > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    fontSize: 30,
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
                fontSize: 28,
                fontWeight: 800,
                padding: '15px 28px',
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

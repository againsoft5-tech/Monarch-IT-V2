import { promises as fs } from 'fs'
import path from 'path'
import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }

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
 * So every source is loaded defensively and a failure drops that one thumbnail
 * instead of the card.
 */
export async function loadOgImage(src: string | undefined): Promise<string | null> {
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

export type BundleOgCard = {
  title: string
  products: { name: string; image?: string }[]
  giftNames: string[]
  total: number
  regularTotal: number
}

/** Fallback card for a link that no longer resolves to anything. */
export function bundleOgFallback(): ImageResponse {
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
    OG_SIZE,
  )
}

/**
 * The link-preview card shared by every bundle URL — ready bundles and custom builds
 * alike, so a shared build unfurls exactly like a shipped one.
 */
export async function bundleOgResponse(card: BundleOgCard): Promise<ImageResponse> {
  const saving = Math.max(0, card.regularTotal - card.total)
  const products = card.products.slice(0, 4)
  const thumbs = (await Promise.all(products.map((p) => loadOgImage(p.image)))).filter(
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
            {card.title}
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
                <div key={i} style={{ display: 'flex', fontSize: 26, color: '#4b5563', marginTop: 8 }}>
                  {i + 1}. {p.name.length > 54 ? `${p.name.slice(0, 54)}…` : p.name}
                </div>
              ))}
            </div>
          )}

          {card.giftNames.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 18 }}>
              {card.giftNames.slice(0, 3).map((name, i) => (
                <div
                  key={i}
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
                  Free: {name.length > 34 ? `${name.slice(0, 34)}…` : name}
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
                {taka(card.total)}
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
                  {taka(card.regularTotal)}
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
    OG_SIZE,
  )
}

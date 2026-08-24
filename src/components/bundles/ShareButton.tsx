'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  /** Path to share, e.g. `/bundles/am5-starter`. Resolved against the live origin. */
  path: string
  /** Message that travels with the link on channels that accept text. */
  text: string
  /** Matches the neighbouring chat button on bundle cards. */
  size?: 'sm' | 'md'
}

/**
 * Share a bundle to a messaging app.
 *
 * Mobile gets the native share sheet (`navigator.share`), which lists every app the
 * viewer actually has — no per-network integration and no Facebook app id. Where that
 * is unavailable (most desktop browsers) it falls back to a small menu of explicit
 * channels, with Copy link first since that is what people reach for most.
 */
export default function ShareButton({ path, text, size = 'sm' }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(t)
  }, [copied])

  /** Absolute, because a messaging app cannot resolve a site-relative path. */
  const url = () => (typeof window === 'undefined' ? path : new URL(path, window.location.origin).toString())

  const share = async () => {
    const link = url()
    // Feature-detect rather than sniff the UA: desktop Safari has `share` too.
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: text, text, url: link })
        return
      } catch {
        // Dismissed, or the sheet refused — fall through to the menu.
      }
    }
    setOpen((v) => !v)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url())
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const box = size === 'md' ? 'h-11 w-11' : 'h-10 w-10'
  const icon = size === 'md' ? 'text-[20px]' : 'text-[18px]'

  const channels = () => {
    const link = encodeURIComponent(url())
    const msg = encodeURIComponent(`${text} ${url()}`)
    return [
      { key: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${msg}` },
      {
        key: 'messenger',
        label: 'Messenger',
        // The web dialog needs a registered app id; this scheme works where the app exists.
        href: `fb-messenger://share?link=${link}`,
      },
      { key: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${link}` },
      { key: 'telegram', label: 'Telegram', href: `https://t.me/share/url?url=${link}&text=${encodeURIComponent(text)}` },
    ]
  }

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => void share()}
        title="Share this bundle"
        aria-label="Share this bundle"
        aria-expanded={open}
        className={`group flex ${box} items-center justify-center rounded-full border border-[#e3e6ee] bg-white transition-colors hover:border-[#c3272b] hover:bg-[#c3272b]`}
      >
        <span className={`mi ${icon} leading-none text-gray-500 transition-colors group-hover:text-white`}>
          share
        </span>
      </button>

      {open ? (
        <div className="absolute bottom-full right-0 z-[10030] mb-2 w-[190px] overflow-hidden rounded-2xl border border-gray-100 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => void copy()}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] font-semibold text-gray-700 hover:bg-gray-50"
          >
            <span className="mi text-[17px] leading-none text-gray-400">
              {copied ? 'check_circle' : 'link'}
            </span>
            {copied ? 'Link copied' : 'Copy link'}
          </button>

          {channels().map((c) => (
            <a
              key={c.key}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] font-semibold text-gray-700 no-underline hover:bg-gray-50"
            >
              <span className="mi text-[17px] leading-none text-gray-400">send</span>
              {c.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}

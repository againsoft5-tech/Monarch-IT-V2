'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { ImageUp, Loader2 } from 'lucide-react'

/** Mirrors the server's ALLOWED_TYPES in /api/upload. */
export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/avif,image/svg+xml'

type Props = {
  label: string
  value: string
  onChange: (url: string) => void
  hint?: string
  /** Thumbnail box size — wide for banners, square for logos. */
  boxClass?: string
  /** Upload target under /public/uploads. Must be allowed by /api/upload. */
  folder?: string
  /** Extra control on the label row, e.g. the layer gear button. */
  action?: ReactNode
}

/** Natural pixel size of an image URL, or null if it cannot be loaded. */
function readImageSize(url: string): Promise<{ width: number; height: number } | null> {
  if (!url || typeof window === 'undefined') return Promise.resolve(null)
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => resolve(null)
    img.src = url
  })
}

/** POSTs to /api/upload and returns the public URL, or null on failure. */
export async function uploadImage(file: File, folder: string): Promise<string | null> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!res.ok) return null
    const data = (await res.json()) as { url?: string }
    return data.url ?? null
  } catch {
    return null
  }
}

/** Thumbnail + upload button + URL field, all writing the same value. */
export default function ImageField({
  label,
  value,
  onChange,
  hint,
  boxClass = 'h-12 w-[84px]',
  folder = 'hero-slider',
  action,
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    let cancelled = false
    setSize(null)
    void readImageSize(value).then((s) => {
      if (!cancelled) setSize(s)
    })
    return () => {
      cancelled = true
    }
  }, [value])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    setUploading(true)
    const url = await uploadImage(file, folder)
    setUploading(false)
    if (url) onChange(url)
    else setError('Upload failed — try a PNG, JPG, WEBP or SVG under 5MB.')
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="text-[11px] font-semibold text-[#555]">{label}</label>
        {action}
      </div>

      <div className="flex gap-2">
        <div
          className={`${boxClass} relative shrink-0 overflow-hidden rounded-none border border-[#ddd] bg-[#f5f5f7]`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-[#aaa]">Empty</div>
          )}
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/75">
              <Loader2 className="h-4 w-4 animate-spin text-[#bd2026]" />
            </div>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <label className="flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-none border border-dashed border-[#c9c9c9] bg-white text-[11px] font-semibold text-[#555] hover:border-[#bd2026] hover:text-[#bd2026]">
            <ImageUp className="h-3.5 w-3.5" />
            {uploading ? 'Uploading…' : 'Upload image'}
            <input type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={handleFile} disabled={uploading} />
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="or paste /images/... path"
            className="h-8 w-full rounded-none border border-[#ddd] bg-white px-2 text-[12px] outline-none focus:border-[#bd2026]"
          />
        </div>
      </div>

      {error ? (
        <p className="m-0 mt-1 text-[10.5px] text-[#bd2026]">{error}</p>
      ) : (
        <p className="m-0 mt-1 text-[10.5px] leading-snug text-[#999]">
          {size ? (
            <span className="font-semibold text-[#666]">
              {size.width} × {size.height} px
            </span>
          ) : null}
          {size && hint ? ' · ' : null}
          {hint}
        </p>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdminAuth } from '@/context/AdminAuthContext'
import HeroSlideContent, { slideAspect, slideRatio } from '@/components/home/HeroSlideContent'
import {
  useHeroSliderDraft,
  publishDraft,
  discardDraft,
  setSliderEnabled,
  addSlide,
  updateSlide,
  updateLayout,
  resetLayout,
  removeSlide,
  reorderSlide,
  updateBackground,
  DEFAULT_SUBTITLE_COLOR,
  DEFAULT_TITLE_COLOR,
  type Device,
  type HeroSlide,
  type ImageBox,
  type SlidePart,
  type TextBox,
} from '@/lib/heroSliderStore'

const RED = '#bd2026'

const inputCls =
  'w-full h-10 px-3.5 rounded-xl border border-gray-200 outline-none text-[13px] text-gray-800 focus:border-gray-400 transition-colors'

const ACCEPT = 'image/png,image/jpeg,image/webp,image/avif,image/svg+xml'

const PART_LABEL: Record<SlidePart, string> = {
  product: 'Product image',
  logo: 'Brand logo',
  text: 'Text content',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

async function uploadImage(file: File): Promise<string | null> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', 'hero-slider')
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (!res.ok) return null
    const data = (await res.json()) as { url?: string }
    return data.url ?? null
  } catch {
    return null
  }
}

/* ---------------------------------------------------------------- controls */

function GearButton({ onClick, title }: { onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="w-7 h-7 shrink-0 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-[#bd2026] hover:border-[#bd2026] transition-colors cursor-pointer"
    >
      <span className="mi text-[16px]">settings</span>
    </button>
  )
}

function Switch({
  checked,
  onChange,
  label,
  size = 'md',
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  size?: 'sm' | 'md'
}) {
  const sm = size === 'sm'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 cursor-pointer"
    >
      <span
        className={`${sm ? 'w-8 h-[18px]' : 'w-10 h-6'} rounded-full p-0.5 flex transition-colors ${
          checked ? 'justify-end' : 'justify-start bg-gray-300'
        }`}
        style={checked ? { backgroundColor: RED } : undefined}
      >
        <span className={`${sm ? 'w-3.5 h-3.5' : 'w-5 h-5'} rounded-full bg-white shadow-sm`} />
      </span>
      <span className={`${sm ? 'text-[12px]' : 'text-[13px]'} font-semibold text-gray-800`}>{label}</span>
    </button>
  )
}

const SWATCHES = ['#ee1c25', '#bd2026', '#111827', '#3f3f46', '#6b7280', '#ffffff']

/** Swatch row + native picker + hex field, kept in sync. */
function ColorControl({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string
  value: string
  fallback: string
  onChange: (v: string) => void
}) {
  const current = value || fallback

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <label className="text-[12px] font-semibold text-gray-700">{label}</label>
        <button
          type="button"
          onClick={() => onChange(fallback)}
          className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          Reset
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={current}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} picker`}
          className="w-9 h-9 shrink-0 rounded-lg border border-gray-200 bg-white cursor-pointer p-0.5"
        />
        <input
          type="text"
          value={current}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fallback}
          spellCheck={false}
          className="w-[92px] h-9 px-2.5 rounded-lg border border-gray-200 text-[12px] text-gray-800 outline-none focus:border-gray-400 uppercase"
        />
        <div className="flex items-center gap-1.5 flex-wrap">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              aria-label={`Use ${c}`}
              title={c}
              className={`w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-110 ${
                current.toLowerCase() === c ? 'ring-2 ring-offset-1 ring-gray-400' : 'border border-gray-200'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function NumControl({
  label,
  hint,
  value,
  min,
  max,
  step = 0.5,
  onChange,
}: {
  label: string
  hint?: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
}) {
  const commit = (raw: string) => {
    const n = Number(raw)
    if (!Number.isFinite(n)) return
    onChange(Math.min(max, Math.max(min, n)))
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <label className="text-[12px] font-semibold text-gray-700">
          {label}
          {hint && <span className="font-normal text-gray-400"> {hint}</span>}
        </label>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => commit(e.target.value)}
          className="w-[62px] h-7 px-2 rounded-lg border border-gray-200 text-[12px] text-gray-800 outline-none focus:border-gray-400"
        />
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => commit(e.target.value)}
        className="w-full accent-[#bd2026] cursor-pointer"
      />
    </div>
  )
}

/** Popup for one layer's z-index / size / position, with Desktop & Mobile tabs. */
function LayerSettingsModal({
  slide,
  part,
  onClose,
}: {
  slide: HeroSlide
  part: SlidePart
  onClose: () => void
}) {
  const [device, setDevice] = useState<Device>('desktop')
  const { dirty } = useHeroSliderDraft()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const box = slide[device][part]
  const set = (patch: Partial<ImageBox> | Partial<TextBox>) => updateLayout(slide.id, device, part, patch)
  const isText = part === 'text'
  const textBox = box as TextBox
  const imageBox = box as ImageBox

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Header, tabs and preview stay put; only the control column scrolls. */}
      <div className="relative w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden bg-white rounded-2xl shadow-xl">
        <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 m-0">{PART_LABEL[part]} settings</h3>
            <p className="text-[12px] text-gray-500 m-0 mt-0.5">
              Desktop and mobile are stored separately — changing one never moves the other.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 shrink-0 rounded-full bg-[#f5f5f7] hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
          >
            <span className="mi text-[18px]">close</span>
          </button>
        </div>

        <div className="shrink-0 px-5 pt-4">
          <div className="inline-flex p-1 rounded-full bg-[#f4f5f7]">
            {(['desktop', 'mobile'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDevice(d)}
                className="h-8 px-4 rounded-full text-[12.5px] font-semibold capitalize cursor-pointer transition-colors"
                style={device === d ? { backgroundColor: RED, color: '#fff' } : { color: '#6b7280' }}
              >
                {d === 'desktop' ? 'Desktop' : 'Mobile 1:1'}
              </button>
            ))}
          </div>
        </div>

        {/* Below md the whole body scrolls; from md up the grid is pinned and
            the right column scrolls on its own. */}
        <div className="flex-1 min-h-0 p-5 grid gap-5 md:grid-cols-2 overflow-y-auto md:overflow-hidden thin-scroll-gray">
          <div className="md:self-start md:min-h-0 md:overflow-y-auto thin-scroll-gray">
            <p className="text-[11px] font-semibold text-gray-400 mb-1.5 m-0">Live preview</p>
            <SlidePreview slide={slide} device={device} maxHeight="max(140px, 88vh - 320px)" />
            <button
              type="button"
              onClick={() => resetLayout(slide.id, device, part)}
              className="mt-3 h-8 px-4 rounded-full border border-gray-200 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Reset {device} to default
            </button>
          </div>

          <div className="space-y-4 md:min-h-0 md:overflow-y-auto md:pr-1.5 thin-scroll-gray">
            <div className="rounded-xl border border-gray-100 p-3.5 space-y-3.5">
              <p className="text-[12px] font-bold text-gray-900 m-0">Layer order</p>
              <NumControl
                label="Z-index"
                hint="(higher = on top)"
                value={box.z}
                min={0}
                max={50}
                step={1}
                onChange={(z) => set({ z })}
              />
              <p className="text-[11px] text-gray-400 m-0 leading-snug">
                Defaults: product 1, brand logo 2, text 3 — text sits on top.
              </p>
            </div>

            {isText && (
              <div className="rounded-xl border border-gray-100 p-3.5 space-y-3.5">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[12px] font-bold text-gray-900 m-0">Colour</p>
                  <p className="text-[11px] text-gray-400 m-0">Applies to both devices</p>
                </div>
                <ColorControl
                  label="Headline"
                  value={slide.titleColor}
                  fallback={DEFAULT_TITLE_COLOR}
                  onChange={(titleColor) => updateSlide(slide.id, { titleColor })}
                />
                <ColorControl
                  label="Subtitle"
                  value={slide.subtitleColor}
                  fallback={DEFAULT_SUBTITLE_COLOR}
                  onChange={(subtitleColor) => updateSlide(slide.id, { subtitleColor })}
                />
              </div>
            )}

            <div className="rounded-xl border border-gray-100 p-3.5 space-y-3.5">
              <p className="text-[12px] font-bold text-gray-900 m-0">Size</p>
              {isText ? (
                <>
                  <NumControl
                    label="Headline font size"
                    hint="(% of slide width)"
                    value={textBox.size}
                    min={1}
                    max={30}
                    step={0.1}
                    onChange={(size) => set({ size })}
                  />
                  <NumControl
                    label="Subtitle font size"
                    hint="(% of slide width)"
                    value={textBox.subSize}
                    min={0.5}
                    max={12}
                    step={0.05}
                    onChange={(subSize) => set({ subSize })}
                  />
                  <NumControl
                    label="Text block width"
                    hint="(% of slide)"
                    value={textBox.w}
                    min={10}
                    max={100}
                    onChange={(w) => set({ w })}
                  />
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Alignment</label>
                    <div className="inline-flex p-1 rounded-full bg-[#f4f5f7]">
                      {(['left', 'center', 'right'] as const).map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => set({ align: a })}
                          className="h-7 px-3.5 rounded-full text-[12px] font-semibold capitalize cursor-pointer"
                          style={textBox.align === a ? { backgroundColor: RED, color: '#fff' } : { color: '#6b7280' }}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <NumControl
                    label="Width"
                    hint="(% of slide)"
                    value={imageBox.w}
                    min={1}
                    max={140}
                    onChange={(w) => set({ w })}
                  />
                  <NumControl
                    label="Height"
                    hint="(% of slide, 0 = auto)"
                    value={imageBox.h}
                    min={0}
                    max={140}
                    onChange={(h) => set({ h })}
                  />
                  <p className="text-[11px] text-gray-400 m-0 leading-snug">
                    Leave height at 0 to keep the image&apos;s natural proportions.
                  </p>
                </>
              )}
            </div>

            <div className="rounded-xl border border-gray-100 p-3.5 space-y-3.5">
              <p className="text-[12px] font-bold text-gray-900 m-0">Position</p>
              <NumControl
                label="X"
                hint="(% from left, centre point)"
                value={box.x}
                min={-30}
                max={130}
                onChange={(x) => set({ x })}
              />
              <NumControl
                label="Y"
                hint="(% from top, centre point)"
                value={box.y}
                min={-30}
                max={130}
                onChange={(y) => set({ y })}
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-between gap-3 px-5 py-3.5 border-t border-gray-100 bg-white">
          <p className="text-[11.5px] text-gray-400 m-0">
            {dirty ? 'These changes are not live yet.' : 'Everything here is live.'}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-full border border-gray-200 text-[12.5px] font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              disabled={!dirty}
              onClick={publishDraft}
              className="h-9 px-5 rounded-full text-white text-[12.5px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: RED }}
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- previews */

function SlidePreview({
  slide,
  device,
  /**
   * Height budget for previews that must fit a fixed panel. Aspect ratio makes
   * height follow width, so the cap is applied as a max-width — without it the
   * 1:1 mobile preview grows taller than the popup and its lower half becomes
   * unreachable, since only the settings column scrolls.
   */
  maxHeight,
}: {
  slide: HeroSlide
  device: Device
  maxHeight?: string
}) {
  const { db } = useHeroSliderDraft()
  const bg = device === 'desktop' ? db.bgDesktop : db.bgMobile || db.bgDesktop

  return (
    <div
      className="relative w-full mx-auto overflow-hidden rounded-xl border border-gray-100 bg-white"
      style={{
        containerType: 'inline-size',
        aspectRatio: slideAspect(device),
        maxWidth: maxHeight ? `calc(${maxHeight} * ${slideRatio(device)})` : undefined,
      }}
    >
      {bg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
      )}
      <HeroSlideContent slide={slide} device={device} />
    </div>
  )
}

/* ------------------------------------------------------------ image picker */

function ImagePicker({
  label,
  hint,
  value,
  onChange,
  onGear,
  boxClass = 'w-24 h-24',
}: {
  label: string
  hint?: string
  value: string
  onChange: (url: string) => void
  onGear?: () => void
  boxClass?: string
}) {
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    const url = await uploadImage(file)
    setUploading(false)
    if (url) onChange(url)
    else window.alert('Image upload failed. Please try a PNG, JPG, WEBP or SVG under 5MB.')
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <label className="text-[12px] font-semibold text-gray-700">{label}</label>
        {onGear && <GearButton onClick={onGear} title={`${label} size, position & layer`} />}
      </div>
      <div className="flex gap-3">
        <div
          className={`${boxClass} shrink-0 rounded-xl border border-gray-100 bg-[#f4f5f7] overflow-hidden flex items-center justify-center relative`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-full h-full object-contain" />
          ) : (
            <span className="mi text-[22px] text-gray-300">image</span>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-[10px] text-gray-500">
              Uploading...
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <label className="flex items-center justify-center h-9 rounded-xl border border-dashed border-gray-300 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer">
            Upload image
            <input type="file" accept={ACCEPT} className="hidden" onChange={handleFile} />
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="or paste image URL"
            className={`${inputCls} h-9`}
          />
          {hint && <p className="text-[11px] text-gray-400 m-0 leading-snug">{hint}</p>}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- slide card */

function SlideCard({ slide, index, count }: { slide: HeroSlide; index: number; count: number }) {
  const [settingsFor, setSettingsFor] = useState<SlidePart | null>(null)

  return (
    <div
      className={`border rounded-2xl p-4 space-y-4 transition-colors ${
        slide.enabled ? 'border-gray-100' : 'border-dashed border-gray-300 bg-[#fafafa]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <p className="text-[12px] font-semibold text-gray-400 m-0">Slide {index + 1}</p>
          <Switch
            size="sm"
            checked={slide.enabled}
            onChange={(enabled) => updateSlide(slide.id, { enabled })}
            label={slide.enabled ? 'Visible' : 'Hidden'}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => reorderSlide(slide.id, -1)}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Move up"
          >
            <span className="mi text-[16px]">arrow_upward</span>
          </button>
          <button
            type="button"
            disabled={index === count - 1}
            onClick={() => reorderSlide(slide.id, 1)}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Move down"
          >
            <span className="mi text-[16px]">arrow_downward</span>
          </button>
          <button
            type="button"
            onClick={() => window.confirm('Remove this slide?') && removeSlide(slide.id)}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-[#bd2026] cursor-pointer"
            aria-label="Remove"
          >
            <span className="mi text-[16px]">delete</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ImagePicker
          label="Brand logo"
          hint="Transparent PNG or SVG works best."
          value={slide.brandLogo}
          onChange={(url) => updateSlide(slide.id, { brandLogo: url })}
          onGear={() => setSettingsFor('logo')}
        />
        <ImagePicker
          label="Product image"
          hint="Cut-out PNG with a transparent background."
          value={slide.productImage}
          onChange={(url) => updateSlide(slide.id, { productImage: url })}
          onGear={() => setSettingsFor('product')}
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <label className="text-[12px] font-semibold text-gray-700">Text content</label>
          <GearButton onClick={() => setSettingsFor('text')} title="Text size, position & layer" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={slide.title}
            onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
            placeholder="Headline — e.g. CURL 7.1"
            className={inputCls}
          />
          <input
            type="text"
            value={slide.subtitle}
            onChange={(e) => updateSlide(slide.id, { subtitle: e.target.value })}
            placeholder="Subtitle — e.g. RGB Gaming Headset"
            className={inputCls}
          />
        </div>
      </div>

      <Field label="Slide link">
        <input
          type="text"
          value={slide.href}
          onChange={(e) => updateSlide(slide.id, { href: e.target.value })}
          placeholder="/offers"
          className={inputCls}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-[2fr_1fr] pt-1">
        <div>
          <p className="text-[11px] font-semibold text-gray-400 mb-1.5 m-0">Desktop preview — 1350×600</p>
          <SlidePreview slide={slide} device="desktop" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-gray-400 mb-1.5 m-0">Mobile preview — 1:1</p>
          <SlidePreview slide={slide} device="mobile" />
        </div>
      </div>

      {settingsFor && (
        <LayerSettingsModal slide={slide} part={settingsFor} onClose={() => setSettingsFor(null)} />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------- page */

export default function AdminHeroSliderPage() {
  const { isAdminLoggedIn, adminChecked } = useAdminAuth()
  const router = useRouter()
  const { db, ready, dirty } = useHeroSliderDraft()

  useEffect(() => {
    if (adminChecked && !isAdminLoggedIn) router.replace('/admin/login')
  }, [adminChecked, isAdminLoggedIn, router])

  if (!adminChecked || !isAdminLoggedIn || !ready) {
    return <div className="min-h-full flex items-center justify-center bg-[#eef0f3] text-gray-400 text-[14px]">Loading...</div>
  }

  return (
    <div className="min-h-full bg-[#eef0f3] px-4 py-8 lg:px-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-[13px] text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 mb-1">
            <span className="mi text-[16px]">arrow_back</span> Dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-900 m-0">Homepage Hero Slider</h1>
          <p className="text-[13px] text-gray-500 mt-1 mb-0">
            One shared background sits behind every slide. Each slide stacks three independent layers on top — product
            image, brand logo and text. Use the gear icon beside any item to set its layer order, size and position,
            separately for the wide desktop banner and the mobile 1:1 square.
          </p>
          <p className="text-[13px] text-gray-500 mt-2 mb-0">
            Edits here only change the previews below. Nothing reaches the homepage until you press{' '}
            <span className="font-semibold text-gray-700">Save changes</span>.
          </p>
        </div>

        {/* Draft controls follow the page so Save is always one click away. */}
        <div className="sticky top-0 z-40 mb-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-3.5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Switch
              checked={db.enabled}
              onChange={setSliderEnabled}
              label={`Slider ${db.enabled ? 'enabled' : 'disabled'}`}
            />

            <span className="text-[12px] text-gray-400 hidden sm:block">
              {db.enabled ? 'Shown at the top of the homepage.' : 'Hidden from the homepage once saved.'}
            </span>

            <div className="flex items-center gap-2.5 ml-auto">
              {dirty ? (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#b45309]">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                  Unsaved changes
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#047857]">
                  <span className="mi text-[16px]">check_circle</span>
                  All changes saved
                </span>
              )}
              <button
                type="button"
                disabled={!dirty}
                onClick={() => window.confirm('Discard all unsaved changes?') && discardDraft()}
                className="h-9 px-4 rounded-full border border-gray-200 text-[12.5px] font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Discard
              </button>
              <button
                type="button"
                disabled={!dirty}
                onClick={publishDraft}
                className="h-9 px-5 rounded-full text-white text-[12.5px] font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: RED }}
              >
                Save changes
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <h2 className="text-[15px] font-bold text-gray-900 m-0 mb-4">Shared background</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImagePicker
              label="Desktop background (wide)"
              hint="Used on tablets and up. Recommended 1350 × 600 (or any 2.25:1 art)."
              value={db.bgDesktop}
              onChange={(url) => updateBackground({ bgDesktop: url })}
              boxClass="w-40 h-[90px]"
            />
            <ImagePicker
              label="Mobile background (1:1)"
              hint="Square artwork. Leave empty to reuse the desktop background."
              value={db.bgMobile}
              onChange={(url) => updateBackground({ bgMobile: url })}
              boxClass="w-[90px] h-[90px]"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-[15px] font-bold text-gray-900 m-0">Slides</h2>
              {db.slides.length > 0 && (
                <span className="text-[12px] text-gray-400">
                  {db.slides.filter((s) => s.enabled).length} of {db.slides.length} visible
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={addSlide}
              className="h-8 px-4 rounded-full text-white text-[12.5px] font-semibold cursor-pointer"
              style={{ backgroundColor: RED }}
            >
              + Add slide
            </button>
          </div>
          <div className="space-y-4">
            {db.slides.length === 0 && (
              <p className="text-[13px] text-gray-400">No slides yet. Add one to show it on the homepage.</p>
            )}
            {db.slides.map((slide, i) => (
              <SlideCard key={slide.id} slide={slide} index={i} count={db.slides.length} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

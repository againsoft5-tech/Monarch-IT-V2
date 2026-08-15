'use client'

import { useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import HeroSlideContent, { slideAspect, slideRatio } from '@/components/home/HeroSlideContent'
import { DEFAULT_LAYOUT, DEFAULT_SUBTITLE_COLOR, DEFAULT_TITLE_COLOR } from '@/lib/heroSliderStore'
import type { Device, HeroSlide as StoreHeroSlide } from '@/lib/heroSliderStore'
import type {
  HeroImageBox,
  HeroSlide,
  HeroSlideLayout,
  HeroTextBox,
} from '@/lib/live-edit/homepage'
import { DrawerHeader } from '@/components/live-edit/drawers/DrawerHeader'

/** Which of a slide's three stacked layers this drawer is editing. */
export type HeroLayerPart = 'product' | 'logo' | 'text'

export const HERO_LAYER_LABEL: Record<HeroLayerPart, string> = {
  product: 'Product image',
  logo: 'Brand logo',
  text: 'Text content',
}

/** Tab order in the drawer — bottom layer to top, matching default z-order. */
const PART_TABS: { id: HeroLayerPart; label: string }[] = [
  { id: 'logo', label: 'Logo' },
  { id: 'text', label: 'Text' },
  { id: 'product', label: 'Product img' },
]

const SWATCHES = ['#ee1c25', '#bd2026', '#111827', '#3f3f46', '#6b7280', '#ffffff']

type Props = {
  slide: HeroSlide
  index: number
  part: HeroLayerPart
  onPartChange: (part: HeroLayerPart) => void
  device: Device
  onDeviceChange: (device: Device) => void
  bgDesktop: string
  bgMobile: string
  onUpdate: (patch: Partial<HeroSlide>) => void
  onClose: () => void
  onBack: () => void
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

/** Number field + range slider, clamped to [min, max]. */
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
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="text-[11px] font-semibold text-[#555]">
          {label}
          {hint ? <span className="font-normal text-[#999]"> {hint}</span> : null}
        </label>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => commit(e.target.value)}
          className="h-7 w-[62px] rounded-none border border-[#ddd] bg-white px-1.5 text-[12px] text-[#222] outline-none focus:border-[#bd2026]"
        />
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => commit(e.target.value)}
        className="w-full cursor-pointer accent-[#bd2026]"
      />
    </div>
  )
}

/** Native picker + hex field + swatch row, all writing the same value. */
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
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="text-[11px] font-semibold text-[#555]">{label}</label>
        <button
          type="button"
          onClick={() => onChange(fallback)}
          className="text-[10px] font-semibold uppercase tracking-wide text-[#999] hover:text-[#bd2026]"
        >
          Reset
        </button>
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={current}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} colour picker`}
          className="h-8 w-8 shrink-0 cursor-pointer rounded-none border border-[#ddd] bg-white p-0.5"
        />
        <input
          type="text"
          value={current}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fallback}
          spellCheck={false}
          className="h-8 w-[80px] shrink-0 rounded-none border border-[#ddd] bg-white px-1.5 text-[11px] uppercase text-[#222] outline-none focus:border-[#bd2026]"
        />
        <div className="flex flex-wrap items-center gap-1">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              title={c}
              aria-label={`Use ${c}`}
              className={cn(
                'h-5 w-5 rounded-none transition-transform hover:scale-110',
                current.toLowerCase() === c
                  ? 'ring-2 ring-[#bd2026] ring-offset-1'
                  : 'border border-[#ddd]',
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-none border border-[#e5e5e5] bg-white p-3">
      <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-[#222]">{title}</p>
      {children}
    </div>
  )
}

export default function HeroLayerDrawer({
  slide,
  index,
  part,
  onPartChange,
  device,
  onDeviceChange,
  bgDesktop,
  bgMobile,
  onUpdate,
  onClose,
  onBack,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBack])

  const layout = slide[device]
  const box = layout[part]
  const isText = part === 'text'
  const textBox = box as HeroTextBox
  const imageBox = box as HeroImageBox

  /** Writes one layer of one device; the other device is never touched. */
  const setBox = (patch: Partial<HeroImageBox> | Partial<HeroTextBox>) => {
    const next = {
      ...layout,
      [part]: { ...box, ...patch },
    } as HeroSlideLayout
    onUpdate(device === 'desktop' ? { desktop: next } : { mobile: next })
  }

  const resetLayer = () => {
    const fallback = JSON.parse(JSON.stringify(DEFAULT_LAYOUT[device][part])) as
      | HeroImageBox
      | HeroTextBox
    const next = { ...layout, [part]: fallback } as HeroSlideLayout
    onUpdate(device === 'desktop' ? { desktop: next } : { mobile: next })
  }

  const bg = device === 'desktop' ? bgDesktop : bgMobile || bgDesktop

  return (
    <aside className="fixed right-0 top-0 z-[84] flex h-full w-full max-w-[420px] flex-col border-l border-[#ccc] bg-[#eceff3] shadow-[-14px_0_40px_rgba(0,0,0,0.22)]">
      <DrawerHeader
        eyebrow={`Banner ${index + 1}`}
        title="Layer settings"
        onClose={onClose}
        onBack={onBack}
      />

      {/* Pinned: device tabs and the preview stay put while the controls scroll. */}
      <div className="shrink-0 space-y-2 border-b border-[#ddd] bg-[#eceff3] px-4 py-3">
        <div className="flex items-center gap-1">
          {(['desktop', 'mobile'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onDeviceChange(d)}
              className={cn(
                'h-8 flex-1 rounded-none border text-[12px] font-semibold',
                device === d
                  ? 'border-[#bd2026] bg-[#bd2026] text-white'
                  : 'border-[#ddd] bg-white text-[#555] hover:bg-[#f5f5f7]',
              )}
            >
              {d === 'desktop' ? 'Desktop 1350×600' : 'Mobile 1:1'}
            </button>
          ))}
        </div>
        <p className="m-0 text-[10.5px] leading-snug text-[#888]">
          Geometry is stored per device — moving this layer on desktop never moves it on mobile.
        </p>

        {/* Own preview, because the canvas iframe may be showing the other device. */}
        <div
          className="relative mx-auto w-full overflow-hidden rounded-none border border-[#ddd] bg-white"
          style={{
            containerType: 'inline-size',
            aspectRatio: slideAspect(device),
            maxWidth: `calc(170px * ${slideRatio(device)})`,
          }}
        >
          {bg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
          ) : null}
          <HeroSlideContent slide={slide as unknown as StoreHeroSlide} device={device} />
        </div>

        {/* Which of the slide's three layers the controls below apply to. */}
        <div className="flex items-center gap-1 pt-0.5">
          {PART_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onPartChange(t.id)}
              title={HERO_LAYER_LABEL[t.id]}
              aria-pressed={part === t.id}
              className={cn(
                'h-8 flex-1 rounded-none border text-[11.5px] font-semibold',
                part === t.id
                  ? 'border-[#222] bg-[#222] text-white'
                  : 'border-[#ddd] bg-white text-[#555] hover:bg-[#f5f5f7]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="thin-scroll-gray min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
        <Group title="Layer order">
          <NumControl
            label="Z-index"
            hint="(higher = on top)"
            value={box.z}
            min={0}
            max={50}
            step={1}
            onChange={(z) => setBox({ z })}
          />
          <p className="m-0 text-[10.5px] leading-snug text-[#999]">
            Defaults: product 1, brand logo 2, text 3 — text sits on top.
          </p>
        </Group>

        {isText ? (
          <Group title="Colour">
            <p className="m-0 -mt-1.5 text-[10.5px] text-[#999]">Shared by both devices.</p>
            <ColorControl
              label="Headline"
              value={slide.titleColor}
              fallback={DEFAULT_TITLE_COLOR}
              onChange={(titleColor) => onUpdate({ titleColor })}
            />
            <ColorControl
              label="Subtitle"
              value={slide.subtitleColor}
              fallback={DEFAULT_SUBTITLE_COLOR}
              onChange={(subtitleColor) => onUpdate({ subtitleColor })}
            />
          </Group>
        ) : null}

        <Group title="Size">
          {isText ? (
            <>
              <NumControl
                label="Headline font size"
                hint="(% of slide width)"
                value={textBox.size}
                min={1}
                max={30}
                step={0.1}
                onChange={(size) => setBox({ size })}
              />
              <NumControl
                label="Subtitle font size"
                hint="(% of slide width)"
                value={textBox.subSize}
                min={0.5}
                max={12}
                step={0.05}
                onChange={(subSize) => setBox({ subSize })}
              />
              <NumControl
                label="Text block width"
                hint="(% of slide)"
                value={textBox.w}
                min={10}
                max={100}
                onChange={(w) => setBox({ w })}
              />
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-[#555]">Alignment</label>
                <div className="flex items-center gap-1">
                  {(['left', 'center', 'right'] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setBox({ align: a })}
                      className={cn(
                        'h-7 flex-1 rounded-none border text-[11px] font-semibold capitalize',
                        textBox.align === a
                          ? 'border-[#bd2026] bg-[#bd2026] text-white'
                          : 'border-[#ddd] bg-white text-[#555] hover:bg-[#f5f5f7]',
                      )}
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
                onChange={(w) => setBox({ w })}
              />
              <NumControl
                label="Height"
                hint="(% of slide, 0 = auto)"
                value={imageBox.h}
                min={0}
                max={140}
                onChange={(h) => setBox({ h })}
              />
              <p className="m-0 text-[10.5px] leading-snug text-[#999]">
                Leave height at 0 to keep the image&apos;s natural proportions.
              </p>
            </>
          )}
        </Group>

        <Group title="Position">
          <NumControl
            label="X"
            hint="(% from left, centre point)"
            value={box.x}
            min={-30}
            max={130}
            onChange={(x) => setBox({ x })}
          />
          <NumControl
            label="Y"
            hint="(% from top, centre point)"
            value={box.y}
            min={-30}
            max={130}
            onChange={(y) => setBox({ y })}
          />
        </Group>

        <button
          type="button"
          onClick={resetLayer}
          className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-none border border-[#ddd] bg-white text-[11px] font-semibold text-[#555] hover:bg-[#f5f5f7]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset {HERO_LAYER_LABEL[part].toLowerCase()} on {device}
        </button>
      </div>
    </aside>
  )
}

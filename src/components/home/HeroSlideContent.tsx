'use client'

import type { CSSProperties } from 'react'
import { DEFAULT_SUBTITLE_COLOR, DEFAULT_TITLE_COLOR } from '@/lib/heroSliderStore'
import type { Device, HeroSlide, ImageBox, TextBox } from '@/lib/heroSliderStore'

/**
 * The three layers of a slide — product image, brand logo and text — as
 * independent siblings inside one `.slider-content-wrapper`.
 *
 * Each is absolutely positioned from its own admin-controlled box: x/y anchor
 * the element's centre as a % of the slide, w/h are % of the slide (0 = auto),
 * and z is the raw z-index. Default stacking, bottom to top, is
 * product (1) → logo (2) → text (3).
 *
 * All sizes resolve against the slide's own width via container-query units, so
 * one set of numbers holds up at every viewport width for that device.
 */

/**
 * Slide box shapes. Desktop keeps the original 1350×600 banner ratio — a true
 * 16:9 hero is so tall on wide screens that everything below it falls off the
 * fold. Mobile gets its own 1:1 square. Both the storefront and the admin
 * previews read these, so the preview can never drift from the real thing.
 */
export const DESKTOP_ASPECT = '1350 / 600'
export const MOBILE_ASPECT = '1 / 1'

export function slideAspect(device: Device) {
  return device === 'desktop' ? DESKTOP_ASPECT : MOBILE_ASPECT
}

function imageStyle(box: ImageBox): CSSProperties {
  return {
    position: 'absolute',
    left: `${box.x}%`,
    top: `${box.y}%`,
    width: `${box.w}%`,
    height: box.h > 0 ? `${box.h}%` : 'auto',
    zIndex: box.z,
    transform: 'translate(-50%, -50%)',
  }
}

function textStyle(box: TextBox): CSSProperties {
  return {
    position: 'absolute',
    left: `${box.x}%`,
    top: `${box.y}%`,
    width: `${box.w}%`,
    zIndex: box.z,
    transform: 'translate(-50%, -50%)',
    textAlign: box.align,
  }
}

export default function HeroSlideContent({ slide, device }: { slide: HeroSlide; device: Device }) {
  const layout = slide[device]

  return (
    <div className="slider-content-wrapper absolute inset-0">
      {slide.productImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slide.productImage}
          alt={slide.title}
          className="slider-product-image object-contain"
          style={imageStyle(layout.product)}
        />
      )}

      {slide.brandLogo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slide.brandLogo}
          alt=""
          className="slider-brand-logo object-contain"
          style={imageStyle(layout.logo)}
        />
      )}

      <div className="slider-text-content" style={textStyle(layout.text)}>
        {slide.title && (
          <h2
            className="m-0 font-bold uppercase leading-[0.92] tracking-[-0.015em]"
            style={{ fontSize: `${layout.text.size}cqw`, color: slide.titleColor || DEFAULT_TITLE_COLOR }}
          >
            {slide.title}
          </h2>
        )}
        {slide.subtitle && (
          <p
            className="m-0 font-semibold uppercase tracking-[0.4em]"
            style={{
              fontSize: `${layout.text.subSize}cqw`,
              marginTop: `${layout.text.subSize * 0.9}cqw`,
              color: slide.subtitleColor || DEFAULT_SUBTITLE_COLOR,
            }}
          >
            {slide.subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

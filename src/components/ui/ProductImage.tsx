'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'

export const NO_IMAGE = '/images/no-image.png'

/**
 * Catalogue rows imported from the old OpenCart site point at its stock
 * placeholder (…/image/cache/placeholder-250x250.png) when a product has no
 * photo. Those URLs load fine, so a broken-image handler never sees them — they
 * have to be recognised by path and swapped for our own placeholder.
 */
const LEGACY_PLACEHOLDER = /\/placeholder(-\d+x\d+)?\.(png|jpe?g|webp)$/i

export function isMissingImage(src?: string | null) {
  return !src?.trim() || LEGACY_PLACEHOLDER.test(src)
}

type Props = Omit<ImageProps, 'src'> & { src?: string | null }

/**
 * Product artwork with the house placeholder standing in whenever a product has
 * no image — the field is empty, it points at the legacy placeholder, or the file
 * 404s. Tracking which src failed (rather than a boolean) means a card that
 * re-renders with a different product still tries that product's own image first.
 */
export default function ProductImage({ src, alt, onError, ...rest }: Props) {
  const [broken, setBroken] = useState('')

  const wanted = isMissingImage(src) ? NO_IMAGE : (src as string)
  const shown = broken === wanted ? NO_IMAGE : wanted

  return (
    <Image
      {...rest}
      src={shown}
      alt={alt}
      onError={(e) => {
        setBroken(wanted)
        onError?.(e)
      }}
    />
  )
}

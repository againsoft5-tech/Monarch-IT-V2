'use client'

import { useState } from 'react'
import Image from 'next/image'
import GiftItemsModal from '@/components/admin/bundles/GiftItemsModal'
import { MAX_GIFT_PICKS, giftPickLimit, type BundleGiftItem } from '@/data/bundleData'

const RED = '#bd2026'

type Props = {
  gifts: BundleGiftItem[]
  /** How many of the listed gifts the customer keeps. Defaults to 1. */
  limit?: number
  onChange: (gifts: BundleGiftItem[]) => void
  onLimitChange: (limit: number) => void
}

/**
 * The free-gift list for one tier: an Add button, the items themselves, and
 * per-item edit / delete.
 *
 * Products and custom text+image gifts share the list, so a single offer can
 * hold both. One item is given automatically; several mean the customer picks.
 */
export default function GiftItemsEditor({ gifts, limit = 1, onChange, onLimitChange }: Props) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<BundleGiftItem | undefined>()

  const close = () => {
    setOpen(false)
    setEditing(undefined)
  }

  const effectiveLimit = Math.max(1, giftPickLimit(gifts, limit))

  const add = (items: BundleGiftItem[]) => {
    if (editing) {
      const replacement = items[0]
      onChange(gifts.map((g) => (g.id === editing.id ? replacement : g)))
      return
    }
    // Guard against a product already on the list arriving twice.
    const fresh = items.filter((i) => !gifts.some((g) => g.slug && g.slug === i.slug))
    onChange([...gifts, ...fresh])
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setEditing(undefined)
          setOpen(true)
        }}
        className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-semibold text-white"
        style={{ backgroundColor: RED }}
      >
        <span className="mi text-[16px] leading-none">add</span> Add gift item
      </button>

      {gifts.length === 0 ? (
        <p className="m-0 mt-2 text-[11.5px] text-gray-400">No gift on this tier yet.</p>
      ) : (
        <>
          {/* Capped by the list itself — offering more picks than gifts would
              render a free-product slot the customer could never fill. */}
          <label className="mt-2 flex items-center gap-2 text-[11.5px] text-gray-600">
            <span>Customer keeps</span>
            <select
              value={effectiveLimit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-8 rounded-lg border border-gray-200 px-2 text-[12.5px] outline-none focus:border-gray-400"
            >
              {Array.from({ length: Math.min(MAX_GIFT_PICKS, gifts.length) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>of {gifts.length}</span>
          </label>

          <p className="m-0 mt-1.5 text-[11.5px] text-gray-500">
            {gifts.length <= effectiveLimit
              ? `Every gift here is added to the customer’s free products automatically.`
              : `The customer picks ${effectiveLimit} of these ${gifts.length}.`}
          </p>
          <ul className="mt-2 flex list-none flex-col gap-1.5 p-0">
            {gifts.map((g) => (
              <li key={g.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                  {g.image ? (
                    <Image src={g.image} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                  ) : (
                    <span className="mi text-[18px] text-gray-300">redeem</span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] text-gray-700">{g.name}</span>
                  <span className="block text-[10.5px] uppercase tracking-wide text-gray-400">
                    {g.kind === 'product' ? 'Product' : 'Text and img'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(g)
                    setOpen(true)
                  }}
                  className="shrink-0 text-gray-400 hover:text-gray-700"
                  aria-label={`Edit ${g.name}`}
                  title="Edit"
                >
                  <span className="mi text-[16px] leading-none">edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange(gifts.filter((x) => x.id !== g.id))}
                  className="shrink-0 text-gray-400 hover:text-[#bd2026]"
                  aria-label={`Remove ${g.name}`}
                  title="Delete"
                >
                  <span className="mi text-[16px] leading-none">delete</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {open ? (
        <GiftItemsModal
          editing={editing}
          usedSlugs={gifts.map((g) => g.slug).filter((s): s is string => Boolean(s))}
          onAdd={add}
          onClose={close}
        />
      ) : null}
    </div>
  )
}

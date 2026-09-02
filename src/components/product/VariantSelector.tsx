'use client'

import Image from 'next/image'
import type { VariantCombo, VariantGroup } from '@/lib/productVariants'
import { getOptionState } from '@/lib/productVariants'

export default function VariantSelector({
  groups,
  combos,
  selection,
  onSelect,
}: {
  groups: VariantGroup[]
  combos: VariantCombo[]
  selection: Record<string, string>
  onSelect: (groupKey: string, optionId: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-3.5">
      {groups.map((group) => {
        const selectedOption = group.options.find((opt) => opt.id === selection[group.key])
        return (
          <div key={group.key}>
            <div className="text-[13px] font-semibold text-gray-800 mb-1.5">
              {group.label}
              {selectedOption && <span className="font-normal text-gray-600">: {selectedOption.label}</span>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {group.options.map((option) => {
                const state = getOptionState(combos, selection, group.key, option.id)
                const disabled = state === 'disabled'
                const isSwatch = Boolean(option.swatch)

                if (isSwatch) {
                  return (
                    <button
                      key={option.id}
                      type="button"
                      title={option.label}
                      aria-label={option.label}
                      aria-pressed={state === 'selected'}
                      disabled={disabled}
                      onClick={() => onSelect(group.key, option.id)}
                      className={`w-12 h-12 shrink-0 rounded-xl border bg-white flex items-center justify-center overflow-hidden transition-colors ${
                        state === 'selected'
                          ? 'border-[#d32f2f]'
                          : disabled
                            ? 'border-gray-200 cursor-not-allowed'
                            : 'border-gray-200 hover:border-[#d32f2f]/50 cursor-pointer'
                      }`}
                    >
                      <Image
                        src={option.swatch!}
                        alt={option.label}
                        width={44}
                        height={44}
                        className={`w-full h-full object-contain p-1 ${disabled ? 'grayscale opacity-40' : ''}`}
                      />
                    </button>
                  )
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={state === 'selected'}
                    disabled={disabled}
                    onClick={() => onSelect(group.key, option.id)}
                    className={`inline-flex items-center justify-center h-10 px-4 rounded-full border-[1.5px] text-[12.5px] font-semibold whitespace-nowrap transition-colors ${
                      state === 'selected'
                        ? 'border-[#d32f2f] text-[#d32f2f]'
                        : disabled
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                          : 'border-gray-200 text-gray-800 hover:border-[#d32f2f]/50 cursor-pointer'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

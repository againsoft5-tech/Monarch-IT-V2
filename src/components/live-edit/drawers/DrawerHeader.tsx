'use client'

type Props = {
  eyebrow?: string
  title: string
  onClose: () => void
  /** Goes back to the Sections list. */
  onBack?: () => void
}

export function DrawerHeader({ eyebrow = 'Section', title, onClose, onBack }: Props) {
  return (
    <div className="flex items-center gap-2 border-b border-[#ddd] bg-white px-3 py-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-none border border-[#ddd] bg-white px-2 text-[12px] font-semibold text-[#333] hover:bg-[#f5f5f7]"
          aria-label="Back to sections"
        >
          ← Back
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#888]">{eyebrow}</p>
        <h2 className="m-0 truncate text-[16px] font-bold text-[#222]">{title}</h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-none border border-[#ddd] bg-white text-[#444]"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  )
}

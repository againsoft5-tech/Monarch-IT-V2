'use client'

import { useEffect } from 'react'
import { useToast } from '@/components/ui/Toast'

const RED = '#bd2026'

type Props = {
  dirty: boolean
  saved: boolean
  onSave: () => void
  onDiscard: () => void
}

/**
 * Sticky footer for the bundle editors.
 *
 * Edits live in the editor's local draft, so nothing is public until Save is pressed.
 * Also guards against closing the tab mid-edit.
 */
export default function SaveBar({ dirty, saved, onSave, onDiscard }: Props) {
  // Driven by `saved` rather than the click, so the toast only appears once the
  // editor has actually committed the record.
  const { toast, showToast } = useToast(2600)
  useEffect(() => {
    if (saved) showToast('Saved successfully — changes are live')
  }, [saved, showToast])

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // Required by some browsers to actually show the native prompt.
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  return (
    <>
      {/* Outside the bar: `backdrop-blur` makes the bar a containing block for
          fixed children, which would anchor the toast to it instead of the viewport. */}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 z-[10050] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#0f7a43] px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg"
        >
          <span className="mi text-[18px] leading-none">check_circle</span>
          {toast}
        </div>
      ) : null}

    <div className="sticky bottom-0 z-20 mt-6 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">

      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-end gap-3">
        <span className={`mr-auto text-[12.5px] font-semibold ${dirty ? 'text-[#bd2026]' : 'text-gray-400'}`}>
          {dirty ? 'Unsaved changes — not live yet' : saved ? 'All changes saved' : 'No changes'}
        </span>

        <button
          type="button"
          onClick={onDiscard}
          disabled={!dirty}
          className="h-10 rounded-full border border-gray-300 px-5 text-[13px] font-semibold text-gray-700 disabled:opacity-40"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty}
          className="h-10 rounded-full px-6 text-[13px] font-semibold text-white disabled:opacity-40"
          style={{ backgroundColor: RED }}
        >
          Save changes
        </button>
      </div>
    </div>
    </>
  )
}

'use client'

import { DrawerHeader } from '@/components/live-edit/drawers/DrawerHeader'

type Field = { key: string; label: string; multiline?: boolean }

type Props = {
  open: boolean
  title: string
  values: Record<string, string>
  fields: Field[]
  onChange: (key: string, value: string) => void
  onClose: () => void
  onBack?: () => void
}

export default function SimpleFieldsDrawer({
  open,
  title,
  values,
  fields,
  onChange,
  onClose,
  onBack,
}: Props) {
  if (!open) return null

  return (
    <aside className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-[420px] flex-col border-l border-[#e5e5e5] bg-white shadow-xl">
      <DrawerHeader title={title} onClose={onClose} onBack={onBack} />
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1 block text-[12px] font-semibold text-[#555]">{f.label}</label>
            {f.multiline ? (
              <textarea
                value={values[f.key] ?? ''}
                onChange={(e) => onChange(f.key, e.target.value)}
                rows={8}
                className="w-full rounded-none border border-[#ddd] px-2 py-2 text-[13px]"
              />
            ) : (
              <input
                type="text"
                value={values[f.key] ?? ''}
                onChange={(e) => onChange(f.key, e.target.value)}
                className="w-full rounded-none border border-[#ddd] px-2 py-2 text-[13px]"
              />
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}

'use client'

import { useState } from 'react'
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import type { FooterLink, FooterSection, FooterSocial } from '@/lib/live-edit/homepage'
import { DrawerHeader } from '@/components/live-edit/drawers/DrawerHeader'

type Props = {
  open: boolean
  value: FooterSection
  onChange: (next: FooterSection) => void
  onClose: () => void
  onBack?: () => void
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function LinkListEditor({
  title,
  links,
  onChange,
}: {
  title: string
  links: FooterLink[]
  onChange: (next: FooterLink[]) => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(links[0]?.id ?? null)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">{title}</p>
        <button
          type="button"
          className="inline-flex h-7 items-center gap-1 rounded-none border border-[#ddd] bg-white px-2 text-[11px] font-semibold"
          onClick={() => {
            const row: FooterLink = {
              id: `fl-${Date.now().toString(36)}`,
              name: 'New link',
              href: '/',
              hidden: false,
            }
            onChange([...links, row])
            setExpandedId(row.id)
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
      {links.map((link) => {
        const expanded = expandedId === link.id
        return (
          <div
            key={link.id}
            className={cn(
              'rounded-none border border-[#e5e5e5] bg-white',
              link.hidden && 'opacity-60',
            )}
          >
            <div className="flex items-center gap-1 p-1.5">
              <button
                type="button"
                className="min-w-0 flex-1 truncate text-left text-[12px] font-medium text-[#222]"
                onClick={() => setExpandedId(expanded ? null : link.id)}
              >
                {link.name || 'Untitled'}
              </button>
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center text-[#666]"
                onClick={() =>
                  onChange(links.map((l) => (l.id === link.id ? { ...l, hidden: !l.hidden } : l)))
                }
              >
                {link.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center text-[#888] hover:text-[#bd2026]"
                onClick={() => onChange(links.filter((l) => l.id !== link.id))}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {expanded ? (
              <div className="space-y-2 border-t border-[#eee] px-2.5 py-2.5">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#555]">Name</label>
                  <input
                    value={link.name}
                    onChange={(e) =>
                      onChange(
                        links.map((l) => (l.id === link.id ? { ...l, name: e.target.value } : l)),
                      )
                    }
                    className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-[#555]">URL</label>
                  <input
                    value={link.href}
                    onChange={(e) =>
                      onChange(
                        links.map((l) => (l.id === link.id ? { ...l, href: e.target.value } : l)),
                      )
                    }
                    className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
                  />
                </div>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

function SocialListEditor({
  title,
  items,
  onChange,
}: {
  title: string
  items: FooterSocial[]
  onChange: (next: FooterSocial[]) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">{title}</p>
        <button
          type="button"
          className="inline-flex h-7 items-center gap-1 rounded-none border border-[#ddd] bg-white px-2 text-[11px] font-semibold"
          onClick={() =>
            onChange([
              ...items,
              {
                id: `soc-${Date.now().toString(36)}`,
                icon: 'fa-link',
                href: '#',
                hidden: false,
              },
            ])
          }
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
      {items.map((s) => (
        <div
          key={s.id}
          className={cn(
            'space-y-1.5 rounded-none border border-[#e5e5e5] bg-white p-2',
            s.hidden && 'opacity-60',
          )}
        >
          <div className="flex items-center gap-2">
            <i
              className={`${s.icon.includes(' ') ? s.icon : `fab ${s.icon}`} text-[14px] text-[#333]`}
            />
            <input
              value={s.icon}
              onChange={(e) =>
                onChange(items.map((x) => (x.id === s.id ? { ...x, icon: e.target.value } : x)))
              }
              placeholder="fa-facebook-f"
              className="h-7 min-w-0 flex-1 rounded-none border border-[#ddd] px-2 text-[11px]"
            />
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center text-[#666]"
              onClick={() =>
                onChange(items.map((x) => (x.id === s.id ? { ...x, hidden: !x.hidden } : x)))
              }
            >
              {s.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              className="inline-flex h-7 w-7 items-center justify-center text-[#888] hover:text-[#bd2026]"
              onClick={() => onChange(items.filter((x) => x.id !== s.id))}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <input
            value={s.href}
            onChange={(e) =>
              onChange(items.map((x) => (x.id === s.id ? { ...x, href: e.target.value } : x)))
            }
            placeholder="https://..."
            className="h-7 w-full rounded-none border border-[#ddd] px-2 text-[11px]"
          />
        </div>
      ))}
    </div>
  )
}

export default function FooterDrawer({ open, value, onChange, onClose, onBack }: Props) {
  if (!open) return null

  const patch = (partial: Partial<FooterSection>) => onChange({ ...value, ...partial })

  return (
    <aside className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-[420px] flex-col border-l border-[#e5e5e5] bg-[#eceff3] shadow-xl">
      <DrawerHeader eyebrow="Chrome" title="Footer" onClose={onClose} onBack={onBack} />

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div className="space-y-2 rounded-none border border-[#e5e5e5] bg-white p-3">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">Brand</p>
          <div className="flex h-16 items-center justify-center rounded-none border border-[#eee] bg-[#1d1d1d] p-2">
            {value.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value.logo} alt="" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-[11px] text-[#999]">No logo</span>
            )}
          </div>
          {(
            [
              ['logo', 'Logo URL'],
              ['logoAlt', 'Logo alt'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">{label}</label>
              <input
                value={value[key] ?? ''}
                onChange={(e) => patch({ [key]: e.target.value })}
                className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
              />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#555]">About text</label>
            <textarea
              value={value.aboutText ?? ''}
              onChange={(e) => patch({ aboutText: e.target.value })}
              rows={4}
              className="w-full rounded-none border border-[#ddd] px-2 py-2 text-[12px]"
            />
          </div>
        </div>

        <SocialListEditor
          title="Social (desktop)"
          items={value.social ?? []}
          onChange={(social) => patch({ social })}
        />
        <SocialListEditor
          title="Social (mobile)"
          items={value.socialMobile ?? []}
          onChange={(socialMobile) => patch({ socialMobile })}
        />

        <div className="space-y-2 rounded-none border border-[#e5e5e5] bg-white p-3">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[#555]">Links title</label>
            <input
              value={value.linksTitle ?? ''}
              onChange={(e) => patch({ linksTitle: e.target.value })}
              className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
            />
          </div>
          <LinkListEditor
            title="Links column 1"
            links={value.linksCol1 ?? []}
            onChange={(linksCol1) => patch({ linksCol1 })}
          />
          <LinkListEditor
            title="Links column 2"
            links={value.linksCol2 ?? []}
            onChange={(linksCol2) => patch({ linksCol2 })}
          />
        </div>

        <div className="space-y-2 rounded-none border border-[#e5e5e5] bg-white p-3">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            Membership
          </p>
          {(
            [
              ['membershipTitle', 'Title'],
              ['membershipLogo', 'Logo URL'],
              ['officeLabel', 'Office label'],
              ['officeAddress', 'Office address'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">{label}</label>
              {key === 'officeAddress' ? (
                <textarea
                  value={value[key] ?? ''}
                  onChange={(e) => patch({ [key]: e.target.value })}
                  rows={3}
                  className="w-full rounded-none border border-[#ddd] px-2 py-2 text-[12px]"
                />
              ) : (
                <input
                  value={value[key] ?? ''}
                  onChange={(e) => patch({ [key]: e.target.value })}
                  className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
                />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-2 rounded-none border border-[#e5e5e5] bg-white p-3">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-[#666]">
            Bottom bar
          </p>
          {(
            [
              ['copyrightBefore', 'Copyright before'],
              ['copyrightBrand', 'Brand name (red)'],
              ['copyrightAfter', 'Copyright after'],
              ['paymentImage', 'Payment image URL'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-[11px] font-semibold text-[#555]">{label}</label>
              <input
                value={value[key] ?? ''}
                onChange={(e) => patch({ [key]: e.target.value })}
                className="h-8 w-full rounded-none border border-[#ddd] px-2 text-[12px]"
              />
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

'use client'

import { useEffect } from 'react'
import { formatCurrency } from '@/lib/currency'
import { NO_IMAGE, isMissingImage } from '@/components/ui/ProductImage'
import type { AccountOrderDetail } from '@/data/accountData'
import { StatusBadge, TableAction } from './account-table'

type Props = {
  open: boolean
  detail: AccountOrderDetail | null
  onClose: () => void
  onPay?: (orderId: string) => void
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2 border-b border-gray-50 py-2 last:border-0">
      <dt className="text-[11px] font-semibold text-gray-400">{label}</dt>
      <dd className="m-0 text-[12.5px] font-medium text-gray-800 break-words">{children}</dd>
    </div>
  )
}

export default function AccountOrderDetailDrawer({ open, detail, onClose, onPay }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[10000] bg-black/45 transition-opacity ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
      />

      <aside
        className={`fixed top-0 right-0 z-[10001] flex h-full w-[92%] max-w-[420px] flex-col bg-[#f6f7f9] shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Order details"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 py-3.5">
          <div>
            <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Order details
            </p>
            <p className="m-0 text-[15px] font-bold text-gray-900">{detail?.id || '—'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-[#f4f5f7] text-gray-700 hover:bg-gray-200"
          >
            <span className="mi text-[22px]">close</span>
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-3 md:p-4">
          {!detail ? (
            <p className="py-10 text-center text-[13px] text-gray-400">Order not found.</p>
          ) : (
            <>
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,0.03)]">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="m-0 text-[14px] font-bold text-gray-900">Order Details</h2>
                  <StatusBadge
                    label={detail.status}
                    tone={detail.status.toLowerCase().includes('pending') ? 'amber' : 'blue'}
                  />
                </div>
                <dl className="m-0">
                  <DetailRow label="Status">{detail.status}</DetailRow>
                  <DetailRow label="Name">{detail.customerName}</DetailRow>
                  <DetailRow label="Phone">{detail.phone}</DetailRow>
                  <DetailRow label="Email">{detail.email}</DetailRow>
                  <DetailRow label="Delivery Address">{detail.deliveryAddress}</DetailRow>
                  <DetailRow label="Delivery Method">{detail.deliveryMethod}</DetailRow>
                  <DetailRow label="Shipping Method">{detail.shippingMethod}</DetailRow>
                  <DetailRow label="Advance Paid">{formatCurrency(detail.advancePaid)}</DetailRow>
                  <DetailRow label="Total">{formatCurrency(detail.total)}</DetailRow>
                  <DetailRow label="Paid">{formatCurrency(detail.paid)}</DetailRow>
                  <DetailRow label="Due">
                    <span className="font-bold text-[#d32f2f]">{formatCurrency(detail.due)}</span>
                  </DetailRow>
                  <DetailRow label="Placed">{detail.date}</DetailRow>
                </dl>
                {detail.due > 0 ? (
                  <div className="mt-3">
                    <TableAction variant="primary" onClick={() => onPay?.(detail.id)}>
                      Pay now · {formatCurrency(detail.due)}
                    </TableAction>
                  </div>
                ) : null}
              </div>

              {detail.products.map((product, idx) => {
                const lineTotal = product.lines.reduce(
                  (sum, line) => sum + line.qty * line.unitPrice,
                  0,
                )
                return (
                  <div
                    key={`${product.name}-${idx}`}
                    className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,0.03)]"
                  >
                    <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">
                      Preview
                    </p>
                    <div className="flex gap-3">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-[#fafbfc]">
                        {/* Order art is a remote URL, so this stays a plain img rather than
                            ProductImage — but it falls back to the same placeholder. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={isMissingImage(product.imageUrl) ? NO_IMAGE : (product.imageUrl as string)}
                          alt=""
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = NO_IMAGE
                          }}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="m-0 text-[12.5px] font-semibold leading-snug text-gray-800">
                        {product.name}
                      </p>
                    </div>

                    <p className="m-0 mt-3 text-[12px] font-semibold text-gray-600">
                      Total Quantity: <span className="text-gray-900">{product.totalQty}</span>
                    </p>

                    <div className="mt-2 overflow-hidden rounded-xl border border-gray-100">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-[#fafbfc] text-[10px] font-bold uppercase tracking-wide text-gray-400">
                            <th className="px-2.5 py-2">Variant</th>
                            <th className="px-2.5 py-2 text-center">Qty</th>
                            <th className="px-2.5 py-2 text-right">× Price</th>
                            <th className="px-2.5 py-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.lines.map((line) => (
                            <tr key={line.label} className="border-t border-gray-50">
                              <td className="px-2.5 py-2 text-[12px] text-gray-700">{line.label}</td>
                              <td className="px-2.5 py-2 text-center text-[12px] tabular-nums">
                                {line.qty}
                              </td>
                              <td className="px-2.5 py-2 text-right text-[12px] tabular-nums text-gray-600">
                                {formatCurrency(line.unitPrice)}
                              </td>
                              <td className="px-2.5 py-2 text-right text-[12px] font-bold tabular-nums text-gray-900">
                                {formatCurrency(line.qty * line.unitPrice)}
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t border-gray-100 bg-[#fafbfc]">
                            <td
                              colSpan={3}
                              className="px-2.5 py-2 text-right text-[11px] font-semibold text-gray-500"
                            >
                              Subtotal
                            </td>
                            <td className="px-2.5 py-2 text-right text-[12px] font-bold text-[#d32f2f]">
                              {formatCurrency(lineTotal)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </aside>
    </>
  )
}

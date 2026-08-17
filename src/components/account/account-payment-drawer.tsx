'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatCurrency } from '@/lib/currency'
import type { AccountOrderRow } from '@/data/accountData'
import { useAuth } from '@/context/AuthContext'
import { TableAction } from './account-table'

const DEFAULT_ADVANCE_PCT = 70

function BkashIcon() {
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-[#E2136E] text-[8px] font-black text-white">
      b
    </span>
  )
}

function NagadIcon() {
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-[3px] bg-[#F15A29] text-[8px] font-black text-white">
      N
    </span>
  )
}

function BankIcon() {
  return <span className="mi text-[16px] leading-none text-[#374151]">account_balance</span>
}

function PaypalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#003087"
        d="M7.5 20.5 8.8 12h4.1c2.4 0 3.9 1.1 3.5 3.3-.4 2.4-2.2 3.7-4.6 3.7H9.7l-.7 4.5H7.5Z"
      />
      <path
        fill="#009CDE"
        d="M9.2 3.5h4.4c1.9 0 3.3.5 4 1.7.8 1.3.7 3.1.1 4.7-.9 2.5-3.1 4-5.9 4H9.4L8.4 21H6.1l2.5-15.8c.1-.4.4-.7.8-.7Z"
      />
      <path
        fill="#012169"
        d="M9.4 14h2.4c2.8 0 5-1.5 5.9-4 .2-.6.3-1.1.3-1.6-1 .5-2.1.7-3.5.7H10.3L9.4 14Z"
      />
    </svg>
  )
}

function StripeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <rect width="24" height="24" rx="4" fill="#635BFF" />
      <path
        fill="#fff"
        d="M11.3 9.3c0-.6.5-.8 1.3-.8 1.2 0 2.7.4 3.9 1V6.7A9.5 9.5 0 0 0 12.5 6c-2.9 0-4.9 1.5-4.9 4 0 3.9 5.4 3.3 5.4 5 0 .7-.6.9-1.5.9-1.3 0-2.9-.5-4.2-1.3v2.9A10 10 0 0 0 12.1 19c3 0 5.1-1.5 5.1-4.1 0-4.2-5.9-3.5-5.9-5.6Z"
      />
    </svg>
  )
}

function PointsIcon() {
  return <span className="mi text-[16px] leading-none text-[#d32f2f]">stars</span>
}

const PAYMENT_METHODS = [
  { id: 'Bkash', label: 'Bkash', Icon: BkashIcon },
  { id: 'Nagad', label: 'Nagad', Icon: NagadIcon },
  { id: 'Bank', label: 'Bank', Icon: BankIcon },
  { id: 'PayPal', label: 'PayPal', Icon: PaypalIcon },
  { id: 'Stripe', label: 'Stripe', Icon: StripeIcon },
] as const

export type PaymentLine = {
  order: AccountOrderRow
  advancePct: number
  payable: number
}

type Props = {
  open: boolean
  orders: AccountOrderRow[]
  onClose: () => void
  onPaid?: (payload: { orderIds: string[]; amount: number; method: string }) => void
}

function buildLines(orders: AccountOrderRow[]): PaymentLine[] {
  return orders.map((order) => {
    const advancePct = DEFAULT_ADVANCE_PCT
    const advanceTarget = Math.round((order.total * advancePct) / 100)
    const payable = Math.max(0, advanceTarget - order.paid)
    return { order, advancePct, payable }
  })
}

export default function AccountPaymentDrawer({ open, orders, onClose, onPaid }: Props) {
  const lines = useMemo(() => buildLines(orders), [orders])
  const totalPayable = useMemo(() => lines.reduce((sum, l) => sum + l.payable, 0), [lines])

  const [amount, setAmount] = useState(totalPayable)
  const [usePoints, setUsePoints] = useState(0)
  const [pointsEnabled, setPointsEnabled] = useState(false)
  const [method, setMethod] = useState('Bkash')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (open) {
      setAmount(totalPayable)
      setUsePoints(0)
      setPointsEnabled(false)
      setDone(false)
      setMethod('Bkash')
    }
  }, [open, totalPayable])

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

  const { customer } = useAuth()
  const pointsBalance = customer?.rewardPoints ?? 0
  const maxPointsUsable = Math.min(pointsBalance, amount)
  const pointsDiscount = pointsEnabled ? Math.min(usePoints, maxPointsUsable) : 0
  const payNow = Math.max(0, amount - pointsDiscount)

  const togglePoints = () => {
    setPointsEnabled((on) => {
      if (on) setUsePoints(0)
      return !on
    })
  }

  const handlePay = () => {
    if (payNow <= 0 && pointsDiscount <= 0) return
    setDone(true)
    onPaid?.({
      orderIds: lines.map((l) => l.order.id),
      amount: payNow,
      method,
    })
  }

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
        className={`fixed top-0 right-0 z-[10001] flex h-full w-[90%] max-w-[400px] flex-col bg-[#f6f7f9] shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Payment"
        aria-hidden={!open}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 py-3.5">
          <div>
            <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Payment
            </p>
            <p className="m-0 text-[15px] font-bold text-gray-900">
              {lines.length === 1 ? lines[0].order.id : `${lines.length} orders`}
            </p>
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

        <div className="flex-1 overflow-y-auto p-3 md:p-4">
          {done ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-10 text-center">
              <span className="mi text-[36px] text-emerald-600">check_circle</span>
              <p className="mt-2 mb-1 text-[16px] font-bold text-emerald-800">Payment initiated</p>
              <p className="m-0 text-[13px] text-emerald-700/80">
                {formatCurrency(payNow)} via {method}
                {pointsDiscount > 0 ? ` · ${pointsDiscount} points used` : ''}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 cursor-pointer rounded-xl border-0 bg-[#d32f2f] px-5 py-2.5 text-[13px] font-semibold text-white"
              >
                Done
              </button>
            </div>
          ) : lines.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-gray-400">No orders to pay.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_28px_rgba(0,0,0,0.03)]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[360px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-gray-100 bg-[#fafbfc] text-[10px] font-bold uppercase tracking-wide text-gray-400">
                        <th className="px-3 py-2.5">Order</th>
                        <th className="px-3 py-2.5 text-right">Total</th>
                        <th className="px-3 py-2.5 text-center">Advance</th>
                        <th className="px-3 py-2.5 text-right">Paid</th>
                        <th className="px-3 py-2.5 text-right">Payable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map(({ order, advancePct, payable }) => (
                        <tr key={order.id} className="border-b border-gray-50 last:border-0">
                          <td className="px-3 py-3">
                            <p className="m-0 text-[13px] font-bold text-[#d32f2f]">{order.id}</p>
                          </td>
                          <td className="px-3 py-3 text-right text-[13px] font-semibold tabular-nums text-gray-800">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className="inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                              {advancePct}%
                            </span>
                            <p className="m-0 mt-1 text-[11px] tabular-nums text-gray-400">
                              {formatCurrency(Math.round((order.total * advancePct) / 100))}
                            </p>
                          </td>
                          <td className="px-3 py-3 text-right text-[13px] tabular-nums text-gray-600">
                            {formatCurrency(order.paid)}
                          </td>
                          <td className="px-3 py-3 text-right text-[13px] font-bold tabular-nums text-[#d32f2f]">
                            {formatCurrency(payable)}
                          </td>
                        </tr>
                      ))}
                      {lines.length > 1 ? (
                        <tr className="bg-[#fafbfc]">
                          <td
                            colSpan={4}
                            className="px-3 py-2.5 text-right text-[11px] font-semibold text-gray-500"
                          >
                            Total payable
                          </td>
                          <td className="px-3 py-2.5 text-right text-[13px] font-bold text-[#d32f2f]">
                            {formatCurrency(totalPayable)}
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,0.03)]">
                <div className="mb-3">
                  <label
                    htmlFor="pay-amount"
                    className="mb-1 block text-[12px] font-semibold text-gray-700"
                  >
                    Payment Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-gray-400">
                      ৳
                    </span>
                    <input
                      id="pay-amount"
                      type="number"
                      min={0}
                      max={totalPayable}
                      value={amount}
                      onChange={(e) => {
                        const next = Math.max(0, Math.min(totalPayable, Number(e.target.value) || 0))
                        setAmount(next)
                        setUsePoints((pts) => Math.min(pts, next, pointsBalance))
                      }}
                      className="h-11 w-full rounded-xl border border-gray-200 pl-7 pr-3 text-[15px] font-bold tabular-nums outline-none focus:border-[#d32f2f]"
                    />
                  </div>
                  <p className="m-0 mt-1 text-[11px] text-gray-400">Max {formatCurrency(totalPayable)}</p>
                </div>

                <div className="mb-3">
                  <p className="mb-1.5 text-[11px] font-semibold text-gray-500">Payment Method</p>
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {PAYMENT_METHODS.map((m) => {
                      const active = method === m.id
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMethod(m.id)}
                          className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 transition-colors ${
                            active
                              ? 'border-[#d32f2f] bg-[#fff0f0] text-[#d32f2f]'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <m.Icon />
                          <span className="text-[11px] font-semibold">{m.label}</span>
                        </button>
                      )
                    })}
                    <button
                      type="button"
                      onClick={togglePoints}
                      className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 transition-colors ${
                        pointsEnabled
                          ? 'border-[#d32f2f] bg-[#fff0f0] text-[#d32f2f]'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <PointsIcon />
                      <span className="text-[11px] font-semibold">Points</span>
                    </button>
                  </div>
                </div>

                {pointsEnabled ? (
                  <div className="mb-3 rounded-xl border border-[#ffd6d6] bg-[#fff8f8] p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div>
                        <p className="m-0 text-[12px] font-bold text-gray-800">Use points</p>
                        <p className="m-0 text-[10px] text-gray-500">1 point = ৳1</p>
                      </div>
                      <div className="text-right">
                        <p className="m-0 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                          Balance
                        </p>
                        <p className="m-0 text-[15px] font-bold text-[#d32f2f]">{pointsBalance}</p>
                      </div>
                    </div>

                    {pointsBalance > 0 ? (
                      <>
                        <div className="flex gap-1.5">
                          <input
                            id="use-points"
                            type="number"
                            min={0}
                            max={maxPointsUsable}
                            value={usePoints}
                            onChange={(e) =>
                              setUsePoints(
                                Math.max(0, Math.min(maxPointsUsable, Number(e.target.value) || 0)),
                              )
                            }
                            className="h-9 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-semibold tabular-nums outline-none focus:border-[#d32f2f]"
                            aria-label="Points to use"
                          />
                          <button
                            type="button"
                            onClick={() => setUsePoints(maxPointsUsable)}
                            className="cursor-pointer rounded-lg border border-[#d32f2f] bg-white px-2.5 text-[11px] font-bold text-[#d32f2f] hover:bg-[#fff0f0]"
                          >
                            Max
                          </button>
                          {usePoints > 0 ? (
                            <button
                              type="button"
                              onClick={() => setUsePoints(0)}
                              className="cursor-pointer rounded-lg border border-gray-200 bg-white px-2.5 text-[11px] font-semibold text-gray-500 hover:bg-gray-50"
                            >
                              Clear
                            </button>
                          ) : null}
                        </div>
                        <p className="m-0 mt-1.5 text-[10px] text-gray-500">
                          You can use up to {maxPointsUsable} points on this payment.
                        </p>
                      </>
                    ) : (
                      <p className="m-0 text-[11px] text-gray-500">
                        No points yet. Earn points on completed orders.
                      </p>
                    )}
                  </div>
                ) : null}

                <div className="mb-3 space-y-1 rounded-xl bg-[#fafbfc] px-3 py-2.5 text-[12px]">
                  <div className="flex justify-between text-gray-600">
                    <span>Amount</span>
                    <span className="font-semibold tabular-nums">{formatCurrency(amount)}</span>
                  </div>
                  {pointsEnabled ? (
                    <div className="flex justify-between text-gray-600">
                      <span>Points used</span>
                      <span className="font-semibold tabular-nums text-emerald-600">
                        −{formatCurrency(pointsDiscount)}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between border-t border-gray-100 pt-1.5 text-gray-900">
                    <span className="font-bold">Pay now</span>
                    <span className="font-bold tabular-nums text-[#d32f2f]">{formatCurrency(payNow)}</span>
                  </div>
                </div>

                <TableAction variant="primary" onClick={handlePay}>
                  <span className="inline-flex w-full items-center justify-center gap-1 px-2 py-1 text-[13px]">
                    Pay {formatCurrency(payNow)}
                    {pointsDiscount > 0 ? (
                      <span className="font-normal opacity-90">(+{pointsDiscount} pts)</span>
                    ) : null}
                  </span>
                </TableAction>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

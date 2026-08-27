'use client'

import { useMemo } from 'react'
import { productsByCategory } from '@/data/pcBuilderData'
import { useChatStore } from '@/lib/chatStore'
import { useBundleStore } from '@/lib/bundleStore'
import { formatCurrency } from '@/lib/currency'
import StatCard from '@/components/admin/dashboard/StatCard'
import RevenueAreaChart from '@/components/admin/dashboard/RevenueAreaChart'
import OrdersBarChart from '@/components/admin/dashboard/OrdersBarChart'

const REVENUE_SERIES = [
  { label: 'Jan', value: 320000 },
  { label: 'Feb', value: 356000 },
  { label: 'Mar', value: 298000 },
  { label: 'Apr', value: 410000 },
  { label: 'May', value: 452000 },
  { label: 'Jun', value: 398000 },
  { label: 'Jul', value: 470000 },
  { label: 'Aug', value: 512000 },
  { label: 'Sep', value: 486000 },
  { label: 'Oct', value: 545000 },
  { label: 'Nov', value: 590000 },
  { label: 'Dec', value: 618000 },
]

const WEEKLY_ORDERS = [
  { label: 'Mon', value: 22 },
  { label: 'Tue', value: 31 },
  { label: 'Wed', value: 26 },
  { label: 'Thu', value: 34 },
  { label: 'Fri', value: 19 },
  { label: 'Sat', value: 29 },
  { label: 'Sun', value: 33 },
]

export default function AdminOverview() {
  const chatDb = useChatStore()
  const bundleDb = useBundleStore()

  const unreadChats = useMemo(
    () =>
      Object.values(chatDb).reduce(
        (sum, convo) => sum + convo.messages.filter((m) => m.sender === 'customer' && !m.read).length,
        0
      ),
    [chatDb]
  )

  // Ready and custom bundles are managed on the same admin screen, so the dashboard
  // counts them together rather than splitting one small card in two.
  const allBundles = useMemo(
    () => [...Object.values(bundleDb.ready), ...Object.values(bundleDb.custom)],
    [bundleDb],
  )
  const activeBundles = useMemo(() => allBundles.filter((b) => b.active).length, [allBundles])

  const totalProducts = useMemo(
    () => Object.values(productsByCategory).reduce((sum, list) => sum + list.length, 0),
    []
  )

  const lastRevenue = REVENUE_SERIES[REVENUE_SERIES.length - 1].value
  const prevRevenue = REVENUE_SERIES[REVENUE_SERIES.length - 2].value
  const revenueDelta = (((lastRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)

  const weeklyOrderTotal = WEEKLY_ORDERS.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="h-full w-full overflow-y-auto thin-scroll-gray px-4 py-6 lg:px-8 lg:py-8 bg-[#eef0f3]">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 m-0">Dashboard</h1>
          <p className="text-[13px] text-gray-500 mt-1 mb-0">Welcome back — here&apos;s what&apos;s happening at Monarch IT today.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-5">
          <StatCard
            icon="payments"
            value={formatCurrency(lastRevenue)}
            label="Revenue this month"
            delta={{ text: `${Math.abs(Number(revenueDelta))}%`, up: Number(revenueDelta) >= 0 }}
          />
          <StatCard
            icon="shopping_bag"
            value={weeklyOrderTotal.toLocaleString()}
            label="Orders this week"
            delta={{ text: '4.35%', up: true }}
          />
          <StatCard
            icon="category"
            value={`${activeBundles}/${allBundles.length}`}
            label="Active bundles"
            href="/admin/bundles"
          />
          <StatCard
            icon="forum"
            value={String(unreadChats)}
            label="Unread chat messages"
            href="/admin/live-chat"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 mb-5">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-5 lg:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[15px] font-bold text-gray-900 m-0">Total Revenue</h2>
                <p className="text-[12px] text-gray-400 m-0 mt-0.5">Monthly revenue (৳)</p>
              </div>
            </div>
            <RevenueAreaChart data={REVENUE_SERIES} />
          </div>

          <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-5 lg:p-6">
            <div className="mb-5">
              <h2 className="text-[15px] font-bold text-gray-900 m-0">Orders this Week</h2>
              <p className="text-[12px] text-gray-400 m-0 mt-0.5">Number of orders per day</p>
            </div>
            <OrdersBarChart data={WEEKLY_ORDERS} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-5">
            <p className="text-[13px] text-gray-500 m-0 mb-1">Total Products in Catalog</p>
            <p className="text-xl font-bold text-gray-900 m-0">{totalProducts.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-5">
            <p className="text-[13px] text-gray-500 m-0 mb-1">Bundles</p>
            <p className="text-xl font-bold text-gray-900 m-0">{allBundles.length.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-5">
            <p className="text-[13px] text-gray-500 m-0 mb-1">Conversations</p>
            <p className="text-xl font-bold text-gray-900 m-0">{Object.values(chatDb).length.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

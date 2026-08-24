'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { productsByCategory } from '@/data/pcBuilderData'
import { useToast, Toast } from '@/components/ui/Toast'
import ReadReceipt from '@/components/chat/ReadReceipt'
import BundleChatCard from '@/components/chat/BundleChatCard'
import AttachMenu from '@/components/chat/AttachMenu'
import FileBubble from '@/components/chat/FileBubble'
import ImageLightbox from '@/components/chat/ImageLightbox'
import RecordingBar from '@/components/chat/RecordingBar'
import { useVoiceRecorder } from '@/lib/useVoiceRecorder'
import {
  useChatStore,
  useTypingSignal,
  sendMessage,
  markRead,
  toggleStar,
  broadcastTyping,
  formatChatTime,
  MAX_ATTACHMENT_SIZE,
  formatFileSize,
  type Conversation,
  type FileKind,
} from '@/lib/chatStore'

const RED = '#bd2026'

const AVATAR_COLORS = ['#bd2026', '#3749bb', '#0f766e', '#b45309', '#7c3aed', '#0e7490']

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function avatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <div
      className="shrink-0 rounded-full flex items-center justify-center text-white font-semibold"
      style={{ width: size, height: size, backgroundColor: avatarColor(name), fontSize: size * 0.36 }}
    >
      {initials(name) || '?'}
    </div>
  )
}

function unreadCount(convo: Conversation) {
  return convo.messages.filter((m) => m.sender === 'customer' && !m.read).length
}

function previewText(msg: Conversation['messages'][number]) {
  if (msg.text) return msg.text
  if (msg.type === 'product') return 'Sent a product'
  if (msg.type === 'bundle') return 'Sent a bundle'
  if (msg.type === 'file') {
    if (msg.fileKind === 'image') return 'Sent a photo'
    if (msg.fileKind === 'video') return 'Sent a video'
    if (msg.fileKind === 'audio') return 'Sent a voice message'
    return 'Sent a document'
  }
  return ''
}

const mockOrders = [
  {
    id: '829012424',
    status: 'Confirmed' as const,
    time: 'Apr 18, 2026',
    productIndex: 0,
    action: 'Send Tracking Link',
    icon: '/images/catalog/view/theme/default/image/svg/order-track-icon.svg',
    iconPosition: 'left' as const,
  },
  {
    id: '829012399',
    status: 'Canceled' as const,
    time: 'Apr 15, 2026',
    productIndex: 1,
    action: 'Notify',
    icon: '/images/chat/notify-icon.svg',
    iconPosition: 'right' as const,
  },
  { id: '829012350', status: 'Pending' as const, time: 'Apr 12, 2026', productIndex: 2, action: 'Review' },
  { id: '829012298', status: 'Delivered' as const, time: 'Apr 08, 2026', productIndex: 3, action: 'Invoice' },
]

const statusStyle: Record<string, string> = {
  Confirmed: 'bg-[#ecfdf5] text-[#10b981]',
  Canceled: 'bg-[#fef2f2] text-[#ef4444]',
  Pending: 'bg-[#fffbeb] text-[#d97706]',
  Delivered: 'bg-[#eff6ff] text-[#3b82f6]',
}

const mockVouchers = [
  { code: 'WELCOME10', desc: '10% off orders over ৳5,000', expiry: 'Jul 31, 2026' },
  { code: 'PCBUILD500', desc: '৳500 off PC Builder orders', expiry: 'Aug 15, 2026' },
  { code: 'FREESHIP', desc: 'Free shipping nationwide', expiry: 'Aug 31, 2026' },
]

export default function AdminDashboard() {
  const { toast, showToast } = useToast()
  const db = useChatStore()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'chat' | 'panel'>('list')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [listFilter, setListFilter] = useState<'all' | 'unread' | 'star'>('all')
  const [listSearch, setListSearch] = useState('')
  const [rightTab, setRightTab] = useState<'orders' | 'products' | 'voucher'>('orders')
  const [orderSearch, setOrderSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastTypingPing = useRef(0)

  const conversations = useMemo(
    () => Object.values(db).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [db]
  )

  const filteredConversations = conversations.filter((c) => {
    if (listSearch && !c.customerName.toLowerCase().includes(listSearch.toLowerCase())) return false
    if (listFilter === 'unread') return unreadCount(c) > 0
    if (listFilter === 'star') return c.starred
    return true
  })

  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id)
    }
  }, [conversations, selectedId])

  const selected = selectedId ? db[selectedId] : undefined
  const messages = selected?.messages ?? []
  const isCustomerTyping = useTypingSignal(selectedId ?? '', 'customer')

  useEffect(() => {
    if (selectedId && messages.length > 0) {
      markRead(selectedId, 'admin')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, messages.length])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, isCustomerTyping])

  const findProduct = (id?: string) => productsByCategory.cpu.find((p) => p.id === id)

  const imageMessages = messages.filter((m) => m.type === 'file' && m.fileKind === 'image')

  const handleInputChange = (value: string) => {
    setInput(value)
    const now = Date.now()
    if (selectedId && now - lastTypingPing.current > 1200) {
      lastTypingPing.current = now
      broadcastTyping(selectedId, 'admin')
    }
  }

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || !selectedId) return
    sendMessage(selectedId, 'admin', trimmed)
    setInput('')
  }

  const handleFileAttach = (file: File, kind: FileKind) => {
    if (!selectedId) return
    if (file.size > MAX_ATTACHMENT_SIZE) {
      showToast(`File too large for this demo (max ${formatFileSize(MAX_ATTACHMENT_SIZE)})`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      sendMessage(selectedId, 'admin', '', 'file', {
        fileName: file.name,
        fileUrl: reader.result as string,
        fileMime: file.type,
        fileSize: file.size,
        fileKind: kind,
      })
    }
    reader.onerror = () => showToast('Could not read that file')
    reader.readAsDataURL(file)
  }

  const handleVoiceSend = (blob: Blob, mimeType: string, durationSec: number) => {
    if (!selectedId) return
    if (blob.size > MAX_ATTACHMENT_SIZE) {
      showToast(`Recording too long for this demo (max ${formatFileSize(MAX_ATTACHMENT_SIZE)})`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const mm = String(Math.floor(durationSec / 60)).padStart(2, '0')
      const ss = String(durationSec % 60).padStart(2, '0')
      sendMessage(selectedId, 'admin', '', 'file', {
        fileName: `Voice message (${mm}:${ss})`,
        fileUrl: reader.result as string,
        fileMime: mimeType,
        fileSize: blob.size,
        fileKind: 'audio',
      })
    }
    reader.onerror = () => showToast('Could not process the recording')
    reader.readAsDataURL(blob)
  }

  const voiceRecorder = useVoiceRecorder(handleVoiceSend, (message) => showToast(message))

  const productResults = productsByCategory.cpu
    .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
    .slice(0, 8)

  const orderResults = mockOrders.filter((order) => {
    const query = orderSearch.toLowerCase()
    if (!query) return true
    const product = productsByCategory.cpu[order.productIndex]
    return (
      order.id.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query) ||
      (product?.name.toLowerCase().includes(query) ?? false)
    )
  })

  return (
    <div className="h-full w-full bg-[#eef0f3] flex flex-col lg:grid lg:grid-cols-[320px_1fr_360px] lg:gap-5 lg:p-5">
      <Toast message={toast} />

      {/* Conversation list */}
      <aside
        className={`${mobileView === 'list' ? 'flex' : 'hidden'} lg:flex flex-1 lg:flex-none w-full min-h-0 flex-col bg-white rounded-none lg:rounded-[28px] border-0 lg:border border-[#eef1f6] shadow-none lg:shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-4`}
      >
        <div className="shrink-0 flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Image src="/images/compare-icons/search-icon.svg" alt="" width={16} height={16} className="w-4 h-4 opacity-60" />
            </span>
            <input
              type="text"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              placeholder="Search"
              className="w-full bg-[#f5f5f7] rounded-full pl-11 pr-3 py-3 text-[13px] font-medium text-gray-700 placeholder-gray-400 outline-none"
            />
          </div>
        </div>

        <div className="shrink-0 flex bg-[#f5f5f7] rounded-full mb-3 p-1">
          {(['all', 'unread', 'star'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setListFilter(f)}
              className={`flex-1 rounded-full py-2 text-[13px] font-semibold capitalize transition-colors cursor-pointer ${
                listFilter === f ? 'text-white' : 'text-gray-600'
              }`}
              style={listFilter === f ? { backgroundColor: RED } : undefined}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto thin-scroll-gray flex flex-col gap-1 -mx-1 px-1">
          {filteredConversations.map((c) => {
            const last = c.messages[c.messages.length - 1]
            const unread = unreadCount(c)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedId(c.id)
                  setMobileView('chat')
                }}
                className={`flex items-center gap-3 rounded-2xl p-2.5 text-left transition-colors cursor-pointer ${
                  selectedId === c.id ? 'bg-[#fdecec]' : 'hover:bg-[#f5f5f7]'
                }`}
              >
                <Avatar name={c.customerName} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[14px] font-semibold text-gray-800 m-0 truncate flex items-center gap-1">
                      {c.customerName}
                      {c.starred && (
                        <Image src="/images/chat/star-icon.svg" alt="" width={13} height={13} className="w-[13px] h-[13px]" />
                      )}
                    </p>
                    <span className="text-[10.5px] text-gray-400 shrink-0">
                      {last ? formatChatTime(last.time).split(' ')[1] : ''}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-gray-500 m-0 truncate">
                    {last ? (last.sender === 'admin' ? 'You: ' : '') + previewText(last) : 'No messages yet'}
                  </p>
                </div>
                {unread > 0 && (
                  <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#10b981] text-white text-[10px] font-bold flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>
            )
          })}
          {filteredConversations.length === 0 && (
            <p className="text-center text-gray-400 text-[13px] py-10">No conversations found.</p>
          )}
        </div>
      </aside>

      {/* Chat window */}
      <main
        className={`${mobileView === 'chat' ? 'flex' : 'hidden'} lg:flex flex-1 lg:flex-none w-full min-w-0 min-h-0 flex-col bg-white rounded-none lg:rounded-[28px] border-0 lg:border border-[#eef1f6] shadow-none lg:shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden`}
      >
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-[14px]">
            Select a conversation to start replying.
          </div>
        ) : (
          <>
            <header className="shrink-0 flex items-center justify-between gap-2 px-4 lg:px-6 py-4 border-b border-[#eef1f6]">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  title="Back to conversations"
                  onClick={() => setMobileView('list')}
                  className="lg:hidden w-9 h-9 shrink-0 rounded-full bg-[#f8fafc] border border-gray-200 hover:bg-[#f1f5f9] flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                >
                  <span className="mi text-[18px]">arrow_back</span>
                </button>
                <Avatar name={selected.customerName} size={40} />
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-gray-800 m-0 truncate">{selected.customerName}</p>
                  <p className="text-[12px] text-gray-400 m-0 truncate">{selected.customerEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  title={selected.starred ? 'Unstar' : 'Star'}
                  onClick={() => toggleStar(selected.id)}
                  className="w-10 h-10 rounded-full bg-[#f8fafc] border border-[#f1f5f9] hover:bg-[#f1f5f9] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Image
                    src="/images/chat/star-icon.svg"
                    alt="Star"
                    width={18}
                    height={18}
                    className={`w-[18px] h-[18px] object-contain transition-all ${
                      selected.starred ? '' : 'grayscale opacity-40'
                    }`}
                  />
                </button>
                <button
                  type="button"
                  title="Settings"
                  onClick={() => showToast('Feature coming soon!')}
                  className="hidden sm:flex w-10 h-10 rounded-full bg-[#f8fafc] border border-[#f1f5f9] hover:bg-[#f1f5f9] items-center justify-center transition-colors cursor-pointer"
                >
                  <Image src="/images/chat/settings.svg" alt="Settings" width={17} height={17} className="object-contain" />
                </button>
                <button
                  type="button"
                  title="Orders & Products"
                  onClick={() => setMobileView('panel')}
                  className="lg:hidden w-10 h-10 shrink-0 rounded-full bg-[#f8fafc] border border-[#f1f5f9] hover:bg-[#f1f5f9] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="mi text-[20px]">storefront</span>
                </button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto thin-scroll-gray px-4 lg:px-6 py-5 flex flex-col">
              {messages.map((msg, i) => {
                const time = formatChatTime(msg.time)
                const prevTime = i > 0 ? formatChatTime(messages[i - 1].time) : null
                const showDivider = i === 0 || prevTime !== time
                const isAdmin = msg.sender === 'admin'
                const product = msg.type === 'product' ? (msg.productSnapshot ?? findProduct(msg.productId)) : undefined
                const bundleMsg = msg.type === 'bundle' ? msg.bundleSnapshot : undefined

                return (
                  <div key={msg.id} className="flex flex-col">
                    {showDivider && <p className="text-center text-[11px] font-medium text-gray-400 my-4">{time}</p>}

                    {bundleMsg ? (
                      <div
                        className={`max-w-[70%] mb-4 flex flex-col ${isAdmin ? 'self-end items-end' : 'self-start items-start'}`}
                      >
                        <BundleChatCard bundle={bundleMsg} />
                        {isAdmin && <ReadReceipt read={msg.read} />}
                      </div>
                    ) : product ? (
                      <div
                        className={`max-w-[70%] mb-4 flex flex-col ${isAdmin ? 'self-end items-end' : 'self-start items-start'}`}
                      >
                        <div
                          className={`bg-white border border-gray-200 rounded-2xl px-5 py-3 ${
                            isAdmin ? 'rounded-tr-[4px]' : 'rounded-tl-[4px]'
                          }`}
                        >
                          {msg.text && <p className="text-[14px] font-medium text-gray-800 mb-2.5">{msg.text}</p>}
                          <div className="bg-white border border-gray-200 rounded-[22px] p-4 flex gap-3.5 w-[280px] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                            <div className="w-16 h-16 shrink-0 rounded-xl bg-white border border-gray-100 overflow-hidden relative">
                              {product.image && <Image src={product.image} alt="" fill className="object-contain p-1" />}
                            </div>
                            <div className="min-w-0 flex flex-col justify-center">
                              <p className="text-[13px] font-semibold text-gray-800 truncate m-0 mb-1">{product.name}</p>
                              <span className="text-[13px] font-bold" style={{ color: RED }}>
                                <span className="font-medium">৳</span><span className="font-price">{product.priceNew.toLocaleString()}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        {isAdmin && <ReadReceipt read={msg.read} />}
                      </div>
                    ) : msg.type === 'file' ? (
                      <div
                        className={`max-w-[70%] mb-4 flex flex-col ${isAdmin ? 'self-end items-end' : 'self-start items-start'}`}
                      >
                        <div
                          className={`bg-white border border-gray-200 rounded-2xl px-4 py-3 ${
                            isAdmin ? 'rounded-tr-[4px]' : 'rounded-tl-[4px]'
                          }`}
                        >
                          <FileBubble
                            msg={msg}
                            onImageClick={() => setLightboxIndex(imageMessages.findIndex((m) => m.id === msg.id))}
                          />
                        </div>
                        {isAdmin && <ReadReceipt read={msg.read} />}
                      </div>
                    ) : isAdmin ? (
                      <div className="self-end max-w-[70%] flex flex-col items-end mb-4">
                        <div className="rounded-2xl rounded-tr-[4px] px-5 py-3 text-white" style={{ backgroundColor: RED }}>
                          <p className="text-[14px] font-medium m-0">{msg.text}</p>
                        </div>
                        <ReadReceipt read={msg.read} />
                      </div>
                    ) : (
                      <div className="self-start max-w-[70%] bg-[#f3f4f6] border border-gray-200 rounded-2xl rounded-tl-[4px] px-5 py-3 mb-4">
                        <p className="text-[14px] font-medium text-gray-800 m-0 leading-[1.5]">{msg.text}</p>
                      </div>
                    )}
                  </div>
                )
              })}

              {isCustomerTyping && (
                <div className="self-start flex items-center gap-2 bg-[#f3f4f6] border border-gray-200 rounded-2xl rounded-tl-[4px] px-4 py-2.5 w-fit">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                  </span>
                  <span className="text-[13px] font-medium text-gray-600">Typing</span>
                </div>
              )}
            </div>

            <footer className="shrink-0 flex items-center gap-3 px-4 lg:px-6 py-4 bg-white border-t border-[#f3f4f6]">
              <AttachMenu onFile={handleFileAttach} />
              {voiceRecorder.state !== 'idle' ? (
                <RecordingBar
                  state={voiceRecorder.state}
                  seconds={voiceRecorder.seconds}
                  previewUrl={voiceRecorder.previewUrl}
                  onCancel={voiceRecorder.cancel}
                  onPause={voiceRecorder.pause}
                  onResume={voiceRecorder.resume}
                  onSend={voiceRecorder.stop}
                />
              ) : (
                <>
                  <button
                    type="button"
                    onClick={voiceRecorder.start}
                    className="w-[42px] h-[42px] shrink-0 rounded-full bg-[#f8fafc] border border-gray-200 hover:bg-[#f1f5f9] flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                  >
                    <span className="mi text-[20px]">mic</span>
                  </button>
                  <div className="flex-1 min-w-0 relative flex items-center">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend()
                      }}
                      placeholder="Write your reply..."
                      className="w-full min-w-0 bg-[#f3f4f6] rounded-full pl-[22px] pr-[50px] py-3.5 text-[14px] font-medium text-gray-800 placeholder-gray-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSend}
                      className="absolute right-4 flex items-center justify-center cursor-pointer"
                    >
                      <Image
                        src="/images/chat/notify-icon.svg"
                        alt="Send"
                        width={18}
                        height={18}
                        className="w-[18px] h-[18px] object-contain grayscale opacity-70 hover:opacity-100 transition-opacity"
                      />
                    </button>
                  </div>
                </>
              )}
            </footer>
          </>
        )}
      </main>

      {/* Orders / Products / Voucher panel */}
      <aside
        className={`${mobileView === 'panel' ? 'flex' : 'hidden'} lg:flex flex-1 lg:flex-none w-full min-h-0 flex-col bg-white rounded-none lg:rounded-[28px] border-0 lg:border border-[#eef1f6] shadow-none lg:shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-4`}
      >
        <div className="shrink-0 flex items-center gap-2 mb-4">
          <button
            type="button"
            title="Back to chat"
            onClick={() => setMobileView('chat')}
            className="lg:hidden w-9 h-9 shrink-0 rounded-full bg-[#f5f5f7] hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
          >
            <span className="mi text-[18px]">arrow_back</span>
          </button>
          <div className="flex-1 flex bg-[#f5f5f7] rounded-full p-1">
            {(['orders', 'products', 'voucher'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setRightTab(t)}
                className={`flex-1 rounded-full py-2.5 text-[13px] font-semibold capitalize transition-colors cursor-pointer ${
                  rightTab === t ? 'text-white' : 'text-gray-600'
                }`}
                style={rightTab === t ? { backgroundColor: RED } : undefined}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto thin-scroll-gray flex flex-col gap-3 pr-1">
          {rightTab === 'orders' && (
            <div className="shrink-0 relative mb-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Image src="/images/compare-icons/search-icon.svg" alt="" width={16} height={16} className="w-4 h-4 opacity-60" />
              </span>
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search Orders"
                className="w-full bg-[#f3f4f6] rounded-full pl-11 pr-3 py-3 text-[13px] font-medium text-gray-600 placeholder-gray-500 outline-none"
              />
            </div>
          )}

          {rightTab === 'orders' &&
            orderResults.map((order) => {
              const product = productsByCategory.cpu[order.productIndex]
              return (
                <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                  <p className="text-[11.5px] text-gray-500 m-0 mb-1 flex items-center gap-1.5">
                    Status:
                    <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${statusStyle[order.status]}`}>
                      {order.status}
                    </span>
                  </p>
                  <p className="text-[11.5px] text-gray-500 m-0 mb-1 flex items-center gap-1.5">
                    Order ID: {order.id}
                    <button
                      type="button"
                      title="Copy order ID"
                      onClick={() => {
                        navigator.clipboard.writeText(order.id)
                        showToast('Order ID copied!')
                      }}
                      className="text-gray-400 hover:text-[#bd2026] transition-colors cursor-pointer"
                    >
                      <span className="mi text-[13px] leading-none">content_copy</span>
                    </button>
                  </p>
                  <p className="text-[11.5px] text-gray-500 m-0 mb-2">Order Time: {order.time}</p>
                  {product && (
                    <div className="flex items-center gap-2.5 bg-[#f8fafc] rounded-xl p-2 mb-2.5">
                      <div className="w-10 h-10 shrink-0 rounded-lg bg-white border border-gray-200 overflow-hidden relative">
                        {product.image && <Image src={product.image} alt="" fill className="object-contain p-1" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11.5px] font-semibold text-gray-800 truncate m-0">{product.name}</p>
                        <p className="text-[11.5px] font-bold m-0" style={{ color: RED }}>
                          <span className="font-medium">৳</span><span className="font-price">{product.priceNew.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => showToast('Feature coming soon!')}
                    className="group w-full bg-white border border-[#bd2026] text-[#bd2026] py-1.5 rounded-full text-[11.5px] font-semibold hover:bg-[#bd2026] hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {order.icon && order.iconPosition === 'left' && (
                      <Image
                        src={order.icon}
                        alt=""
                        width={13}
                        height={13}
                        className="w-[13px] h-[13px] object-contain transition-all group-hover:brightness-0 group-hover:invert"
                      />
                    )}
                    {order.action}
                    {order.icon && order.iconPosition === 'right' && (
                      <Image
                        src={order.icon}
                        alt=""
                        width={13}
                        height={13}
                        className="w-[13px] h-[13px] object-contain transition-all group-hover:brightness-0 group-hover:invert"
                      />
                    )}
                  </button>
                </div>
              )
            })}
          {rightTab === 'orders' && orderResults.length === 0 && (
            <p className="text-center text-gray-400 text-[13px] py-10">No orders match your search.</p>
          )}

          {rightTab === 'products' && (
            <>
              <div className="shrink-0 relative mb-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Image src="/images/compare-icons/search-icon.svg" alt="" width={16} height={16} className="w-4 h-4 opacity-60" />
                </span>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search Products"
                  className="w-full bg-[#f3f4f6] rounded-full pl-11 pr-3 py-3 text-[13px] font-medium text-gray-600 placeholder-gray-500 outline-none"
                />
              </div>
              {productResults.map((p) => (
                <div key={p.id} className="flex gap-3 items-start bg-white border border-gray-100 rounded-2xl p-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                  <div className="w-[54px] h-[54px] shrink-0 rounded-xl bg-white border border-gray-200 overflow-hidden relative">
                    {p.image && <Image src={p.image} alt="" fill className="object-contain p-1" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold text-gray-800 leading-[1.4] m-0 mb-1 line-clamp-2">{p.name}</p>
                    <p className="text-[12px] font-bold m-0 mb-2" style={{ color: RED }}>
                      <span className="font-medium">৳</span><span className="font-price">{p.priceNew.toLocaleString()}</span>
                    </p>
                    <button
                      type="button"
                      disabled={!selectedId}
                      onClick={() => {
                        if (!selectedId) return
                        sendMessage(selectedId, 'admin', 'Here is the product you asked about:', 'product', {
                          productId: p.id,
                        })
                      }}
                      className="shrink-0 whitespace-nowrap bg-white border border-[#bd2026] text-[#bd2026] px-4 py-1.5 rounded-full text-[11px] font-semibold hover:bg-[#bd2026] hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Send to chat
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {rightTab === 'voucher' &&
            mockVouchers.map((v) => (
              <div key={v.code} className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-bold" style={{ color: RED }}>
                    {v.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(v.code)
                      showToast('Voucher code copied!')
                    }}
                    className="text-[11px] font-semibold text-gray-500 hover:text-[#bd2026] transition-colors cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-[12px] text-gray-600 m-0 mb-1">{v.desc}</p>
                <p className="text-[10.5px] text-gray-400 m-0">Expires {v.expiry}</p>
              </div>
            ))}
        </div>
      </aside>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={imageMessages.map((m) => ({ url: m.fileUrl ?? '', alt: m.fileName }))}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}

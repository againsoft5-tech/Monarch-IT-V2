'use client'

import { useEffect, useState } from 'react'

export type ChatSender = 'customer' | 'admin'
export type ChatMessageType = 'text' | 'product' | 'file'
export type FileKind = 'image' | 'video' | 'document' | 'audio'

export type ProductSnapshot = {
  name: string
  image: string
  priceNew: number
  priceOld: number
  discountPct: number
  href?: string
}

export type StoredMessage = {
  id: string
  sender: ChatSender
  type: ChatMessageType
  text: string
  productId?: string
  productSnapshot?: ProductSnapshot
  fileName?: string
  fileUrl?: string
  fileMime?: string
  fileSize?: number
  fileKind?: FileKind
  time: string
  read: boolean
}

export type Conversation = {
  id: string
  customerName: string
  customerEmail: string
  starred: boolean
  messages: StoredMessage[]
  updatedAt: string
}

type ChatDB = Record<string, Conversation>

const DB_KEY = 'monarch_chat_db'
const CHANNEL_NAME = 'monarch-chat-sync'
const LOCAL_EVENT = 'monarch-chat-local-change'

type SyncMessage = { kind: 'db' } | { kind: 'typing'; conversationId: string; sender: ChatSender }

let channel: BroadcastChannel | null = null
function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME)
  return channel
}

function nowIso() {
  return new Date().toISOString()
}

export function formatChatTime(iso: string) {
  const date = new Date(iso)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${mm}/${dd} ${hh}:${min}`
}

function makeId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
}

function seedDB(): ChatDB {
  const conversations: Conversation[] = [
    {
      id: 'tanvir.ahmed@gmail.com',
      customerName: 'Tanvir Ahmed',
      customerEmail: 'tanvir.ahmed@gmail.com',
      starred: true,
      updatedAt: '2026-07-16T10:47:00.000Z',
      messages: [
        { id: makeId(), sender: 'customer', type: 'text', text: 'Is the RTX 4070 still available?', time: '2026-07-16T10:42:00.000Z', read: true },
        { id: makeId(), sender: 'admin', type: 'text', text: 'Yes sir, available in stock!', time: '2026-07-16T10:44:00.000Z', read: true },
        { id: makeId(), sender: 'customer', type: 'text', text: 'Great, what is the warranty period?', time: '2026-07-16T10:47:00.000Z', read: true },
        { id: makeId(), sender: 'admin', type: 'text', text: '3 years official warranty from Monarch IT.', time: '2026-07-16T10:49:00.000Z', read: false },
      ],
    },
    {
      id: 'nusrat.jahan@gmail.com',
      customerName: 'Nusrat Jahan',
      customerEmail: 'nusrat.jahan@gmail.com',
      starred: false,
      updatedAt: '2026-07-17T15:20:00.000Z',
      messages: [
        { id: makeId(), sender: 'customer', type: 'text', text: 'Do you provide home delivery outside Dhaka?', time: '2026-07-17T15:18:00.000Z', read: false },
        { id: makeId(), sender: 'admin', type: 'text', text: 'Yes, we deliver nationwide via courier.', time: '2026-07-17T15:20:00.000Z', read: true },
      ],
    },
    {
      id: 'rafiul.islam@gmail.com',
      customerName: 'Rafiul Islam',
      customerEmail: 'rafiul.islam@gmail.com',
      starred: false,
      updatedAt: '2026-07-15T09:05:00.000Z',
      messages: [
        { id: makeId(), sender: 'customer', type: 'text', text: 'Can I visit the shop to see the laptop before buying?', time: '2026-07-15T09:00:00.000Z', read: true },
        { id: makeId(), sender: 'admin', type: 'text', text: "Yes sir, you're most welcome to visit our shop directly at your convenience.", time: '2026-07-15T09:05:00.000Z', read: true },
      ],
    },
    {
      id: 'ayesha.siddika@gmail.com',
      customerName: 'Ayesha Siddika',
      customerEmail: 'ayesha.siddika@gmail.com',
      starred: true,
      updatedAt: '2026-07-14T12:30:00.000Z',
      messages: [
        { id: makeId(), sender: 'customer', type: 'text', text: 'What is the price of the AMD Ryzen 5 5600?', time: '2026-07-14T12:28:00.000Z', read: true },
        { id: makeId(), sender: 'admin', type: 'text', text: '৳14,800 with 12% off right now.', time: '2026-07-14T12:30:00.000Z', read: true },
      ],
    },
  ]

  const db: ChatDB = {}
  for (const c of conversations) db[c.id] = c
  return db
}

function readDB(): ChatDB {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (!raw) {
      const seeded = seedDB()
      localStorage.setItem(DB_KEY, JSON.stringify(seeded))
      return seeded
    }
    return JSON.parse(raw) as ChatDB
  } catch {
    return {}
  }
}

function writeDB(db: ChatDB) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
  getChannel()?.postMessage({ kind: 'db' } satisfies SyncMessage)
  window.dispatchEvent(new Event(LOCAL_EVENT))
}

export function getOrCreateConversation(email: string, name: string): Conversation {
  const db = readDB()
  const id = email.toLowerCase()
  if (!db[id]) {
    db[id] = {
      id,
      customerName: name,
      customerEmail: email,
      starred: false,
      updatedAt: nowIso(),
      messages: [
        {
          id: makeId(),
          sender: 'admin',
          type: 'text',
          text: 'Welcome to Monarch IT! How can we help you today?',
          time: nowIso(),
          read: true,
        },
      ],
    }
    writeDB(db)
  }
  return db[id]
}

type SendMessageOptions = {
  productId?: string
  productSnapshot?: ProductSnapshot
  fileName?: string
  fileUrl?: string
  fileMime?: string
  fileSize?: number
  fileKind?: FileKind
}

export function sendMessage(
  conversationId: string,
  sender: ChatSender,
  text: string,
  type: ChatMessageType = 'text',
  options: SendMessageOptions = {}
) {
  const db = readDB()
  const convo = db[conversationId]
  if (!convo) return

  const message: StoredMessage = {
    id: makeId(),
    sender,
    type,
    text,
    time: nowIso(),
    read: false,
    ...options,
  }
  convo.messages.push(message)
  convo.updatedAt = message.time
  writeDB(db)
}

export const MAX_ATTACHMENT_SIZE = 1.5 * 1024 * 1024

export function formatFileSize(bytes?: number) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function markRead(conversationId: string, reader: ChatSender) {
  const db = readDB()
  const convo = db[conversationId]
  if (!convo) return

  const otherSender: ChatSender = reader === 'customer' ? 'admin' : 'customer'
  let changed = false
  for (const m of convo.messages) {
    if (m.sender === otherSender && !m.read) {
      m.read = true
      changed = true
    }
  }
  if (changed) writeDB(db)
}

export function toggleStar(conversationId: string) {
  const db = readDB()
  const convo = db[conversationId]
  if (!convo) return
  convo.starred = !convo.starred
  writeDB(db)
}

export function broadcastTyping(conversationId: string, sender: ChatSender) {
  getChannel()?.postMessage({ kind: 'typing', conversationId, sender } satisfies SyncMessage)
}

export function useChatStore() {
  const [db, setDb] = useState<ChatDB>({})

  useEffect(() => {
    setDb(readDB())
    const refresh = () => setDb(readDB())
    const ch = getChannel()
    const onMessage = (e: MessageEvent<SyncMessage>) => {
      if (e.data?.kind === 'db') refresh()
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === DB_KEY) refresh()
    }
    ch?.addEventListener('message', onMessage)
    window.addEventListener(LOCAL_EVENT, refresh)
    window.addEventListener('storage', onStorage)
    return () => {
      ch?.removeEventListener('message', onMessage)
      window.removeEventListener(LOCAL_EVENT, refresh)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return db
}

export function useTypingSignal(conversationId: string, watchFor: ChatSender) {
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const ch = getChannel()
    let timer: ReturnType<typeof setTimeout> | null = null

    const onMessage = (e: MessageEvent<SyncMessage>) => {
      if (e.data?.kind === 'typing' && e.data.conversationId === conversationId && e.data.sender === watchFor) {
        setIsTyping(true)
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => setIsTyping(false), 2500)
      }
    }

    ch?.addEventListener('message', onMessage)
    return () => {
      ch?.removeEventListener('message', onMessage)
      if (timer) clearTimeout(timer)
    }
  }, [conversationId, watchFor])

  return isTyping
}

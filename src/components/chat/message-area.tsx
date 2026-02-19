'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { MessageBubble } from './message-bubble'
import { MessageInput } from './message-input'
import { markMessagesAsRead } from '@/actions/chat'
import type { ChatMessageItem } from '@/actions/chat'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

type MessageAreaProps = {
  orderId: string
  orderDescription: string
  orderStatus: string
  companion: {
    name: string
    avatarUrl: string | null
  }
  initialMessages: ChatMessageItem[]
  onBack?: () => void
}

const statusLabels: Record<string, string> = {
  NEW: 'Новая',
  DISCUSSION: 'Обсуждение',
  ACCEPTED: 'Принята',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Выполнена',
  CANCELLED: 'Отменена',
  DISPUTED: 'Спор',
}

export function MessageArea({
  orderId,
  orderDescription,
  orderStatus,
  companion,
  initialMessages,
  onBack,
}: MessageAreaProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ChatMessageItem[]>(initialMessages)
  const [isLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const currentUserId = session?.user?.id

  // Автоскролл к последнему сообщению
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior })
  }, [])

  // Обновляем сообщения при смене беседы
  useEffect(() => {
    setMessages(initialMessages)
    // Скроллим сразу без анимации
    setTimeout(() => scrollToBottom('instant'), 50)
  }, [orderId, initialMessages, scrollToBottom])

  // Помечаем как прочитанные при открытии и при получении новых
  useEffect(() => {
    if (orderId && currentUserId) {
      markMessagesAsRead(orderId).catch(() => {})
    }
  }, [orderId, currentUserId, messages.length])

  // Polling каждые 3 секунды
  useEffect(() => {
    if (!orderId) return

    const poll = async () => {
      try {
        const lastMsg = messages[messages.length - 1]
        const after = lastMsg?.createdAt || ''
        const res = await fetch(
          `/api/chat/messages?orderId=${encodeURIComponent(orderId)}&after=${encodeURIComponent(after)}`
        )
        const data = await res.json()
        if (data.success && data.data?.messages?.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id))
            const newMsgs = data.data.messages.filter(
              (m: ChatMessageItem) => !existingIds.has(m.id)
            )
            if (newMsgs.length === 0) return prev
            return [...prev, ...newMsgs]
          })
          scrollToBottom()
          // Помечаем новые как прочитанные
          markMessagesAsRead(orderId).catch(() => {})
        }
      } catch {
        // Тихо игнорируем ошибки polling
      }
    }

    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [orderId, messages, scrollToBottom])

  const handleMessageSent = () => {
    // Сразу запросим новые сообщения после отправки
    setTimeout(async () => {
      try {
        const lastMsg = messages[messages.length - 1]
        const after = lastMsg?.createdAt || ''
        const res = await fetch(
          `/api/chat/messages?orderId=${encodeURIComponent(orderId)}&after=${encodeURIComponent(after)}`
        )
        const data = await res.json()
        if (data.success && data.data?.messages?.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id))
            const newMsgs = data.data.messages.filter(
              (m: ChatMessageItem) => !existingIds.has(m.id)
            )
            if (newMsgs.length === 0) return prev
            return [...prev, ...newMsgs]
          })
          scrollToBottom()
        }
      } catch {
        // ignore
      }
    }, 500)
  }

  // Группировка сообщений по дате
  const groupedMessages: { date: string; messages: ChatMessageItem[] }[] = []
  let currentDateStr = ''

  for (const msg of messages) {
    const dateStr = format(new Date(msg.createdAt), 'd MMMM yyyy', { locale: ru })
    if (dateStr !== currentDateStr) {
      currentDateStr = dateStr
      groupedMessages.push({ date: dateStr, messages: [] })
    }
    groupedMessages[groupedMessages.length - 1].messages.push(msg)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Шапка */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
        {onBack && (
          <button type="button" onClick={onBack} className="md:hidden p-1 -ml-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <Avatar className="h-9 w-9">
          <AvatarImage src={companion.avatarUrl || undefined} />
          <AvatarFallback>{companion.name[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{companion.name}</p>
          <p className="text-xs text-muted-foreground truncate">{orderDescription.slice(0, 60)}</p>
        </div>
        <Badge variant="outline" className="shrink-0 text-xs">
          {statusLabels[orderStatus] || orderStatus}
        </Badge>
      </div>

      {/* Сообщения */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground text-sm">Нет сообщений</p>
            <p className="text-muted-foreground text-xs mt-1">
              Напишите первое сообщение, чтобы начать обсуждение
            </p>
          </div>
        )}

        {groupedMessages.map((group) => (
          <div key={group.date}>
            <div className="flex justify-center my-3">
              <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {group.date}
              </span>
            </div>
            <div className="space-y-1">
              {group.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  text={msg.text}
                  imageUrl={msg.imageUrl}
                  createdAt={msg.createdAt}
                  isOwn={msg.senderId === currentUserId}
                  isRead={msg.isRead}
                />
              ))}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Ввод сообщения */}
      <MessageInput orderId={orderId} onMessageSent={handleMessageSent} />
    </div>
  )
}

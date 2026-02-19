'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ConversationList } from './conversation-list'
import { MessageArea } from './message-area'
import { getMessages } from '@/actions/chat'
import type { ConversationItem, ChatMessageItem } from '@/actions/chat'
import { MessageSquare } from 'lucide-react'

type ChatLayoutProps = {
  initialConversations: ConversationItem[]
}

export function ChatLayout({ initialConversations }: ChatLayoutProps) {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [conversations, setConversations] = useState(initialConversations)
  const [activeOrderId, setActiveOrderId] = useState<string | null>(
    searchParams.get('order') || null
  )
  const [messages, setMessages] = useState<ChatMessageItem[]>([])
  const [, setLoadingMessages] = useState(false)

  const currentUserId = session?.user?.id || ''

  const activeConversation = conversations.find((c) => c.orderId === activeOrderId)

  // Загрузка сообщений при выборе беседы
  const loadMessages = useCallback(async (orderId: string) => {
    setLoadingMessages(true)
    try {
      const result = await getMessages(orderId)
      if (result.success && result.data) {
        setMessages(result.data.messages)
      }
    } catch {
      // ignore
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  // При смене активной беседы
  useEffect(() => {
    if (activeOrderId) {
      loadMessages(activeOrderId)
    } else {
      setMessages([])
    }
  }, [activeOrderId, loadMessages])

  // Обработчик выбора беседы
  const handleSelectConversation = (orderId: string) => {
    setActiveOrderId(orderId)
    // Обновляем URL без перезагрузки
    router.replace(`/dashboard/chat?order=${orderId}`, { scroll: false })
  }

  // Обработчик кнопки «Назад» (мобильные)
  const handleBack = () => {
    setActiveOrderId(null)
    router.replace('/dashboard/chat', { scroll: false })
  }

  // Polling для обновления списка бесед (непрочитанные и последнее сообщение)
  useEffect(() => {
    const pollConversations = async () => {
      try {
        const res = await fetch('/api/chat/unread')
        const data = await res.json()
        // Обновляем бейджи, если кол-во изменилось
        if (typeof data.count === 'number') {
          // Перезапрашиваем беседы через server action только если есть новые
          const { getConversations } = await import('@/actions/chat')
          const result = await getConversations()
          if (result.success && result.data) {
            setConversations(result.data)
          }
        }
      } catch {
        // ignore
      }
    }

    const interval = setInterval(pollConversations, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-[calc(100vh-10rem)] bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Список бесед — скрыт на мобильных когда выбрана беседа */}
      <div
        className={`w-full md:w-[320px] md:border-r shrink-0 ${
          activeOrderId ? 'hidden md:flex md:flex-col' : 'flex flex-col'
        }`}
      >
        <ConversationList
          conversations={conversations}
          activeOrderId={activeOrderId}
          currentUserId={currentUserId}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* Область сообщений */}
      <div
        className={`flex-1 min-w-0 ${
          activeOrderId ? 'flex flex-col' : 'hidden md:flex md:flex-col'
        }`}
      >
        {activeConversation ? (
          <MessageArea
            orderId={activeConversation.orderId}
            orderDescription={activeConversation.orderDescription}
            orderStatus={activeConversation.orderStatus}
            companion={activeConversation.companion}
            initialMessages={messages}
            onBack={handleBack}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">Выберите беседу</p>
            <p className="text-sm text-muted-foreground mt-1">
              Выберите беседу из списка слева, чтобы начать общение
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

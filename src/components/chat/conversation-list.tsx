'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search, MessageSquare } from 'lucide-react'
import { ConversationItemCard } from './conversation-item'
import type { ConversationItem } from '@/actions/chat'

type ConversationListProps = {
  conversations: ConversationItem[]
  activeOrderId: string | null
  currentUserId: string
  onSelect: (orderId: string) => void
}

export function ConversationList({
  conversations,
  activeOrderId,
  currentUserId,
  onSelect,
}: ConversationListProps) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? conversations.filter(
        (c) =>
          c.companion.name.toLowerCase().includes(search.toLowerCase()) ||
          c.orderDescription.toLowerCase().includes(search.toLowerCase())
      )
    : conversations

  return (
    <div className="flex flex-col h-full">
      {/* Поиск */}
      <div className="p-3 border-b shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по беседам..."
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Список */}
      <div className="flex-1 overflow-y-auto p-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              {search.trim() ? 'Ничего не найдено' : 'Нет бесед'}
            </p>
            {!search.trim() && (
              <p className="text-xs text-muted-foreground mt-1">
                Беседы появятся, когда вы создадите заявку исполнителю
              </p>
            )}
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationItemCard
              key={conv.orderId}
              conversation={conv}
              isActive={conv.orderId === activeOrderId}
              currentUserId={currentUserId}
              onClick={() => onSelect(conv.orderId)}
            />
          ))
        )}
      </div>
    </div>
  )
}

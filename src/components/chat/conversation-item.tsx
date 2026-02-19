'use client'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { ConversationItem } from '@/actions/chat'

type ConversationItemProps = {
  conversation: ConversationItem
  isActive: boolean
  currentUserId: string
  onClick: () => void
}

export function ConversationItemCard({
  conversation,
  isActive,
  currentUserId,
  onClick,
}: ConversationItemProps) {
  const { companion, lastMessage, unreadCount, orderDescription } = conversation

  const lastMessagePreview = lastMessage
    ? lastMessage.senderId === currentUserId
      ? `Вы: ${lastMessage.text}`
      : lastMessage.text
    : orderDescription

  const timeAgo = lastMessage
    ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true, locale: ru })
    : null

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 px-3 py-3 text-left transition-colors rounded-lg',
        isActive ? 'bg-primary/10' : 'hover:bg-muted'
      )}
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={companion.avatarUrl || undefined} />
        <AvatarFallback>{companion.name[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold truncate">{companion.name}</span>
          {timeAgo && (
            <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {lastMessagePreview.slice(0, 60)}
        </p>
      </div>

      {unreadCount > 0 && (
        <span className="shrink-0 mt-1 flex items-center justify-center min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold px-1.5">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

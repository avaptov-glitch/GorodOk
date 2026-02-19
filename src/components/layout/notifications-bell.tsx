'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { markAllNotificationsRead } from '@/actions/notifications'

// Сериализованный тип для передачи из серверного компонента
export type NotificationItem = {
  id: string
  title: string
  body: string
  link: string | null
  isRead: boolean
  createdAt: string // ISO строка
  type: string
}

interface NotificationsBellProps {
  notifications: NotificationItem[]
  unreadCount: number
}

export function NotificationsBell({ notifications, unreadCount }: NotificationsBellProps) {
  const [isPending, startTransition] = useTransition()

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead()
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Уведомления</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        {/* Шапка */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Уведомления</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground gap-1"
              onClick={handleMarkAllRead}
              disabled={isPending}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Прочитать все
            </Button>
          )}
        </div>

        {/* Список уведомлений */}
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Нет уведомлений
          </div>
        ) : (
          <ul className="divide-y max-h-80 overflow-y-auto">
            {notifications.map((n) => {
              const content = (
                <div className={`px-4 py-3 text-sm hover:bg-muted/50 transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}>
                  <div className="flex items-start gap-2">
                    {!n.isRead && (
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                    <div className={!n.isRead ? '' : 'ml-4'}>
                      <p className="font-medium text-foreground leading-snug">{n.title}</p>
                      <p className="text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                        {n.body}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ru })}
                      </p>
                    </div>
                  </div>
                </div>
              )

              return (
                <li key={n.id}>
                  {n.link ? (
                    <Link href={n.link} className="block">
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}

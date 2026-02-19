import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TaskStatusBadge } from './task-status-badge'
import { MapPin, MessageSquare, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { TaskStatus } from '@/types'

export interface TaskCardProps {
  id: string
  title: string
  description: string
  budget: number | null
  district: string | null
  status: TaskStatus
  createdAt: Date | string
  responsesCount: number
  client: { name: string; avatarUrl: string | null }
  category: { name: string; slug: string }
}

function formatBudget(budgetKopecks: number | null): string {
  if (!budgetKopecks) return 'По договорённости'
  return `${Math.floor(budgetKopecks / 100).toLocaleString('ru-RU')} ₽`
}

export function TaskCard({
  id,
  title,
  description,
  budget,
  district,
  status,
  createdAt,
  responsesCount,
  client,
  category,
}: TaskCardProps) {
  const initials = client.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ru })

  return (
    <Link href={`/task/${id}`} className="block">
      <Card className="hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
        <CardContent className="p-5 flex flex-col flex-1">
          {/* Header: category + status */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <Badge variant="secondary" className="text-xs truncate">
              {category.name}
            </Badge>
            <TaskStatusBadge status={status} />
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2">{title}</h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{description}</p>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Budget */}
          <div className="text-lg font-semibold text-foreground mb-3">
            {formatBudget(budget)}
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
            {district && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {district}
              </span>
            )}
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              {responsesCount} {responsesCount === 1 ? 'отклик' : responsesCount >= 2 && responsesCount <= 4 ? 'отклика' : 'откликов'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {timeAgo}
            </span>
          </div>

          {/* Client */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
            <Avatar className="h-6 w-6">
              <AvatarImage src={client.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate">{client.name}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

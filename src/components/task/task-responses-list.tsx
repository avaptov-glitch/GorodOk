import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SelectExecutorButton } from './select-executor-button'
import { Star, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { TaskStatus } from '@/types'

interface TaskResponseData {
  id: string
  message: string
  price: number | null
  createdAt: Date | string
  executor: {
    id: string
    isVerified: boolean
    isPro: boolean
    ratingAvg: number
    reviewsCount: number
    user: { name: string; avatarUrl: string | null }
  }
}

interface TaskResponsesListProps {
  responses: TaskResponseData[]
  isOwner: boolean
  taskId: string
  taskStatus: TaskStatus
}

function formatPrice(priceKopecks: number | null): string {
  if (!priceKopecks) return 'Не указана'
  return `${Math.floor(priceKopecks / 100).toLocaleString('ru-RU')} ₽`
}

export function TaskResponsesList({
  responses,
  isOwner,
  taskId,
  taskStatus,
}: TaskResponsesListProps) {
  if (responses.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-4">
        Пока нет откликов. Будьте первым!
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {responses.map((resp) => {
        const initials = resp.executor.user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()

        const timeAgo = formatDistanceToNow(new Date(resp.createdAt), {
          addSuffix: true,
          locale: ru,
        })

        return (
          <Card key={resp.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <Link href={`/executor/${resp.executor.id}`}>
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={resp.executor.user.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div className="flex-1 min-w-0">
                  {/* Name + badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Link
                      href={`/executor/${resp.executor.id}`}
                      className="font-semibold text-foreground hover:underline"
                    >
                      {resp.executor.user.name}
                    </Link>
                    {resp.executor.isVerified && (
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    )}
                    {resp.executor.isPro && (
                      <Badge variant="secondary" className="text-xs">
                        PRO
                      </Badge>
                    )}
                  </div>

                  {/* Rating */}
                  {resp.executor.reviewsCount > 0 ? (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">
                        {resp.executor.ratingAvg.toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({resp.executor.reviewsCount})
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Нет отзывов</span>
                  )}

                  {/* Message */}
                  <p className="text-sm text-foreground mt-2 whitespace-pre-line">
                    {resp.message}
                  </p>

                  {/* Price + time */}
                  <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="text-sm">
                        <span className="text-muted-foreground">Цена: </span>
                        <span className="font-semibold">{formatPrice(resp.price)}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{timeAgo}</span>
                    </div>

                    {/* Select button for task owner */}
                    {isOwner && taskStatus === 'ACTIVE' && (
                      <SelectExecutorButton
                        taskId={taskId}
                        responseId={resp.id}
                        executorName={resp.executor.user.name}
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

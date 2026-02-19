import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Inbox, Star, MessageSquare } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/common/empty-state'
import { StatusBadge } from '@/components/order/status-badge'
import { OrderStatusActions } from '@/components/order/order-status-actions'
import { ReviewReplyForm } from '@/components/review/review-reply-form'
import type { OrderStatus } from '@/types'

export const metadata: Metadata = { title: 'Входящие заявки' }

const TABS: { label: string; value: string; statuses?: OrderStatus[] }[] = [
  { label: 'Новые', value: 'new', statuses: ['NEW', 'DISCUSSION'] },
  { label: 'В работе', value: 'active', statuses: ['ACCEPTED', 'IN_PROGRESS'] },
  { label: 'Все', value: 'all' },
  { label: 'Выполненные', value: 'completed', statuses: ['COMPLETED'] },
  { label: 'Отменённые', value: 'cancelled', statuses: ['CANCELLED', 'DISPUTED'] },
]

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function ExecutorOrdersPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  // Получаем профиль исполнителя
  const executorProfile = await prisma.executorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })

  if (!executorProfile) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-4">Входящие заявки</h1>
        <p className="text-muted-foreground">
          Для получения заявок необходимо создать анкету исполнителя.{' '}
          <Link href="/dashboard/executor/profile" className="text-primary hover:underline">
            Перейти к анкете
          </Link>
        </p>
      </div>
    )
  }

  const { tab = 'new' } = await searchParams
  const activeTab = TABS.find((t) => t.value === tab) ?? TABS[0]

  const orders = await prisma.order.findMany({
    where: {
      executorId: executorProfile.id,
      ...(activeTab.statuses ? { status: { in: activeTab.statuses } } : {}),
    },
    include: {
      client: { select: { name: true, avatarUrl: true } },
      service: { select: { name: true } },
      review: {
        select: {
          id: true,
          rating: true,
          text: true,
          executorReply: true,
          client: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Считаем новые заявки для бейджа
  const newCount = await prisma.order.count({
    where: { executorId: executorProfile.id, status: { in: ['NEW', 'DISCUSSION'] } },
  })

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Входящие заявки</h1>
        {newCount > 0 && (
          <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            {newCount} новых
          </span>
        )}
      </div>

      {/* Вкладки фильтра */}
      <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 w-fit flex-wrap">
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`?tab=${t.value}`}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-12 w-12" />}
          title="Заявок нет"
          description={
            tab === 'new'
              ? 'Новых заявок пока нет. Убедитесь, что ваша анкета заполнена и опубликована.'
              : 'Заявок в этой категории пока нет.'
          }
          action={
            tab === 'new' ? (
              <Button asChild>
                <Link href="/dashboard/executor/profile">Настроить анкету</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const initials =
              order.client.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) ?? 'К'

            const isNew = order.status === 'NEW' || order.status === 'DISCUSSION'

            return (
              <Card
                key={order.id}
                className={`hover:shadow-md transition-shadow ${isNew ? 'border-primary/30 bg-primary/5' : ''}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Аватар клиента */}
                    <Avatar className="h-11 w-11 shrink-0">
                      <AvatarImage src={order.client.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-muted text-muted-foreground font-medium text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    {/* Основная информация */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-semibold text-foreground">{order.client.name}</p>
                          {order.service && (
                            <p className="text-sm text-primary mt-0.5">{order.service.name}</p>
                          )}
                        </div>
                        <StatusBadge status={order.status} />
                      </div>

                      <p className="text-sm text-foreground/80 mt-2 line-clamp-3">
                        {order.description}
                      </p>

                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {order.budget !== null && (
                            <span className="font-medium text-foreground text-sm">
                              Бюджет: {(order.budget / 100).toLocaleString('ru-RU')} ₽
                            </span>
                          )}
                          <span>
                            {formatDistanceToNow(order.createdAt, {
                              addSuffix: true,
                              locale: ru,
                            })}
                          </span>
                        </div>

                        <OrderStatusActions
                          orderId={order.id}
                          currentStatus={order.status}
                          userRole="EXECUTOR"
                        />
                      </div>

                      {/* Отзыв клиента */}
                      {order.review && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium">{order.review.rating} из 5</span>
                            <span className="text-xs text-muted-foreground">
                              от {order.review.client.name}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/80 line-clamp-3">
                            {order.review.text}
                          </p>
                          {order.review.executorReply ? (
                            <div className="pl-3 border-l-2 border-primary/40">
                              <p className="text-xs font-medium text-primary mb-0.5 flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                Ваш ответ
                              </p>
                              <p className="text-sm text-foreground/80">{order.review.executorReply}</p>
                            </div>
                          ) : (
                            <ReviewReplyForm reviewId={order.review.id} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

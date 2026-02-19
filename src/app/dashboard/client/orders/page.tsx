import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { FileText, Star } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/common/empty-state'
import { StatusBadge } from '@/components/order/status-badge'
import { OrderStatusActions } from '@/components/order/order-status-actions'
import { ReviewFormDialog } from '@/components/review/review-form-dialog'
import type { OrderStatus } from '@/types'

export const metadata: Metadata = { title: 'Мои заявки' }

// Вкладки фильтра
const TABS: { label: string; value: string; statuses?: OrderStatus[] }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Активные', value: 'active', statuses: ['NEW', 'DISCUSSION', 'ACCEPTED', 'IN_PROGRESS'] },
  { label: 'Выполненные', value: 'completed', statuses: ['COMPLETED'] },
  { label: 'Отменённые', value: 'cancelled', statuses: ['CANCELLED', 'DISPUTED'] },
]

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function ClientOrdersPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const { tab = 'all' } = await searchParams
  const activeTab = TABS.find((t) => t.value === tab) ?? TABS[0]

  const orders = await prisma.order.findMany({
    where: {
      clientId: session.user.id,
      ...(activeTab.statuses ? { status: { in: activeTab.statuses } } : {}),
    },
    include: {
      executor: {
        select: {
          id: true,
          user: { select: { name: true, avatarUrl: true } },
        },
      },
      service: { select: { name: true } },
      review: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">Мои заявки</h1>

      {/* Вкладки фильтра */}
      <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 w-fit">
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
          icon={<FileText className="h-12 w-12" />}
          title="Заявок нет"
          description={
            tab === 'all'
              ? 'Вы ещё не оставляли заявок. Найдите исполнителя и отправьте первую.'
              : 'Заявок в этой категории пока нет.'
          }
          action={
            tab === 'all' ? (
              <Button asChild>
                <Link href="/categories">Найти исполнителя</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const initials =
              order.executor.user.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) ?? 'И'

            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Аватар исполнителя */}
                    <Link href={`/executor/${order.executor.id}`} className="shrink-0">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={order.executor.user.avatarUrl ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    {/* Основная информация */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <Link
                            href={`/executor/${order.executor.id}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {order.executor.user.name}
                          </Link>
                          {order.service && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {order.service.name}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={order.status} />
                      </div>

                      <p className="text-sm text-foreground/80 mt-2 line-clamp-2">
                        {order.description}
                      </p>

                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {order.budget !== null && (
                            <span className="font-medium text-foreground">
                              {(order.budget / 100).toLocaleString('ru-RU')} ₽
                            </span>
                          )}
                          <span>
                            {formatDistanceToNow(order.createdAt, {
                              addSuffix: true,
                              locale: ru,
                            })}
                          </span>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <OrderStatusActions
                            orderId={order.id}
                            currentStatus={order.status}
                            userRole="CLIENT"
                          />
                          {order.status === 'COMPLETED' && !order.review && (
                            <ReviewFormDialog
                              orderId={order.id}
                              executorName={order.executor.user.name ?? 'Исполнитель'}
                            />
                          )}
                          {order.status === 'COMPLETED' && order.review && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              Отзыв оставлен
                            </span>
                          )}
                        </div>
                      </div>
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

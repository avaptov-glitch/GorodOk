export const dynamic = 'force-dynamic'

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
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Входящие заявки</h1>
          <p className="text-slate-500 mt-1 font-medium">Отвечайте на предложения клиентов.</p>
        </div>
        {newCount > 0 && (
          <span className="text-sm font-bold text-blue-700 bg-blue-50 px-4 py-1.5 rounded-xl shadow-sm shadow-blue-500/10">
            {newCount} новых
          </span>
        )}
      </div>

      {/* Вкладки фильтра */}
      <div className="flex gap-2 mb-8 bg-white border border-slate-200/60 shadow-sm rounded-2xl p-1.5 w-fit overflow-x-auto">
        {TABS.map((t) => {
          const isActive = tab === t.value;
          return (
            <Link
              key={t.value}
              href={`?tab=${t.value}`}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              {t.label}
            </Link>
          )
        })}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm pt-8 pb-12">
          <EmptyState
            icon={<Inbox className="h-16 w-16 text-slate-300" />}
            title="Заявок нет"
            description={
              tab === 'new'
                ? 'Новых заявок пока нет. Убедитесь, что ваша анкета заполнена и опубликована.'
                : 'Заявок в этой категории пока нет.'
            }
            action={
              tab === 'new' ? (
                <Button asChild className="rounded-xl font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 h-11 px-6">
                  <Link href="/dashboard/executor/profile">Настроить анкету</Link>
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
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
              <div
                key={order.id}
                className={`bg-white rounded-3xl border ${isNew ? 'border-blue-200 shadow-blue-100/50 bg-blue-50/5' : 'border-slate-200/60 shadow-sm'} hover:shadow-md transition-all p-6 sm:p-8 relative overflow-hidden group`}
              >
                {/* Accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isNew ? 'bg-blue-500 opacity-100' : 'bg-gradient-to-b from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100'} transition-opacity`} />

                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {/* Аватар клиента */}
                  <Avatar className="h-14 w-14 shrink-0 ring-4 ring-slate-50 shadow-sm group-hover:ring-blue-50 transition-all">
                    <AvatarImage src={order.client.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-bold text-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  {/* Основная информация */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                      <div>
                        <p className="font-extrabold text-lg text-slate-900">{order.client.name}</p>
                        {order.service && (
                          <p className="text-sm font-semibold text-blue-600 mt-0.5">{order.service.name}</p>
                        )}
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <p className="text-slate-600 text-base leading-relaxed line-clamp-3 mt-3 mb-4">
                      {order.description}
                    </p>

                    <div className="flex items-center justify-between mt-4 flex-wrap gap-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                        {order.budget !== null && (
                          <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-lg font-bold">
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

                      <div className="sm:ml-auto">
                        <OrderStatusActions
                          orderId={order.id}
                          currentStatus={order.status}
                          userRole="EXECUTOR"
                        />
                      </div>
                    </div>

                    {/* Отзыв клиента */}
                    {order.review && (
                      <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                          <span className="text-sm font-bold text-slate-700">{order.review.rating} из 5</span>
                          <span className="text-xs font-medium text-slate-400">
                            от {order.review.client.name}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-3">
                          {order.review.text}
                        </p>
                        {order.review.executorReply ? (
                          <div className="pl-4 py-1 border-l-2 border-blue-200 mt-3">
                            <p className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5" />
                              Ваш ответ
                            </p>
                            <p className="text-sm text-slate-600">{order.review.executorReply}</p>
                          </div>
                        ) : (
                          <div className="mt-4 border-t border-slate-200 pt-3">
                            <ReviewReplyForm reviewId={order.review.id} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

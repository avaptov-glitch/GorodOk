export const dynamic = 'force-dynamic'

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
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Мои заявки</h1>
        <p className="text-slate-500 mt-1 font-medium">Управляйте вашими заказами и отслеживайте их статус.</p>
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
            icon={<FileText className="h-16 w-16 text-slate-300" />}
            title="Заявок нет"
            description={
              tab === 'all'
                ? 'Вы ещё не оставляли заявок. Найдите исполнителя и отправьте первую.'
                : 'Заявок в этой категории пока нет.'
            }
            action={
              tab === 'all' ? (
                <Button asChild className="rounded-xl font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 h-11 px-6">
                  <Link href="/categories">Найти исполнителя</Link>
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const initials =
              order.executor.user.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) ?? 'И'

            return (
              <div key={order.id} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all p-6 sm:p-8 relative overflow-hidden group">
                {/* Accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {/* Аватар исполнителя */}
                  <Link href={`/executor/${order.executor.id}`} className="shrink-0">
                    <Avatar className="h-14 w-14 ring-4 ring-slate-50 shadow-sm group-hover:ring-blue-50 transition-all">
                      <AvatarImage src={order.executor.user.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-bold text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  {/* Основная информация */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                      <div>
                        <Link
                          href={`/executor/${order.executor.id}`}
                          className="font-extrabold text-lg text-slate-900 hover:text-blue-600 transition-colors"
                        >
                          {order.executor.user.name}
                        </Link>
                        {order.service && (
                          <p className="text-sm font-semibold text-slate-500 mt-0.5">
                            {order.service.name}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <p className="text-slate-600 text-base leading-relaxed line-clamp-2 mt-3 mb-4">
                      {order.description}
                    </p>

                    <div className="flex items-center justify-between mt-4 flex-wrap gap-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                        {order.budget !== null && (
                          <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-lg">
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

                      <div className="flex gap-2 flex-wrap sm:ml-auto">
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
                          <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                            Отзыв оставлен
                          </span>
                        )}
                      </div>
                    </div>
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

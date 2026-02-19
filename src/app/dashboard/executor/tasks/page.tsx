import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ClipboardList, MapPin, MessageSquare, Wallet, AlertCircle } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/common/empty-state'
import { TaskStatusBadge } from '@/components/task/task-status-badge'

export const metadata: Metadata = { title: 'Доска заданий' }

const TABS = [
  { label: 'Все задания', value: 'all' },
  { label: 'Мои отклики', value: 'responded' },
]

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

function formatBudget(budgetKopecks: number | null): string {
  if (!budgetKopecks) return 'По договорённости'
  return `${Math.floor(budgetKopecks / 100).toLocaleString('ru-RU')} ₽`
}

export default async function ExecutorTasksPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const executorProfile = await prisma.executorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!executorProfile) redirect('/dashboard')

  const { tab = 'all' } = await searchParams

  // Получаем информацию о плане и дневном лимите
  const subscription = await prisma.subscription.findFirst({
    where: { executorId: executorProfile.id, isActive: true },
    select: { plan: true },
  })
  const isFree = !subscription || subscription.plan === 'FREE'

  let dailyResponseCount = 0
  if (isFree) {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    dailyResponseCount = await prisma.taskResponse.count({
      where: { executorId: executorProfile.id, createdAt: { gte: todayStart } },
    })
  }

  if (tab === 'responded') {
    // Мои отклики
    const myResponses = await prisma.taskResponse.findMany({
      where: { executorId: executorProfile.id },
      include: {
        task: {
          include: {
            client: { select: { name: true, avatarUrl: true } },
            category: { select: { name: true } },
            _count: { select: { responses: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">Доска заданий</h1>

        {/* Лимит откликов для FREE */}
        {isFree && (
          <div className="flex items-center gap-2 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2.5 mb-4">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Откликов сегодня: <strong>{dailyResponseCount}/5</strong>. Оформите{' '}
              <Link href="/dashboard/executor/subscription" className="underline font-medium">
                PRO
              </Link>{' '}
              для безлимита.
            </span>
          </div>
        )}

        {/* Tabs */}
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

        {myResponses.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-12 w-12" />}
            title="Вы ещё не откликались"
            description="Просмотрите доску заданий и откликнитесь на подходящие."
          />
        ) : (
          <div className="space-y-3">
            {myResponses.map((resp) => (
              <Card key={resp.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {resp.task.category.name}
                      </Badge>
                      <TaskStatusBadge status={resp.task.status} />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Отклик:{' '}
                      {formatDistanceToNow(new Date(resp.createdAt), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </span>
                  </div>

                  <Link
                    href={`/task/${resp.task.id}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {resp.task.title}
                  </Link>

                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    Ваш отклик: {resp.message}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {formatBudget(resp.task.budget)}
                    </span>
                    {resp.price && (
                      <span>
                        Ваша цена: <strong className="text-foreground">{formatBudget(resp.price)}</strong>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {resp.task._count.responses}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Tab: all — Все активные задания
  const tasks = await prisma.task.findMany({
    where: { status: 'ACTIVE' },
    include: {
      client: { select: { name: true, avatarUrl: true } },
      category: { select: { name: true, slug: true } },
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // Получаем ID заданий, на которые уже откликнулся
  const respondedTaskIds = new Set(
    (
      await prisma.taskResponse.findMany({
        where: { executorId: executorProfile.id },
        select: { taskId: true },
      })
    ).map((r) => r.taskId)
  )

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">Доска заданий</h1>

      {/* Лимит откликов для FREE */}
      {isFree && (
        <div className="flex items-center gap-2 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2.5 mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            Откликов сегодня: <strong>{dailyResponseCount}/5</strong>. Оформите{' '}
            <Link href="/dashboard/executor/subscription" className="underline font-medium">
              PRO
            </Link>{' '}
            для безлимита.
          </span>
        </div>
      )}

      {/* Tabs */}
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

      {tasks.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-12 w-12" />}
          title="Активных заданий пока нет"
          description="Здесь будут появляться задания от клиентов. Проверяйте периодически!"
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {task.category.name}
                    </Badge>
                    {respondedTaskIds.has(task.id) && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        Вы откликнулись
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(task.createdAt), {
                      addSuffix: true,
                      locale: ru,
                    })}
                  </span>
                </div>

                <Link
                  href={`/task/${task.id}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {task.title}
                </Link>

                <p className="text-sm text-foreground/80 mt-1 line-clamp-2">
                  {task.description}
                </p>

                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5" />
                    <span className="font-medium text-foreground">
                      {formatBudget(task.budget)}
                    </span>
                  </span>
                  {task.district && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {task.district}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {task._count.responses}{' '}
                    {task._count.responses === 1
                      ? 'отклик'
                      : task._count.responses >= 2 && task._count.responses <= 4
                        ? 'отклика'
                        : 'откликов'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

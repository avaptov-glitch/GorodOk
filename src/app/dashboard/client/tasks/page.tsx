import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ClipboardList, Plus, MessageSquare } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/common/empty-state'
import { TaskStatusBadge } from '@/components/task/task-status-badge'
import { TaskStatusActions } from '@/components/task/task-status-actions'
import { Badge } from '@/components/ui/badge'
import type { TaskStatus } from '@/types'

export const metadata: Metadata = { title: 'Мои задания' }

const TABS: { label: string; value: string; statuses?: TaskStatus[] }[] = [
  { label: 'Все', value: 'all' },
  { label: 'Активные', value: 'active', statuses: ['ACTIVE'] },
  { label: 'В работе', value: 'in_progress', statuses: ['IN_PROGRESS'] },
  { label: 'Завершённые', value: 'completed', statuses: ['COMPLETED'] },
  { label: 'Отменённые', value: 'cancelled', statuses: ['CANCELLED'] },
]

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

function formatBudget(budgetKopecks: number | null): string {
  if (!budgetKopecks) return 'По договорённости'
  return `${Math.floor(budgetKopecks / 100).toLocaleString('ru-RU')} ₽`
}

export default async function ClientTasksPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const { tab = 'all' } = await searchParams
  const activeTab = TABS.find((t) => t.value === tab) ?? TABS[0]

  const tasks = await prisma.task.findMany({
    where: {
      clientId: session.user.id,
      ...(activeTab.statuses ? { status: { in: activeTab.statuses } } : {}),
    },
    include: {
      category: { select: { name: true } },
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground">Мои задания</h1>
        <Button asChild size="sm">
          <Link href="/tasks/create">
            <Plus className="h-4 w-4 mr-1.5" />
            Создать задание
          </Link>
        </Button>
      </div>

      {/* Tabs */}
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

      {tasks.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-12 w-12" />}
          title="Заданий нет"
          description={
            tab === 'all'
              ? 'Вы ещё не создавали заданий. Опишите задачу — исполнители откликнутся!'
              : 'Заданий в этой категории пока нет.'
          }
          action={
            tab === 'all' ? (
              <Button asChild>
                <Link href="/tasks/create">Создать задание</Link>
              </Button>
            ) : undefined
          }
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
                    <TaskStatusBadge status={task.status} />
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

                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {formatBudget(task.budget)}
                    </span>
                    <Link
                      href={`/task/${task.id}`}
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {task._count.responses}{' '}
                      {task._count.responses === 1
                        ? 'отклик'
                        : task._count.responses >= 2 && task._count.responses <= 4
                          ? 'отклика'
                          : 'откликов'}
                    </Link>
                  </div>

                  <TaskStatusActions taskId={task.id} currentStatus={task.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

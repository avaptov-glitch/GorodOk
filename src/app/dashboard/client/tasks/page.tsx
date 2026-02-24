export const dynamic = 'force-dynamic'

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
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Мои задания</h1>
          <p className="text-slate-500 mt-1 font-medium">Следите за откликами и выбирайте исполнителей.</p>
        </div>
        <Button asChild className="rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 px-6 h-11 shrink-0">
          <Link href="/tasks/create">
            <Plus className="h-5 w-5 mr-1.5" />
            Создать задание
          </Link>
        </Button>
      </div>

      {/* Tabs */}
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

      {tasks.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm pt-8 pb-12">
          <EmptyState
            icon={<ClipboardList className="h-16 w-16 text-slate-300" />}
            title="Заданий нет"
            description={
              tab === 'all'
                ? 'Вы ещё не создавали заданий. Опишите задачу — исполнители откликнутся!'
                : 'Заданий в этой категории пока нет.'
            }
            action={
              tab === 'all' ? (
                <Button asChild className="rounded-xl font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 h-11 px-6">
                  <Link href="/tasks/create">Создать задание</Link>
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all p-6 sm:p-8 relative overflow-hidden group">
              {/* Accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex flex-col">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="rounded-xl px-3 py-1 bg-slate-100 text-slate-700 font-bold border-none">
                      {task.category.name}
                    </Badge>
                    <TaskStatusBadge status={task.status} />
                  </div>
                  <span className="text-sm font-medium text-slate-400">
                    {formatDistanceToNow(new Date(task.createdAt), {
                      addSuffix: true,
                      locale: ru,
                    })}
                  </span>
                </div>

                <Link
                  href={`/task/${task.id}`}
                  className="font-extrabold text-xl text-slate-900 hover:text-blue-600 transition-colors mb-3"
                >
                  {task.title}
                </Link>

                <p className="text-base text-slate-600 leading-relaxed line-clamp-2 mb-5">
                  {task.description}
                </p>

                <div className="flex items-center justify-between pt-5 border-t border-slate-100 flex-wrap gap-4">
                  <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
                    <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-lg">
                      {formatBudget(task.budget)}
                    </span>
                    <Link
                      href={`/task/${task.id}#responses`}
                      className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors bg-slate-50 px-3 py-1 rounded-lg"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {task._count.responses}{' '}
                      {task._count.responses === 1
                        ? 'отклик'
                        : task._count.responses >= 2 && task._count.responses <= 4
                          ? 'отклика'
                          : 'откликов'}
                    </Link>
                  </div>

                  <div className="sm:ml-auto">
                    <TaskStatusActions taskId={task.id} currentStatus={task.status} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

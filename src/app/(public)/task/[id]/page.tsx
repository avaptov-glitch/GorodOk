export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { TaskStatusBadge } from '@/components/task/task-status-badge'
import { TaskResponsesList } from '@/components/task/task-responses-list'
import { TaskResponseForm } from '@/components/task/task-response-form'
import { ChevronRight, MapPin, Calendar, Wallet } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ru } from 'date-fns/locale'

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const params = await paramsPromise
  const task = await prisma.task.findUnique({
    where: { id: params.id },
    select: { title: true, description: true },
  })
  if (!task) return {}
  return {
    title: task.title,
    description: task.description.length > 160 ? `${task.description.slice(0, 160)}...` : task.description,
  }
}

function formatBudget(budgetKopecks: number | null): string {
  if (!budgetKopecks) return 'По договорённости'
  return `${Math.floor(budgetKopecks / 100).toLocaleString('ru-RU')} ₽`
}

export default async function TaskPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>
}) {
  const params = await paramsPromise
  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      client: { select: { id: true, name: true, avatarUrl: true } },
      category: { select: { name: true, slug: true } },
      responses: {
        include: {
          executor: {
            select: {
              id: true,
              isVerified: true,
              isPro: true,
              ratingAvg: true,
              reviewsCount: true,
              user: { select: { name: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!task) notFound()

  const session = await getServerSession(authOptions)
  const isOwner = task.client.id === session?.user?.id

  // Проверяем, является ли текущий пользователь исполнителем и может ли откликнуться
  let canRespond = false
  let alreadyResponded = false
  if (session?.user?.id && !isOwner && task.status === 'ACTIVE') {
    const executorProfile = await prisma.executorProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (executorProfile) {
      canRespond = true
      alreadyResponded = task.responses.some(
        (r) => r.executor.id === executorProfile.id
      )
    }
  }

  const clientInitials = task.client.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-foreground transition-colors">
          Главная
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link href="/tasks" className="hover:text-foreground transition-colors">
          Задания
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="text-foreground font-medium line-clamp-1">{task.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task details */}
          <Card>
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="secondary">{task.category.name}</Badge>
                    <TaskStatusBadge status={task.status} />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">{task.title}</h1>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 shrink-0" />
                  <span className="font-semibold text-foreground">
                    {formatBudget(task.budget)}
                  </span>
                </span>
                {task.district && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {task.district}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 shrink-0" />
                  {format(new Date(task.createdAt), 'd MMMM yyyy', { locale: ru })}
                </span>
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground whitespace-pre-line">{task.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Responses */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Отклики ({task.responses.length})
            </h2>

            {/* Response form for executors */}
            {canRespond && !alreadyResponded && (
              <div className="mb-4">
                <TaskResponseForm taskId={task.id} taskTitle={task.title} />
              </div>
            )}
            {canRespond && alreadyResponded && (
              <p className="text-sm text-muted-foreground bg-muted rounded-md px-3 py-2 mb-4">
                Вы уже откликнулись на это задание
              </p>
            )}

            <TaskResponsesList
              responses={task.responses}
              isOwner={isOwner}
              taskId={task.id}
              taskStatus={task.status}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Client card */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Заказчик</h3>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={task.client.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {clientInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{task.client.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(task.createdAt), {
                      addSuffix: true,
                      locale: ru,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task info card */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Информация</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Статус</span>
                  <TaskStatusBadge status={task.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Бюджет</span>
                  <span className="font-medium">{formatBudget(task.budget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Откликов</span>
                  <span className="font-medium">{task.responses.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Категория</span>
                  <Link
                    href={`/category/${task.category.slug}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {task.category.name}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

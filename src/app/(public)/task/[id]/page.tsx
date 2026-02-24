export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Premium Hero Header */}
      <div className="bg-white border-b border-slate-200/60 pt-8 pb-10 mb-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-6 flex-wrap">
            <Link href="/" className="hover:text-blue-600 transition-colors">Главная</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <Link href="/tasks" className="hover:text-blue-600 transition-colors">Задания</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="text-slate-900 font-bold line-clamp-1">{task.title}</span>
          </nav>

          <div className="mt-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant="secondary" className="rounded-xl px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">
                  {task.category.name}
                </Badge>
                <TaskStatusBadge status={task.status} />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                {task.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-slate-600 font-medium">
                <span className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-xl">
                  <Wallet className="h-4 w-4" />
                  {formatBudget(task.budget)}
                </span>
                {task.district && (
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                    {task.district}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                  {format(new Date(task.createdAt), 'd MMMM yyyy', { locale: ru })}
                </span>
              </div>
            </div>

            {/* Actions for Executor */}
            {canRespond && !alreadyResponded && (
              <div className="shrink-0 pt-2">
                <Button asChild className="h-12 md:h-14 px-8 rounded-2xl text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all">
                  <a href="#responses">Оставить отклик</a>
                </Button>
              </div>
            )}
            {canRespond && alreadyResponded && (
              <div className="shrink-0 pt-2">
                <Badge variant="outline" className="h-12 px-6 rounded-2xl font-bold border-green-200 bg-green-50 text-green-700 text-base inline-flex items-center">
                  Вы откликнулись
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-4 pb-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Description Card */}
            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Описание задания</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 whitespace-pre-line leading-relaxed text-base">{task.description}</p>
              </div>
            </div>

            {/* Responses Section */}
            <div id="responses" className="scroll-mt-8 space-y-6">
              <div className="flex items-center gap-3 px-2">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Отклики
                </h2>
                <Badge variant="secondary" className="rounded-full px-3 py-0.5 bg-slate-200 text-slate-700 text-sm font-bold flex items-center justify-center">
                  {task.responses.length}
                </Badge>
              </div>

              {/* Response form for executors */}
              {canRespond && !alreadyResponded && (
                <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm p-6 sm:p-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Оставить отклик</h3>
                  <TaskResponseForm taskId={task.id} taskTitle={task.title} />
                </div>
              )}

              {/* Submissions/Responses list */}
              {task.responses.length > 0 ? (
                <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm p-6 sm:p-8">
                  <TaskResponsesList
                    responses={task.responses}
                    isOwner={isOwner}
                    taskId={task.id}
                    taskStatus={task.status}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm p-12 text-center">
                  <p className="text-slate-500 font-medium">Пока нет ни одного отклика. Станьте первым!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-6">
            {/* Client Card */}
            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white" />
              <div className="relative pt-4">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 ring-4 ring-white shadow-xl mb-4">
                    <AvatarImage src={task.client.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 text-2xl font-bold">
                      {clientInitials}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-extrabold text-xl text-slate-900">{task.client.name}</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Заказчик</p>

                  <div className="w-full h-px bg-slate-100 my-6" />

                  <p className="text-sm text-slate-500 font-medium px-4">
                    Зарегистрирован(а) {formatDistanceToNow(new Date(task.createdAt), {
                      addSuffix: true,
                      locale: ru,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Task Info Card */}
            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm p-6 lg:sticky lg:top-6">
              <h3 className="font-bold text-lg text-slate-900 mb-5">Информация</h3>
              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <span className="text-slate-500">Статус</span>
                  <TaskStatusBadge status={task.status} />
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <span className="text-slate-500">Бюджет</span>
                  <span className="text-slate-900">{formatBudget(task.budget)}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <span className="text-slate-500">Откликов</span>
                  <span className="text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">{task.responses.length}</span>
                </div>
                <div className="flex flex-col gap-2 pt-1 border-slate-100 last:border-0">
                  <span className="text-slate-500">Категория</span>
                  <Link
                    href={`/category/${task.category.slug}`}
                    className="text-blue-600 hover:text-blue-700 font-bold transition-colors"
                  >
                    {task.category.name}
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

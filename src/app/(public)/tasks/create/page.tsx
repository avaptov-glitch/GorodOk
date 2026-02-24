export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import type { Metadata } from 'next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TaskCreateForm } from '@/components/task/task-create-form'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Создать задание',
  description: 'Опишите задачу, и исполнители откликнутся',
}

export default async function CreateTaskPage({
  searchParams,
}: {
  searchParams: { title?: string; categoryId?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/tasks/create')
  }

  // Проверяем роль
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (user?.role !== 'CLIENT') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <h1 className="text-2xl font-bold">Создание заданий доступно только клиентам</h1>
          <p className="text-muted-foreground">
            Зарегистрируйтесь как клиент, чтобы размещать задания для исполнителей.
          </p>
          <Button asChild>
            <Link href="/tasks">Вернуться к заданиям</Link>
          </Button>
        </div>
      </div>
    )
  }

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { order: 'asc' },
        select: { id: true, name: true },
      },
    },
    orderBy: { order: 'asc' },
  })

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Premium Hero Header */}
      <div className="bg-white border-b border-slate-200/60 pt-8 pb-10 mb-8">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-6">
            <Link href="/" className="hover:text-blue-600 transition-colors">Главная</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <Link href="/tasks" className="hover:text-blue-600 transition-colors">Задания</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="text-slate-900 font-bold">Создать задание</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Опишите вашу задачу
          </h1>
          <p className="text-lg text-slate-600">
            Подробное описание поможет быстрее найти подходящего специалиста.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-2xl py-4 pb-16">
        <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm p-6 sm:p-8">
          <TaskCreateForm
            categories={categories}
            defaultTitle={searchParams.title}
            defaultCategoryId={searchParams.categoryId}
          />
        </div>
      </div>
    </div>
  )
}

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

export default async function CreateTaskPage() {
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
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">
          Главная
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link href="/tasks" className="hover:text-foreground transition-colors">
          Задания
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="text-foreground font-medium">Создать задание</span>
      </nav>

      <div className="max-w-2xl mx-auto">
        <TaskCreateForm categories={categories} />
      </div>
    </div>
  )
}

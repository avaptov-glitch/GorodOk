import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ServicesManager } from '@/components/executor/services-manager'

export const metadata: Metadata = { title: 'Мои услуги' }

export default async function ExecutorServicesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'EXECUTOR') {
    redirect('/dashboard')
  }

  const profile = await prisma.executorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      services: {
        include: { category: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  const categories = await prisma.category.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  })

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">Мои услуги</h1>
      <p className="text-muted-foreground mb-8">
        Добавьте услуги с ценами — клиенты увидят их на вашей странице профиля.
      </p>

      {!profile ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium">Анкета ещё не заполнена</p>
          <p className="text-sm text-muted-foreground mt-1">
            Сначала заполните{' '}
            <a href="/dashboard/executor/profile" className="text-primary hover:underline">
              анкету исполнителя
            </a>
          </p>
        </div>
      ) : (
        <ServicesManager services={profile.services} categories={categories} />
      )}
    </div>
  )
}

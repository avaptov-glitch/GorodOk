import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Eye, FileText, Star, TrendingUp, CheckCircle, Clock } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Статистика' }

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ElementType
  description?: string
  accent?: boolean
}

function StatCard({ title, value, icon: Icon, description, accent }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p
              className={`text-3xl font-bold mt-1 ${
                accent ? 'text-primary' : 'text-foreground'
              }`}
            >
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
              accent ? 'bg-primary/10' : 'bg-muted'
            }`}
          >
            <Icon className={`h-5 w-5 ${accent ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function ExecutorStatsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'EXECUTOR') {
    redirect('/dashboard')
  }

  const profile = await prisma.executorProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      viewsCount: true,
      reviewsCount: true,
      ratingAvg: true,
    },
  })

  if (!profile) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground mb-2">Статистика</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl">
          <TrendingUp className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium">Анкета ещё не заполнена</p>
          <p className="text-sm text-muted-foreground mt-1">
            Статистика появится после публикации анкеты
          </p>
        </div>
      </div>
    )
  }

  // Считаем заявки по статусам
  const [totalOrders, activeOrders, completedOrders] = await Promise.all([
    prisma.order.count({ where: { executorId: profile.id } }),
    prisma.order.count({
      where: {
        executorId: profile.id,
        status: { in: ['NEW', 'DISCUSSION', 'ACCEPTED', 'IN_PROGRESS'] },
      },
    }),
    prisma.order.count({
      where: { executorId: profile.id, status: 'COMPLETED' },
    }),
  ])

  const conversionRate =
    totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0

  const ratingDisplay =
    profile.ratingAvg > 0 ? profile.ratingAvg.toFixed(1) : '—'

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">Статистика</h1>
      <p className="text-muted-foreground mb-8">
        Данные о вашей активности на платформе.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          title="Просмотры профиля"
          value={profile.viewsCount}
          icon={Eye}
          description="за всё время"
          accent
        />
        <StatCard
          title="Всего заявок"
          value={totalOrders}
          icon={FileText}
          description="получено"
        />
        <StatCard
          title="Активных заявок"
          value={activeOrders}
          icon={Clock}
          description="в работе сейчас"
          accent={activeOrders > 0}
        />
        <StatCard
          title="Выполнено заказов"
          value={completedOrders}
          icon={CheckCircle}
          description="успешно завершены"
        />
        <StatCard
          title="Конверсия"
          value={`${conversionRate}%`}
          icon={TrendingUp}
          description="заявок → выполнено"
        />
        <StatCard
          title="Рейтинг"
          value={ratingDisplay}
          icon={Star}
          description={`${profile.reviewsCount} отзывов`}
          accent={profile.ratingAvg >= 4.5}
        />
      </div>
    </div>
  )
}

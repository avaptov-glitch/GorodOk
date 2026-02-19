export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ScheduleEditor } from '@/components/executor/schedule-editor'

export const metadata: Metadata = { title: 'Расписание' }

// Дни недели в порядке Пн–Вс (0 = Воскресенье в БД)
const DEFAULT_SCHEDULE = [1, 2, 3, 4, 5, 6, 0].map((day) => ({
  dayOfWeek: day,
  startTime: '09:00',
  endTime: '18:00',
  isAvailable: day !== 0, // по умолчанию пн–сб доступны, вс — нет
}))

export default async function ExecutorSchedulePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'EXECUTOR') {
    redirect('/dashboard')
  }

  const profile = await prisma.executorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      schedule: { orderBy: { dayOfWeek: 'asc' } },
    },
  })

  // Если расписание ещё не задано — используем дефолтное
  const scheduleByDay = new Map(profile?.schedule.map((s) => [s.dayOfWeek, s]) ?? [])

  const schedule = [1, 2, 3, 4, 5, 6, 0].map((day) => {
    const existing = scheduleByDay.get(day)
    return existing
      ? {
          dayOfWeek: existing.dayOfWeek,
          startTime: existing.startTime,
          endTime: existing.endTime,
          isAvailable: existing.isAvailable,
        }
      : DEFAULT_SCHEDULE.find((d) => d.dayOfWeek === day)!
  })

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">Расписание</h1>
      <p className="text-muted-foreground mb-8">
        Укажите в какие дни и часы вы доступны для клиентов.
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
        <ScheduleEditor schedule={schedule} />
      )}
    </div>
  )
}

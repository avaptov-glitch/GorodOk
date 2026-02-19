import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProfileForm } from '@/components/executor/profile-form'

export const metadata: Metadata = { title: 'Моя анкета' }

export default async function ExecutorProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'EXECUTOR') {
    redirect('/dashboard')
  }

  const [profile, categories] = await Promise.all([
    prisma.executorProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        categories: { select: { categoryId: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    }),
  ])

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">Моя анкета</h1>
      <p className="text-muted-foreground mb-8">
        Заполните анкету, чтобы клиенты могли вас найти в каталоге.
      </p>

      {/* Статус модерации */}
      {profile?.moderationStatus === 'REJECTED' && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Анкета отклонена модератором</p>
              {profile.rejectionReason && (
                <p className="text-sm text-muted-foreground mt-1">{profile.rejectionReason}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Исправьте замечания и сохраните анкету для повторной проверки.
              </p>
            </div>
          </div>
        </div>
      )}
      {profile?.moderationStatus === 'PENDING' && (
        <div className="mb-6 rounded-lg border border-amber-500/50 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-700">Анкета на проверке</p>
              <p className="text-sm text-muted-foreground mt-1">
                Модерация обычно занимает до 2 суток. Анкета появится в каталоге после одобрения.
              </p>
            </div>
          </div>
        </div>
      )}
      {profile?.moderationStatus === 'APPROVED' && (
        <div className="mb-6 rounded-lg border border-green-500/50 bg-green-500/5 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <p className="font-semibold text-green-700">Анкета одобрена и опубликована</p>
          </div>
        </div>
      )}

      <ProfileForm profile={profile} categories={categories} />
    </div>
  )
}

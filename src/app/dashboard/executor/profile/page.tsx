export const dynamic = 'force-dynamic'

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
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Моя анкета</h1>
        <p className="text-slate-500 mt-1 font-medium">Заполните анкету, чтобы клиенты могли вас найти в каталоге.</p>
      </div>

      {/* Статус модерации */}
      <div className="space-y-4">
        {profile?.moderationStatus === 'REJECTED' && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-2 rounded-xl shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-extrabold text-red-700">Анкета отклонена модератором</p>
                {profile.rejectionReason && (
                  <p className="text-sm font-medium text-red-600/80 mt-1">{profile.rejectionReason}</p>
                )}
                <p className="text-sm text-red-600/70 mt-1">
                  Исправьте замечания и сохраните анкету для повторной проверки.
                </p>
              </div>
            </div>
          </div>
        )}
        {profile?.moderationStatus === 'PENDING' && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 p-2 rounded-xl shrink-0">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-extrabold text-amber-700">Анкета на проверке</p>
                <p className="text-sm font-medium text-amber-600/80 mt-1">
                  Модерация обычно занимает до 2 суток. Анкета появится в каталоге после одобрения.
                </p>
              </div>
            </div>
          </div>
        )}
        {profile?.moderationStatus === 'APPROVED' && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-2 rounded-xl shrink-0">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="font-extrabold text-emerald-700">Анкета одобрена и опубликована</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm p-6 sm:p-8">
        <ProfileForm profile={profile} categories={categories} />
      </div>
    </div>
  )
}

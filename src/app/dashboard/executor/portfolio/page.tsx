export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PortfolioManager } from '@/components/executor/portfolio-manager'

export const metadata: Metadata = { title: 'Портфолио' }

export default async function ExecutorPortfolioPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'EXECUTOR') {
    redirect('/dashboard')
  }

  const profile = await prisma.executorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      portfolio: { orderBy: { order: 'asc' } },
      certificates: { orderBy: { createdAt: 'asc' } },
    },
  })

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">Портфолио</h1>
      <p className="text-muted-foreground mb-8">
        Загрузите фотографии работ и документы об образовании или сертификаты.
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
        <PortfolioManager
          portfolio={profile.portfolio}
          certificates={profile.certificates}
        />
      )}
    </div>
  )
}

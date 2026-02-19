import type { Metadata } from 'next'
import { getProfilesForModeration } from '@/actions/admin'
import { ModerationList } from '@/components/admin/moderation-list'

export const metadata: Metadata = { title: 'Модерация анкет | ГородОк' }

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const status = params.status || 'PENDING'
  const profiles = await getProfilesForModeration(status)

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">Модерация анкет</h1>
      <p className="text-muted-foreground mb-6">
        Проверка и одобрение профилей исполнителей.
      </p>

      <ModerationList profiles={profiles} currentStatus={status} />
    </div>
  )
}

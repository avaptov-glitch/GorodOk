import type { Metadata } from 'next'
import { getUsers } from '@/actions/admin'
import { UsersTable } from '@/components/admin/users-table'

export const metadata: Metadata = { title: 'Пользователи | ГородОк' }

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; search?: string; page?: string }>
}) {
  const params = await searchParams
  const role = params.role || 'ALL'
  const search = params.search || ''
  const page = parseInt(params.page || '1')

  const data = await getUsers({ role, search, page, perPage: 20 })

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">Пользователи</h1>
      <p className="text-muted-foreground mb-6">
        Управление пользователями платформы.
      </p>

      <UsersTable
        users={data.users}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
        currentRole={role}
        currentSearch={search}
      />
    </div>
  )
}

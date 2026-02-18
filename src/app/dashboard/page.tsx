import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

// Редирект на кабинет в зависимости от роли пользователя
export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  if (session.user.role === 'ADMIN') {
    redirect('/admin')
  }

  if (session.user.role === 'EXECUTOR') {
    redirect('/dashboard/executor/profile')
  }

  redirect('/dashboard/client/orders')
}

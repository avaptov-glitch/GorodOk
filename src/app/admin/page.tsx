import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { LayoutDashboard } from 'lucide-react'

export const metadata: Metadata = { title: 'Администрирование | ГородОк' }

// Заглушка — полная реализация в Этапе 12 (Админ-панель)
export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-6 py-3 border-b border-border bg-card">
            <Breadcrumbs />
          </div>
          <main className="flex-1 p-6 bg-background">
            <div className="max-w-4xl">
              <h1 className="text-2xl font-bold text-foreground mb-2">Панель администратора</h1>
              <p className="text-muted-foreground mb-8">
                Управление пользователями, категориями и модерация контента.
              </p>
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl">
                <LayoutDashboard className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">Дашборд администратора</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Полная функциональность появится в Этапе 12
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

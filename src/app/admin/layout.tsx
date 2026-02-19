import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

export const metadata: Metadata = {
  title: {
    template: '%s | Админ — ГородОк',
    default: 'Администрирование — ГородОк',
  },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

export const metadata: Metadata = {
  title: {
    template: '%s | Кабинет — ГородОк',
    default: 'Личный кабинет — ГородОк',
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Хлебные крошки */}
          <div className="px-6 py-3 border-b border-border bg-card">
            <Breadcrumbs />
          </div>
          <main className="flex-1 p-6 bg-background">{children}</main>
        </div>
      </div>
    </div>
  )
}

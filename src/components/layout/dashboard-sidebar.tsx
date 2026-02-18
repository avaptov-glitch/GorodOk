'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  FileText,
  ClipboardList,
  Heart,
  Settings,
  User,
  Briefcase,
  GalleryHorizontal,
  TrendingUp,
  Calendar,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  Users,
  Tag,
  AlertTriangle,
  LayoutDashboard,
} from 'lucide-react'

type MenuItem = {
  href: string
  label: string
  icon: React.ElementType
}

const clientMenuItems: MenuItem[] = [
  { href: '/dashboard/client/orders', label: 'Мои заявки', icon: FileText },
  { href: '/dashboard/client/tasks', label: 'Мои задания', icon: ClipboardList },
  { href: '/dashboard/client/favorites', label: 'Избранное', icon: Heart },
  { href: '/dashboard/chat', label: 'Чат', icon: MessageSquare },
  { href: '/dashboard/client/settings', label: 'Настройки', icon: Settings },
]

const executorMenuItems: MenuItem[] = [
  { href: '/dashboard/executor/profile', label: 'Моя анкета', icon: User },
  { href: '/dashboard/executor/services', label: 'Мои услуги', icon: Briefcase },
  { href: '/dashboard/executor/portfolio', label: 'Портфолио', icon: GalleryHorizontal },
  { href: '/dashboard/executor/orders', label: 'Входящие заявки', icon: FileText },
  { href: '/dashboard/executor/tasks', label: 'Доска заданий', icon: ClipboardList },
  { href: '/dashboard/executor/stats', label: 'Статистика', icon: TrendingUp },
  { href: '/dashboard/executor/schedule', label: 'Расписание', icon: Calendar },
  { href: '/dashboard/executor/subscription', label: 'Подписка', icon: CreditCard },
  { href: '/dashboard/chat', label: 'Чат', icon: MessageSquare },
]

const adminMenuItems: MenuItem[] = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
  { href: '/admin/categories', label: 'Категории', icon: Tag },
  { href: '/admin/moderation', label: 'Модерация анкет', icon: ShieldCheck },
  { href: '/admin/reports', label: 'Жалобы и споры', icon: AlertTriangle },
]

const roleLabels: Record<string, string> = {
  ADMIN: 'Администратор',
  EXECUTOR: 'Исполнитель',
  CLIENT: 'Клиент',
}

export function DashboardSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) return null

  const role = session.user.role
  const menuItems =
    role === 'ADMIN' ? adminMenuItems : role === 'EXECUTOR' ? executorMenuItems : clientMenuItems

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-[calc(100vh-4rem)] border-r border-border bg-card shrink-0">
      {/* Информация о пользователе */}
      <div className="p-4 border-b">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {roleLabels[role] ?? role}
        </p>
        <p className="text-sm font-semibold text-foreground truncate mt-0.5">
          {session.user.name}
        </p>
      </div>

      {/* Навигация */}
      <nav className="flex-1 p-3 space-y-0.5">
        {menuItems.map(({ href, label, icon: Icon }) => {
          // Считаем ссылку активной если путь совпадает или начинается с href
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

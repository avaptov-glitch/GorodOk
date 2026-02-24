'use client'

import { useState, useEffect } from 'react'
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
  const [unreadChatCount, setUnreadChatCount] = useState(0)

  // Polling непрочитанных сообщений каждые 10 секунд
  useEffect(() => {
    if (!session?.user?.id) return

    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/chat/unread')
        const data = await res.json()
        if (typeof data.count === 'number') {
          setUnreadChatCount(data.count)
        }
      } catch {
        // ignore
      }
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, 10000)
    return () => clearInterval(interval)
  }, [session?.user?.id])

  if (!session) return null

  const role = session.user.role
  const menuItems =
    role === 'ADMIN' ? adminMenuItems : role === 'EXECUTOR' ? executorMenuItems : clientMenuItems

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-[calc(100vh-4rem)] border-r border-slate-200/60 bg-white shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] shrink-0 z-10">
      {/* Информация о пользователе */}
      <div className="p-6 border-b border-slate-100">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
          {roleLabels[role] ?? role}
        </p>
        <p className="text-base font-extrabold text-slate-900 truncate">
          {session.user.name}
        </p>
      </div>

      {/* Навигация */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map(({ href, label, icon: Icon }) => {
          // Считаем ссылку активной если путь совпадает или начинается с href
          const isActive = pathname === href || pathname.startsWith(href + '/')
          const isChatLink = href === '/dashboard/chat'

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200',
                isActive
                  ? 'bg-blue-50/80 text-blue-700 shadow-sm shadow-blue-100/50'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-blue-600' : 'text-slate-400')} />
              <span className="flex-1">{label}</span>
              {isChatLink && unreadChatCount > 0 && (
                <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-rose-500 text-white text-[11px] font-extrabold px-1.5 shadow-sm shadow-rose-500/20">
                  {unreadChatCount > 99 ? '99+' : unreadChatCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

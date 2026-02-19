import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Users,
  ShieldCheck,
  Tag,
  AlertTriangle,
  FileText,
  ClipboardList,
  Star,
  TrendingUp,
  UserPlus,
  ShoppingBag,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAdminStats } from '@/actions/admin'

export const metadata: Metadata = { title: 'Администрирование | ГородОк' }

const statCards: {
  key: keyof Awaited<ReturnType<typeof getAdminStats>>
  label: string
  icon: React.ElementType
  color: string
  alert?: boolean
}[] = [
  { key: 'totalUsers', label: 'Пользователей', icon: Users, color: 'text-blue-600' },
  { key: 'totalExecutors', label: 'Исполнителей', icon: Users, color: 'text-green-600' },
  { key: 'totalClients', label: 'Клиентов', icon: Users, color: 'text-cyan-600' },
  { key: 'pendingModeration', label: 'На модерации', icon: ShieldCheck, color: 'text-amber-600', alert: true },
  { key: 'totalOrders', label: 'Всего заявок', icon: FileText, color: 'text-violet-600' },
  { key: 'activeOrders', label: 'Активных заявок', icon: ShoppingBag, color: 'text-indigo-600' },
  { key: 'totalTasks', label: 'Заданий', icon: ClipboardList, color: 'text-orange-600' },
  { key: 'activeTasks', label: 'Активных заданий', icon: ClipboardList, color: 'text-teal-600' },
  { key: 'totalReviews', label: 'Отзывов', icon: Star, color: 'text-yellow-600' },
  { key: 'totalCategories', label: 'Категорий', icon: Tag, color: 'text-pink-600' },
  { key: 'newUsersWeek', label: 'Новых за неделю', icon: UserPlus, color: 'text-emerald-600' },
  { key: 'newOrdersWeek', label: 'Заявок за неделю', icon: TrendingUp, color: 'text-sky-600' },
]

const quickLinks = [
  { href: '/admin/moderation', label: 'Модерация анкет', icon: ShieldCheck, description: 'Проверка и одобрение профилей исполнителей' },
  { href: '/admin/categories', label: 'Категории', icon: Tag, description: 'Управление категориями и подкатегориями услуг' },
  { href: '/admin/users', label: 'Пользователи', icon: Users, description: 'Управление пользователями, блокировка, роли' },
  { href: '/admin/reports', label: 'Жалобы и споры', icon: AlertTriangle, description: 'Модерация отзывов и разрешение споров' },
]

export default async function AdminPage() {
  const stats = await getAdminStats()

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">Панель администратора</h1>
      <p className="text-muted-foreground mb-6">
        Обзор платформы и быстрый доступ к управлению.
      </p>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ key, label, icon: Icon, color, alert }) => {
          const value = stats[key]
          return (
            <Card key={key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                  </div>
                  <div className="relative">
                    <Icon className={`h-8 w-8 ${color} opacity-80`} />
                    {alert && value > 0 && (
                      <Badge variant="destructive" className="absolute -top-2 -right-3 text-[10px] px-1.5 py-0">
                        {value}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Быстрые ссылки */}
      <h2 className="text-lg font-semibold mb-4">Управление</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickLinks.map(({ href, label, icon: Icon, description }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-base">
                  <Icon className="h-5 w-5 text-primary" />
                  {label}
                  {href === '/admin/moderation' && stats.pendingModeration > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {stats.pendingModeration}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

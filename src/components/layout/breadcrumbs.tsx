'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

// Карта сегментов URL → читаемые русские названия
const segmentLabels: Record<string, string> = {
  dashboard: 'Личный кабинет',
  client: 'Клиент',
  executor: 'Исполнитель',
  admin: 'Администрирование',
  orders: 'Заявки',
  tasks: 'Задания',
  favorites: 'Избранное',
  settings: 'Настройки',
  profile: 'Анкета',
  services: 'Услуги',
  portfolio: 'Портфолио',
  stats: 'Статистика',
  schedule: 'Расписание',
  subscription: 'Подписка',
  chat: 'Чат',
  categories: 'Категории',
  category: 'Категория',
  users: 'Пользователи',
  moderation: 'Модерация',
  reports: 'Жалобы',
  login: 'Вход',
  register: 'Регистрация',
  search: 'Поиск',
}

export function Breadcrumbs() {
  const pathname = usePathname()

  if (pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)

  const crumbs = segments.map((segment, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/')
    const label = segmentLabels[segment] ?? segment
    const isLast = idx === segments.length - 1
    return { href, label, isLast }
  })

  return (
    <nav aria-label="Навигационная цепочка" className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
        aria-label="Главная"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {crumbs.map(({ href, label, isLast }) => (
        <span key={href} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-border shrink-0" />
          {isLast ? (
            <span className="text-foreground font-medium">{label}</span>
          ) : (
            <Link
              href={href}
              className="hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}

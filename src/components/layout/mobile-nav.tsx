'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  Menu,
  Search,
  Home,
  Grid3X3,
  ClipboardList,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
} from 'lucide-react'

interface MobileNavProps {
  session: Session | null
}

const navLinks = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/categories', label: 'Категории', icon: Grid3X3 },
  { href: '/tasks', label: 'Задания', icon: ClipboardList },
]

export function MobileNav({ session }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const dashboardHref = session
    ? session.user.role === 'ADMIN'
      ? '/admin'
      : session.user.role === 'EXECUTOR'
        ? '/dashboard/executor/profile'
        : '/dashboard/client/orders'
    : '/login'

  const initials =
    session?.user.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? ''

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Открыть меню"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 flex flex-col p-0">
        {/* Шапка */}
        <div className="flex items-center gap-2 p-4 border-b">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm leading-none">Г</span>
          </div>
          <span className="font-bold text-xl">ГородОк</span>
        </div>

        {/* Поиск */}
        <div className="p-4 border-b">
          <form action="/search" method="get" className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input name="q" placeholder="Найти мастера..." className="pl-9" />
          </form>
        </div>

        {/* Навигационные ссылки */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <Separator />

        {/* Секция авторизации */}
        <div className="p-4">
          {session ? (
            <div className="space-y-3">
              {/* Информация о пользователе */}
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={session.user.image ?? undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>

              {/* Ссылка на кабинет */}
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                asChild
              >
                <Link href={dashboardHref} onClick={() => setOpen(false)}>
                  <LayoutDashboard className="h-4 w-4" />
                  Личный кабинет
                </Link>
              </Button>

              {/* Выход */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setOpen(false)
                  signOut({ callbackUrl: '/' })
                }}
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button variant="outline" className="w-full gap-2" asChild>
                <Link href="/login" onClick={() => setOpen(false)}>
                  <LogIn className="h-4 w-4" />
                  Войти
                </Link>
              </Button>
              <Button className="w-full gap-2" asChild>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <UserPlus className="h-4 w-4" />
                  Регистрация
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

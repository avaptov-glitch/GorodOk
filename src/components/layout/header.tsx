import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { UserNav } from './user-nav'
import { MobileNav } from './mobile-nav'
import { NotificationsBell } from './notifications-bell'
import type { NotificationItem } from './notifications-bell'

export async function Header() {
  const session = await getServerSession(authOptions)

  // Получаем уведомления для авторизованного пользователя
  let notifications: NotificationItem[] = []
  let unreadCount = 0

  if (session?.user?.id) {
    try {
      const [raw, totalUnread] = await Promise.all([
        prisma.notification.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        prisma.notification.count({
          where: { userId: session.user.id, isRead: false },
        }),
      ])
      notifications = raw.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        link: n.link,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
        type: n.type,
      }))
      unreadCount = totalUnread
    } catch (error) {
      console.error('Failed to fetch notifications in Header:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto max-w-[1360px] flex h-[80px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">

        {/* Логотип (Premium Version) */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-[0.8rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_4px_15px_rgba(37,99,235,0.3)] group-hover:scale-105 group-hover:shadow-[0_8px_25px_rgba(37,99,235,0.4)] transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-white font-black text-xl leading-none relative z-10 font-sans tracking-tight">Г</span>
          </div>
          <span className="font-extrabold text-[1.4rem] text-slate-900 tracking-[-0.03em] hidden sm:block">
            ГородОк<span className="text-blue-600">.</span>
          </span>
        </Link>

        {/* Поиск — только десктоп (Pill Shape) */}
        <form action="/search" method="get" className="hidden lg:flex flex-1 max-w-[480px] relative group/search">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-md opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/search:text-blue-600 transition-colors" />
          <Input
            name="q"
            type="search"
            placeholder="Что нужно сделать?"
            className="pl-11 h-11 bg-slate-100/50 hover:bg-slate-100 focus:bg-white text-base font-medium rounded-full border border-slate-200/60 focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 placeholder:text-slate-400 placeholder:font-normal shadow-sm"
          />
        </form>

        {/* Авторизация + уведомления + мобильное меню */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">

          {/* Ссылки (Desktop Only) */}
          <nav className="hidden lg:flex items-center gap-1 mr-2">
            <Button variant="ghost" asChild className="text-[15px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full h-10 px-5 transition-all">
              <Link href="/categories">Все услуги</Link>
            </Button>
            <Button variant="ghost" asChild className="text-[15px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full h-10 px-5 transition-all">
              <Link href="/tasks">Задания</Link>
            </Button>
          </nav>

          <div className="w-px h-6 bg-slate-200 hidden lg:block mx-1"></div>

          {session ? (
            <>
              <div className="hidden sm:block">
                <NotificationsBell notifications={notifications} unreadCount={unreadCount} />
              </div>
              <UserNav user={session.user} />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex text-[15px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full h-10 px-6 transition-all">
                <Link href="/login">Войти</Link>
              </Button>
              <Button asChild className="text-[15px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-full h-10 px-6 shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition-all">
                <Link href="/register">Регистрация</Link>
              </Button>
            </>
          )}

          <div className="lg:hidden ml-1">
            <MobileNav session={session} />
          </div>
        </div>

      </div>
    </header>
  )
}

import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { UserNav } from './user-nav'
import { MobileNav } from './mobile-nav'

export async function Header() {
  const session = await getServerSession(authOptions)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
      <div className="container mx-auto flex h-[72px] items-center justify-between gap-6 px-6">

        {/* Логотип */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-base leading-none">Г</span>
          </div>
          <span className="font-bold text-2xl text-foreground hidden sm:block tracking-tight">
            ГородОк
          </span>
        </Link>

        {/* Поиск — только десктоп */}
        <form action="/search" method="get" className="hidden md:flex flex-1 max-w-lg relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            name="q"
            type="search"
            placeholder="Найти мастера или услугу..."
            className="pl-10 h-10 bg-background text-base"
          />
        </form>

        {/* Навигация — только десктоп */}
        <nav className="hidden lg:flex items-center gap-0.5">
          <Button variant="ghost" asChild className="text-base font-medium px-4">
            <Link href="/categories">Категории</Link>
          </Button>
          <Button variant="ghost" asChild className="text-base font-medium px-4">
            <Link href="/tasks">Задания</Link>
          </Button>
        </nav>

        {/* Авторизация + мобильное меню */}
        <div className="flex items-center gap-3">
          {session ? (
            <UserNav user={session.user} />
          ) : (
            <>
              <Button variant="outline" asChild className="hidden sm:inline-flex text-base">
                <Link href="/login">Войти</Link>
              </Button>
              <Button asChild className="text-base">
                <Link href="/register">Регистрация</Link>
              </Button>
            </>
          )}
          <MobileNav session={session} />
        </div>

      </div>
    </header>
  )
}

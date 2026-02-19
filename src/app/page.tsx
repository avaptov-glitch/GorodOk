import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Search, Star, CheckCircle, ArrowRight, MessageSquare,
  GraduationCap, Dumbbell, Hammer, Car, Monitor, Sparkles, Home,
  Scale, PartyPopper, PawPrint, Briefcase,
  type LucideProps,
} from 'lucide-react'
import { type ComponentType } from 'react'
import { JsonLd } from '@/components/seo/json-ld'

export const metadata: Metadata = {
  title: 'ГородОк — найди исполнителя рядом',
  description:
    'Маркетплейс услуг в Вологде: репетиторы, сантехники, тренеры, мастера по ремонту и сотни других специалистов. Быстро найдите проверенного исполнителя рядом.',
  openGraph: {
    title: 'ГородОк — найди исполнителя рядом',
    description:
      'Маркетплейс услуг в Вологде: репетиторы, сантехники, тренеры и другие специалисты — быстро и удобно.',
  },
}

const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  GraduationCap, Dumbbell, Hammer, Car, Monitor, Sparkles, Home,
  Scale, PartyPopper, PawPrint,
}

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Briefcase
  return <Icon className={className} />
}

const POPULAR_SEARCHES = ['Репетитор', 'Сантехник', 'Тренер', 'Клининг', 'Фотограф']

export default async function HomePage() {
  // Топ-уровневые категории для сетки
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: 'asc' },
    take: 10,
    include: {
      _count: { select: { executors: true } },
    },
  })

  // Лучшие исполнители по рейтингу
  const topExecutors = await prisma.executorProfile.findMany({
    where: {
      isPublished: true,
      moderationStatus: 'APPROVED',
      reviewsCount: { gt: 0 },
    },
    orderBy: [{ ratingAvg: 'desc' }, { reviewsCount: 'desc' }],
    take: 6,
    include: {
      user: { select: { name: true, avatarUrl: true } },
      categories: {
        include: { category: { select: { name: true } } },
        take: 2,
      },
      services: {
        where: { isActive: true },
        orderBy: { priceFrom: 'asc' },
        take: 1,
        select: { priceFrom: true, name: true },
      },
    },
  })

  // Статистика платформы
  const [totalExecutors, totalCategories] = await Promise.all([
    prisma.executorProfile.count({
      where: { isPublished: true, moderationStatus: 'APPROVED' },
    }),
    prisma.category.count({ where: { parentId: null } }),
  ])

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return (
    <div className="flex flex-col min-h-screen">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'ГородОк',
          url: siteUrl,
          description: 'Маркетплейс услуг вашего города',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${siteUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }}
      />
      <Header />
      <main className="flex-1">

        {/* ===== HERO ===== */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <Badge variant="secondary" className="mb-4 text-sm px-3 py-1">
              Исполнители в Вологде
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-5 leading-tight">
              Найди лучшего{' '}
              <span className="text-primary">специалиста рядом</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Репетиторы, сантехники, тренеры, мастера — сотни проверенных исполнителей по любым задачам
            </p>

            {/* Форма поиска */}
            <form action="/search" method="get" className="flex gap-2 max-w-lg mx-auto mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  name="q"
                  type="search"
                  placeholder="Найти мастера или услугу..."
                  className="pl-11 h-12 text-base bg-card"
                />
              </div>
              <Button size="lg" type="submit" className="h-12 px-6">
                Найти
              </Button>
            </form>

            {/* Популярные запросы */}
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <span className="text-muted-foreground self-center">Популярные:</span>
              {POPULAR_SEARCHES.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="py-8 px-4 border-y border-border bg-card">
          <div className="container mx-auto">
            <div className="grid grid-cols-3 gap-4 text-center max-w-2xl mx-auto">
              {[
                {
                  value: totalExecutors > 0 ? `${totalExecutors}+` : '500+',
                  label: 'Исполнителей',
                },
                {
                  value: totalCategories > 0 ? `${totalCategories}` : '10',
                  label: 'Категорий',
                },
                { value: '4.8 ★', label: 'Средний рейтинг' },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">{value}</span>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CATEGORIES ===== */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Категории услуг
                </h2>
                <p className="text-muted-foreground mt-1">Найдите нужного специалиста</p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex gap-2">
                <Link href="/categories">
                  Все категории
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`}>
                  <Card className="hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer h-full">
                    <CardContent className="flex flex-col items-center justify-center gap-3 p-4 sm:p-5 text-center h-full min-h-[100px]">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CategoryIcon name={cat.icon} className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground leading-snug">
                          {cat.name}
                        </p>
                        {cat._count.executors > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {cat._count.executors}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="sm:hidden mt-5 flex justify-center">
              <Button variant="outline" asChild className="gap-2">
                <Link href="/categories">
                  Все категории
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ===== TOP EXECUTORS ===== */}
        {topExecutors.length > 0 && (
          <section className="py-16 px-4 bg-muted/30">
            <div className="container mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Лучшие исполнители
                  </h2>
                  <p className="text-muted-foreground mt-1">Топ специалисты по рейтингу</p>
                </div>
                <Button variant="outline" asChild className="hidden sm:flex gap-2">
                  <Link href="/categories">
                    Все исполнители
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topExecutors.map((exec) => {
                  const initials = exec.user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                  const minService = exec.services[0]

                  return (
                    <Card
                      key={exec.id}
                      className="overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-14 w-14 shrink-0">
                            <AvatarImage src={exec.user.avatarUrl ?? undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-semibold truncate">{exec.user.name}</h3>
                              {exec.isVerified && (
                                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                              )}
                              {exec.isPro && (
                                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                                  PRO
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {exec.categories.map((c) => c.category.name).join(', ')}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="font-semibold text-sm">
                                {exec.ratingAvg.toFixed(1)}
                              </span>
                              <span className="text-muted-foreground text-sm">
                                ({exec.reviewsCount} отзывов)
                              </span>
                            </div>
                            {minService && (
                              <p className="text-sm mt-0.5">
                                <span className="text-muted-foreground">от </span>
                                <span className="font-semibold">
                                  {Math.floor(minService.priceFrom / 100).toLocaleString('ru-RU')} ₽
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="w-full mt-4" asChild>
                          <Link href={`/executor/${exec.id}`}>Смотреть профиль</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ===== HOW IT WORKS ===== */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Как это работает
              </h2>
              <p className="text-muted-foreground mt-2">Найти исполнителя легко и быстро</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  icon: <Search className="h-8 w-8" />,
                  step: '1',
                  title: 'Найдите специалиста',
                  desc: 'Выберите категорию, используйте фильтры по рейтингу, цене и району',
                },
                {
                  icon: <MessageSquare className="h-8 w-8" />,
                  step: '2',
                  title: 'Оставьте заявку',
                  desc: 'Опишите задачу, укажите срок и бюджет — исполнитель получит уведомление',
                },
                {
                  icon: <CheckCircle className="h-8 w-8" />,
                  step: '3',
                  title: 'Получите результат',
                  desc: 'Общайтесь в чате, контролируйте выполнение и оставьте отзыв',
                },
              ].map(({ icon, step, title, desc }) => (
                <div key={step} className="flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      {icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {step}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{title}</h3>
                    <p className="text-muted-foreground text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-10 gap-3 flex-wrap">
              <Button size="lg" asChild>
                <Link href="/categories">Найти исполнителя</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register">Стать исполнителем</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}

export const dynamic = 'force-dynamic'

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
  Scale, PartyPopper, PawPrint, Briefcase, ClipboardList, Users,
  type LucideProps,
} from 'lucide-react'
import { type ComponentType } from 'react'
import { JsonLd } from '@/components/seo/json-ld'
import { QuickTaskForm } from '@/components/task/quick-task-form'

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

function pluralize(n: number, one: string, few: string, many: string) {
  const abs = Math.abs(n) % 100
  const lastDigit = abs % 10
  if (abs >= 11 && abs <= 19) return many
  if (lastDigit === 1) return one
  if (lastDigit >= 2 && lastDigit <= 4) return few
  return many
}

const POPULAR_SEARCHES = ['Репетитор', 'Сантехник', 'Тренер', 'Клининг', 'Фотограф']

export default async function HomePage() {
  // Топ-уровневые категории для сетки + children для QuickTaskForm
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: 'asc' },
    take: 10,
    include: {
      children: {
        orderBy: { order: 'asc' },
        select: { id: true, name: true },
      },
    },
  })

  // Точные счётчики (только опубликованные + одобренные исполнители)
  const executorCounts = await prisma.executorCategory.groupBy({
    by: ['categoryId'],
    _count: { categoryId: true },
    where: {
      executor: { isPublished: true, moderationStatus: 'APPROVED' },
    },
  })
  const countMap = Object.fromEntries(
    executorCounts.map((e) => [e.categoryId, e._count.categoryId])
  )

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
      user: { select: { name: true, avatarUrl: true, lastSeenAt: true } },
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
  const [totalExecutors, completedOrders, totalReviews, avgRatingResult] = await Promise.all([
    prisma.executorProfile.count({
      where: { isPublished: true, moderationStatus: 'APPROVED' },
    }),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.review.count(),
    prisma.review.aggregate({ _avg: { rating: true } }),
  ])
  const avgRating = avgRatingResult._avg.rating

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
        <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-14 sm:py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-8 sm:mb-10">
              <Badge variant="secondary" className="mb-4 text-sm px-3 py-1">
                Исполнители в Вологде
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                Найди лучшего{' '}
                <span className="text-primary">специалиста рядом</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
                Репетиторы, сантехники, тренеры, мастера — сотни проверенных исполнителей по любым задачам
              </p>
            </div>

            {/* Два CTA-блока */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 max-w-4xl mx-auto">
              {/* Описать задачу — первый на мобайле */}
              <div className="order-1 lg:order-2">
                <QuickTaskForm categories={categories} />
              </div>

              {/* Найти по каталогу */}
              <div className="order-2 lg:order-1">
                <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm h-full flex flex-col">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Search className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">Найти по каталогу</h3>
                      <p className="text-xs text-muted-foreground">Выберите из сотен исполнителей</p>
                    </div>
                  </div>

                  <form action="/search" method="get" className="flex gap-2 mb-4 flex-1">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none" />
                      <Input
                        name="q"
                        type="search"
                        placeholder="Найти мастера или услугу..."
                        className="pl-10 h-11 text-base"
                      />
                    </div>
                    <Button size="default" type="submit" className="h-11 px-5">
                      Найти
                    </Button>
                  </form>

                  <div className="flex flex-wrap gap-1.5 text-sm mt-auto">
                    <span className="text-muted-foreground self-center text-xs">Популярные:</span>
                    {POPULAR_SEARCHES.map((tag) => (
                      <Link
                        key={tag}
                        href={`/search?q=${encodeURIComponent(tag)}`}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="py-8 px-4 border-y border-border bg-card">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center max-w-3xl mx-auto">
              {[
                {
                  value: totalExecutors > 0 ? `${totalExecutors}+` : '500+',
                  label: 'Исполнителей',
                },
                {
                  value: completedOrders > 0 ? `${completedOrders}+` : '1 000+',
                  label: 'Выполнено заказов',
                },
                {
                  value: totalReviews > 0 ? `${totalReviews}+` : '2 000+',
                  label: 'Отзывов',
                },
                {
                  value: avgRating ? `${avgRating.toFixed(1)} ★` : '4.8 ★',
                  label: 'Средний рейтинг',
                },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">{value}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">{label}</span>
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
              {categories.map((cat) => {
                const count = countMap[cat.id] ?? 0
                return (
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
                          {count > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {count} {pluralize(count, 'специалист', 'специалиста', 'специалистов')}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
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
                  const isOnline = exec.user.lastSeenAt
                    ? (Date.now() - new Date(exec.user.lastSeenAt).getTime()) / 60000 < 5
                    : false

                  return (
                    <Card
                      key={exec.id}
                      className="overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="relative shrink-0">
                            <Avatar className="h-14 w-14">
                              <AvatarImage src={exec.user.avatarUrl ?? undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            {isOnline && (
                              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full" />
                            )}
                          </div>
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
                              {exec.ratingAvg >= 4.8 && exec.reviewsCount >= 10 && (
                                <Badge className="text-xs h-5 px-1.5 bg-amber-500/10 text-amber-700 border-amber-300 hover:bg-amber-500/20">
                                  Топ
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {exec.categories.map((c) => c.category.name).join(', ')}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="font-semibold text-sm">
                                {exec.ratingAvg.toFixed(2)}
                              </span>
                              <span className="text-muted-foreground text-sm">
                                ({exec.reviewsCount} {pluralize(exec.reviewsCount, 'отзыв', 'отзыва', 'отзывов')})
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
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Как это работает
              </h2>
              <p className="text-muted-foreground mt-2">Опишите задачу — найдите исполнителя за минуты</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <ClipboardList className="h-8 w-8" />,
                  step: '1',
                  title: 'Опишите задачу',
                  desc: 'Расскажите что нужно сделать, укажите бюджет и район — займёт 2 минуты',
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  step: '2',
                  title: 'Специалисты увидят',
                  desc: 'Подходящие исполнители найдут ваше задание на доске заданий платформы',
                },
                {
                  icon: <MessageSquare className="h-8 w-8" />,
                  step: '3',
                  title: 'Пришлют предложения',
                  desc: 'Получите отклики с ценами и сроками, сравните исполнителей по рейтингу',
                },
                {
                  icon: <CheckCircle className="h-8 w-8" />,
                  step: '4',
                  title: 'Выберите лучшего',
                  desc: 'Договоритесь в чате, выберите исполнителя и оставьте отзыв после работы',
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
                <Link href="/tasks/create">Описать задачу</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/categories">Найти исполнителя</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  )
}

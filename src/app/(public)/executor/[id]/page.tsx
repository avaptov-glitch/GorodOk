export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import {
  Star,
  MapPin,
  CheckCircle,
  Globe,
  Car,
  Home,
  Clock,
  ChevronRight,
  Eye,
  ImageOff,
  Zap,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { OrderFormDialog } from '@/components/executor/order-form-dialog'
import { FavoriteButton } from '@/components/executor/favorite-button'
import { cn } from '@/lib/utils'
import { JsonLd } from '@/components/seo/json-ld'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

type PriceType = 'FIXED' | 'FROM' | 'RANGE' | 'NEGOTIABLE' | 'PER_HOUR'

function formatPrice(priceFrom: number, priceTo: number | null, priceType: PriceType): string {
  const fromRub = Math.floor(priceFrom / 100).toLocaleString('ru-RU')
  if (priceType === 'NEGOTIABLE') return 'По договорённости'
  if (priceType === 'FIXED') return `${fromRub} ₽`
  if (priceType === 'PER_HOUR') return `${fromRub} ₽/час`
  if (priceType === 'RANGE' && priceTo) {
    const toRub = Math.floor(priceTo / 100).toLocaleString('ru-RU')
    return `${fromRub} — ${toRub} ₽`
  }
  return `от ${fromRub} ₽`
}

function pluralReviews(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return 'отзывов'
  if (mod10 === 1) return 'отзыв'
  if (mod10 >= 2 && mod10 <= 4) return 'отзыва'
  return 'отзывов'
}

function pluralYears(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return 'лет'
  if (mod10 === 1) return 'год'
  if (mod10 >= 2 && mod10 <= 4) return 'года'
  return 'лет'
}

function StarRow({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn(
              'h-3 w-3',
              i < rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30'
            )}
          />
        ))}
        <span className="ml-1 text-xs font-medium">{rating}</span>
      </div>
    </div>
  )
}

function EmptyTabState({ icon, text }: { icon?: ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
      {icon}
      <p className="text-sm">{text}</p>
    </div>
  )
}

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const executor = await prisma.executorProfile.findUnique({
    where: { id: params.id },
    select: {
      description: true,
      user: { select: { name: true, city: true } },
      categories: { include: { category: { select: { name: true } } }, take: 2 },
    },
  })
  if (!executor) return {}
  const categoryNames = executor.categories.map((c) => c.category.name).join(', ')
  return {
    title: `${executor.user.name} — ${categoryNames || 'Исполнитель'} в ${executor.user.city}`,
    description:
      executor.description?.slice(0, 160) ??
      `Профиль исполнителя ${executor.user.name} на ГородОк`,
  }
}

export default async function ExecutorProfilePage({ params }: { params: { id: string } }) {
  const executor = await prisma.executorProfile.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, avatarUrl: true, city: true, lastSeenAt: true } },
      categories: {
        include: { category: { select: { name: true, slug: true } } },
      },
      services: {
        where: { isActive: true },
        orderBy: { priceFrom: 'asc' },
        include: { category: { select: { name: true } } },
      },
      portfolio: { orderBy: { order: 'asc' } },
      certificates: { orderBy: { createdAt: 'asc' } },
      reviews: {
        include: { client: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 30,
      },
      subscription: true,
    },
  })

  if (!executor || !executor.isPublished || executor.moderationStatus !== 'APPROVED') {
    notFound()
  }

  // Увеличиваем счётчик просмотров в фоне
  prisma.executorProfile
    .update({ where: { id: params.id }, data: { viewsCount: { increment: 1 } } })
    .catch(() => {})

  // Проверяем сессию и статус избранного
  const session = await getServerSession(authOptions)
  const isClient = session?.user?.role === 'CLIENT'
  let isFavorited = false
  if (session?.user?.id) {
    const fav = await prisma.favorite.findUnique({
      where: { userId_executorId: { userId: session.user.id, executorId: params.id } },
      select: { id: true },
    })
    isFavorited = !!fav
  }

  const initials = executor.user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const firstCategory = executor.categories[0]?.category
  const categoryNames = executor.categories.map((c) => c.category.name).join(', ')
  const minPrice = executor.services[0]?.priceFrom

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* JSON-LD: BreadcrumbList */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Главная', item: SITE_URL },
            ...(firstCategory
              ? [{
                  '@type': 'ListItem',
                  position: 2,
                  name: firstCategory.name,
                  item: `${SITE_URL}/category/${firstCategory.slug}`,
                }]
              : []),
            {
              '@type': 'ListItem',
              position: firstCategory ? 3 : 2,
              name: executor.user.name,
            },
          ],
        }}
      />
      {/* JSON-LD: LocalBusiness */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: executor.user.name,
          description: executor.description || `Исполнитель: ${categoryNames}`,
          url: `${SITE_URL}/executor/${executor.id}`,
          ...(executor.user.avatarUrl ? { image: executor.user.avatarUrl } : {}),
          address: {
            '@type': 'PostalAddress',
            addressLocality: executor.user.city || 'Вологда',
            ...(executor.district ? { streetAddress: executor.district } : {}),
          },
          ...(executor.reviewsCount > 0
            ? {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: executor.ratingAvg.toFixed(1),
                  reviewCount: executor.reviewsCount,
                  bestRating: 5,
                  worstRating: 1,
                },
              }
            : {}),
          ...(minPrice
            ? {
                priceRange: `от ${Math.floor(minPrice / 100)} ₽`,
              }
            : {}),
        }}
      />
      {/* Хлебные крошки */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-foreground transition-colors">
          Главная
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link href="/categories" className="hover:text-foreground transition-colors">
          Категории
        </Link>
        {firstCategory && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link
              href={`/category/${firstCategory.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {firstCategory.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="text-foreground font-medium">{executor.user.name}</span>
      </nav>

      {/* Hero секция */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Аватар с онлайн-индикатором */}
            <div className="relative shrink-0 self-start">
              <Avatar className="h-24 w-24 ring-2 ring-border">
                <AvatarImage src={executor.user.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {executor.user.lastSeenAt && (Date.now() - new Date(executor.user.lastSeenAt).getTime()) / 60000 < 5 && (
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-card rounded-full" />
              )}
            </div>

            {/* Основная информация */}
            <div className="flex-1 min-w-0">
              {/* Имя + значки */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-foreground">{executor.user.name}</h1>
                {executor.isVerified && (
                  <CheckCircle
                    className="h-5 w-5 text-primary shrink-0"
                    aria-label="Верифицирован"
                  />
                )}
                {executor.isPro && <Badge className="shrink-0">PRO</Badge>}
                {executor.subscription?.plan === 'BUSINESS' && (
                  <Badge variant="secondary" className="shrink-0">
                    Бизнес
                  </Badge>
                )}
                {executor.ratingAvg >= 4.8 && executor.reviewsCount >= 10 && (
                  <Badge className="shrink-0 bg-amber-500/10 text-amber-700 border-amber-300 hover:bg-amber-500/20">
                    Топ специалист
                  </Badge>
                )}
                {executor.avgResponseTimeMinutes != null && executor.avgResponseTimeMinutes <= 60 && (
                  <Badge variant="outline" className="shrink-0 text-green-700 border-green-300">
                    <Zap className="h-3 w-3 mr-1" />
                    Быстро отвечает
                  </Badge>
                )}
              </div>

              {/* Категории */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {executor.categories.map(({ category }) => (
                  <Link key={category.slug} href={`/category/${category.slug}`}>
                    <Badge
                      variant="outline"
                      className="hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      {category.name}
                    </Badge>
                  </Link>
                ))}
              </div>

              {/* Рейтинг */}
              {executor.reviewsCount > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < Math.round(executor.ratingAvg)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-muted text-muted-foreground/30'
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{executor.ratingAvg.toFixed(2)}</span>
                  <span className="text-muted-foreground text-sm">
                    {executor.reviewsCount} {pluralReviews(executor.reviewsCount)}
                  </span>
                </div>
              )}

              {/* Местоположение и формат */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {executor.user.city}
                  {executor.district && `, ${executor.district}`}
                </span>
                {executor.worksOnline && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    Онлайн
                  </span>
                )}
                {executor.travelsToClient && (
                  <span className="flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5 shrink-0" />
                    Выезжает к клиенту
                  </span>
                )}
                {executor.acceptsAtOwnPlace && (
                  <span className="flex items-center gap-1.5">
                    <Home className="h-3.5 w-3.5 shrink-0" />
                    Принимает у себя
                  </span>
                )}
                {executor.experienceYears > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {executor.experienceYears} {pluralYears(executor.experienceYears)} опыта
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 shrink-0" />
                  {executor.viewsCount.toLocaleString('ru-RU')} просмотров
                </span>
                {executor.user.lastSeenAt && (
                  <span className="flex items-center gap-1.5">
                    <span className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      (Date.now() - new Date(executor.user.lastSeenAt).getTime()) / 60000 < 5
                        ? 'bg-green-500'
                        : 'bg-muted-foreground/40'
                    )} />
                    {(Date.now() - new Date(executor.user.lastSeenAt).getTime()) / 60000 < 5
                      ? 'В сети'
                      : `Был(а) ${formatDistanceToNow(executor.user.lastSeenAt, { locale: ru, addSuffix: true })}`
                    }
                  </span>
                )}
              </div>

              {/* Кнопки действий */}
              <div className="flex flex-wrap gap-3">
                {isClient ? (
                  <>
                    <OrderFormDialog
                      executorId={params.id}
                      executorName={executor.user.name}
                      services={executor.services.map((s) => ({ id: s.id, name: s.name }))}
                    />
                    <FavoriteButton executorId={params.id} initialIsFavorited={isFavorited} />
                  </>
                ) : !session ? (
                  <Button size="lg" asChild>
                    <Link href={`/login?callbackUrl=/executor/${params.id}`}>
                      Войти, чтобы оставить заявку
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Табы */}
      <Tabs defaultValue="services">
        <TabsList className="mb-6 h-auto flex-wrap gap-1">
          <TabsTrigger value="services">Услуги ({executor.services.length})</TabsTrigger>
          <TabsTrigger value="portfolio">Портфолио ({executor.portfolio.length})</TabsTrigger>
          <TabsTrigger value="reviews">Отзывы ({executor.reviewsCount})</TabsTrigger>
          <TabsTrigger value="about">О себе</TabsTrigger>
        </TabsList>

        {/* ─── Услуги ─── */}
        <TabsContent value="services">
          {executor.services.length === 0 ? (
            <EmptyTabState text="Услуги не добавлены" />
          ) : (
            <div className="grid gap-3">
              {executor.services.map((service) => (
                <Card key={service.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {service.description}
                          </p>
                        )}
                        <Badge variant="outline" className="mt-2 text-xs font-normal">
                          {service.category.name}
                        </Badge>
                      </div>
                      <p className="font-semibold text-foreground shrink-0 text-right">
                        {formatPrice(
                          service.priceFrom,
                          service.priceTo,
                          service.priceType as PriceType
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Портфолио ─── */}
        <TabsContent value="portfolio">
          {executor.portfolio.length === 0 ? (
            <EmptyTabState icon={<ImageOff className="h-10 w-10" />} text="Портфолио пока не добавлено" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {executor.portfolio.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.description ?? 'Работа из портфолио'}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {item.description && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-xs line-clamp-2">{item.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Отзывы ─── */}
        <TabsContent value="reviews">
          {executor.reviews.length === 0 ? (
            <EmptyTabState text="Отзывов пока нет" />
          ) : (
            <div className="space-y-4">
              {executor.reviews.map((review) => {
                const clientInitials = review.client.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()

                return (
                  <Card key={review.id}>
                    <CardContent className="p-5 space-y-3">
                      {/* Заголовок: автор + дата + общая оценка */}
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={review.client.avatarUrl ?? undefined} />
                          <AvatarFallback className="text-sm font-medium">
                            {clientInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="font-medium text-foreground">{review.client.name}</p>
                            <time className="text-xs text-muted-foreground">
                              {format(review.createdAt, 'd MMMM yyyy', { locale: ru })}
                            </time>
                          </div>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  'h-3.5 w-3.5',
                                  i < review.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-muted text-muted-foreground/30'
                                )}
                              />
                            ))}
                            <span className="text-sm font-medium ml-1">{review.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Текст отзыва */}
                      <p className="text-sm text-foreground leading-relaxed">{review.text}</p>

                      {/* Подоценки */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-muted/50 rounded-lg">
                        <StarRow rating={review.qualityRating} label="Качество" />
                        <StarRow rating={review.punctualityRating} label="Пунктуальность" />
                        <StarRow rating={review.valueRating} label="Цена / качество" />
                        <StarRow rating={review.politenessRating} label="Вежливость" />
                      </div>

                      {/* Фото к отзыву */}
                      {review.photos.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {review.photos.map((photo, i) => (
                            <div
                              key={i}
                              className="relative h-20 w-20 rounded-md overflow-hidden bg-muted"
                            >
                              <Image
                                src={photo}
                                alt={`Фото к отзыву ${i + 1}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Ответ исполнителя */}
                      {review.executorReply && (
                        <>
                          <Separator />
                          <div className="pl-3 border-l-2 border-primary/40">
                            <p className="text-xs font-medium text-primary mb-1">
                              Ответ исполнителя
                              {review.executorReplyAt && (
                                <span className="text-muted-foreground font-normal ml-1">
                                  ·{' '}
                                  {format(review.executorReplyAt, 'd MMMM yyyy', { locale: ru })}
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-foreground">{review.executorReply}</p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ─── О себе ─── */}
        <TabsContent value="about">
          <div className="space-y-5">
            {/* Описание */}
            {executor.description && (
              <Card>
                <CardContent className="p-5">
                  <h2 className="font-semibold text-foreground mb-3">О себе</h2>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {executor.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Ключевые факты */}
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold text-foreground mb-4">Информация</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {executor.experienceYears > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Опыт работы</p>
                        <p className="text-sm font-medium">
                          {executor.experienceYears} {pluralYears(executor.experienceYears)}
                        </p>
                      </div>
                    </div>
                  )}
                  {executor.worksOnline && (
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Globe className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Формат</p>
                        <p className="text-sm font-medium">Работает онлайн</p>
                      </div>
                    </div>
                  )}
                  {executor.travelsToClient && (
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Car className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Выезд</p>
                        <p className="text-sm font-medium">Выезжает к клиенту</p>
                      </div>
                    </div>
                  )}
                  {executor.district && (
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Район</p>
                        <p className="text-sm font-medium">{executor.district}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Сертификаты */}
            {executor.certificates.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <h2 className="font-semibold text-foreground mb-4">
                    Образование и сертификаты
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {executor.certificates.map((cert) => (
                      <div key={cert.id} className="space-y-2">
                        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted border">
                          <Image
                            src={cert.imageUrl}
                            alt={cert.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, 33vw"
                          />
                        </div>
                        <div className="flex items-start gap-1.5">
                          {cert.isVerified && (
                            <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          )}
                          <p className="text-xs text-foreground font-medium line-clamp-2">
                            {cert.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

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
  ImageOff,
  Zap,
} from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    .catch(() => { })

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
      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Premium Hero Banner Background */}
        <div className="h-[240px] md:h-[320px] w-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4"></div>

          {/* Breadcrumbs over dark background */}
          <div className="container mx-auto px-4 max-w-5xl pt-6 relative z-10">
            {/* JSON-LD: BreadcrumbList (Hidden from UI but present in DOM) */}
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

            <nav className="flex items-center gap-2 text-sm font-medium text-white/70 overflow-x-auto pb-2 scrollbar-hide">
              <Link href="/" className="hover:text-white transition-colors whitespace-nowrap">Главная</Link>
              <ChevronRight className="h-4 w-4 shrink-0 text-white/40" />
              <Link href="/categories" className="hover:text-white transition-colors whitespace-nowrap">Категории</Link>
              {firstCategory && (
                <>
                  <ChevronRight className="h-4 w-4 shrink-0 text-white/40" />
                  <Link
                    href={`/category/${firstCategory.slug}`}
                    className="hover:text-white transition-colors whitespace-nowrap"
                  >
                    {firstCategory.name}
                  </Link>
                </>
              )}
              <ChevronRight className="h-4 w-4 shrink-0 text-white/40" />
              <span className="text-white whitespace-nowrap truncate max-w-[200px]">{executor.user.name}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16 max-w-5xl -mt-20 md:-mt-24 relative z-20">

          {/* Main Profile Info Card (Overlapping Banner) */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 mb-8">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">

              {/* Avatar Section */}
              <div className="relative shrink-0 -mt-16 md:-mt-20 self-center md:self-auto">
                <div className="p-2 bg-white rounded-full shadow-xl">
                  <Avatar className="h-32 w-32 md:h-40 md:w-40">
                    <AvatarImage src={executor.user.avatarUrl ?? undefined} className="object-cover" />
                    <AvatarFallback className="bg-blue-50 text-blue-600 text-4xl font-extrabold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {executor.user.lastSeenAt && (Date.now() - new Date(executor.user.lastSeenAt).getTime()) / 60000 < 5 && (
                  <div className="absolute bottom-4 right-4 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full shadow-sm" title="В сети"></div>
                )}
              </div>

              {/* Core Info Section */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{executor.user.name}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {executor.isVerified && (
                      <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Проверен
                      </div>
                    )}
                    {executor.isPro && (
                      <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                        PRO
                      </div>
                    )}
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                  {executor.categories.map(({ category }) => (
                    <Link key={category.slug} href={`/category/${category.slug}`}>
                      <span className="inline-block bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border border-slate-200/60 hover:border-blue-200">
                        {category.name}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Meta Stats Row */}
                <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4 text-sm">
                  {/* Rating */}
                  {executor.reviewsCount > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                        <Star className="h-5 w-5 fill-current" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-lg leading-none mb-1">{executor.ratingAvg.toFixed(1)}</div>
                        <div className="text-slate-500 text-xs font-medium">{executor.reviewsCount} {pluralReviews(executor.reviewsCount)}</div>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm leading-none mb-1">{executor.user.city}</div>
                      {executor.district && <div className="text-slate-500 text-xs font-medium truncate max-w-[120px]">{executor.district}</div>}
                    </div>
                  </div>

                  {/* Experience */}
                  {executor.experienceYears > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm leading-none mb-1">{executor.experienceYears} {pluralYears(executor.experienceYears)}</div>
                        <div className="text-slate-500 text-xs font-medium">опыта работы</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 pt-4 md:pt-0">
                {isClient ? (
                  <>
                    <OrderFormDialog
                      executorId={params.id}
                      executorName={executor.user.name}
                      services={executor.services.map((s) => ({ id: s.id, name: s.name }))}
                      triggerClassName="w-full sm:flex-1 md:w-full h-12 md:h-14 rounded-xl md:rounded-2xl text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                    />
                    <div className="w-full sm:flex-1 md:w-full">
                      <FavoriteButton executorId={params.id} initialIsFavorited={isFavorited} className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50" />
                    </div>

                  </>
                ) : !session ? (
                  <Button size="lg" className="h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] shadow-xl shadow-blue-500/20 transition-all w-full" asChild>
                    <Link href={`/login?callbackUrl=/executor/${params.id}`}>
                      Предложить заказ
                    </Link>
                  </Button>
                ) : null}
              </div>

            </div>
          </div>

          {/* Bento Grid Content Area */}
          <Tabs defaultValue="services" className="w-full">
            <TabsList className="mb-8 w-full justify-start h-auto bg-transparent gap-2 p-0 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200">
              <TabsTrigger value="services" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-slate-200 rounded-xl px-5 py-3 text-sm font-bold text-slate-500 data-[state=active]:text-slate-900 transition-all border border-transparent hover:bg-slate-100">
                Услуги <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-600">{executor.services.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-slate-200 rounded-xl px-5 py-3 text-sm font-bold text-slate-500 data-[state=active]:text-slate-900 transition-all border border-transparent hover:bg-slate-100">
                Работы <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-600">{executor.portfolio.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-slate-200 rounded-xl px-5 py-3 text-sm font-bold text-slate-500 data-[state=active]:text-slate-900 transition-all border border-transparent hover:bg-slate-100">
                Отзывы <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-600">{executor.reviewsCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="about" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-slate-200 rounded-xl px-5 py-3 text-sm font-bold text-slate-500 data-[state=active]:text-slate-900 transition-all border border-transparent hover:bg-slate-100">
                О себе
              </TabsTrigger>
            </TabsList>

            {/* ─── Услуги ─── */}
            <TabsContent value="services" className="mt-0 outline-none">
              {executor.services.length === 0 ? (
                <EmptyTabState text="Услуги не добавлены" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {executor.services.map((service) => (
                    <div key={service.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                            {service.name}
                          </h3>
                          <span className="font-black text-lg text-emerald-600 shrink-0 bg-emerald-50 px-3 py-1 rounded-xl">
                            {formatPrice(service.priceFrom, service.priceTo, service.priceType as PriceType)}
                          </span>
                        </div>
                        {service.description && (
                          <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="w-fit text-xs font-semibold bg-slate-50 border-slate-200 text-slate-500">
                        {service.category.name}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ─── Портфолио ─── */}
            <TabsContent value="portfolio" className="mt-0 outline-none">
              {executor.portfolio.length === 0 ? (
                <EmptyTabState icon={<ImageOff className="h-10 w-10" />} text="Портфолио пока не добавлено" />
              ) : (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                  {executor.portfolio.map((item) => (
                    <div key={item.id} className="relative rounded-[2rem] overflow-hidden bg-slate-100 group break-inside-avoid">
                      {/* Next Image with intrinsic ratio using a neat trick: wrapping in a block div that allows natural image sizing in columns */}
                      <img
                        src={item.imageUrl}
                        alt={item.description ?? 'Работа из портфолио'}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                      {item.description && (
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                          <p className="text-white text-sm font-medium leading-tight">{item.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ─── Отзывы ─── */}
            <TabsContent value="reviews" className="mt-0 outline-none">
              {executor.reviews.length === 0 ? (
                <EmptyTabState text="Отзывов пока нет" />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {executor.reviews.map((review) => {
                    const clientInitials = review.client.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                    return (
                      <div key={review.id} className="bg-white rounded-[2rem] p-6 lg:p-8 border border-slate-100 shadow-sm flex flex-col">
                        <div className="flex items-center gap-4 mb-5">
                          <Avatar className="h-12 w-12 border border-slate-100 shadow-sm">
                            <AvatarImage src={review.client.avatarUrl ?? undefined} />
                            <AvatarFallback className="text-sm font-bold bg-indigo-50 text-indigo-700">
                              {clientInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-bold text-slate-900">{review.client.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star key={i} className={cn('h-3.5 w-3.5', i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200')} />
                                ))}
                              </div>
                              <time className="text-xs font-medium text-slate-400">
                                {format(review.createdAt, 'd MMM yyyy', { locale: ru })}
                              </time>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-6 font-medium italic">&laquo;{review.text}&raquo;</p>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 bg-slate-50/80 rounded-2xl mb-4 mt-auto">
                          <StarRow rating={review.qualityRating} label="Качество" />
                          <StarRow rating={review.punctualityRating} label="Пунктуальность" />
                          <StarRow rating={review.valueRating} label="Цена / качество" />
                          <StarRow rating={review.politenessRating} label="Вежливость" />
                        </div>

                        {review.photos.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {review.photos.map((photo, i) => (
                              <div key={i} className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-slate-100">
                                <Image src={photo} alt={`Фото к отзыву ${i + 1}`} fill className="object-cover" sizes="64px" />
                              </div>
                            ))}
                          </div>
                        )}

                        {review.executorReply && (
                          <div className="mt-4 pl-4 border-l-4 border-blue-500 bg-blue-50/50 p-4 rounded-xl rounded-tl-none">
                            <p className="text-xs font-bold text-blue-800 mb-1 flex items-center gap-2">
                              Ответ исполнителя
                              {review.executorReplyAt && (
                                <span className="text-blue-400/80 font-semibold text-[10px] uppercase tracking-wider">
                                  {format(review.executorReplyAt, 'd MMM yyyy', { locale: ru })}
                                </span>
                              )}
                            </p>
                            <p className="text-sm font-medium text-blue-900/90 leading-relaxed">{review.executorReply}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            {/* ─── О себе (Bento Dashboard) ─── */}
            <TabsContent value="about" className="mt-0 outline-none">
              {/* Bento Grid Layout using CSS Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Description Column */}
                <div className="md:col-span-2 flex flex-col gap-6">
                  {executor.description ? (
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm h-full">
                      <h2 className="font-extrabold text-xl text-slate-900 mb-6 flex items-center gap-3">
                        <div className="h-8 w-2 bg-blue-600 rounded-full"></div>
                        Обо мне
                      </h2>
                      <p className="text-base text-slate-600 leading-loose whitespace-pre-line font-medium">
                        {executor.description}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex items-center justify-center h-full text-slate-400 font-medium">
                      Пользователь пока не добавил описание о себе
                    </div>
                  )}
                </div>

                {/* Sidebar Info Column */}
                <div className="flex flex-col gap-6">

                  {/* Stats Widget */}
                  <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-900 mb-5">Формат работы</h3>
                    <div className="space-y-4">
                      {executor.worksOnline && (
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl">
                          <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500">
                            <Globe className="h-5 w-5" />
                          </div>
                          <div className="font-bold text-slate-700 text-sm">Принимает заказы онлайн</div>
                        </div>
                      )}
                      {executor.travelsToClient && (
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl">
                          <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-500">
                            <Car className="h-5 w-5" />
                          </div>
                          <div className="font-bold text-slate-700 text-sm">Выезжает к клиенту</div>
                        </div>
                      )}
                      {executor.acceptsAtOwnPlace && (
                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl">
                          <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-500">
                            <Home className="h-5 w-5" />
                          </div>
                          <div className="font-bold text-slate-700 text-sm">Принимает у себя</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Response Rate Widget */}
                  {executor.avgResponseTimeMinutes != null && (
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] p-6 text-white shadow-lg shadow-blue-500/20">
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className="h-6 w-6 text-amber-300" />
                        <h3 className="font-bold text-lg">Скорость ответа</h3>
                      </div>
                      <p className="text-3xl font-black mb-1 text-white">~{executor.avgResponseTimeMinutes} мин</p>
                      <p className="text-blue-100 text-sm font-medium opacity-90">Среднее время ответа на новые заявки</p>
                    </div>
                  )}

                </div>

                {/* Certificates Row (Spans full width) */}
                {executor.certificates.length > 0 && (
                  <div className="md:col-span-3 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm mt-2">
                    <h2 className="font-extrabold text-xl text-slate-900 mb-6 flex items-center gap-3">
                      <div className="h-8 w-2 bg-emerald-500 rounded-full"></div>
                      Документы и сертификаты
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {executor.certificates.map((cert) => (
                        <div key={cert.id} className="group cursor-pointer">
                          <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                            <Image
                              src={cert.imageUrl}
                              alt={cert.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                            />
                          </div>
                          <div className="flex items-start gap-2">
                            {cert.isVerified ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                            ) : (
                              <div className="h-5 w-5 shrink-0 mt-0.5" /> // spacer
                            )}
                            <p className="text-sm text-slate-700 font-bold leading-snug group-hover:text-blue-600 transition-colors">
                              {cert.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

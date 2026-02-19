export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { ExecutorCard } from '@/components/executor/executor-card'
import { Filters } from '@/components/search/filters'
import { SortDropdown } from '@/components/search/sort-dropdown'
import { EmptyState } from '@/components/common/empty-state'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronRight, Search, Users } from 'lucide-react'
import { JsonLd } from '@/components/seo/json-ld'

const PAGE_SIZE = 12
const MAX_QUERY_LENGTH = 200
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

type SearchPageParams = {
  q?: string
  sort?: string
  city?: string
  rating?: string
  priceFrom?: string
  priceTo?: string
  district?: string
  hasPortfolio?: string
  isVerified?: string
  minExperience?: string
  online?: string
  travelsToClient?: string
  acceptsAtOwnPlace?: string
  page?: string
}

// Очистка и ограничение поискового запроса
function sanitizeQuery(raw?: string): string {
  if (!raw) return ''
  return raw.trim().replace(/\s+/g, ' ').slice(0, MAX_QUERY_LENGTH)
}

// Построение WHERE с текстовым поиском через OR + фильтры через AND
function buildSearchWhere(query: string, params: SearchPageParams) {
  const where: Record<string, unknown> = {
    isPublished: true,
    moderationStatus: 'APPROVED',
  }

  // Текстовый поиск по 5 полям
  if (query) {
    where.OR = [
      { user: { name: { contains: query, mode: 'insensitive' } } },
      { description: { contains: query, mode: 'insensitive' } },
      { services: { some: { name: { contains: query, mode: 'insensitive' }, isActive: true } } },
      { services: { some: { description: { contains: query, mode: 'insensitive' }, isActive: true } } },
      { categories: { some: { category: { name: { contains: query, mode: 'insensitive' } } } } },
    ]
  }

  // Фильтры — через AND чтобы не конфликтовать с OR
  const andConditions: Record<string, unknown>[] = []

  if (params.city) {
    andConditions.push({ user: { city: params.city } })
  }

  if (params.rating) {
    where.ratingAvg = { gte: parseFloat(params.rating) }
  }

  if (params.district) {
    where.district = params.district
  }

  if (params.isVerified) {
    where.isVerified = true
  }

  if (params.minExperience) {
    where.experienceYears = { gte: parseInt(params.minExperience) }
  }

  if (params.online) {
    where.worksOnline = true
  }

  if (params.travelsToClient) {
    where.travelsToClient = true
  }

  if (params.acceptsAtOwnPlace) {
    where.acceptsAtOwnPlace = true
  }

  if (params.hasPortfolio) {
    where.portfolio = { some: {} }
  }

  // Фильтр по цене услуг (рубли → копейки)
  if (params.priceFrom || params.priceTo) {
    const servicePriceFilter: Record<string, unknown> = { isActive: true }
    if (params.priceFrom) servicePriceFilter.priceFrom = { gte: parseInt(params.priceFrom) * 100 }
    if (params.priceTo) servicePriceFilter.priceFrom = {
      ...(servicePriceFilter.priceFrom as Record<string, unknown>),
      lte: parseInt(params.priceTo) * 100,
    }
    andConditions.push({ services: { some: servicePriceFilter } })
  }

  if (andConditions.length > 0) {
    where.AND = andConditions
  }

  return where
}

// Сортировка (идентична category page)
function buildOrderBy(sort: string) {
  switch (sort) {
    case 'rating':
      return [{ ratingAvg: 'desc' as const }, { reviewsCount: 'desc' as const }]
    case 'reviews':
      return [{ reviewsCount: 'desc' as const }, { ratingAvg: 'desc' as const }]
    case 'newest':
      return [{ createdAt: 'desc' as const }]
    case 'priceAsc':
    case 'priceDesc':
      return [{ ratingAvg: 'desc' as const }, { reviewsCount: 'desc' as const }]
    case 'recommended':
    default:
      return [
        { isPro: 'desc' as const },
        { ratingAvg: 'desc' as const },
        { reviewsCount: 'desc' as const },
      ]
  }
}

// URL пагинации с сохранением всех параметров
function buildPageUrl(page: number, searchParams: SearchPageParams): string {
  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([k, v]) => {
    if (v && k !== 'page') params.set(k, v)
  })
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return `/search${qs ? `?${qs}` : ''}`
}

function PaginationControls({
  page,
  totalPages,
  searchParams,
}: {
  page: number
  totalPages: number
  searchParams: SearchPageParams
}) {
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  const pages: number[] = []
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <Pagination>
      <PaginationContent>
        {page > 1 && (
          <PaginationItem>
            <PaginationPrevious href={buildPageUrl(page - 1, searchParams)} />
          </PaginationItem>
        )}
        {start > 1 && (
          <>
            <PaginationItem>
              <PaginationLink href={buildPageUrl(1, searchParams)}>1</PaginationLink>
            </PaginationItem>
            {start > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}
        {pages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink href={buildPageUrl(p, searchParams)} isActive={p === page}>
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink href={buildPageUrl(totalPages, searchParams)}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}
        {page < totalPages && (
          <PaginationItem>
            <PaginationNext href={buildPageUrl(page + 1, searchParams)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  )
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchPageParams
}): Promise<Metadata> {
  const query = sanitizeQuery(searchParams.q)

  if (!query) {
    return {
      title: 'Поиск исполнителей',
      description: 'Найдите лучших специалистов на ГородОк — репетиторы, мастера, тренеры и другие исполнители рядом с вами',
    }
  }

  return {
    title: `${query} — поиск исполнителей`,
    description: `Результаты поиска «${query}» на ГородОк. Найдите специалистов по вашему запросу.`,
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchPageParams
}) {
  const query = sanitizeQuery(searchParams.q)
  const sort = searchParams.sort ?? 'recommended'
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const skip = (page - 1) * PAGE_SIZE

  // Определяем, нужно ли делать запрос
  const filterKeys = [
    'sort', 'city', 'rating', 'priceFrom', 'priceTo', 'district',
    'hasPortfolio', 'isVerified', 'minExperience', 'online',
    'travelsToClient', 'acceptsAtOwnPlace',
  ] as const
  const hasFilters = filterKeys.some((k) => searchParams[k])
  const shouldSearch = query.length > 0 || hasFilters

  // Запрос к БД только если есть поисковый запрос или фильтры
  if (!shouldSearch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'SearchResultsPage',
            name: 'Поиск исполнителей',
            url: `${SITE_URL}/search`,
          }}
        />

        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link href="/" className="hover:text-foreground transition-colors">
            Главная
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-foreground font-medium">Поиск</span>
        </nav>

        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            Поиск исполнителей
          </h1>
        </div>

        <form action="/search" method="get" className="mb-6 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              name="q"
              type="search"
              placeholder="Найти мастера или услугу..."
              className="pl-10 h-11 text-base"
            />
          </div>
        </form>

        <EmptyState
          icon={<Search className="h-16 w-16" />}
          title="Введите запрос для поиска"
          description="Найдите исполнителей по имени, услуге или категории"
        />
      </div>
    )
  }

  const where = buildSearchWhere(query, searchParams)
  const orderBy = buildOrderBy(sort)

  const [executors, total] = await Promise.all([
    prisma.executorProfile.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        ratingAvg: true,
        reviewsCount: true,
        isVerified: true,
        isPro: true,
        district: true,
        worksOnline: true,
        acceptsAtOwnPlace: true,
        travelsToClient: true,
        avgResponseTimeMinutes: true,
        user: { select: { name: true, avatarUrl: true, lastSeenAt: true } },
        categories: {
          include: { category: { select: { name: true } } },
        },
        services: {
          where: { isActive: true },
          orderBy: { priceFrom: 'asc' },
          take: 3,
          select: { name: true, priceFrom: true, priceType: true },
        },
        portfolio: {
          orderBy: { order: 'asc' },
          take: 1,
          select: { imageUrl: true },
        },
      },
    }),
    prisma.executorProfile.count({ where }),
  ])

  // Районы для фильтра
  const districtsRaw = await prisma.executorProfile.findMany({
    where: {
      isPublished: true,
      moderationStatus: 'APPROVED',
      district: { not: null },
    },
    select: { district: true },
    distinct: ['district'],
  })
  const districts = districtsRaw.map((d) => d.district!).filter(Boolean).sort()

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="container mx-auto px-4 py-8">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SearchResultsPage',
          name: query ? `Поиск: ${query}` : 'Поиск исполнителей',
          url: `${SITE_URL}/search${query ? `?q=${encodeURIComponent(query)}` : ''}`,
        }}
      />

      {/* Хлебные крошки */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-foreground transition-colors">
          Главная
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="text-foreground font-medium">Поиск</span>
      </nav>

      {/* Заголовок */}
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
          {query ? `Результаты поиска: «${query}»` : 'Поиск исполнителей'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {total > 0
            ? `Найдено ${total} исполнител${total === 1 ? 'ь' : total < 5 ? 'я' : 'ей'}`
            : 'По вашему запросу ничего не найдено'}
        </p>
      </div>

      {/* Строка поиска на странице */}
      <form action="/search" method="get" className="mb-6 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Найти мастера или услугу..."
            className="pl-10 h-11 text-base"
          />
        </div>
      </form>

      {/* Нет результатов */}
      {total === 0 && (
        <EmptyState
          icon={<Users className="h-16 w-16" />}
          title="Ничего не найдено"
          description="Попробуйте изменить запрос или ослабить фильтры"
          action={
            <Button variant="outline" asChild>
              <Link href="/categories">Посмотреть категории</Link>
            </Button>
          }
        />
      )}

      {/* Результаты */}
      {total > 0 && (
        <div className="flex gap-6 items-start">
          {/* Фильтры */}
          <Suspense>
            <Filters districts={districts} />
          </Suspense>

          {/* Основной контент */}
          <div className="flex-1 min-w-0">
            {/* Панель: кол-во + сортировка */}
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <span className="text-sm text-muted-foreground">
                {executors.length > 0 && `${executors.length} из ${total}`}
              </span>
              <Suspense>
                <SortDropdown />
              </Suspense>
            </div>

            {/* Сетка исполнителей */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {executors.map((executor) => (
                <ExecutorCard
                  key={executor.id}
                  id={executor.id}
                  user={executor.user}
                  ratingAvg={executor.ratingAvg}
                  reviewsCount={executor.reviewsCount}
                  isVerified={executor.isVerified}
                  isPro={executor.isPro}
                  district={executor.district}
                  worksOnline={executor.worksOnline}
                  acceptsAtOwnPlace={executor.acceptsAtOwnPlace}
                  travelsToClient={executor.travelsToClient}
                  avgResponseTimeMinutes={executor.avgResponseTimeMinutes}
                  services={executor.services}
                  categories={executor.categories}
                  portfolio={executor.portfolio}
                />
              ))}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="mt-8">
                <PaginationControls
                  page={page}
                  totalPages={totalPages}
                  searchParams={searchParams}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

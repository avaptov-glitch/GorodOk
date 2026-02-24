export const dynamic = 'force-dynamic'

import Link from 'next/link'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { ExecutorCard } from '@/components/executor/executor-card'
import { Filters } from '@/components/search/filters'
import { SortDropdown } from '@/components/search/sort-dropdown'
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
import { ChevronRight, Search, Users, SlidersHorizontal } from 'lucide-react'
const PAGE_SIZE = 12
const MAX_QUERY_LENGTH = 200

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

function sanitizeQuery(raw?: string): string {
  if (!raw) return ''
  return raw.trim().replace(/\s+/g, ' ').slice(0, MAX_QUERY_LENGTH)
}

function buildSearchWhere(query: string, params: SearchPageParams) {
  const where: Record<string, unknown> = {
    isPublished: true,
    moderationStatus: 'APPROVED',
  }

  if (query) {
    where.OR = [
      { user: { name: { contains: query, mode: 'insensitive' } } },
      { description: { contains: query, mode: 'insensitive' } },
      { services: { some: { name: { contains: query, mode: 'insensitive' }, isActive: true } } },
      { services: { some: { description: { contains: query, mode: 'insensitive' }, isActive: true } } },
      { categories: { some: { category: { name: { contains: query, mode: 'insensitive' } } } } },
    ]
  }

  const andConditions: Record<string, unknown>[] = []

  if (params.city) andConditions.push({ user: { city: params.city } })
  if (params.rating) where.ratingAvg = { gte: parseFloat(params.rating) }
  if (params.district) where.district = params.district
  if (params.isVerified) where.isVerified = true
  if (params.minExperience) where.experienceYears = { gte: parseInt(params.minExperience) }
  if (params.online) where.worksOnline = true
  if (params.travelsToClient) where.travelsToClient = true
  if (params.acceptsAtOwnPlace) where.acceptsAtOwnPlace = true
  if (params.hasPortfolio) where.portfolio = { some: {} }

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

function buildOrderBy(sort: string) {
  switch (sort) {
    case 'rating': return [{ ratingAvg: 'desc' as const }, { reviewsCount: 'desc' as const }]
    case 'reviews': return [{ reviewsCount: 'desc' as const }, { ratingAvg: 'desc' as const }]
    case 'newest': return [{ createdAt: 'desc' as const }]
    case 'priceAsc':
    case 'priceDesc': return [{ ratingAvg: 'desc' as const }, { reviewsCount: 'desc' as const }]
    case 'recommended':
    default:
      return [
        { isPro: 'desc' as const },
        { ratingAvg: 'desc' as const },
        { reviewsCount: 'desc' as const },
      ]
  }
}

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
    <Pagination className="mt-12">
      <PaginationContent className="bg-white rounded-full px-2 py-1 shadow-sm border border-slate-200">
        {page > 1 && (
          <PaginationItem>
            <PaginationPrevious href={buildPageUrl(page - 1, searchParams)} className="rounded-full hover:bg-slate-100 font-medium" />
          </PaginationItem>
        )}
        {start > 1 && (
          <>
            <PaginationItem>
              <PaginationLink href={buildPageUrl(1, searchParams)} className="rounded-full">1</PaginationLink>
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
            <PaginationLink
              href={buildPageUrl(p, searchParams)}
              isActive={p === page}
              className={`rounded-full font-bold ${p === page ? 'bg-slate-900 text-white hover:bg-slate-800' : 'hover:bg-slate-100 text-slate-600'}`}
            >
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
              <PaginationLink href={buildPageUrl(totalPages, searchParams)} className="rounded-full">
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}
        {page < totalPages && (
          <PaginationItem>
            <PaginationNext href={buildPageUrl(page + 1, searchParams)} className="rounded-full hover:bg-slate-100 font-medium" />
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

  const filterKeys = [
    'sort', 'city', 'rating', 'priceFrom', 'priceTo', 'district',
    'hasPortfolio', 'isVerified', 'minExperience', 'online',
    'travelsToClient', 'acceptsAtOwnPlace',
  ] as const
  const hasFilters = filterKeys.some((k) => searchParams[k])
  const shouldSearch = query.length > 0 || hasFilters

  if (!shouldSearch) {
    return (
      <div className="min-h-[80vh] bg-[#F8FAFC]">
        <div className="container mx-auto px-4 max-w-[1360px] py-12">
          {/* Top minimal header */}
          <nav className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-8">
            <Link href="/" className="hover:text-blue-600 transition-colors">Главная</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="text-slate-900">Поиск</span>
          </nav>

          <div className="max-w-3xl mx-auto mt-16 text-center">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center shadow-inner mx-auto mb-8 border border-blue-100">
              <Search className="h-10 w-10" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-[-0.03em] mb-4">
              Поиск специалистов
            </h1>
            <p className="text-xl font-medium text-slate-500 mb-10">
              Более 100,000 мастеров готовы помочь. Введите запрос.
            </p>

            <form action="/search" method="get" className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <Input
                name="q"
                type="search"
                placeholder="Например: ремонт квартир, репетитор по английскому..."
                className="w-full pl-16 pr-6 py-8 h-auto rounded-[2.5rem] bg-white border-2 border-slate-200 text-xl font-semibold placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all"
              />
              <Button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-[calc(100%-24px)] text-lg font-bold">
                Найти
              </Button>
            </form>
          </div>
        </div>
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
        categories: { include: { category: { select: { name: true } } } },
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

  const districtsRaw = await prisma.executorProfile.findMany({
    where: { isPublished: true, moderationStatus: 'APPROVED', district: { not: null } },
    select: { district: true },
    distinct: ['district'],
  })
  const districts = districtsRaw.map((d) => d.district!).filter(Boolean).sort()

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Search Band */}
      <div className="bg-white border-b border-slate-200/60 pt-6 pb-6 sticky top-0 z-40 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 max-w-[1360px]">
          <nav className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-4">
            <Link href="/" className="hover:text-blue-600 transition-colors">Главная</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="text-slate-900">Поиск</span>
          </nav>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-[-0.02em] shrink-0">
              {query ? `Результаты: «${query}»` : 'Все специалисты'}
            </h1>

            <form action="/search" method="get" className="w-full max-w-2xl relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Что будем искать?"
                className="w-full pl-12 pr-4 h-14 rounded-full bg-slate-100/50 hover:bg-slate-100 focus:bg-white border-transparent focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 text-base font-medium transition-all shadow-sm"
              />
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-[1360px] py-8">
        {total === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-16 text-center shadow-sm">
            <div className="w-24 h-24 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Ничего не найдено</h2>
            <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">
              Мы не нашли специалистов точно по вашему запросу. Попробуйте изменить фильтры или написать иначе.
            </p>
            <Button asChild className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 px-8">
              <Link href="/categories">Открыть каталог категорий</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Filters Sidebar */}
            <div className="w-full lg:w-[280px] shrink-0">
              <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm p-6 sticky top-[140px]">
                <div className="flex items-center gap-2 font-black text-lg text-slate-900 mb-6">
                  <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                  Фильтры
                </div>
                <Suspense fallback={<div className="h-[400px] bg-slate-50 animate-pulse rounded-xl"></div>}>
                  <Filters districts={districts} />
                </Suspense>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Meta Panel */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white rounded-2xl p-3 px-5 border border-slate-200/60 shadow-sm">
                <span className="font-bold text-slate-600">
                  Показано <span className="text-slate-900">{executors.length}</span> из <span className="text-slate-900">{total}</span>
                </span>
                <Suspense>
                  <SortDropdown />
                </Suspense>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
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

              {totalPages > 1 && (
                <PaginationControls
                  page={page}
                  totalPages={totalPages}
                  searchParams={searchParams}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

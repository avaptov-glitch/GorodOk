export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { ExecutorCard } from '@/components/executor/executor-card'
import { CategoryFilters } from '@/components/search/category-filters'
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
import { ChevronRight, Users } from 'lucide-react'
import { JsonLd } from '@/components/seo/json-ld'

const PAGE_SIZE = 12
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

type SearchParams = {
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

// Строим условие WHERE по параметрам фильтров
function buildWhere(categoryIds: string[], params: SearchParams) {
  const where: Record<string, unknown> = {
    isPublished: true,
    moderationStatus: 'APPROVED',
    categories: {
      some: { categoryId: { in: categoryIds } },
    },
  }

  if (params.city) {
    where.user = { city: params.city }
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

  // Фильтр по цене услуг (в рублях → переводим в копейки)
  if (params.priceFrom || params.priceTo) {
    const servicePriceFilter: Record<string, unknown> = { isActive: true }
    if (params.priceFrom) {
      servicePriceFilter.priceFrom = { gte: parseInt(params.priceFrom) * 100 }
    }
    if (params.priceTo) {
      const priceToCents = parseInt(params.priceTo) * 100
      servicePriceFilter.priceFrom = {
        ...(servicePriceFilter.priceFrom as Record<string, unknown> || {}),
        lte: priceToCents,
      }
      // Если у услуги задана верхняя граница цены — она тоже должна быть в бюджете
      servicePriceFilter.OR = [
        { priceTo: null },
        { priceTo: { lte: priceToCents } },
      ]
    }
    where.services = { some: servicePriceFilter }
  }

  return where
}

// Строим сортировку
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
      // TODO: для точной сортировки по цене нужно денормализованное поле minServicePrice
      // MVP: используем рейтинг как запасной вариант
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

// Пагинация — генерируем URL с сохранением всех параметров
function buildPageUrl(page: number, searchParams: SearchParams): string {
  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([k, v]) => {
    if (v && k !== 'page') params.set(k, v)
  })
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `?${qs}` : '?'
}

function PaginationControls({
  page,
  totalPages,
  searchParams,
}: {
  page: number
  totalPages: number
  searchParams: SearchParams
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
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } })
  if (!category) return {}
  return {
    title: category.name,
    description: `Найдите лучших специалистов в категории «${category.name}» на ГородОк`,
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: SearchParams
}) {
  // Загружаем категорию с подкатегориями и родителем
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      parent: true,
      children: { orderBy: { order: 'asc' } },
    },
  })
  if (!category) notFound()

  const categoryIds = [category.id, ...category.children.map((c) => c.id)]
  const where = buildWhere(categoryIds, searchParams)
  const orderBy = buildOrderBy(searchParams.sort ?? 'recommended')
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const skip = (page - 1) * PAGE_SIZE

  // Параллельно: исполнители + общий счётчик
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

  // Список районов для фильтра
  const districtsRaw = await prisma.executorProfile.findMany({
    where: {
      isPublished: true,
      moderationStatus: 'APPROVED',
      categories: { some: { categoryId: { in: categoryIds } } },
      district: { not: null },
    },
    select: { district: true },
    distinct: ['district'],
  })
  const districts = districtsRaw
    .map((d) => d.district!)
    .filter(Boolean)
    .sort()

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // JSON-LD BreadcrumbList
  const breadcrumbItems = [
    { name: 'Главная', url: SITE_URL },
    { name: 'Категории', url: `${SITE_URL}/categories` },
    ...(category.parent
      ? [{ name: category.parent.name, url: `${SITE_URL}/category/${category.parent.slug}` }]
      : []),
    { name: category.name, url: `${SITE_URL}/category/${category.slug}` },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbItems.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: item.url,
          })),
        }}
      />

      {/* Premium Hero Header */}
      <div className="bg-white border-b border-slate-200/60 pt-8 pb-10 mb-8">
        <div className="container mx-auto px-4 max-w-[1360px]">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <Link href="/" className="hover:text-blue-600 transition-colors whitespace-nowrap">Главная</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <Link href="/categories" className="hover:text-blue-600 transition-colors whitespace-nowrap">Категории</Link>
            {category.parent && (
              <>
                <ChevronRight className="h-4 w-4 shrink-0" />
                <Link href={`/category/${category.parent.slug}`} className="hover:text-blue-600 transition-colors whitespace-nowrap">
                  {category.parent.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
            <span className="text-slate-900 whitespace-nowrap">{category.name}</span>
          </nav>

          {/* Title & Stats */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-[-0.03em] mb-3">
                {category.name}
              </h1>
              <p className="text-lg text-slate-500 font-medium">
                {total > 0 ? (
                  <>Найдено <span className="text-slate-900 font-bold">{total}</span> исполнителей</>
                ) : (
                  'Пока нет исполнителей в этой категории'
                )}
              </p>
            </div>

            {/* Subcategories (Tags) */}
            {category.children.length > 0 && (
              <div className="flex flex-wrap gap-2 max-w-2xl justify-start md:justify-end">
                {category.children.map((sub) => (
                  <Link key={sub.id} href={`/category/${sub.slug}`}>
                    <div className="text-sm font-semibold bg-slate-50 hover:bg-white text-slate-600 hover:text-blue-600 border border-slate-200/60 hover:border-blue-200 rounded-full py-2 px-4 shadow-sm hover:shadow-md ring-1 ring-slate-900/5 transition-all duration-300 cursor-pointer">
                      {sub.name}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-[1360px] py-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Filters Sidebar */}
          <div className="w-full lg:w-[280px] shrink-0">
            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm p-6 sticky top-6">
              <div className="font-black text-lg text-slate-900 mb-6">
                Фильтры
              </div>
              <Suspense fallback={<div className="h-[400px] bg-slate-50 animate-pulse rounded-xl"></div>}>
                <CategoryFilters categorySlug={category.slug} districts={districts} />
              </Suspense>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Meta Panel: Count + Sort */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white rounded-2xl p-3 px-5 border border-slate-200/60 shadow-sm">
              <span className="font-bold text-slate-600">
                Показано <span className="text-slate-900">{executors.length}</span> из <span className="text-slate-900">{total}</span>
              </span>
              <Suspense>
                <SortDropdown />
              </Suspense>
            </div>

            {/* Grid */}
            {executors.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-16 text-center shadow-sm w-full">
                <div className="w-24 h-24 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 flex-shrink-0">
                  <Users className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Ничего не найдено</h2>
                <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">
                  Сбросьте фильтры или выберите другую <Link href="/categories" className="text-blue-600 hover:underline">категорию услуг</Link>.
                </p>
              </div>
            ) : (
              <>
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <PaginationControls
                      page={page}
                      totalPages={totalPages}
                      searchParams={searchParams}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

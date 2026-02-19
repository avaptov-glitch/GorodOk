import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { ExecutorCard } from '@/components/executor/executor-card'
import { CategoryFilters } from '@/components/search/category-filters'
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
import { Badge } from '@/components/ui/badge'
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
    if (params.priceFrom) servicePriceFilter.priceFrom = { gte: parseInt(params.priceFrom) * 100 }
    if (params.priceTo) servicePriceFilter.priceFrom = {
      ...(servicePriceFilter.priceFrom as Record<string, unknown>),
      lte: parseInt(params.priceTo) * 100,
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
      include: {
        user: { select: { name: true, avatarUrl: true } },
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
    <div className="container mx-auto px-4 py-8">
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
      {/* Хлебные крошки */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-foreground transition-colors">
          Главная
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <Link href="/categories" className="hover:text-foreground transition-colors">
          Категории
        </Link>
        {category.parent && (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link
              href={`/category/${category.parent.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {category.parent.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="text-foreground font-medium">{category.name}</span>
      </nav>

      {/* Заголовок */}
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{category.name}</h1>
        <p className="text-muted-foreground text-sm">
          {total > 0 ? `Найдено ${total} исполнителей` : 'Пока нет исполнителей в этой категории'}
        </p>
      </div>

      {/* Подкатегории */}
      {category.children.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {category.children.map((sub) => (
            <Link key={sub.id} href={`/category/${sub.slug}`}>
              <Badge
                variant="outline"
                className="cursor-pointer border-transparent text-foreground/60 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-colors text-sm py-1.5 px-3 font-normal"
              >
                {sub.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <div className="flex gap-6 items-start">
        {/* Фильтры (сайдбар / мобильный Sheet) */}
        <Suspense>
          <CategoryFilters categorySlug={category.slug} districts={districts} />
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
          {executors.length === 0 ? (
            <EmptyState
              icon={<Users className="h-16 w-16" />}
              title="Исполнителей не найдено"
              description="Попробуйте изменить фильтры или выбрать другую категорию"
            />
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

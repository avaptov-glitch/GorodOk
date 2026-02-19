import Link from 'next/link'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { TaskCard } from '@/components/task/task-card'
import { TaskFilters } from '@/components/task/task-filters'
import { TaskSortDropdown } from '@/components/task/task-sort-dropdown'
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
import { Button } from '@/components/ui/button'
import { ChevronRight, ClipboardList, Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Доска заданий',
  description: 'Задания от клиентов — откликайтесь и находите заказы на ГородОк',
}

const PAGE_SIZE = 12

type SearchParams = {
  category?: string
  district?: string
  budgetFrom?: string
  budgetTo?: string
  sort?: string
  page?: string
}

function buildWhere(params: SearchParams) {
  const where: Record<string, unknown> = {
    status: 'ACTIVE',
  }

  if (params.category) {
    where.categoryId = params.category
  }
  if (params.district) {
    where.district = params.district
  }
  if (params.budgetFrom || params.budgetTo) {
    const budgetFilter: Record<string, number> = {}
    if (params.budgetFrom) {
      budgetFilter.gte = parseInt(params.budgetFrom) * 100 // Рубли → копейки
    }
    if (params.budgetTo) {
      budgetFilter.lte = parseInt(params.budgetTo) * 100
    }
    where.budget = budgetFilter
  }

  return where
}

function buildOrderBy(sort: string) {
  switch (sort) {
    case 'budget_desc':
      return [{ budget: 'desc' as const }]
    case 'budget_asc':
      return [{ budget: 'asc' as const }]
    case 'responses_asc':
      return [{ responses: { _count: 'asc' as const } }]
    default:
      return [{ createdAt: 'desc' as const }]
  }
}

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
            {start > 2 && <PaginationEllipsis />}
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
            {end < totalPages - 1 && <PaginationEllipsis />}
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

export default async function TasksPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>
}) {
  const searchParams = await searchParamsPromise
  const where = buildWhere(searchParams)
  const orderBy = buildOrderBy(searchParams.sort ?? 'newest')
  const page = Math.max(1, parseInt(searchParams.page ?? '1'))
  const skip = (page - 1) * PAGE_SIZE

  const [tasks, total, categoriesRaw, districtsRaw] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      include: {
        client: { select: { name: true, avatarUrl: true } },
        category: { select: { name: true, slug: true } },
        _count: { select: { responses: true } },
      },
    }),
    prisma.task.count({ where }),
    prisma.category.findMany({
      where: { parentId: null },
      select: { id: true, name: true },
      orderBy: { order: 'asc' },
    }),
    prisma.task.findMany({
      where: { status: 'ACTIVE', district: { not: null } },
      select: { district: true },
      distinct: ['district'],
    }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const districts = districtsRaw
    .map((d) => d.district!)
    .filter(Boolean)
    .sort()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">
          Главная
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="text-foreground font-medium">Доска заданий</span>
      </nav>

      {/* Title + create button */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground">Доска заданий</h1>
        <Button asChild>
          <Link href="/tasks/create">
            <Plus className="h-4 w-4 mr-2" />
            Создать задание
          </Link>
        </Button>
      </div>

      {/* Layout: filters + content */}
      <div className="flex gap-6 items-start">
        <Suspense>
          <TaskFilters categories={categoriesRaw} districts={districts} />
        </Suspense>

        <div className="flex-1 min-w-0">
          {/* Sort + count */}
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <span className="text-sm text-muted-foreground">
              {tasks.length > 0 && `${skip + 1}–${Math.min(skip + tasks.length, total)} из ${total}`}
            </span>
            <Suspense>
              <TaskSortDropdown />
            </Suspense>
          </div>

          {/* Grid of cards */}
          {tasks.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-12 w-12" />}
              title="Заданий пока нет"
              description="Станьте первым — создайте задание, и исполнители откликнутся!"
              action={
                <Button asChild>
                  <Link href="/tasks/create">Создать задание</Link>
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    budget={task.budget}
                    district={task.district}
                    status={task.status}
                    createdAt={task.createdAt}
                    responsesCount={task._count.responses}
                    client={task.client}
                    category={task.category}
                  />
                ))}
              </div>

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

export const dynamic = 'force-dynamic'

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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Premium Hero Header */}
      <div className="bg-white border-b border-slate-200/60 pt-8 pb-10 mb-8">
        <div className="container mx-auto px-4 max-w-[1360px]">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-6">
            <Link href="/" className="hover:text-blue-600 transition-colors">Главная</Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="text-slate-900 font-bold">Доска заданий</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                Доска заданий
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl">
                Находите интересные заказы, предлагайте свои услуги и зарабатывайте вместе с «ГородОк».
              </p>
            </div>

            <Button asChild className="h-12 md:h-14 px-8 rounded-2xl text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-[1.02] shadow-xl shadow-blue-500/20 transition-all shrink-0">
              <Link href="/tasks/create">
                <Plus className="h-5 w-5 mr-2" />
                Создать задание
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-[1360px] py-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Filters Sidebar */}
          <div className="w-full lg:w-[280px] shrink-0">
            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm p-6 lg:sticky lg:top-[140px]">
              <Suspense>
                <TaskFilters categories={categoriesRaw} districts={districts} />
              </Suspense>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">

            {/* Meta bar */}
            <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm px-6 py-4 flex flex-wrap items-center justify-between gap-4 mb-8">
              <p className="font-bold text-slate-700">
                {total > 0 ? (
                  <>
                    Найдено <span className="text-blue-600">{total}</span> заданий
                  </>
                ) : (
                  'Задания не найдены'
                )}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-400 hidden sm:inline-block">Сортировка:</span>
                <Suspense>
                  <TaskSortDropdown />
                </Suspense>
              </div>
            </div>

            {/* Grid of cards */}
            {tasks.length === 0 ? (
              <EmptyState
                icon={<ClipboardList className="h-16 w-16 text-slate-300" />}
                title="Заданий пока нет"
                description="Станьте первым — создайте задание, и исполнители откликнутся!"
                action={
                  <Button asChild className="rounded-xl font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 h-11 px-6">
                    <Link href="/tasks/create">Создать задание</Link>
                  </Button>
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  <div className="mt-12 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-2 flex justify-center w-fit mx-auto">
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

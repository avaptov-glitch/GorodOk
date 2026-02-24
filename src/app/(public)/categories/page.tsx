export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { JsonLd } from '@/components/seo/json-ld'
import CategoriesClient from './client-page'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Все категории услуг | ГородОк',
  description:
    'Каталог профессионалов ГородОк. Выберите направление и найдите лучшего специалиста для своей задачи: репетиторы, мастера, автосервисы и другие профи.',
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: 'asc' },
    include: {
      children: {
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { executors: true } },
        },
      },
      _count: { select: { executors: true } },
    },
  })

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Все категории услуг',
          url: `${SITE_URL}/categories`,
        }}
      />
      <CategoriesClient categories={categories} />
    </>
  )
}

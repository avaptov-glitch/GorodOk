export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { getCategories } from '@/actions/admin'
import { CategoriesManager } from '@/components/admin/categories-manager'

export const metadata: Metadata = { title: 'Управление категориями | ГородОк' }

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">Управление категориями</h1>
      <p className="text-muted-foreground mb-6">
        Создание, редактирование и удаление категорий и подкатегорий услуг.
      </p>

      <CategoriesManager categories={categories} />
    </div>
  )
}

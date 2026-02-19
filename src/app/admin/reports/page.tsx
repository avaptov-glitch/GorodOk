export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { getReportedReviews, getDisputedOrders } from '@/actions/admin'
import { ReportsManager } from '@/components/admin/reports-manager'

export const metadata: Metadata = { title: 'Жалобы и споры | ГородОк' }

export default async function ReportsPage() {
  const [reviews, orders] = await Promise.all([
    getReportedReviews(),
    getDisputedOrders(),
  ])

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-foreground mb-2">Жалобы и споры</h1>
      <p className="text-muted-foreground mb-6">
        Модерация отзывов и разрешение споров по заказам.
      </p>

      <ReportsManager reviews={reviews} orders={orders} />
    </div>
  )
}

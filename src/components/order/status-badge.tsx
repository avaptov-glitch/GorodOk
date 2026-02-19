import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/types'

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  NEW: { label: 'Новая', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  DISCUSSION: { label: 'Обсуждение', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  ACCEPTED: { label: 'Принята', className: 'bg-green-100 text-green-700 border-green-200' },
  IN_PROGRESS: { label: 'В работе', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  COMPLETED: { label: 'Выполнена', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Отменена', className: 'bg-red-100 text-red-700 border-red-200' },
  DISPUTED: { label: 'Спор', className: 'bg-orange-100 text-orange-700 border-orange-200' },
}

interface StatusBadgeProps {
  status: OrderStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: '' }
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

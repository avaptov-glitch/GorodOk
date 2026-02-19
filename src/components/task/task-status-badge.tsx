import { Badge } from '@/components/ui/badge'
import type { TaskStatus } from '@/types'

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Активно', className: 'bg-green-100 text-green-700 border-green-200' },
  IN_PROGRESS: { label: 'В работе', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  COMPLETED: { label: 'Выполнено', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Отменено', className: 'bg-red-100 text-red-700 border-red-200' },
}

interface TaskStatusBadgeProps {
  status: TaskStatus
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: '' }
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}

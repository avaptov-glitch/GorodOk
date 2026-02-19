'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { updateTaskStatus } from '@/actions/tasks'
import type { TaskStatus } from '@/types'

interface TaskStatusActionsProps {
  taskId: string
  currentStatus: TaskStatus
}

export function TaskStatusActions({ taskId, currentStatus }: TaskStatusActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleAction(status: 'COMPLETED' | 'CANCELLED') {
    startTransition(async () => {
      const result = await updateTaskStatus({ taskId, status })
      if (result.success) {
        router.refresh()
      }
    })
  }

  if (currentStatus === 'ACTIVE') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAction('CANCELLED')}
        disabled={isPending}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
      >
        {isPending ? 'Отмена...' : 'Отменить'}
      </Button>
    )
  }

  if (currentStatus === 'IN_PROGRESS') {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => handleAction('COMPLETED')}
          disabled={isPending}
        >
          {isPending ? 'Завершение...' : 'Завершить'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleAction('CANCELLED')}
          disabled={isPending}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          Отменить
        </Button>
      </div>
    )
  }

  return null
}

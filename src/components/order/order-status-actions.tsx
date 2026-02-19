'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { updateOrderStatus } from '@/actions/orders'
import { useToast } from '@/hooks/use-toast'
import type { OrderStatus } from '@/types'

type TargetStatus = 'ACCEPTED' | 'CANCELLED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISCUSSION' | 'DISPUTED'

interface OrderStatusActionsProps {
  orderId: string
  currentStatus: OrderStatus
  userRole: 'CLIENT' | 'EXECUTOR'
}

export function OrderStatusActions({ orderId, currentStatus, userRole }: OrderStatusActionsProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  function handleAction(newStatus: TargetStatus) {
    startTransition(async () => {
      const result = await updateOrderStatus({ orderId, status: newStatus })
      if (!result.success) {
        toast({ title: 'Ошибка', description: result.error, variant: 'destructive' })
      } else {
        toast({ title: 'Статус обновлён' })
      }
    })
  }

  if (userRole === 'EXECUTOR') {
    if (currentStatus === 'NEW' || currentStatus === 'DISCUSSION') {
      return (
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => handleAction('ACCEPTED')} disabled={isPending}>
            Принять
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleAction('CANCELLED')}
            disabled={isPending}
          >
            Отклонить
          </Button>
        </div>
      )
    }
    if (currentStatus === 'ACCEPTED') {
      return (
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => handleAction('IN_PROGRESS')} disabled={isPending}>
            Начать работу
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction('CANCELLED')}
            disabled={isPending}
          >
            Отменить
          </Button>
        </div>
      )
    }
    if (currentStatus === 'IN_PROGRESS') {
      return (
        <Button size="sm" onClick={() => handleAction('COMPLETED')} disabled={isPending}>
          Отметить выполненной
        </Button>
      )
    }
  }

  if (userRole === 'CLIENT') {
    if (currentStatus === 'NEW' || currentStatus === 'DISCUSSION' || currentStatus === 'ACCEPTED' || currentStatus === 'IN_PROGRESS') {
      return (
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
          onClick={() => handleAction('CANCELLED')}
          disabled={isPending}
        >
          Отменить заявку
        </Button>
      )
    }
  }

  return null
}

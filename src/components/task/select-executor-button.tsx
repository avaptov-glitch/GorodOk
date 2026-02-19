'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { selectExecutor } from '@/actions/tasks'
import { UserCheck } from 'lucide-react'

interface SelectExecutorButtonProps {
  taskId: string
  responseId: string
  executorName: string
}

export function SelectExecutorButton({
  taskId,
  responseId,
  executorName,
}: SelectExecutorButtonProps) {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSelect() {
    setErrorMessage(null)
    startTransition(async () => {
      const result = await selectExecutor({ taskId, responseId })
      if (result.success) {
        router.refresh()
      } else {
        setErrorMessage(result.error ?? 'Произошла ошибка')
      }
    })
  }

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" className="gap-1.5">
            <UserCheck className="h-3.5 w-3.5" />
            Выбрать
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Выбрать исполнителя?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы выбираете <strong>{executorName}</strong> для выполнения задания.
              Будет создана заявка, и исполнитель получит уведомление.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleSelect} disabled={isPending}>
              {isPending ? 'Создание заявки...' : 'Подтвердить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {errorMessage && (
        <p className="text-xs text-destructive mt-1">{errorMessage}</p>
      )}
    </>
  )
}

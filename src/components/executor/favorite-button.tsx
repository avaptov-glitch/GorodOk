'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleFavorite } from '@/actions/favorites'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  executorId: string
  initialIsFavorited: boolean
}

export function FavoriteButton({ executorId, initialIsFavorited }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    // Оптимистичное обновление UI до ответа сервера
    setIsFavorited((prev) => !prev)
    startTransition(async () => {
      const result = await toggleFavorite(executorId)
      if (!result.success) {
        // Откатываем при ошибке
        setIsFavorited((prev) => !prev)
      } else if (result.data) {
        setIsFavorited(result.data.isFavorited)
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="lg"
      className={cn(
        'w-full sm:w-auto gap-2',
        isFavorited && 'border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-600'
      )}
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorited ? 'Убрать из избранного' : 'Добавить в избранное'}
    >
      <Heart className={cn('h-4 w-4', isFavorited && 'fill-rose-500 text-rose-500')} />
      {isFavorited ? 'В избранном' : 'В избранное'}
    </Button>
  )
}

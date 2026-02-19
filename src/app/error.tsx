'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Что-то пошло не так
        </h2>
        <p className="text-muted-foreground mb-8">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу или
          вернуться на главную.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Попробовать снова
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              На главную
            </Link>
          </Button>
        </div>
        {error.digest && (
          <p className="text-xs text-muted-foreground mt-6">
            Код ошибки: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}

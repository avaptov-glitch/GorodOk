import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function ExecutorProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Хлебные крошки */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Hero */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <Skeleton className="h-24 w-24 rounded-full shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="flex gap-2 items-center">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-4 rounded-full" />
                ))}
                <Skeleton className="h-4 w-20 ml-1" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex gap-3 pt-1">
                <Skeleton className="h-10 w-40 rounded-md" />
                <Skeleton className="h-10 w-36 rounded-md" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Табы */}
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-md" />
        ))}
      </div>

      {/* Контент таба */}
      <div className="grid gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-5 w-24 shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

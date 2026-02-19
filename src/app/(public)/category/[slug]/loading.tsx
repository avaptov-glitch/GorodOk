import { Skeleton } from '@/components/ui/skeleton'

function ExecutorCardSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex gap-3">
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        <Skeleton className="h-3 w-2/5" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export default function CategoryLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Title skeleton */}
      <div className="mb-5 space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar skeleton */}
        <div className="hidden lg:block w-60 shrink-0">
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>

        {/* Grid skeleton */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-48 rounded-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ExecutorCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { SlidersHorizontal, X } from 'lucide-react'

interface TaskFiltersProps {
  categories: Array<{ id: string; name: string }>
  districts: string[]
}

const FILTER_KEYS = ['category', 'district', 'budgetFrom', 'budgetTo']

function TaskFiltersContent({ categories, districts }: TaskFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const clearAll = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  const hasFilters = FILTER_KEYS.some((k) => searchParams.has(k))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">Фильтры</h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-muted-foreground h-7 px-2"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Сбросить
          </Button>
        )}
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <>
          <div>
            <p className="text-sm font-medium mb-2.5">Категория</p>
            <RadioGroup
              value={searchParams.get('category') ?? ''}
              onValueChange={(v) => updateParam('category', v || null)}
            >
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={cat.id} id={`cat-${cat.id}`} />
                  <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer font-normal">
                    {cat.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <Separator />
        </>
      )}

      {/* Budget range */}
      <div>
        <p className="text-sm font-medium mb-2.5">Бюджет (₽)</p>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="От"
            defaultValue={searchParams.get('budgetFrom') ?? ''}
            onBlur={(e) => updateParam('budgetFrom', e.target.value || null)}
            className="h-8 text-sm"
            min={0}
          />
          <Input
            type="number"
            placeholder="До"
            defaultValue={searchParams.get('budgetTo') ?? ''}
            onBlur={(e) => updateParam('budgetTo', e.target.value || null)}
            className="h-8 text-sm"
            min={0}
          />
        </div>
      </div>

      <Separator />

      {/* District */}
      {districts.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2.5">Район</p>
          <RadioGroup
            value={searchParams.get('district') ?? ''}
            onValueChange={(v) => updateParam('district', v || null)}
          >
            {districts.map((d) => (
              <div key={d} className="flex items-center space-x-2">
                <RadioGroupItem value={d} id={`district-${d}`} />
                <Label htmlFor={`district-${d}`} className="cursor-pointer font-normal">
                  {d}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}
    </div>
  )
}

export function TaskFilters({ categories, districts }: TaskFiltersProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 shrink-0">
        <div className="sticky top-24 bg-card rounded-xl border border-border p-5 shadow-sm">
          <TaskFiltersContent categories={categories} districts={districts} />
        </div>
      </aside>

      {/* Mobile sheet trigger */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Фильтры
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Фильтры</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <TaskFiltersContent categories={categories} districts={districts} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

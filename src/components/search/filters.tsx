'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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

interface FiltersProps {
  districts: string[]
}

const RATING_OPTIONS = [
  { value: '4.8', label: 'От 4.8 ★' },
  { value: '4.5', label: 'От 4.5 ★' },
  { value: '4.0', label: 'От 4.0 ★' },
]

const EXPERIENCE_OPTIONS = [
  { value: '1', label: 'От 1 года' },
  { value: '3', label: 'От 3 лет' },
  { value: '5', label: 'От 5 лет' },
]

const FILTER_KEYS = [
  'rating',
  'priceFrom',
  'priceTo',
  'district',
  'hasPortfolio',
  'isVerified',
  'minExperience',
  'online',
  'travelsToClient',
  'acceptsAtOwnPlace',
]

function FiltersContent({ districts }: FiltersProps) {
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

  const toggleBoolParam = useCallback(
    (key: string) => {
      const current = searchParams.get(key)
      updateParam(key, current ? null : '1')
    },
    [searchParams, updateParam]
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

      {/* Rating */}
      <div>
        <p className="text-sm font-medium mb-2.5">Рейтинг</p>
        <RadioGroup
          value={searchParams.get('rating') ?? ''}
          onValueChange={(v) => updateParam('rating', v || null)}
        >
          {RATING_OPTIONS.map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2">
              <RadioGroupItem value={opt.value} id={`rating-${opt.value}`} />
              <Label htmlFor={`rating-${opt.value}`} className="cursor-pointer font-normal">
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {/* Price range */}
      <div>
        <p className="text-sm font-medium mb-2.5">Цена (₽)</p>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="От"
            defaultValue={searchParams.get('priceFrom') ?? ''}
            onBlur={(e) => updateParam('priceFrom', e.target.value || null)}
            className="h-8 text-sm"
            min={0}
          />
          <Input
            type="number"
            placeholder="До"
            defaultValue={searchParams.get('priceTo') ?? ''}
            onBlur={(e) => updateParam('priceTo', e.target.value || null)}
            className="h-8 text-sm"
            min={0}
          />
        </div>
      </div>

      <Separator />

      {/* District */}
      {districts.length > 0 && (
        <>
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
          <Separator />
        </>
      )}

      {/* Experience */}
      <div>
        <p className="text-sm font-medium mb-2.5">Опыт</p>
        <RadioGroup
          value={searchParams.get('minExperience') ?? ''}
          onValueChange={(v) => updateParam('minExperience', v || null)}
        >
          {EXPERIENCE_OPTIONS.map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2">
              <RadioGroupItem value={opt.value} id={`exp-${opt.value}`} />
              <Label htmlFor={`exp-${opt.value}`} className="cursor-pointer font-normal">
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {/* Checkboxes */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isVerified"
            checked={searchParams.get('isVerified') === '1'}
            onCheckedChange={() => toggleBoolParam('isVerified')}
          />
          <Label htmlFor="isVerified" className="cursor-pointer font-normal">
            Верифицированные
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasPortfolio"
            checked={searchParams.get('hasPortfolio') === '1'}
            onCheckedChange={() => toggleBoolParam('hasPortfolio')}
          />
          <Label htmlFor="hasPortfolio" className="cursor-pointer font-normal">
            С портфолио
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="online"
            checked={searchParams.get('online') === '1'}
            onCheckedChange={() => toggleBoolParam('online')}
          />
          <Label htmlFor="online" className="cursor-pointer font-normal">
            Работает онлайн
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="travelsToClient"
            checked={searchParams.get('travelsToClient') === '1'}
            onCheckedChange={() => toggleBoolParam('travelsToClient')}
          />
          <Label htmlFor="travelsToClient" className="cursor-pointer font-normal">
            Выезд на дом
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="acceptsAtOwnPlace"
            checked={searchParams.get('acceptsAtOwnPlace') === '1'}
            onCheckedChange={() => toggleBoolParam('acceptsAtOwnPlace')}
          />
          <Label htmlFor="acceptsAtOwnPlace" className="cursor-pointer font-normal">
            Принимает у себя
          </Label>
        </div>
      </div>
    </div>
  )
}

export function Filters({ districts }: FiltersProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 shrink-0">
        <div className="sticky top-24 bg-card rounded-xl border border-border p-5 shadow-sm">
          <FiltersContent districts={districts} />
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
              <FiltersContent districts={districts} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

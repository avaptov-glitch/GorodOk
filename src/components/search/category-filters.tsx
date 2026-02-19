'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SlidersHorizontal, X } from 'lucide-react'
import { type FilterModule } from '@/config/filter-modules'
import { getEffectiveFilters } from '@/config/category-filters'

interface CategoryFiltersProps {
  categorySlug: string
  districts?: string[]
}

// ============================================================
// Рендер одного модуля фильтра
// ============================================================

function FilterModuleRenderer({
  module,
  value,
  onChange,
}: {
  module: FilterModule
  value: string | null
  onChange: (val: string | null) => void
}) {
  const { ui, label, options, hint } = module

  // --- SELECT (enum → select) ---
  if (ui === 'select') {
    return (
      <div>
        <p className="text-sm font-medium mb-2">{label}</p>
        <Select
          value={value ?? ''}
          onValueChange={(v) => onChange(v || null)}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder={`Выберите...`} />
          </SelectTrigger>
          <SelectContent>
            {(options ?? []).map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
            className="text-muted-foreground h-6 px-1.5 mt-1 text-xs"
          >
            <X className="h-3 w-3 mr-0.5" />
            Сбросить
          </Button>
        )}
      </div>
    )
  }

  // --- CHIPS (multi → chips) ---
  if (ui === 'chips') {
    const selected = value ? value.split(',') : []
    const toggle = (opt: string) => {
      const next = selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
      onChange(next.length > 0 ? next.join(',') : null)
    }
    return (
      <div>
        <p className="text-sm font-medium mb-2">{label}</p>
        <div className="flex flex-wrap gap-1.5">
          {(options ?? []).map((opt) => {
            const isActive = selected.includes(opt)
            return (
              <Badge
                key={opt}
                variant={isActive ? 'default' : 'outline'}
                className={`cursor-pointer text-xs py-1 px-2.5 font-normal transition-colors ${
                  isActive
                    ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
                    : 'hover:bg-muted'
                }`}
                onClick={() => toggle(opt)}
              >
                {opt}
              </Badge>
            )
          })}
        </div>
      </div>
    )
  }

  // --- CHECKBOXES (multi → checkboxes) ---
  if (ui === 'checkboxes') {
    const selected = value ? value.split(',') : []
    const toggle = (opt: string) => {
      const next = selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
      onChange(next.length > 0 ? next.join(',') : null)
    }
    return (
      <div>
        <p className="text-sm font-medium mb-2">{label}</p>
        <div className="space-y-2">
          {(options ?? []).map((opt) => (
            <div key={opt} className="flex items-center space-x-2">
              <Checkbox
                id={`${module.id}-${opt}`}
                checked={selected.includes(opt)}
                onCheckedChange={() => toggle(opt)}
              />
              <Label
                htmlFor={`${module.id}-${opt}`}
                className="cursor-pointer font-normal text-sm"
              >
                {opt}
              </Label>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --- TOGGLE ---
  if (ui === 'toggle') {
    const isOn = value === '1'
    return (
      <div className="flex items-center justify-between">
        <Label htmlFor={module.id} className="cursor-pointer font-normal text-sm">
          {label}
        </Label>
        <Switch
          id={module.id}
          checked={isOn}
          onCheckedChange={(checked) => onChange(checked ? '1' : null)}
        />
      </div>
    )
  }

  // --- SLIDER (range) ---
  if (ui === 'slider') {
    // Для range используем два поля: {id}_from и {id}_to
    // value не используется напрямую, вместо этого работаем через onChange двух ключей
    return <RangeFilter module={module} />
  }

  // --- TEXT ---
  if (ui === 'text') {
    return (
      <div>
        <p className="text-sm font-medium mb-2">{label}</p>
        <Input
          type="text"
          placeholder={hint ?? `${label}...`}
          defaultValue={value ?? ''}
          onBlur={(e) => onChange(e.target.value || null)}
          className="h-8 text-sm"
        />
      </div>
    )
  }

  return null
}

// Отдельный компонент для range, т.к. он работает с двумя search params
function RangeFilter({ module }: { module: FilterModule }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const fromKey = `${module.id}_from`
  const toKey = `${module.id}_to`

  const updateRange = useCallback(
    (key: string, val: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (val) {
        params.set(key, val)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div>
      <p className="text-sm font-medium mb-2">{module.label}</p>
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="От"
          defaultValue={searchParams.get(fromKey) ?? ''}
          onBlur={(e) => updateRange(fromKey, e.target.value || null)}
          className="h-8 text-sm"
          min={0}
        />
        <Input
          type="number"
          placeholder="До"
          defaultValue={searchParams.get(toKey) ?? ''}
          onBlur={(e) => updateRange(toKey, e.target.value || null)}
          className="h-8 text-sm"
          min={0}
        />
      </div>
      {module.hint && (
        <p className="text-xs text-muted-foreground mt-1">{module.hint}</p>
      )}
    </div>
  )
}

// ============================================================
// Основной контент фильтров
// ============================================================

function FiltersContent({ categorySlug, districts }: CategoryFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const modules = getEffectiveFilters(categorySlug)

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

  // Проверяем, есть ли активные фильтры (кроме sort и page)
  const hasFilters = Array.from(searchParams.entries()).some(
    ([k]) => k !== 'sort' && k !== 'page'
  )

  // Подставляем опции для GEO_DISTRICT динамически
  const modulesWithDistricts = modules.map((m) => {
    if (m.id === 'GEO_DISTRICT' && districts && districts.length > 0) {
      return { ...m, options: districts }
    }
    return m
  })

  // Разделяем на глобальные и специфичные
  const GLOBAL_IDS = new Set([
    'GEO_CITY', 'GEO_DISTRICT', 'SERVICE_MODE', 'PRICE_RANGE',
    'AVAILABILITY', 'URGENCY', 'RATING_MIN', 'REVIEWS_ONLY',
    'EXPERIENCE_YEARS', 'VERIFIED', 'PAYMENT_METHOD',
  ])
  const globalModules = modulesWithDistricts.filter((m) => GLOBAL_IDS.has(m.id))
  const specificModules = modulesWithDistricts.filter((m) => !GLOBAL_IDS.has(m.id))

  return (
    <div className="space-y-4">
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

      {/* Глобальные фильтры */}
      {globalModules.map((mod) => (
        <div key={mod.id}>
          <FilterModuleRenderer
            module={mod}
            value={searchParams.get(mod.id)}
            onChange={(val) => updateParam(mod.id, val)}
          />
        </div>
      ))}

      {/* Разделитель, если есть специфичные */}
      {specificModules.length > 0 && (
        <>
          <Separator />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Параметры категории
          </p>
        </>
      )}

      {/* Специфичные фильтры категории */}
      {specificModules.map((mod) => (
        <div key={mod.id}>
          <FilterModuleRenderer
            module={mod}
            value={searchParams.get(mod.id)}
            onChange={(val) => updateParam(mod.id, val)}
          />
        </div>
      ))}
    </div>
  )
}

// ============================================================
// Экспорт: адаптивный компонент (десктоп-сайдбар + мобайл-sheet)
// ============================================================

export function CategoryFilters({ categorySlug, districts }: CategoryFiltersProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 bg-card rounded-xl border border-border p-5 shadow-sm max-h-[calc(100vh-7rem)] overflow-y-auto">
          <FiltersContent categorySlug={categorySlug} districts={districts} />
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
              <FiltersContent categorySlug={categorySlug} districts={districts} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

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
        <p className="text-sm font-bold text-slate-800 mb-3">{label}</p>
        <Select
          value={value ?? ''}
          onValueChange={(v) => onChange(v || null)}
        >
          <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-transparent hover:bg-slate-100 transition-colors text-sm font-medium">
            <SelectValue placeholder={`Выберите...`} />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-lg border-slate-100">
            {(options ?? []).map((opt) => (
              <SelectItem key={opt} value={opt} className="rounded-lg cursor-pointer">
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
            className="text-slate-400 hover:text-rose-600 h-6 px-2 mt-2 text-xs font-semibold"
          >
            <X className="h-3 w-3 mr-1" />
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
        <p className="text-sm font-bold text-slate-800 mb-3">{label}</p>
        <div className="flex flex-wrap gap-2">
          {(options ?? []).map((opt) => {
            const isActive = selected.includes(opt)
            return (
              <Badge
                key={opt}
                variant={isActive ? 'default' : 'outline'}
                className={`cursor-pointer text-xs py-1.5 px-3 font-semibold transition-all duration-300 rounded-lg ${isActive
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm ring-2 ring-blue-600/20 ring-offset-1'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-transparent'
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
        <p className="text-sm font-bold text-slate-800 mb-3">{label}</p>
        <div className="space-y-3">
          {(options ?? []).map((opt) => (
            <div key={opt} className="flex items-center space-x-3 group">
              <Checkbox
                id={`${module.id}-${opt}`}
                checked={selected.includes(opt)}
                onCheckedChange={() => toggle(opt)}
                className="rounded-md border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-colors"
              />
              <Label
                htmlFor={`${module.id}-${opt}`}
                className="cursor-pointer font-medium text-sm text-slate-600 group-hover:text-slate-900 transition-colors"
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
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
        <div>
          <Label htmlFor={module.id} className="cursor-pointer font-bold text-sm text-slate-800">
            {label}
          </Label>
          {hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}
        </div>
        <Switch
          id={module.id}
          checked={isOn}
          onCheckedChange={(checked) => onChange(checked ? '1' : null)}
          className="data-[state=checked]:bg-blue-600"
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
        <p className="text-sm font-bold text-slate-800 mb-3">{label}</p>
        <Input
          type="text"
          placeholder={hint ?? `${label}...`}
          defaultValue={value ?? ''}
          onBlur={(e) => onChange(e.target.value || null)}
          className="h-11 rounded-xl bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
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
      <p className="text-sm font-bold text-slate-800 mb-3">{module.label}</p>
      <div className="flex gap-3">
        <Input
          type="number"
          placeholder="От"
          defaultValue={searchParams.get(fromKey) ?? ''}
          onBlur={(e) => updateRange(fromKey, e.target.value || null)}
          className="h-11 rounded-xl bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
          min={0}
        />
        <div className="hidden sm:flex items-center text-slate-300">-</div>
        <Input
          type="number"
          placeholder="До"
          defaultValue={searchParams.get(toKey) ?? ''}
          onBlur={(e) => updateRange(toKey, e.target.value || null)}
          className="h-11 rounded-xl bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium"
          min={0}
        />
      </div>
      {module.hint && (
        <p className="text-xs text-slate-500 font-medium mt-2">{module.hint}</p>
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
    <div className="space-y-6">
      {/* Header moved to parent (CategoryPage / SearchPage) but we keep Reset here */}
      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAll}
          className="w-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 border-slate-200/60 rounded-xl transition-all"
        >
          <X className="h-4 w-4 mr-2" />
          Сбросить все фильтры
        </Button>
      )}

      <div className="space-y-6">
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
            <Separator className="bg-slate-100" />
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
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
      {/* NOTE: The outer Card styling (rounded-2xl, shadow, border) is now handled by the parent layout page.tsx so this component can be embedded cleanly anywhere. */}
      <aside className="hidden lg:block w-full">
        <FiltersContent categorySlug={categorySlug} districts={districts} />
      </aside>

      {/* Mobile sheet trigger */}
      <div className="lg:hidden w-full">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full gap-2 rounded-xl h-12 border-slate-200/60 shadow-sm hover:bg-slate-50 font-semibold text-slate-700">
              <SlidersHorizontal className="h-5 w-5 text-blue-600" />
              Фильтры и сортировка
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[340px] sm:w-[400px] overflow-y-auto bg-white border-r-slate-200/60 p-6 rounded-r-[2rem]">
            <SheetHeader className="mb-6 text-left">
              <SheetTitle className="text-2xl font-bold text-slate-900">Фильтры</SheetTitle>
            </SheetHeader>
            <FiltersContent categorySlug={categorySlug} districts={districts} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

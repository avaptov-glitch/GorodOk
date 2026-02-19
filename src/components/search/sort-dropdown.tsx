'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Рекомендуемые' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'reviews', label: 'По отзывам' },
  { value: 'priceAsc', label: 'Цена: по возрастанию' },
  { value: 'priceDesc', label: 'Цена: по убыванию' },
  { value: 'newest', label: 'Новые' },
]

export function SortDropdown() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('sort') ?? 'recommended'

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'recommended') {
      params.delete('sort')
    } else {
      params.set('sort', value)
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Сортировка" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

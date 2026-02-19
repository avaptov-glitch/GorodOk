'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ClipboardList, ArrowRight } from 'lucide-react'

interface QuickTaskFormProps {
  categories: Array<{
    id: string
    name: string
    children: Array<{ id: string; name: string }>
  }>
}

export function QuickTaskForm({ categories }: QuickTaskFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim() || title.trim().length < 8) {
      setError('Опишите задачу (минимум 8 символов)')
      return
    }

    const params = new URLSearchParams()
    params.set('title', title.trim())
    if (categoryId) params.set('categoryId', categoryId)

    const targetUrl = `/tasks/create?${params.toString()}`

    if (session?.user) {
      router.push(targetUrl)
    } else {
      router.push(`/login?callbackUrl=${encodeURIComponent(targetUrl)}`)
    }
  }

  return (
    <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <ClipboardList className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg leading-tight">Опишите задачу</h3>
          <p className="text-xs text-muted-foreground">Специалисты пришлют предложения с ценой</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Что нужно сделать?"
          className="h-11 text-base"
        />

        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Категория (необязательно)" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((parent) => (
              <SelectGroup key={parent.id}>
                <SelectLabel>{parent.name}</SelectLabel>
                {parent.children.length > 0 ? (
                  parent.children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value={parent.id}>{parent.name}</SelectItem>
                )}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full h-11 gap-2">
          Найти специалистов
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

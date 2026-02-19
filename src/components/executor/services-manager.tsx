'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  createService,
  updateService,
  deleteService,
  toggleServiceActive,
} from '@/actions/executor'
import type { Category, Service } from '@/types'

type ServiceWithCategory = Service & { category: Category }

interface ServicesManagerProps {
  services: ServiceWithCategory[]
  categories: Category[]
}

const PRICE_TYPE_LABELS: Record<string, string> = {
  FIXED: 'Фиксированная',
  FROM: 'От N рублей',
  RANGE: 'Диапазон цен',
  NEGOTIABLE: 'По договорённости',
  PER_HOUR: 'За час',
}

const formSchema = z.object({
  categoryId: z.string().min(1, 'Выберите категорию'),
  name: z.string().min(2, 'Минимум 2 символа').max(200),
  description: z.string().max(500).optional(),
  priceType: z.enum(['FIXED', 'FROM', 'RANGE', 'NEGOTIABLE', 'PER_HOUR']),
  priceFrom: z.coerce.number().int().min(0, 'Цена не может быть отрицательной'),
  priceTo: z.coerce.number().int().min(0).optional(),
})

type FormValues = z.infer<typeof formSchema>

function formatPrice(service: Service): string {
  const from = Math.round(service.priceFrom / 100)
  const to = service.priceTo ? Math.round(service.priceTo / 100) : null
  switch (service.priceType) {
    case 'FIXED':
      return `${from.toLocaleString('ru-RU')} ₽`
    case 'FROM':
      return `от ${from.toLocaleString('ru-RU')} ₽`
    case 'RANGE':
      return to
        ? `${from.toLocaleString('ru-RU')} – ${to.toLocaleString('ru-RU')} ₽`
        : `от ${from.toLocaleString('ru-RU')} ₽`
    case 'NEGOTIABLE':
      return 'По договорённости'
    case 'PER_HOUR':
      return `${from.toLocaleString('ru-RU')} ₽/час`
    default:
      return ''
  }
}

const EMPTY_FORM: FormValues = {
  categoryId: '',
  name: '',
  description: '',
  priceType: 'FROM',
  priceFrom: 0,
  priceTo: undefined,
}

export function ServicesManager({ services, categories }: ServicesManagerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceWithCategory | null>(null)

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Zod v4 coerce types incompatible with RHF
    resolver: zodResolver(formSchema) as any,
    defaultValues: EMPTY_FORM,
  })

  const priceType = form.watch('priceType')

  function openAdd() {
    setEditingService(null)
    form.reset(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(service: ServiceWithCategory) {
    setEditingService(service)
    form.reset({
      categoryId: service.categoryId,
      name: service.name,
      description: service.description ?? '',
      priceType: service.priceType as FormValues['priceType'],
      priceFrom: Math.round(service.priceFrom / 100),
      priceTo: service.priceTo ? Math.round(service.priceTo / 100) : undefined,
    })
    setDialogOpen(true)
  }

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = editingService
        ? await updateService(editingService.id, values)
        : await createService(values)

      if (!result.success) {
        toast({ variant: 'destructive', title: 'Ошибка', description: result.error })
        return
      }

      toast({ title: editingService ? 'Услуга обновлена' : 'Услуга добавлена' })
      setDialogOpen(false)
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteService(id)
      setDeletingId(null)
      if (!result.success) {
        toast({ variant: 'destructive', title: 'Ошибка', description: result.error })
      } else {
        toast({ title: 'Услуга удалена' })
        router.refresh()
      }
    })
  }

  function handleToggle(service: ServiceWithCategory) {
    setTogglingId(service.id)
    startTransition(async () => {
      const result = await toggleServiceActive(service.id, !service.isActive)
      setTogglingId(null)
      if (!result.success) {
        toast({ variant: 'destructive', title: 'Ошибка', description: result.error })
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd} disabled={isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить услугу
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground font-medium">Пока нет услуг</p>
          <Button variant="link" onClick={openAdd} className="mt-1">
            Добавить первую услугу
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between gap-3 p-4 bg-card rounded-xl border border-border"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground truncate">{service.name}</span>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {service.category.name}
                  </Badge>
                  {!service.isActive && (
                    <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
                      Скрыта
                    </Badge>
                  )}
                </div>
                {service.description && (
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">
                    {service.description}
                  </p>
                )}
                <p className="text-sm font-semibold text-primary mt-1">{formatPrice(service)}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Скрыть / Показать */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title={service.isActive ? 'Скрыть услугу' : 'Показать услугу'}
                  disabled={isPending || togglingId === service.id}
                  onClick={() => handleToggle(service)}
                >
                  {togglingId === service.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : service.isActive ? (
                    <Eye className="h-4 w-4 text-primary" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>

                {/* Редактировать */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={isPending}
                  onClick={() => openEdit(service)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                {/* Удалить */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  disabled={isPending || deletingId === service.id}
                  onClick={() => handleDelete(service.id)}
                >
                  {deletingId === service.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Диалог добавления / редактирования */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Редактировать услугу' : 'Новая услуга'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Категория */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Категория</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Название */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название услуги</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Например: Подготовка к ЕГЭ по математике"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Описание */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание (необязательно)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Подробности об услуге..."
                        rows={2}
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Тип цены */}
              <FormField
                control={form.control}
                name="priceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Тип цены</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PRICE_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Цены (скрываем если NEGOTIABLE) */}
              {priceType !== 'NEGOTIABLE' && (
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="priceFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {priceType === 'RANGE' ? 'Цена от (₽)' : priceType === 'PER_HOUR' ? 'Цена за час (₽)' : 'Цена (₽)'}
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min={0} disabled={isPending} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {priceType === 'RANGE' && (
                    <FormField
                      control={form.control}
                      name="priceTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Цена до (₽)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              disabled={isPending}
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) =>
                                field.onChange(e.target.value === '' ? undefined : e.target.value)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isPending}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingService ? 'Сохранить' : 'Добавить'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

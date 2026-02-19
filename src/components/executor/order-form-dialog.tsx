'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { createOrder } from '@/actions/orders'

type ServiceOption = {
  id: string
  name: string
}

const formSchema = z.object({
  serviceId: z.string().optional(),
  description: z
    .string()
    .min(10, 'Опишите задачу подробнее (не менее 10 символов)')
    .max(1000, 'Описание слишком длинное (не более 1000 символов)'),
  budgetStr: z
    .string()
    .optional()
    .refine(
      (v) => !v || (/^\d+$/.test(v.trim()) && parseInt(v.trim()) > 0),
      'Введите корректный бюджет в рублях'
    ),
})

type FormValues = z.infer<typeof formSchema>

interface OrderFormDialogProps {
  executorId: string
  executorName: string
  services: ServiceOption[]
}

export function OrderFormDialog({ executorId, executorName, services }: OrderFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { serviceId: '', description: '', budgetStr: '' },
  })

  function onSubmit(values: FormValues) {
    setErrorMessage(null)
    startTransition(async () => {
      const result = await createOrder({
        executorId,
        serviceId: values.serviceId || undefined,
        description: values.description,
        budget: values.budgetStr ? parseInt(values.budgetStr.trim()) : undefined,
      })

      if (result.success) {
        setSuccessMessage('Заявка успешно отправлена! Исполнитель свяжется с вами.')
        form.reset()
      } else {
        setErrorMessage(result.error ?? 'Произошла ошибка')
      }
    })
  }

  function handleOpenChange(val: boolean) {
    setOpen(val)
    if (!val) {
      setSuccessMessage(null)
      setErrorMessage(null)
      form.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          Оставить заявку
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Заявка исполнителю</DialogTitle>
          <DialogDescription>
            Опишите вашу задачу для <strong>{executorName}</strong>
          </DialogDescription>
        </DialogHeader>

        {successMessage ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 text-sm">
              {successMessage}
            </div>
            <Button onClick={() => handleOpenChange(false)} className="w-full">
              Закрыть
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Выбор услуги */}
              {services.length > 0 && (
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Услуга (необязательно)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите услугу..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {services.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Описание задачи */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание задачи *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Опишите, что нужно сделать, в какие сроки и другие детали..."
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Бюджет */}
              <FormField
                control={form.control}
                name="budgetStr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Бюджет, ₽ (необязательно)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} placeholder="Например: 5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {errorMessage && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  {errorMessage}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Отправка...' : 'Отправить заявку'}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

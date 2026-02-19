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
  FormDescription,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { respondToTask } from '@/actions/tasks'
import { Send } from 'lucide-react'

const formSchema = z.object({
  message: z
    .string()
    .min(10, 'Сообщение должно содержать не менее 10 символов')
    .max(1000, 'Сообщение слишком длинное (не более 1000 символов)'),
  priceStr: z
    .string()
    .optional()
    .refine(
      (v) => !v || (/^\d+$/.test(v.trim()) && parseInt(v.trim()) > 0),
      'Введите корректную цену в рублях'
    ),
})

type FormValues = z.infer<typeof formSchema>

interface TaskResponseFormProps {
  taskId: string
  taskTitle: string
}

export function TaskResponseForm({ taskId, taskTitle }: TaskResponseFormProps) {
  const [open, setOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: '', priceStr: '' },
  })

  function onSubmit(values: FormValues) {
    setErrorMessage(null)
    startTransition(async () => {
      const result = await respondToTask({
        taskId,
        message: values.message,
        price: values.priceStr ? parseInt(values.priceStr.trim()) : undefined,
      })

      if (result.success) {
        setSuccessMessage('Отклик успешно отправлен! Клиент увидит ваше предложение.')
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
        <Button className="gap-2">
          <Send className="h-4 w-4" />
          Откликнуться
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Отклик на задание</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {taskTitle}
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
              {/* Сообщение */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ваше предложение *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Опишите, как вы можете помочь, ваш опыт, сроки..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Не указывайте контактные данные — обмен контактами произойдёт после выбора.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Цена */}
              <FormField
                control={form.control}
                name="priceStr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Предлагаемая цена, ₽ (необязательно)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Например: 3000"
                        {...field}
                      />
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
                {isPending ? 'Отправка...' : 'Отправить отклик'}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

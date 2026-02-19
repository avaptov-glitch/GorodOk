'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createTask } from '@/actions/tasks'

const formSchema = z.object({
  title: z
    .string()
    .min(8, 'Заголовок должен содержать не менее 8 символов')
    .max(80, 'Заголовок слишком длинный (не более 80 символов)'),
  description: z
    .string()
    .min(30, 'Описание должно содержать не менее 30 символов')
    .max(2000, 'Описание слишком длинное (не более 2000 символов)'),
  categoryId: z.string().min(1, 'Выберите категорию'),
  budgetStr: z
    .string()
    .optional()
    .refine(
      (v) => !v || (/^\d+$/.test(v.trim()) && parseInt(v.trim()) > 0),
      'Введите корректный бюджет в рублях'
    ),
  district: z.string().optional(),
  meetingFormat: z.enum(['REMOTE', 'AT_CLIENT', 'AT_EXECUTOR']).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface TaskCreateFormProps {
  categories: Array<{
    id: string
    name: string
    children: Array<{ id: string; name: string }>
  }>
  defaultTitle?: string
  defaultCategoryId?: string
}

export function TaskCreateForm({ categories, defaultTitle, defaultCategoryId }: TaskCreateFormProps) {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultTitle ?? '',
      description: '',
      categoryId: defaultCategoryId ?? '',
      budgetStr: '',
      district: '',
      meetingFormat: undefined,
    },
  })

  function onSubmit(values: FormValues) {
    setErrorMessage(null)
    startTransition(async () => {
      const result = await createTask({
        title: values.title,
        description: values.description,
        categoryId: values.categoryId,
        budget: values.budgetStr ? parseInt(values.budgetStr.trim()) : undefined,
        district: values.district || undefined,
        meetingFormat: values.meetingFormat || undefined,
      })

      if (result.success && result.data) {
        router.push(`/task/${result.data.id}`)
      } else {
        setErrorMessage(result.error ?? 'Произошла ошибка')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Новое задание</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Заголовок */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Заголовок *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Например: Нужен репетитор по математике для 9 класса"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>От 8 до 80 символов</FormDescription>
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
                  <FormLabel>Описание *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Подробно опишите задачу: что нужно сделать, сроки, требования к исполнителю..."
                      className="min-h-[140px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Минимум 30 символов. Не указывайте контактные данные (телефон, email, ссылки).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Категория */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию..." />
                      </SelectTrigger>
                    </FormControl>
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
                    <Input
                      type="number"
                      min={1}
                      placeholder="Например: 5000"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Оставьте пустым, если бюджет по договорённости
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Район */}
            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Район (необязательно)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Например: Центральный"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Формат встречи */}
            <FormField
              control={form.control}
              name="meetingFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Формат (необязательно)</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="REMOTE" id="task-fmt-remote" />
                        <Label htmlFor="task-fmt-remote" className="font-normal cursor-pointer">Дистанционно</Label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="AT_CLIENT" id="task-fmt-client" />
                        <Label htmlFor="task-fmt-client" className="font-normal cursor-pointer">У меня</Label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RadioGroupItem value="AT_EXECUTOR" id="task-fmt-executor" />
                        <Label htmlFor="task-fmt-executor" className="font-normal cursor-pointer">У специалиста</Label>
                      </div>
                    </RadioGroup>
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

            <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
              {isPending ? 'Публикация...' : 'Опубликовать задание'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

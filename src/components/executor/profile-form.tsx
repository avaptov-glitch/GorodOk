'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { saveExecutorProfile } from '@/actions/executor'
import type { Category } from '@/types'

type ProfileData = {
  description: string | null
  experienceYears: number
  district: string | null
  worksOnline: boolean
  travelsToClient: boolean
  acceptsAtOwnPlace: boolean
  isPublished: boolean
  categories: Array<{ categoryId: string }>
}

interface ProfileFormProps {
  profile: ProfileData | null
  categories: Category[]
}

const formSchema = z.object({
  description: z.string().max(2000, 'Не более 2000 символов').optional(),
  experienceYears: z.coerce.number().int().min(0, 'Не менее 0').max(60, 'Не более 60'),
  district: z.string().max(100).optional(),
  worksOnline: z.boolean(),
  travelsToClient: z.boolean(),
  acceptsAtOwnPlace: z.boolean(),
  categoryIds: z.array(z.string()),
  isPublished: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export function ProfileForm({ profile, categories }: ProfileFormProps) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Zod v4 coerce types incompatible with RHF
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      description: profile?.description ?? '',
      experienceYears: profile?.experienceYears ?? 0,
      district: profile?.district ?? '',
      worksOnline: profile?.worksOnline ?? false,
      travelsToClient: profile?.travelsToClient ?? true,
      acceptsAtOwnPlace: profile?.acceptsAtOwnPlace ?? false,
      categoryIds: profile?.categories.map((c) => c.categoryId) ?? [],
      isPublished: profile?.isPublished ?? false,
    },
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await saveExecutorProfile(values)
      if (result.success) {
        toast({ title: 'Анкета сохранена', description: 'Изменения успешно применены.' })
      } else {
        toast({ variant: 'destructive', title: 'Ошибка', description: result.error })
      }
    })
  }

  // Группируем категории: сначала родители, под ними дети
  const parentCategories = categories.filter((c) => !c.parentId)
  const childrenByParent = categories.reduce<Record<string, Category[]>>((acc, c) => {
    if (c.parentId) {
      acc[c.parentId] = [...(acc[c.parentId] ?? []), c]
    }
    return acc
  }, {})

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* === О себе === */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">О себе</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Расскажите о своём опыте, подходе к работе, образовании..."
                      rows={6}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    До 2000 символов. Хорошее описание увеличивает количество заявок.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="experienceYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Опыт работы (лет)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={60} disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Район города</FormLabel>
                    <FormControl>
                      <Input placeholder="Например: Заречье" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-3 pt-1">
              <FormField
                control={form.control}
                name="travelsToClient"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2.5 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-normal">Выезжаю к клиенту</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="acceptsAtOwnPlace"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2.5 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-normal">Принимаю у себя</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="worksOnline"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2.5 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-normal">Работаю онлайн</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* === Категории услуг === */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Категории услуг</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="categoryIds"
              render={() => (
                <FormItem>
                  <div className="space-y-5">
                    {parentCategories.map((parent, idx) => {
                      const children = childrenByParent[parent.id] ?? []
                      // Если у родителя нет детей — показываем самого родителя как вариант
                      const items = children.length > 0 ? children : [parent]
                      return (
                        <div key={parent.id}>
                          {idx > 0 && <Separator className="mb-5" />}
                          <p className="text-sm font-semibold text-foreground mb-2.5">{parent.name}</p>
                          <div className="grid grid-cols-2 gap-y-2 gap-x-4 pl-1">
                            {items.map((cat) => (
                              <FormField
                                key={cat.id}
                                control={form.control}
                                name="categoryIds"
                                render={({ field }) => (
                                  <FormItem className="flex items-center gap-2.5 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value.includes(cat.id)}
                                        onCheckedChange={(checked) => {
                                          field.onChange(
                                            checked
                                              ? [...field.value, cat.id]
                                              : field.value.filter((id) => id !== cat.id)
                                          )
                                        }}
                                        disabled={isPending}
                                      />
                                    </FormControl>
                                    <FormLabel className="cursor-pointer font-normal text-sm leading-tight">
                                      {cat.name}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <FormMessage className="mt-3" />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* === Публикация === */}
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <div>
                    <FormLabel className="cursor-pointer font-semibold">
                      Опубликовать анкету
                    </FormLabel>
                    <FormDescription>
                      Ваша анкета будет отображаться в каталоге и результатах поиска
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} size="lg">
            {isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Сохранение...</>
            ) : (
              <><Save className="mr-2 h-4 w-4" />Сохранить анкету</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

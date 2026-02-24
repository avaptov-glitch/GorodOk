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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* === О себе === */}
        <div className="space-y-5">
          <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">О себе</h2>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold text-slate-700">Описание</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Расскажите о своём опыте, подходе к работе, образовании..."
                    rows={6}
                    disabled={isPending}
                    className="resize-none rounded-xl border-slate-200/60 shadow-sm focus-visible:ring-blue-500 bg-slate-50/50"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-slate-500">
                  До 2000 символов. Хорошее описание увеличивает количество заявок.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="experienceYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold text-slate-700">Опыт работы (лет)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={60}
                      disabled={isPending}
                      className="rounded-xl border-slate-200/60 shadow-sm focus-visible:ring-blue-500 bg-slate-50/50"
                      {...field}
                    />
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
                  <FormLabel className="text-sm font-bold text-slate-700">Район города</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Например: Заречье"
                      disabled={isPending}
                      className="rounded-xl border-slate-200/60 shadow-sm focus-visible:ring-blue-500 bg-slate-50/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col gap-3.5 pt-2">
            <FormField
              control={form.control}
              name="travelsToClient"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                      className="rounded text-blue-600 focus-visible:ring-blue-500 h-5 w-5 border-slate-300"
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-semibold text-slate-700 pb-0.5">Выезжаю к клиенту</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acceptsAtOwnPlace"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                      className="rounded text-blue-600 focus-visible:ring-blue-500 h-5 w-5 border-slate-300"
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-semibold text-slate-700 pb-0.5">Принимаю у себя</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="worksOnline"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                      className="rounded text-blue-600 focus-visible:ring-blue-500 h-5 w-5 border-slate-300"
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-semibold text-slate-700 pb-0.5">Работаю онлайн</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* === Категории услуг === */}
        <div className="space-y-5 pt-4">
          <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">Категории услуг</h2>
          <FormField
            control={form.control}
            name="categoryIds"
            render={() => (
              <FormItem>
                <div className="space-y-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                  {parentCategories.map((parent, idx) => {
                    const children = childrenByParent[parent.id] ?? []
                    // Если у родителя нет детей — показываем самого родителя как вариант
                    const items = children.length > 0 ? children : [parent]
                    return (
                      <div key={parent.id}>
                        {idx > 0 && <Separator className="mb-6 border-slate-200/60" />}
                        <p className="text-base font-extrabold text-slate-800 mb-3">{parent.name}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6">
                          {items.map((cat) => (
                            <FormField
                              key={cat.id}
                              control={form.control}
                              name="categoryIds"
                              render={({ field }) => (
                                <FormItem className="flex items-center gap-3 space-y-0">
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
                                      className="rounded text-blue-600 focus-visible:ring-blue-500 h-5 w-5 border-slate-300 shrink-0"
                                    />
                                  </FormControl>
                                  <FormLabel className="cursor-pointer font-medium text-slate-600 text-sm leading-tight pb-0.5">
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
        </div>

        {/* === Публикация === */}
        <div className="pt-4">
          <div className="bg-blue-50/40 border border-blue-100/50 p-5 rounded-2xl">
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex items-start gap-4 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                      className="mt-1 rounded text-blue-600 focus-visible:ring-blue-500 h-5 w-5 border-blue-200"
                    />
                  </FormControl>
                  <div>
                    <FormLabel className="cursor-pointer font-extrabold text-blue-900 text-base">
                      Опубликовать анкету
                    </FormLabel>
                    <FormDescription className="text-blue-700/80 mt-1">
                      Ваша анкета будет отображаться в каталоге и результатах поиска
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isPending}
            size="lg"
            className="rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 px-8 h-12 text-base"
          >
            {isPending ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Сохранение...</>
            ) : (
              <><Save className="mr-2 h-5 w-5" />Сохранить анкету</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

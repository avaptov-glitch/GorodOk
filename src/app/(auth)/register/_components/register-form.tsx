'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { registerUser } from '@/actions/auth'

// Клиентская схема должна совпадать с серверной схемой в src/actions/auth.ts
const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, 'Имя должно содержать не менее 2 символов')
    .max(100, 'Имя слишком длинное'),
  email: z.email('Некорректный email'),
  password: z
    .string()
    .min(8, 'Пароль должен содержать не менее 8 символов')
    .max(100, 'Пароль слишком длинный'),
  role: z.enum(['CLIENT', 'EXECUTOR'] as const, {
    error: 'Выберите роль',
  }),
})

type RegisterInput = z.infer<typeof RegisterSchema>

export function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'CLIENT',
    },
  })

  async function onSubmit(values: RegisterInput) {
    setIsLoading(true)
    try {
      // 1. Создаём пользователя через Server Action
      const result = await registerUser(values)

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Ошибка регистрации',
          description: result.error,
        })
        return
      }

      // 2. Автоматический вход после успешной регистрации
      const signInResult = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (signInResult?.error) {
        // Регистрация прошла, но вход не удался — направляем на страницу входа
        toast({
          title: 'Аккаунт создан',
          description: 'Войдите с вашими данными.',
        })
        router.push('/login')
        return
      }

      // 3. Перенаправляем в личный кабинет
      toast({ title: 'Добро пожаловать!', description: 'Аккаунт успешно создан.' })
      router.push('/dashboard')
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Создать аккаунт</CardTitle>
        <CardDescription>Заполните форму для регистрации</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Имя */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Иван Иванов"
                      autoComplete="name"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Пароль */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Минимум 8 символов"
                      autoComplete="new-password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Выбор роли */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Я регистрируюсь как</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 gap-3 pt-1"
                      disabled={isLoading}
                    >
                      {/* Клиент */}
                      <div>
                        <RadioGroupItem
                          value="CLIENT"
                          id="role-client"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="role-client"
                          className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-card p-4 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50 transition-colors"
                        >
                          <span className="text-sm font-semibold">Клиент</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            Ищу исполнителей
                          </span>
                        </Label>
                      </div>
                      {/* Исполнитель */}
                      <div>
                        <RadioGroupItem
                          value="EXECUTOR"
                          id="role-executor"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="role-executor"
                          className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-card p-4 cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:border-primary/50 transition-colors"
                        >
                          <span className="text-sm font-semibold">Исполнитель</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            Предоставляю услуги
                          </span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Создать аккаунт
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        Уже есть аккаунт?&nbsp;
        <Link href="/login" className="text-primary hover:underline font-medium">
          Войти
        </Link>
      </CardFooter>
    </Card>
  )
}

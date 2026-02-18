'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { useToast } from '@/hooks/use-toast'

const LoginSchema = z.object({
  email: z.email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

type LoginInput = z.infer<typeof LoginSchema>

// Маппинг кодов ошибок NextAuth на русские сообщения
const AUTH_ERRORS: Record<string, string> = {
  CredentialsSignin: 'Неверный email или пароль',
  default: 'Произошла ошибка. Попробуйте ещё раз.',
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Ошибка из URL-параметра (когда NextAuth делает redirect с ошибкой)
  const urlError = searchParams.get('error')
  const urlErrorMessage = urlError
    ? (AUTH_ERRORS[urlError] ?? AUTH_ERRORS.default)
    : null

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginInput) {
    setIsLoading(true)
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false, // Управляем редиректом вручную
      })

      if (result?.error) {
        const message = AUTH_ERRORS[result.error] ?? AUTH_ERRORS.default
        toast({ variant: 'destructive', title: 'Ошибка входа', description: message })
        return
      }

      // После успешного входа перенаправляем на callbackUrl или дашборд
      const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'
      router.push(callbackUrl)
      router.refresh() // Обновляем серверные компоненты с новой сессией
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Вход</CardTitle>
        <CardDescription>Введите email и пароль для входа в аккаунт</CardDescription>
        {urlErrorMessage && (
          <p className="text-sm text-destructive mt-1">{urlErrorMessage}</p>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Войти
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        Нет аккаунта?&nbsp;
        <Link href="/register" className="text-primary hover:underline font-medium">
          Зарегистрироваться
        </Link>
      </CardFooter>
    </Card>
  )
}

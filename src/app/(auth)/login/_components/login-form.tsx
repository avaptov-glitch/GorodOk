'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

const AUTH_ERRORS: Record<string, string> = {
  CredentialsSignin: 'Неверный email или пароль',
  default: 'Произошла ошибка. Попробуйте ещё раз.',
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

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
        redirect: false,
      })

      if (result?.error) {
        const message = AUTH_ERRORS[result.error] ?? AUTH_ERRORS.default
        toast({ variant: 'destructive', title: 'Ошибка входа', description: message })
        return
      }

      const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'
      router.push(callbackUrl)
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-white/60 ring-1 ring-slate-900/5 hover:shadow-[0_30px_70px_rgba(37,99,235,0.08)] hover:bg-white/90 transition-all duration-500 ease-out relative">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-[-0.02em] mb-2">С возвращением</h1>
        <p className="text-slate-500 font-medium">Войдите, чтобы продолжить работу</p>
        {urlErrorMessage && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-2xl border border-red-100">
            {urlErrorMessage}
          </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-bold ml-1">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                    className="h-14 rounded-2xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white border-slate-200/60 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all px-5 text-base shadow-sm font-medium"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="ml-1" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-bold ml-1 flex justify-between">
                  <span>Пароль</span>
                  <Link href="#" className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors">Забыли?</Link>
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="h-14 rounded-2xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white border-slate-200/60 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all px-5 text-base shadow-sm font-medium tracking-widest placeholder:tracking-normal"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="ml-1" />
              </FormItem>
            )}
          />

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-lg font-bold shadow-[0_8px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_12px_25px_rgba(15,23,42,0.2)] hover:-translate-y-0.5 transition-all group"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>Войти <ArrowRight className="ml-2 w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" /></>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-8 text-center text-sm font-medium text-slate-500">
        Ещё нет аккаунта?{' '}
        <Link href="/register" className="text-blue-600 hover:text-blue-800 font-bold transition-colors">
          Зарегистрироваться
        </Link>
      </div>
    </div>
  )
}

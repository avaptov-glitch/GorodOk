'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { registerUser } from '@/actions/auth'

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
      const result = await registerUser(values)

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Ошибка регистрации',
          description: result.error,
        })
        return
      }

      const signInResult = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (signInResult?.error) {
        toast({
          title: 'Аккаунт создан',
          description: 'Войдите с вашими данными.',
        })
        router.push('/login')
        return
      }

      toast({ title: 'Добро пожаловать!', description: 'Аккаунт успешно создан.' })
      router.push('/dashboard')
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-white/60 ring-1 ring-slate-900/5 hover:shadow-[0_30px_70px_rgba(37,99,235,0.08)] hover:bg-white/90 transition-all duration-500 ease-out relative">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-[-0.02em] mb-2">Создать аккаунт</h1>
        <p className="text-slate-500 font-medium">Бесплатный доступ ко всем функциям платформы</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-2 gap-3"
                    disabled={isLoading}
                  >
                    <div>
                      <RadioGroupItem value="CLIENT" id="role-client" className="peer sr-only" />
                      <Label
                        htmlFor="role-client"
                        className="flex flex-col items-center justify-center rounded-[1.5rem] border-2 border-slate-100 bg-white/50 p-4 cursor-pointer peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50/50 peer-data-[state=checked]:shadow-[0_8px_20px_rgba(37,99,235,0.1)] hover:border-blue-200 transition-all"
                      >
                        <span className="text-sm font-bold text-slate-900">Я клиент</span>
                        <span className="text-xs text-slate-500 font-medium mt-1">Ищу специалистов</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="EXECUTOR" id="role-executor" className="peer sr-only" />
                      <Label
                        htmlFor="role-executor"
                        className="flex flex-col items-center justify-center rounded-[1.5rem] border-2 border-slate-100 bg-white/50 p-4 cursor-pointer peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50/50 peer-data-[state=checked]:shadow-[0_8px_20px_rgba(37,99,235,0.1)] hover:border-blue-200 transition-all"
                      >
                        <span className="text-sm font-bold text-slate-900">Я мастер</span>
                        <span className="text-xs text-slate-500 font-medium mt-1">Оказываю услуги</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage className="ml-1 text-center" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-bold ml-1">Имя и Фамилия</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Иван Иванов"
                    autoComplete="name"
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
                <FormLabel className="text-slate-700 font-bold ml-1">Пароль</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Минимум 8 символов"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="h-14 rounded-2xl bg-slate-50/50 hover:bg-slate-50 focus:bg-white border-slate-200/60 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all px-5 text-base shadow-sm font-medium tracking-widest placeholder:tracking-normal"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="ml-1" />
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-lg font-bold shadow-[0_8px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_12px_25px_rgba(15,23,42,0.2)] hover:-translate-y-0.5 transition-all group"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>Продолжить <ArrowRight className="ml-2 w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" /></>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-8 text-center text-sm font-medium text-slate-500">
        Уже есть аккаунт?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-800 font-bold transition-colors">
          Войти
        </Link>
      </div>
    </div>
  )
}

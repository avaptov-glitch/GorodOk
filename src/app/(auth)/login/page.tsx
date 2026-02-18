import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { LoginForm } from './_components/login-form'

export const metadata: Metadata = {
  title: 'Вход',
}

export default async function LoginPage() {
  // Авторизованных пользователей сразу перенаправляем в кабинет
  const session = await getServerSession(authOptions)
  if (session) {
    redirect('/dashboard')
  }

  return <LoginForm />
}

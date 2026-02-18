import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { RegisterForm } from './_components/register-form'

export const metadata: Metadata = {
  title: 'Регистрация',
}

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect('/dashboard')
  }

  return <RegisterForm />
}

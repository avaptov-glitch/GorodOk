'use server'

import { z } from 'zod'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'

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
  // ADMIN намеренно не включён — запрет самоназначения роли администратора
  role: z.enum(['CLIENT', 'EXECUTOR'] as const, {
    error: 'Выберите роль',
  }),
})

export type RegisterInput = z.infer<typeof RegisterSchema>

export async function registerUser(
  data: RegisterInput
): Promise<ApiResponse<{ id: string }>> {
  // Серверная валидация (защита на случай обхода клиентской валидации)
  const parsed = RegisterSchema.safeParse(data)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Ошибка валидации'
    return { success: false, error: firstError }
  }

  const { name, email, password, role } = parsed.data

  try {
    // Проверяем уникальность email
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    if (existing) {
      return { success: false, error: 'Пользователь с таким email уже существует' }
    }

    // Хешируем пароль (cost factor 12 — баланс безопасности и скорости)
    const passwordHash = await hash(password, 12)

    // Создаём пользователя (+ профиль и подписку для исполнителей) в транзакции
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email, passwordHash, role },
        select: { id: true },
      })

      // Для исполнителей создаём ExecutorProfile и бесплатную подписку
      if (role === 'EXECUTOR') {
        const profile = await tx.executorProfile.create({
          data: { userId: newUser.id },
          select: { id: true },
        })

        await tx.subscription.create({
          data: {
            executorId: profile.id,
            plan: 'FREE',
            expiresAt: new Date('2099-12-31'),
          },
        })
      }

      return newUser
    })

    return { success: true, data: { id: user.id } }
  } catch {
    // Не раскрываем детали ошибок БД клиенту
    return { success: false, error: 'Ошибка при регистрации. Попробуйте позже.' }
  }
}

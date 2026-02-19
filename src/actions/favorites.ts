'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'

export async function toggleFavorite(
  executorId: string
): Promise<ApiResponse<{ isFavorited: boolean }>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const userId = session.user.id

  try {
    const existing = await prisma.favorite.findUnique({
      where: { userId_executorId: { userId, executorId } },
      select: { id: true },
    })

    if (existing) {
      await prisma.favorite.delete({
        where: { userId_executorId: { userId, executorId } },
      })
      revalidatePath(`/executor/${executorId}`)
      return { success: true, data: { isFavorited: false } }
    } else {
      await prisma.favorite.create({
        data: { userId, executorId },
      })
      revalidatePath(`/executor/${executorId}`)
      return { success: true, data: { isFavorited: true } }
    }
  } catch {
    return { success: false, error: 'Ошибка. Попробуйте позже.' }
  }
}

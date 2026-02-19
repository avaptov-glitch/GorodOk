'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'

export async function markAllNotificationsRead(): Promise<ApiResponse<void>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  try {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    })
    revalidatePath('/', 'layout')
    return { success: true }
  } catch {
    return { success: false, error: 'Ошибка при обновлении уведомлений' }
  }
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/chat/unread
 * Возвращает общее количество непрочитанных сообщений для текущего пользователя
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 })
  }

  try {
    const userId = session.user.id

    // Считаем непрочитанные сообщения в заказах, где пользователь — участник
    const count = await prisma.chatMessage.count({
      where: {
        isRead: false,
        senderId: { not: userId },
        order: {
          OR: [
            { clientId: userId },
            { executor: { userId } },
          ],
        },
      },
    })

    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}

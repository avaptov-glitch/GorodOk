import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/chat/messages?orderId=X&after=ISO_TIMESTAMP
 * Polling endpoint: возвращает новые сообщения после указанного времени
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Не авторизован' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const orderId = searchParams.get('orderId')
  const after = searchParams.get('after')

  if (!orderId) {
    return NextResponse.json({ success: false, error: 'orderId обязателен' }, { status: 400 })
  }

  // Проверяем что пользователь — участник заказа
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      clientId: true,
      executor: { select: { userId: true } },
    },
  })

  if (!order) {
    return NextResponse.json({ success: false, error: 'Заказ не найден' }, { status: 404 })
  }

  const isParticipant =
    order.clientId === session.user.id || order.executor.userId === session.user.id

  if (!isParticipant) {
    return NextResponse.json({ success: false, error: 'Нет доступа' }, { status: 403 })
  }

  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        orderId,
        ...(after ? { createdAt: { gt: new Date(after) } } : {}),
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
      select: {
        id: true,
        senderId: true,
        text: true,
        imageUrl: true,
        isRead: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        messages: messages.map((m) => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
        })),
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Ошибка сервера' }, { status: 500 })
  }
}

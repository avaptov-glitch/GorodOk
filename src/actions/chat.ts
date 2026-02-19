'use server'

import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'

// --- Типы ---

export type ConversationItem = {
  orderId: string
  orderDescription: string
  orderStatus: string
  companion: {
    id: string
    name: string
    avatarUrl: string | null
  }
  lastMessage: {
    text: string
    createdAt: string
    senderId: string
  } | null
  unreadCount: number
}

export type ChatMessageItem = {
  id: string
  senderId: string
  text: string
  imageUrl: string | null
  isRead: boolean
  createdAt: string
}

// --- Схемы валидации ---

const SendMessageSchema = z.object({
  orderId: z.string().min(1),
  text: z.string().min(1, 'Сообщение не может быть пустым').max(2000, 'Слишком длинное сообщение'),
  imageUrl: z.string().url().optional(),
})

// --- Хелпер: проверка участия в заказе ---

async function verifyOrderParticipant(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      clientId: true,
      status: true,
      executor: { select: { id: true, userId: true } },
    },
  })

  if (!order) return null

  const isClient = order.clientId === userId
  const isExecutor = order.executor.userId === userId

  if (!isClient && !isExecutor) return null

  return {
    order,
    isClient,
    isExecutor,
    companionUserId: isClient ? order.executor.userId : order.clientId,
  }
}

// --- Server Actions ---

export async function sendMessage(
  data: z.infer<typeof SendMessageSchema>
): Promise<ApiResponse<{ id: string }>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const parsed = SendMessageSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
  }

  const { orderId, text, imageUrl } = parsed.data

  const participant = await verifyOrderParticipant(orderId, session.user.id)
  if (!participant) {
    return { success: false, error: 'Нет доступа к этой беседе' }
  }

  try {
    const message = await prisma.chatMessage.create({
      data: {
        orderId,
        senderId: session.user.id,
        text,
        imageUrl: imageUrl || null,
      },
      select: { id: true },
    })

    // Уведомление собеседнику (не блокируем основной поток)
    const senderName = session.user.name || 'Пользователь'
    prisma.notification
      .create({
        data: {
          userId: participant.companionUserId,
          type: 'NEW_MESSAGE',
          title: `Сообщение от ${senderName}`,
          body: text.length > 80 ? `${text.slice(0, 80)}...` : text,
          link: `/dashboard/chat?order=${orderId}`,
        },
      })
      .catch((e) => console.error('Failed to create message notification:', e))

    revalidatePath('/dashboard/chat')
    return { success: true, data: { id: message.id } }
  } catch {
    return { success: false, error: 'Ошибка при отправке сообщения' }
  }
}

export async function markMessagesAsRead(
  orderId: string
): Promise<ApiResponse<void>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const participant = await verifyOrderParticipant(orderId, session.user.id)
  if (!participant) {
    return { success: false, error: 'Нет доступа к этой беседе' }
  }

  try {
    await prisma.chatMessage.updateMany({
      where: {
        orderId,
        senderId: { not: session.user.id },
        isRead: false,
      },
      data: { isRead: true },
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Ошибка при обновлении статуса сообщений' }
  }
}

export async function getConversations(): Promise<ApiResponse<ConversationItem[]>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const userId = session.user.id

  try {
    // Находим все заказы, где пользователь — клиент или исполнитель
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { clientId: userId },
          { executor: { userId } },
        ],
      },
      select: {
        id: true,
        description: true,
        status: true,
        clientId: true,
        client: { select: { id: true, name: true, avatarUrl: true } },
        executor: {
          select: {
            userId: true,
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { text: true, createdAt: true, senderId: true },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const conversations: ConversationItem[] = orders.map((order) => {
      const isClient = order.clientId === userId
      const companion = isClient
        ? { id: order.executor.user.id, name: order.executor.user.name ?? 'Исполнитель', avatarUrl: order.executor.user.avatarUrl }
        : { id: order.client.id, name: order.client.name ?? 'Клиент', avatarUrl: order.client.avatarUrl }

      const lastMessage = order.messages[0]
        ? {
            text: order.messages[0].text,
            createdAt: order.messages[0].createdAt.toISOString(),
            senderId: order.messages[0].senderId,
          }
        : null

      return {
        orderId: order.id,
        orderDescription: order.description,
        orderStatus: order.status,
        companion,
        lastMessage,
        unreadCount: order._count.messages,
      }
    })

    // Сортировка: беседы с сообщениями сначала, потом по дате последнего сообщения
    conversations.sort((a, b) => {
      if (a.lastMessage && !b.lastMessage) return -1
      if (!a.lastMessage && b.lastMessage) return 1
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
      }
      return 0
    })

    return { success: true, data: conversations }
  } catch {
    return { success: false, error: 'Ошибка при загрузке бесед' }
  }
}

export async function getMessages(
  orderId: string,
  cursor?: string
): Promise<ApiResponse<{ messages: ChatMessageItem[]; nextCursor: string | null }>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const participant = await verifyOrderParticipant(orderId, session.user.id)
  if (!participant) {
    return { success: false, error: 'Нет доступа к этой беседе' }
  }

  const PAGE_SIZE = 50

  try {
    const messages = await prisma.chatMessage.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      take: PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        senderId: true,
        text: true,
        imageUrl: true,
        isRead: true,
        createdAt: true,
      },
    })

    const hasMore = messages.length > PAGE_SIZE
    const result = hasMore ? messages.slice(0, PAGE_SIZE) : messages
    const nextCursor = hasMore ? result[result.length - 1]?.id ?? null : null

    // Переворачиваем — хронологический порядок
    const formatted: ChatMessageItem[] = result.reverse().map((msg) => ({
      id: msg.id,
      senderId: msg.senderId,
      text: msg.text,
      imageUrl: msg.imageUrl,
      isRead: msg.isRead,
      createdAt: msg.createdAt.toISOString(),
    }))

    return { success: true, data: { messages: formatted, nextCursor } }
  } catch {
    return { success: false, error: 'Ошибка при загрузке сообщений' }
  }
}

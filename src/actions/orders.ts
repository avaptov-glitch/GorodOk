'use server'

import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiResponse, OrderStatus } from '@/types'

const CreateOrderSchema = z.object({
  executorId: z.string().min(1),
  serviceId: z.string().min(1).optional(),
  taskId: z.string().min(1).optional(), // Если заказ создаётся из задания
  description: z
    .string()
    .min(10, 'Описание должно содержать не менее 10 символов')
    .max(1000, 'Описание слишком длинное (не более 1000 символов)'),
  budget: z.number().int().positive('Бюджет должен быть положительным числом').optional(),
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>

export async function createOrder(
  data: CreateOrderInput
): Promise<ApiResponse<{ id: string }>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  // Проверяем роль — только клиенты могут создавать заявки
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (user?.role !== 'CLIENT') {
    return { success: false, error: 'Только клиенты могут оставлять заявки' }
  }

  const parsed = CreateOrderSchema.safeParse(data)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Ошибка валидации'
    return { success: false, error: firstError }
  }

  const { executorId, serviceId, taskId, description, budget } = parsed.data

  // Проверяем существование и доступность исполнителя
  const executor = await prisma.executorProfile.findUnique({
    where: { id: executorId, isPublished: true, moderationStatus: 'APPROVED' },
    select: { id: true, userId: true },
  })
  if (!executor) {
    return { success: false, error: 'Исполнитель не найден' }
  }

  // Нельзя создать заявку на самого себя
  if (executor.userId === session.user.id) {
    return { success: false, error: 'Нельзя создать заявку на самого себя' }
  }

  try {
    const order = await prisma.order.create({
      data: {
        clientId: session.user.id,
        executorId,
        serviceId: serviceId ?? null,
        taskId: taskId ?? null,
        description,
        budget: budget ? budget * 100 : null, // Рубли → копейки
      },
      select: { id: true },
    })

    // Уведомление исполнителю (не блокируем основной поток)
    prisma.notification
      .create({
        data: {
          userId: executor.userId,
          type: 'NEW_ORDER',
          title: 'Новая заявка',
          body: description.length > 80 ? `${description.slice(0, 80)}...` : description,
          link: '/dashboard/executor/orders',
        },
      })
      .catch(() => {})

    revalidatePath(`/executor/${executorId}`)
    revalidatePath('/dashboard/client/orders')
    revalidatePath('/dashboard/executor/orders')
    return { success: true, data: { id: order.id } }
  } catch {
    return { success: false, error: 'Ошибка при создании заявки. Попробуйте позже.' }
  }
}

// Какие переходы статусов разрешены для каждой роли
const ALLOWED_TRANSITIONS: Record<string, ('CLIENT' | 'EXECUTOR')[]> = {
  'NEW->ACCEPTED': ['EXECUTOR'],
  'NEW->DISCUSSION': ['EXECUTOR'],
  'NEW->CANCELLED': ['CLIENT', 'EXECUTOR'],
  'DISCUSSION->ACCEPTED': ['EXECUTOR'],
  'DISCUSSION->CANCELLED': ['CLIENT', 'EXECUTOR'],
  'ACCEPTED->IN_PROGRESS': ['EXECUTOR'],
  'ACCEPTED->CANCELLED': ['CLIENT', 'EXECUTOR'],
  'IN_PROGRESS->COMPLETED': ['EXECUTOR'],
  'IN_PROGRESS->CANCELLED': ['CLIENT', 'EXECUTOR'],
  'IN_PROGRESS->DISPUTED': ['CLIENT', 'EXECUTOR'],
}

const statusLabels: Partial<Record<OrderStatus, string>> = {
  ACCEPTED: 'принята',
  CANCELLED: 'отменена',
  IN_PROGRESS: 'в работе',
  COMPLETED: 'выполнена',
  DISCUSSION: 'требует уточнения',
  DISPUTED: 'спорная',
}

const UpdateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
    'ACCEPTED',
    'CANCELLED',
    'IN_PROGRESS',
    'COMPLETED',
    'DISCUSSION',
    'DISPUTED',
  ]),
})

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>

export async function updateOrderStatus(
  data: UpdateOrderStatusInput
): Promise<ApiResponse<void>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const parsed = UpdateOrderStatusSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
  }

  const { orderId, status } = parsed.data

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { executor: { select: { userId: true } } },
  })

  if (!order) {
    return { success: false, error: 'Заявка не найдена' }
  }

  const isClient = order.clientId === session.user.id
  const isExecutor = order.executor.userId === session.user.id

  if (!isClient && !isExecutor) {
    return { success: false, error: 'Нет доступа к этой заявке' }
  }

  const userRole = isExecutor ? 'EXECUTOR' : 'CLIENT'
  const transitionKey = `${order.status}->${status}`
  const allowedRoles = ALLOWED_TRANSITIONS[transitionKey]

  if (!allowedRoles || !allowedRoles.includes(userRole)) {
    return { success: false, error: 'Данный переход статуса недопустим' }
  }

  try {
    await prisma.order.update({ where: { id: orderId }, data: { status } })

    // Уведомляем вторую сторону
    const notifyUserId = isExecutor ? order.clientId : order.executor.userId
    prisma.notification
      .create({
        data: {
          userId: notifyUserId,
          type: 'ORDER_STATUS',
          title: 'Статус заявки изменён',
          body: `Заявка ${statusLabels[status as OrderStatus] ?? status}`,
          link: isExecutor ? '/dashboard/client/orders' : '/dashboard/executor/orders',
        },
      })
      .catch(() => {})

    revalidatePath('/dashboard/executor/orders')
    revalidatePath('/dashboard/client/orders')
    return { success: true }
  } catch {
    return { success: false, error: 'Ошибка при обновлении статуса. Попробуйте позже.' }
  }
}

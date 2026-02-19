'use server'

import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'

// Regex для обнаружения контактных данных
const CONTACT_INFO_REGEX =
  /(\+?[78]\d{10}|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|[\w.-]+@[\w.-]+\.\w{2,}|https?:\/\/\S+|t\.me\/\S+|wa\.me\/\S+|viber:\/\/\S+)/i

function containsContactInfo(text: string): boolean {
  return CONTACT_INFO_REGEX.test(text)
}

// --- createTask ---

const CreateTaskSchema = z.object({
  title: z
    .string()
    .min(8, 'Заголовок должен содержать не менее 8 символов')
    .max(80, 'Заголовок слишком длинный (не более 80 символов)'),
  description: z
    .string()
    .min(30, 'Описание должно содержать не менее 30 символов')
    .max(2000, 'Описание слишком длинное (не более 2000 символов)'),
  categoryId: z.string().min(1, 'Выберите категорию'),
  budget: z.number().int().positive('Бюджет должен быть положительным').optional(),
  district: z.string().optional(),
})

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>

export async function createTask(
  data: CreateTaskInput
): Promise<ApiResponse<{ id: string }>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (user?.role !== 'CLIENT') {
    return { success: false, error: 'Только клиенты могут создавать задания' }
  }

  const parsed = CreateTaskSchema.safeParse(data)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Ошибка валидации'
    return { success: false, error: firstError }
  }

  const { title, description, categoryId, budget, district } = parsed.data

  if (containsContactInfo(title) || containsContactInfo(description)) {
    return {
      success: false,
      error: 'Запрещено размещать контактные данные (телефон, email, ссылки) в задании',
    }
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  })
  if (!category) {
    return { success: false, error: 'Категория не найдена' }
  }

  try {
    const task = await prisma.task.create({
      data: {
        clientId: session.user.id,
        categoryId,
        title,
        description,
        budget: budget ? budget * 100 : null, // Рубли → копейки
        district: district || null,
      },
      select: { id: true },
    })

    revalidatePath('/tasks')
    revalidatePath('/dashboard/client/tasks')
    return { success: true, data: { id: task.id } }
  } catch {
    return { success: false, error: 'Ошибка при создании задания. Попробуйте позже.' }
  }
}

// --- respondToTask ---

const RespondToTaskSchema = z.object({
  taskId: z.string().min(1),
  message: z
    .string()
    .min(10, 'Сообщение должно содержать не менее 10 символов')
    .max(1000, 'Сообщение слишком длинное (не более 1000 символов)'),
  price: z.number().int().positive('Цена должна быть положительной').optional(),
})

export type RespondToTaskInput = z.infer<typeof RespondToTaskSchema>

export async function respondToTask(
  data: RespondToTaskInput
): Promise<ApiResponse<{ id: string }>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const parsed = RespondToTaskSchema.safeParse(data)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Ошибка валидации'
    return { success: false, error: firstError }
  }

  const { taskId, message, price } = parsed.data

  if (containsContactInfo(message)) {
    return {
      success: false,
      error: 'Запрещено размещать контактные данные (телефон, email, ссылки) в отклике',
    }
  }

  // Получаем профиль исполнителя
  const executorProfile = await prisma.executorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })
  if (!executorProfile) {
    return { success: false, error: 'Только исполнители могут откликаться на задания' }
  }

  // Проверяем задание
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, status: true, clientId: true },
  })
  if (!task) {
    return { success: false, error: 'Задание не найдено' }
  }
  if (task.status !== 'ACTIVE') {
    return { success: false, error: 'На это задание уже нельзя откликнуться' }
  }
  if (task.clientId === session.user.id) {
    return { success: false, error: 'Нельзя откликнуться на своё задание' }
  }

  // Проверяем дубль отклика
  const existing = await prisma.taskResponse.findFirst({
    where: { taskId, executorId: executorProfile.id },
    select: { id: true },
  })
  if (existing) {
    return { success: false, error: 'Вы уже откликнулись на это задание' }
  }

  // Проверяем лимит для FREE плана (5 откликов/день)
  const subscription = await prisma.subscription.findFirst({
    where: { executorId: executorProfile.id, isActive: true },
    select: { plan: true },
  })
  if (!subscription || subscription.plan === 'FREE') {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayCount = await prisma.taskResponse.count({
      where: { executorId: executorProfile.id, createdAt: { gte: todayStart } },
    })
    if (todayCount >= 5) {
      return {
        success: false,
        error: 'Лимит откликов на бесплатном плане: 5 в день. Оформите PRO для безлимита.',
      }
    }
  }

  try {
    const response = await prisma.taskResponse.create({
      data: {
        taskId,
        executorId: executorProfile.id,
        message,
        price: price ? price * 100 : null, // Рубли → копейки
      },
      select: { id: true },
    })

    // Уведомление клиенту
    prisma.notification
      .create({
        data: {
          userId: task.clientId,
          type: 'TASK_RESPONSE',
          title: 'Новый отклик на задание',
          body: message.length > 80 ? `${message.slice(0, 80)}...` : message,
          link: `/task/${taskId}`,
        },
      })
      .catch(() => {})

    revalidatePath(`/task/${taskId}`)
    revalidatePath('/tasks')
    revalidatePath('/dashboard/client/tasks')
    revalidatePath('/dashboard/executor/tasks')
    return { success: true, data: { id: response.id } }
  } catch {
    return { success: false, error: 'Ошибка при отправке отклика. Попробуйте позже.' }
  }
}

// --- updateTaskStatus ---

const UpdateTaskStatusSchema = z.object({
  taskId: z.string().min(1),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
})

export type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusSchema>

const ALLOWED_TASK_TRANSITIONS: Record<string, string[]> = {
  'ACTIVE->CANCELLED': ['CLIENT'],
  'ACTIVE->IN_PROGRESS': ['CLIENT'],
  'IN_PROGRESS->COMPLETED': ['CLIENT'],
  'IN_PROGRESS->CANCELLED': ['CLIENT'],
}

export async function updateTaskStatus(
  data: UpdateTaskStatusInput
): Promise<ApiResponse<void>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const parsed = UpdateTaskStatusSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
  }

  const { taskId, status } = parsed.data

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, status: true, clientId: true },
  })
  if (!task) {
    return { success: false, error: 'Задание не найдено' }
  }
  if (task.clientId !== session.user.id) {
    return { success: false, error: 'Нет доступа к этому заданию' }
  }

  const transitionKey = `${task.status}->${status}`
  if (!ALLOWED_TASK_TRANSITIONS[transitionKey]) {
    return { success: false, error: 'Данный переход статуса недопустим' }
  }

  try {
    await prisma.task.update({ where: { id: taskId }, data: { status } })

    revalidatePath(`/task/${taskId}`)
    revalidatePath('/tasks')
    revalidatePath('/dashboard/client/tasks')
    return { success: true }
  } catch {
    return { success: false, error: 'Ошибка при обновлении статуса. Попробуйте позже.' }
  }
}

// --- selectExecutor ---

const SelectExecutorSchema = z.object({
  taskId: z.string().min(1),
  responseId: z.string().min(1),
})

export type SelectExecutorInput = z.infer<typeof SelectExecutorSchema>

export async function selectExecutor(
  data: SelectExecutorInput
): Promise<ApiResponse<{ orderId: string }>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { success: false, error: 'Необходимо авторизоваться' }
  }

  const parsed = SelectExecutorSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
  }

  const { taskId, responseId } = parsed.data

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, status: true, clientId: true, title: true, description: true },
  })
  if (!task) {
    return { success: false, error: 'Задание не найдено' }
  }
  if (task.clientId !== session.user.id) {
    return { success: false, error: 'Нет доступа к этому заданию' }
  }
  if (task.status !== 'ACTIVE') {
    return { success: false, error: 'Исполнитель уже выбран или задание закрыто' }
  }

  const response = await prisma.taskResponse.findUnique({
    where: { id: responseId },
    select: { id: true, executorId: true, price: true, executor: { select: { userId: true } } },
  })
  if (!response || response.executorId === undefined) {
    return { success: false, error: 'Отклик не найден' }
  }

  try {
    // Создаём заказ и обновляем статус задания в транзакции
    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          clientId: session.user.id,
          executorId: response.executorId,
          taskId,
          description: task.description,
          budget: response.price,
        },
        select: { id: true },
      }),
      prisma.task.update({
        where: { id: taskId },
        data: { status: 'IN_PROGRESS' },
      }),
    ])

    // Уведомление исполнителю
    prisma.notification
      .create({
        data: {
          userId: response.executor.userId,
          type: 'NEW_ORDER',
          title: 'Вас выбрали исполнителем',
          body: `По заданию: ${task.title.length > 60 ? `${task.title.slice(0, 60)}...` : task.title}`,
          link: '/dashboard/executor/orders',
        },
      })
      .catch(() => {})

    revalidatePath(`/task/${taskId}`)
    revalidatePath('/tasks')
    revalidatePath('/dashboard/client/tasks')
    revalidatePath('/dashboard/client/orders')
    revalidatePath('/dashboard/executor/orders')
    revalidatePath('/dashboard/executor/tasks')
    return { success: true, data: { orderId: order.id } }
  } catch {
    return { success: false, error: 'Ошибка при выборе исполнителя. Попробуйте позже.' }
  }
}

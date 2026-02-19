'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'

// ─── Схемы валидации ────────────────────────────────────────────────

const ratingField = z.number().int().min(1).max(5)

const CreateReviewSchema = z.object({
  orderId: z.string().uuid(),
  rating: ratingField,
  qualityRating: ratingField,
  punctualityRating: ratingField,
  valueRating: ratingField,
  politenessRating: ratingField,
  text: z.string().min(1, 'Напишите текст отзыва').max(1000, 'Максимум 1000 символов'),
  photos: z.array(z.string().url()).max(5).default([]),
})

type CreateReviewInput = z.infer<typeof CreateReviewSchema>

const ReplySchema = z.object({
  reviewId: z.string().uuid(),
  text: z.string().min(1, 'Напишите ответ').max(500, 'Максимум 500 символов'),
})

// ─── Пересчёт рейтинга (внутренняя) ────────────────────────────────

async function recalculateRating(executorId: string) {
  const agg = await prisma.review.aggregate({
    where: { executorId },
    _avg: { rating: true },
    _count: { id: true },
  })

  await prisma.executorProfile.update({
    where: { id: executorId },
    data: {
      ratingAvg: Math.round((agg._avg.rating ?? 0) * 10) / 10,
      reviewsCount: agg._count.id,
    },
  })
}

// ─── Создание отзыва ────────────────────────────────────────────────

export async function createReview(data: CreateReviewInput): Promise<ApiResponse<{ id: string }>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: 'Необходимо авторизоваться' }
  if (session.user.role !== 'CLIENT') return { success: false, error: 'Только клиенты могут оставлять отзывы' }

  const parsed = CreateReviewSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
  }

  const { orderId, rating, qualityRating, punctualityRating, valueRating, politenessRating, text, photos } = parsed.data

  // Загружаем заказ с проверками
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, clientId: true, executorId: true, status: true, review: { select: { id: true } } },
  })

  if (!order) return { success: false, error: 'Заказ не найден' }
  if (order.clientId !== session.user.id) return { success: false, error: 'Это не ваш заказ' }
  if (order.status !== 'COMPLETED') return { success: false, error: 'Отзыв можно оставить только на завершённый заказ' }
  if (order.review) return { success: false, error: 'Отзыв на этот заказ уже оставлен' }

  try {
    const review = await prisma.review.create({
      data: {
        clientId: session.user.id,
        executorId: order.executorId,
        orderId,
        rating,
        qualityRating,
        punctualityRating,
        valueRating,
        politenessRating,
        text,
        photos,
      },
      select: { id: true },
    })

    // Пересчитываем рейтинг
    await recalculateRating(order.executorId)

    // Уведомление исполнителю
    const executor = await prisma.executorProfile.findUnique({
      where: { id: order.executorId },
      select: { userId: true },
    })
    if (executor) {
      await prisma.notification.create({
        data: {
          userId: executor.userId,
          type: 'NEW_REVIEW',
          title: 'Новый отзыв',
          body: `Клиент ${session.user.name ?? 'Клиент'} оставил отзыв — ${rating} из 5`,
          link: '/dashboard/executor/orders',
        },
      })
    }

    revalidatePath('/dashboard/client/orders')
    revalidatePath('/dashboard/executor/orders')

    return { success: true, data: { id: review.id } }
  } catch {
    return { success: false, error: 'Ошибка при сохранении отзыва' }
  }
}

// ─── Ответ исполнителя на отзыв ─────────────────────────────────────

export async function replyToReview(
  reviewId: string,
  text: string
): Promise<ApiResponse<void>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: 'Необходимо авторизоваться' }
  if (session.user.role !== 'EXECUTOR') return { success: false, error: 'Только исполнители могут отвечать на отзывы' }

  const parsed = ReplySchema.safeParse({ reviewId, text })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
  }

  // Находим отзыв и проверяем принадлежность
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, executorId: true, executorReply: true, executor: { select: { userId: true } } },
  })

  if (!review) return { success: false, error: 'Отзыв не найден' }
  if (review.executor.userId !== session.user.id) return { success: false, error: 'Это не ваш отзыв' }
  if (review.executorReply) return { success: false, error: 'Вы уже ответили на этот отзыв' }

  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        executorReply: parsed.data.text,
        executorReplyAt: new Date(),
      },
    })

    revalidatePath('/dashboard/executor/orders')

    return { success: true }
  } catch {
    return { success: false, error: 'Ошибка при сохранении ответа' }
  }
}

'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ============================================================
// Helpers
// ============================================================

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Доступ запрещён')
  }
  return session
}

// ============================================================
// Модерация профилей
// ============================================================

export async function getProfilesForModeration(status?: string) {
  await requireAdmin()

  const where = status && status !== 'ALL'
    ? { moderationStatus: status as 'PENDING' | 'APPROVED' | 'REJECTED' }
    : {}

  const profiles = await prisma.executorProfile.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true } },
      categories: { include: { category: { select: { name: true } } } },
      services: { select: { id: true, name: true, isActive: true } },
      _count: { select: { reviews: true, orders: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return profiles
}

export async function moderateProfile(
  profileId: string,
  status: 'APPROVED' | 'REJECTED',
  reason?: string
) {
  await requireAdmin()

  const profile = await prisma.executorProfile.findUnique({
    where: { id: profileId },
    select: { userId: true, moderationStatus: true },
  })

  if (!profile) throw new Error('Профиль не найден')

  await prisma.executorProfile.update({
    where: { id: profileId },
    data: {
      moderationStatus: status,
      rejectionReason: status === 'REJECTED' ? (reason || 'Не указана') : null,
      isPublished: status === 'APPROVED',
    },
  })

  // Отправляем уведомление исполнителю
  await prisma.notification.create({
    data: {
      userId: profile.userId,
      type: 'SYSTEM',
      title: status === 'APPROVED' ? 'Профиль одобрен' : 'Профиль отклонён',
      body: status === 'APPROVED'
        ? 'Ваш профиль прошёл модерацию и теперь виден клиентам.'
        : `Ваш профиль отклонён. Причина: ${reason || 'Не указана'}`,
      link: '/dashboard/executor/profile',
    },
  })

  revalidatePath('/admin/moderation')
  return { success: true }
}

// ============================================================
// Управление категориями
// ============================================================

export async function getCategories() {
  await requireAdmin()

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { executors: true, services: true } },
        },
      },
      _count: { select: { executors: true, services: true } },
    },
    orderBy: { order: 'asc' },
  })

  return categories
}

export async function createCategory(data: {
  name: string
  slug: string
  icon: string
  parentId?: string | null
  order?: number
}) {
  await requireAdmin()

  // Проверяем уникальность slug
  const existing = await prisma.category.findUnique({ where: { slug: data.slug } })
  if (existing) throw new Error('Категория с таким slug уже существует')

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      icon: data.icon,
      parentId: data.parentId || null,
      order: data.order ?? 0,
    },
  })

  revalidatePath('/admin/categories')
  return category
}

export async function updateCategory(
  categoryId: string,
  data: { name?: string; slug?: string; icon?: string; order?: number }
) {
  await requireAdmin()

  if (data.slug) {
    const existing = await prisma.category.findFirst({
      where: { slug: data.slug, NOT: { id: categoryId } },
    })
    if (existing) throw new Error('Категория с таким slug уже существует')
  }

  const category = await prisma.category.update({
    where: { id: categoryId },
    data,
  })

  revalidatePath('/admin/categories')
  return category
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin()

  // Проверяем наличие подкатегорий
  const children = await prisma.category.count({ where: { parentId: categoryId } })
  if (children > 0) throw new Error('Нельзя удалить категорию с подкатегориями. Сначала удалите подкатегории.')

  // Проверяем наличие привязанных исполнителей
  const executors = await prisma.executorCategory.count({ where: { categoryId } })
  if (executors > 0) throw new Error('Нельзя удалить категорию с привязанными исполнителями')

  await prisma.category.delete({ where: { id: categoryId } })

  revalidatePath('/admin/categories')
  return { success: true }
}

// ============================================================
// Управление пользователями
// ============================================================

export async function getUsers(params?: {
  role?: string
  search?: string
  page?: number
  perPage?: number
}) {
  await requireAdmin()

  const { role, search, page = 1, perPage = 20 } = params || {}

  const where: Record<string, unknown> = {}
  if (role && role !== 'ALL') {
    where.role = role
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        executorProfile: {
          select: {
            id: true,
            moderationStatus: true,
            isPublished: true,
            ratingAvg: true,
            reviewsCount: true,
          },
        },
        _count: { select: { orders: true, reviews: true, tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.user.count({ where }),
  ])

  return { users, total, page, perPage, totalPages: Math.ceil(total / perPage) }
}

export async function toggleUserActive(userId: string) {
  await requireAdmin()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true, role: true },
  })
  if (!user) throw new Error('Пользователь не найден')
  if (user.role === 'ADMIN') throw new Error('Нельзя заблокировать администратора')

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  })

  revalidatePath('/admin/users')
  return { success: true, isActive: !user.isActive }
}

export async function changeUserRole(userId: string, newRole: 'CLIENT' | 'EXECUTOR' | 'ADMIN') {
  await requireAdmin()

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('Пользователь не найден')

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  })

  // Если стал исполнителем — создаём профиль если нет
  if (newRole === 'EXECUTOR') {
    const existing = await prisma.executorProfile.findUnique({ where: { userId } })
    if (!existing) {
      await prisma.executorProfile.create({
        data: { userId },
      })
    }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

// ============================================================
// Дашборд — статистика
// ============================================================

export async function getAdminStats() {
  await requireAdmin()

  const [
    totalUsers,
    totalExecutors,
    totalClients,
    pendingModeration,
    totalOrders,
    activeOrders,
    totalTasks,
    activeTasks,
    totalReviews,
    totalCategories,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'EXECUTOR' } }),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.executorProfile.count({ where: { moderationStatus: 'PENDING' } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ['NEW', 'DISCUSSION', 'ACCEPTED', 'IN_PROGRESS'] } } }),
    prisma.task.count(),
    prisma.task.count({ where: { status: 'ACTIVE' } }),
    prisma.review.count(),
    prisma.category.count({ where: { parentId: null } }),
  ])

  // Новые пользователи за последние 7 дней
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const newUsersWeek = await prisma.user.count({
    where: { createdAt: { gte: weekAgo } },
  })

  // Новые заказы за последние 7 дней
  const newOrdersWeek = await prisma.order.count({
    where: { createdAt: { gte: weekAgo } },
  })

  return {
    totalUsers,
    totalExecutors,
    totalClients,
    pendingModeration,
    totalOrders,
    activeOrders,
    totalTasks,
    activeTasks,
    totalReviews,
    totalCategories,
    newUsersWeek,
    newOrdersWeek,
  }
}

// ============================================================
// Жалобы / Отчёты
// ============================================================

export async function getReportedReviews() {
  await requireAdmin()

  // Показываем немодерированные отзывы
  const reviews = await prisma.review.findMany({
    where: { isModerated: false },
    include: {
      client: { select: { id: true, name: true, email: true } },
      executor: {
        select: {
          id: true,
          user: { select: { name: true } },
        },
      },
      order: { select: { id: true, description: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return reviews
}

export async function moderateReview(reviewId: string, approve: boolean) {
  await requireAdmin()

  if (approve) {
    await prisma.review.update({
      where: { id: reviewId },
      data: { isModerated: true },
    })
  } else {
    // Удаляем отзыв и пересчитываем рейтинг
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { executorId: true },
    })

    await prisma.review.delete({ where: { id: reviewId } })

    if (review) {
      // Пересчитываем рейтинг
      const stats = await prisma.review.aggregate({
        where: { executorId: review.executorId },
        _avg: { rating: true },
        _count: { rating: true },
      })

      await prisma.executorProfile.update({
        where: { id: review.executorId },
        data: {
          ratingAvg: stats._avg.rating ?? 0,
          reviewsCount: stats._count.rating,
        },
      })
    }
  }

  revalidatePath('/admin/reports')
  return { success: true }
}

export async function getDisputedOrders() {
  await requireAdmin()

  const orders = await prisma.order.findMany({
    where: { status: 'DISPUTED' },
    include: {
      client: { select: { id: true, name: true, email: true } },
      executor: {
        select: {
          id: true,
          user: { select: { name: true, email: true } },
        },
      },
      service: { select: { name: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return orders
}

export async function resolveDispute(
  orderId: string,
  resolution: 'COMPLETED' | 'CANCELLED'
) {
  await requireAdmin()

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) throw new Error('Заказ не найден')
  if (order.status !== 'DISPUTED') throw new Error('Заказ не в статусе спора')

  await prisma.order.update({
    where: { id: orderId },
    data: { status: resolution },
  })

  // Уведомляем обе стороны
  const notificationData = {
    type: 'SYSTEM' as const,
    title: 'Спор разрешён',
    body: resolution === 'COMPLETED'
      ? 'Администратор разрешил спор в пользу завершения заказа.'
      : 'Администратор разрешил спор. Заказ отменён.',
    link: `/dashboard/client/orders`,
  }

  const executorProfile = await prisma.executorProfile.findUnique({
    where: { id: order.executorId },
    select: { userId: true },
  })

  const notifications: { userId: string; type: 'SYSTEM'; title: string; body: string; link: string }[] = [
    { ...notificationData, userId: order.clientId },
  ]

  if (executorProfile) {
    notifications.push({ ...notificationData, userId: executorProfile.userId })
  }

  await prisma.notification.createMany({ data: notifications })

  revalidatePath('/admin/reports')
  return { success: true }
}

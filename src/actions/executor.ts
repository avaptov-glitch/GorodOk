'use server'

import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'

// Helper: проверяем сессию и получаем ID профиля исполнителя
async function requireExecutorId(userId: string): Promise<string | null> {
  const profile = await prisma.executorProfile.findUnique({
    where: { userId },
    select: { id: true },
  })
  return profile?.id ?? null
}

// ============================================================
// Сохранение / обновление основной анкеты исполнителя
// ============================================================

const SaveProfileSchema = z.object({
  description: z.string().max(2000, 'Не более 2000 символов').optional(),
  experienceYears: z.number().int().min(0).max(60),
  district: z.string().max(100).optional(),
  worksOnline: z.boolean(),
  travelsToClient: z.boolean(),
  acceptsAtOwnPlace: z.boolean(),
  categoryIds: z.array(z.string()),
  isPublished: z.boolean(),
})

export type SaveProfileInput = z.infer<typeof SaveProfileSchema>

export async function saveExecutorProfile(
  data: SaveProfileInput
): Promise<ApiResponse<{ id: string }>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: 'Необходимо авторизоваться' }
  if (session.user.role !== 'EXECUTOR') return { success: false, error: 'Только для исполнителей' }

  const parsed = SaveProfileSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
  }

  const { description, experienceYears, district, worksOnline, travelsToClient, acceptsAtOwnPlace, categoryIds, isPublished } =
    parsed.data

  try {
    const profile = await prisma.executorProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        description: description || null,
        experienceYears,
        district: district || null,
        worksOnline,
        travelsToClient,
        acceptsAtOwnPlace,
        isPublished,
      },
      update: {
        description: description || null,
        experienceYears,
        district: district || null,
        worksOnline,
        travelsToClient,
        acceptsAtOwnPlace,
        isPublished,
      },
      select: { id: true },
    })

    // Полностью заменяем набор категорий
    await prisma.executorCategory.deleteMany({ where: { executorId: profile.id } })
    if (categoryIds.length > 0) {
      await prisma.executorCategory.createMany({
        data: categoryIds.map((categoryId) => ({ executorId: profile.id, categoryId })),
        skipDuplicates: true,
      })
    }

    revalidatePath('/dashboard/executor/profile')
    return { success: true, data: { id: profile.id } }
  } catch {
    return { success: false, error: 'Ошибка при сохранении анкеты' }
  }
}

// ============================================================
// CRUD услуг
// ============================================================

const ServiceSchema = z.object({
  categoryId: z.string().min(1, 'Выберите категорию'),
  name: z.string().min(2, 'Название слишком короткое').max(200),
  description: z.string().max(500).optional(),
  priceType: z.enum(['FIXED', 'FROM', 'RANGE', 'NEGOTIABLE', 'PER_HOUR']),
  priceFrom: z.number().int().min(0, 'Цена не может быть отрицательной'),
  priceTo: z.number().int().min(0).optional(),
})

export type ServiceInput = z.infer<typeof ServiceSchema>

export async function createService(data: ServiceInput): Promise<ApiResponse<{ id: string }>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: 'Необходимо авторизоваться' }
  if (session.user.role !== 'EXECUTOR') return { success: false, error: 'Только для исполнителей' }

  const executorId = await requireExecutorId(session.user.id)
  if (!executorId) return { success: false, error: 'Сначала заполните анкету исполнителя' }

  const parsed = ServiceSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
  }

  try {
    const service = await prisma.service.create({
      data: {
        executorId,
        categoryId: parsed.data.categoryId,
        name: parsed.data.name,
        description: parsed.data.description || null,
        priceType: parsed.data.priceType,
        priceFrom: parsed.data.priceFrom * 100, // Рубли → копейки
        priceTo: parsed.data.priceTo ? parsed.data.priceTo * 100 : null,
      },
      select: { id: true },
    })
    revalidatePath('/dashboard/executor/services')
    return { success: true, data: { id: service.id } }
  } catch {
    return { success: false, error: 'Ошибка при создании услуги' }
  }
}

export async function updateService(id: string, data: ServiceInput): Promise<ApiResponse<void>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: 'Необходимо авторизоваться' }
  if (session.user.role !== 'EXECUTOR') return { success: false, error: 'Только для исполнителей' }

  const executorId = await requireExecutorId(session.user.id)
  if (!executorId) return { success: false, error: 'Профиль исполнителя не найден' }

  const parsed = ServiceSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
  }

  try {
    // updateMany с проверкой владельца (executorId) — защита от чужих данных
    await prisma.service.updateMany({
      where: { id, executorId },
      data: {
        categoryId: parsed.data.categoryId,
        name: parsed.data.name,
        description: parsed.data.description || null,
        priceType: parsed.data.priceType,
        priceFrom: parsed.data.priceFrom * 100,
        priceTo: parsed.data.priceTo ? parsed.data.priceTo * 100 : null,
      },
    })
    revalidatePath('/dashboard/executor/services')
    return { success: true }
  } catch {
    return { success: false, error: 'Ошибка при обновлении услуги' }
  }
}

export async function deleteService(id: string): Promise<ApiResponse<void>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: 'Необходимо авторизоваться' }
  if (session.user.role !== 'EXECUTOR') return { success: false, error: 'Только для исполнителей' }

  const executorId = await requireExecutorId(session.user.id)
  if (!executorId) return { success: false, error: 'Профиль исполнителя не найден' }

  try {
    await prisma.service.deleteMany({ where: { id, executorId } })
    revalidatePath('/dashboard/executor/services')
    return { success: true }
  } catch {
    return { success: false, error: 'Ошибка при удалении услуги' }
  }
}

export async function toggleServiceActive(
  id: string,
  isActive: boolean
): Promise<ApiResponse<void>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: 'Необходимо авторизоваться' }
  if (session.user.role !== 'EXECUTOR') return { success: false, error: 'Только для исполнителей' }

  const executorId = await requireExecutorId(session.user.id)
  if (!executorId) return { success: false, error: 'Профиль исполнителя не найден' }

  try {
    await prisma.service.updateMany({ where: { id, executorId }, data: { isActive } })
    revalidatePath('/dashboard/executor/services')
    return { success: true }
  } catch {
    return { success: false, error: 'Ошибка при обновлении услуги' }
  }
}

// ============================================================
// Портфолио
// ============================================================

export async function addPortfolioItem(
  imageUrl: string,
  description?: string
): Promise<ApiResponse<{ id: string }>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: 'Необходимо авторизоваться' }
  if (session.user.role !== 'EXECUTOR') return { success: false, error: 'Только для исполнителей' }

  const executorId = await requireExecutorId(session.user.id)
  if (!executorId) return { success: false, error: 'Профиль исполнителя не найден' }

  try {
    const count = await prisma.portfolio.count({ where: { executorId } })
    if (count >= 20) return { success: false, error: 'Максимум 20 фотографий в портфолио' }

    const maxOrder = await prisma.portfolio.aggregate({
      where: { executorId },
      _max: { order: true },
    })

    const item = await prisma.portfolio.create({
      data: {
        executorId,
        imageUrl,
        description: description || null,
        order: (maxOrder._max.order ?? 0) + 1,
      },
      select: { id: true },
    })
    revalidatePath('/dashboard/executor/portfolio')
    return { success: true, data: { id: item.id } }
  } catch {
    return { success: false, error: 'Ошибка при добавлении фото' }
  }
}

export async function deletePortfolioItem(id: string): Promise<ApiResponse<void>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: 'Необходимо авторизоваться' }
  if (session.user.role !== 'EXECUTOR') return { success: false, error: 'Только для исполнителей' }

  const executorId = await requireExecutorId(session.user.id)
  if (!executorId) return { success: false, error: 'Профиль исполнителя не найден' }

  try {
    await prisma.portfolio.deleteMany({ where: { id, executorId } })
    revalidatePath('/dashboard/executor/portfolio')
    return { success: true }
  } catch {
    return { success: false, error: 'Ошибка при удалении фото' }
  }
}

// ============================================================
// Сертификаты
// ============================================================

export async function addCertificate(
  imageUrl: string,
  title: string
): Promise<ApiResponse<{ id: string }>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: 'Необходимо авторизоваться' }
  if (session.user.role !== 'EXECUTOR') return { success: false, error: 'Только для исполнителей' }

  const executorId = await requireExecutorId(session.user.id)
  if (!executorId) return { success: false, error: 'Профиль исполнителя не найден' }

  if (!title || title.trim().length < 2) return { success: false, error: 'Введите название документа' }

  try {
    const cert = await prisma.certificate.create({
      data: { executorId, imageUrl, title: title.trim() },
      select: { id: true },
    })
    revalidatePath('/dashboard/executor/portfolio')
    return { success: true, data: { id: cert.id } }
  } catch {
    return { success: false, error: 'Ошибка при добавлении сертификата' }
  }
}

export async function deleteCertificate(id: string): Promise<ApiResponse<void>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: 'Необходимо авторизоваться' }
  if (session.user.role !== 'EXECUTOR') return { success: false, error: 'Только для исполнителей' }

  const executorId = await requireExecutorId(session.user.id)
  if (!executorId) return { success: false, error: 'Профиль исполнителя не найден' }

  try {
    await prisma.certificate.deleteMany({ where: { id, executorId } })
    revalidatePath('/dashboard/executor/portfolio')
    return { success: true }
  } catch {
    return { success: false, error: 'Ошибка при удалении сертификата' }
  }
}

// ============================================================
// Расписание (все 7 дней за один раз)
// ============================================================

const ScheduleDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Формат времени: ЧЧ:ММ'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Формат времени: ЧЧ:ММ'),
  isAvailable: z.boolean(),
})

const SaveScheduleSchema = z.array(ScheduleDaySchema).length(7)

export type ScheduleDayInput = z.infer<typeof ScheduleDaySchema>

export async function saveSchedule(days: ScheduleDayInput[]): Promise<ApiResponse<void>> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { success: false, error: 'Необходимо авторизоваться' }
  if (session.user.role !== 'EXECUTOR') return { success: false, error: 'Только для исполнителей' }

  const executorId = await requireExecutorId(session.user.id)
  if (!executorId) return { success: false, error: 'Профиль исполнителя не найден' }

  const parsed = SaveScheduleSchema.safeParse(days)
  if (!parsed.success) {
    return { success: false, error: 'Неверный формат расписания' }
  }

  try {
    // Удаляем старое расписание и создаём новое
    await prisma.schedule.deleteMany({ where: { executorId } })
    await prisma.schedule.createMany({
      data: parsed.data.map((d) => ({ executorId, ...d })),
    })
    revalidatePath('/dashboard/executor/schedule')
    return { success: true }
  } catch {
    return { success: false, error: 'Ошибка при сохранении расписания' }
  }
}

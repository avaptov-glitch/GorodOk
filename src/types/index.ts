// Локальный импорт для использования внутри этого файла
import type {
  User,
  ExecutorProfile,
  Category,
  Service,
  Portfolio,
  Certificate,
  Review,
  Subscription,
} from '@/generated/prisma/client'

// Re-export Prisma-generated model types for use across the application
export type {
  User,
  ExecutorProfile,
  Category,
  Service,
  Portfolio,
  Certificate,
  Review,
  Order,
  ChatMessage,
  Notification,
  Task,
  TaskResponse,
  Subscription,
  Favorite,
  Schedule,
} from '@/generated/prisma/client'

// Re-export enum types
export type {
  Role,
  ModerationStatus,
  PriceType,
  OrderStatus,
  NotificationType,
  TaskStatus,
  Plan,
} from '@/generated/prisma/client'

// Обёртка для всех API-ответов
export type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

// Тип для карточки исполнителя в каталоге
export type ExecutorCardData = {
  id: string
  ratingAvg: number
  reviewsCount: number
  district: string | null
  isVerified: boolean
  isPro: boolean
  user: { name: string; avatarUrl: string | null }
  categories: Array<{ category: { name: string; slug: string } }>
  services: Array<{ name: string; priceFrom: number; priceType: string }>
}

// Исполнитель с полными данными для страницы профиля
export type ExecutorProfileFull = ExecutorProfile & {
  user: Pick<User, 'name' | 'avatarUrl' | 'city' | 'lastSeenAt'>
  categories: Array<{ category: Pick<Category, 'name' | 'slug' | 'icon'> }>
  services: Service[]
  portfolio: Portfolio[]
  certificates: Certificate[]
  reviews: Array<Review & { client: Pick<User, 'name' | 'avatarUrl'> }>
  subscription: Subscription | null
}

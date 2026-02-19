import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Статические страницы
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/tasks`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/login`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/register`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Категории
  const categories = await prisma.category.findMany({
    select: { slug: true },
  })

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Опубликованные исполнители
  const executors = await prisma.executorProfile.findMany({
    where: { isPublished: true, moderationStatus: 'APPROVED' },
    select: { id: true, updatedAt: true },
  })

  const executorPages: MetadataRoute.Sitemap = executors.map((exec) => ({
    url: `${SITE_URL}/executor/${exec.id}`,
    lastModified: exec.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Открытые задания
  const tasks = await prisma.task.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, updatedAt: true },
  })

  const taskPages: MetadataRoute.Sitemap = tasks.map((task) => ({
    url: `${SITE_URL}/task/${task.id}`,
    lastModified: task.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...categoryPages, ...executorPages, ...taskPages]
}

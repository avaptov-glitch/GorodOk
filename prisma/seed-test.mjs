import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Загружаем .env
try {
  const envContent = readFileSync(resolve(__dirname, '../.env'), 'utf8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim()
        let value = trimmed.substring(eqIdx + 1).trim()
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
        if (!process.env[key]) process.env[key] = value
      }
    }
  }
} catch {}

const { PrismaClient } = await import('../src/generated/prisma/client.ts')
const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('password123', 10)

  // Клиент
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@test.com' },
    update: {},
    create: { email: 'client@test.com', name: 'Иван Петров', passwordHash: hash, role: 'CLIENT', city: 'Вологда' },
  })
  console.log('Client:', clientUser.email)

  // Исполнитель
  const execUser = await prisma.user.upsert({
    where: { email: 'executor@test.com' },
    update: {},
    create: { email: 'executor@test.com', name: 'Алексей Мастеров', passwordHash: hash, role: 'EXECUTOR', city: 'Вологда' },
  })
  console.log('Executor:', execUser.email)

  // Категория
  const category = await prisma.category.findFirst({ where: { parentId: { not: null } } })
  if (!category) { console.error('Нет категорий — запусти npm run db:seed'); return }
  console.log('Category:', category.name)

  // Профиль исполнителя
  const profile = await prisma.executorProfile.upsert({
    where: { userId: execUser.id },
    update: { isPublished: true, moderationStatus: 'APPROVED' },
    create: {
      userId: execUser.id,
      description: 'Опытный репетитор по математике и физике. Готовлю к ЕГЭ, ОГЭ и олимпиадам. Индивидуальный подход к каждому ученику.\n\nРаботаю с учениками 5–11 классов. Средний балл ЕГЭ у моих учеников — 87 баллов.',
      experienceYears: 7,
      district: 'Центральный',
      worksOnline: true,
      travelsToClient: true,
      isVerified: true,
      isPro: true,
      ratingAvg: 4.8,
      reviewsCount: 12,
      viewsCount: 342,
      isPublished: true,
      moderationStatus: 'APPROVED',
    },
  })
  console.log('Profile:', profile.id)

  // Привязка к категории
  await prisma.executorCategory.upsert({
    where: { executorId_categoryId: { executorId: profile.id, categoryId: category.id } },
    update: {},
    create: { executorId: profile.id, categoryId: category.id },
  })

  // Услуги
  const cnt = await prisma.service.count({ where: { executorId: profile.id } })
  if (cnt === 0) {
    await prisma.service.createMany({
      data: [
        { executorId: profile.id, categoryId: category.id, name: 'Репетиторство по математике', description: 'Подготовка к ЕГЭ и ОГЭ, решение задач', priceFrom: 250000, priceType: 'FROM' },
        { executorId: profile.id, categoryId: category.id, name: 'Подготовка к ОГЭ по физике', priceFrom: 200000, priceType: 'FROM' },
        { executorId: profile.id, categoryId: category.id, name: 'Олимпиадная математика', description: 'Подготовка к олимпиадам', priceFrom: 300000, priceTo: 400000, priceType: 'RANGE' },
      ],
    })
    console.log('Services created')
  }

  console.log('\n✅ Готово!')
  console.log('   Страница профиля: http://localhost:3000/executor/' + profile.id)
  console.log('   Логин клиента:    client@test.com / password123')
  console.log('   Логин исп-ля:     executor@test.com / password123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

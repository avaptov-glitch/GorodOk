import 'dotenv/config'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
async function createCategoryWithChildren(
  parent: { name: string; slug: string; icon: string; order: number },
  children: Array<{ name: string; slug: string; icon: string; order: number }>
) {
  const parentCategory = await prisma.category.upsert({
    where: { slug: parent.slug },
    update: {},
    create: parent,
  })

  for (const child of children) {
    await prisma.category.upsert({
      where: { slug: child.slug },
      update: {},
      create: { ...child, parentId: parentCategory.id },
    })
  }

  return parentCategory
}

async function main() {
  console.log('Засеваем категории услуг...')

  // 1. Образование
  await createCategoryWithChildren(
    { name: 'Образование', slug: 'education', icon: 'GraduationCap', order: 1 },
    [
      { name: 'Репетиторы', slug: 'tutors', icon: 'BookOpen', order: 1 },
      { name: 'Курсы иностранных языков', slug: 'language-courses', icon: 'Languages', order: 2 },
      { name: 'Музыкальные уроки', slug: 'music-lessons', icon: 'Music', order: 3 },
      { name: 'Подготовка к школе', slug: 'school-prep', icon: 'School', order: 4 },
    ]
  )

  // 2. Спорт и фитнес
  await createCategoryWithChildren(
    { name: 'Спорт и фитнес', slug: 'sports-fitness', icon: 'Dumbbell', order: 2 },
    [
      { name: 'Персональный тренер', slug: 'personal-trainer', icon: 'Dumbbell', order: 1 },
      { name: 'Йога', slug: 'yoga', icon: 'Leaf', order: 2 },
      { name: 'Плавание', slug: 'swimming', icon: 'Waves', order: 3 },
      { name: 'Единоборства', slug: 'martial-arts', icon: 'Shield', order: 4 },
    ]
  )

  // 3. Ремонт и строительство
  await createCategoryWithChildren(
    { name: 'Ремонт и строительство', slug: 'repair-construction', icon: 'Hammer', order: 3 },
    [
      { name: 'Сантехник', slug: 'plumber', icon: 'Droplets', order: 1 },
      { name: 'Электрик', slug: 'electrician', icon: 'Zap', order: 2 },
      { name: 'Отделочные работы', slug: 'finishing-works', icon: 'PaintBucket', order: 3 },
      { name: 'Сборка мебели', slug: 'furniture-assembly', icon: 'Armchair', order: 4 },
    ]
  )

  // 4. Авто
  await createCategoryWithChildren(
    { name: 'Авто', slug: 'auto', icon: 'Car', order: 4 },
    [
      { name: 'СТО', slug: 'car-service', icon: 'Wrench', order: 1 },
      { name: 'Автоэлектрик', slug: 'auto-electrician', icon: 'Zap', order: 2 },
      { name: 'Автомойка', slug: 'car-wash', icon: 'Droplets', order: 3 },
      { name: 'Эвакуатор', slug: 'tow-truck', icon: 'Truck', order: 4 },
    ]
  )

  // 5. IT и Digital
  await createCategoryWithChildren(
    { name: 'IT и Digital', slug: 'it-digital', icon: 'Monitor', order: 5 },
    [
      { name: 'Создание сайтов', slug: 'web-development', icon: 'Globe', order: 1 },
      { name: 'Настройка компьютеров', slug: 'pc-setup', icon: 'Settings', order: 2 },
      { name: 'SMM', slug: 'smm', icon: 'Share2', order: 3 },
      { name: 'Дизайн', slug: 'design', icon: 'Palette', order: 4 },
    ]
  )

  // 6. Красота и здоровье
  await createCategoryWithChildren(
    { name: 'Красота и здоровье', slug: 'beauty-health', icon: 'Sparkles', order: 6 },
    [
      { name: 'Парикмахер', slug: 'hairdresser', icon: 'Scissors', order: 1 },
      { name: 'Маникюр', slug: 'manicure', icon: 'Hand', order: 2 },
      { name: 'Массаж', slug: 'massage', icon: 'Heart', order: 3 },
      { name: 'Косметолог', slug: 'cosmetologist', icon: 'Smile', order: 4 },
    ]
  )

  // 7. Дом и быт
  await createCategoryWithChildren(
    { name: 'Дом и быт', slug: 'home-lifestyle', icon: 'Home', order: 7 },
    [
      { name: 'Уборка', slug: 'cleaning', icon: 'Sparkles', order: 1 },
      { name: 'Помощь с переездом', slug: 'moving', icon: 'PackageOpen', order: 2 },
      { name: 'Садовые работы', slug: 'gardening', icon: 'TreePine', order: 3 },
      { name: 'Готовка', slug: 'cooking', icon: 'ChefHat', order: 4 },
    ]
  )

  // 8. Юридические и финансовые
  await createCategoryWithChildren(
    { name: 'Юридические и финансовые', slug: 'legal-financial', icon: 'Scale', order: 8 },
    [
      { name: 'Юрист', slug: 'lawyer', icon: 'Scale', order: 1 },
      { name: 'Бухгалтер', slug: 'accountant', icon: 'Calculator', order: 2 },
      { name: 'Риэлтор', slug: 'realtor', icon: 'Building', order: 3 },
      { name: 'Страхование', slug: 'insurance', icon: 'Shield', order: 4 },
    ]
  )

  // 9. Мероприятия
  await createCategoryWithChildren(
    { name: 'Мероприятия', slug: 'events', icon: 'PartyPopper', order: 9 },
    [
      { name: 'Фотограф', slug: 'photographer', icon: 'Camera', order: 1 },
      { name: 'Видеооператор', slug: 'videographer', icon: 'Video', order: 2 },
      { name: 'Аниматор', slug: 'animator', icon: 'Star', order: 3 },
      { name: 'Ведущий', slug: 'host', icon: 'Mic', order: 4 },
    ]
  )

  // 10. Животные
  await createCategoryWithChildren(
    { name: 'Животные', slug: 'animals', icon: 'PawPrint', order: 10 },
    [
      { name: 'Ветеринар', slug: 'veterinarian', icon: 'Stethoscope', order: 1 },
      { name: 'Груминг', slug: 'grooming', icon: 'Scissors', order: 2 },
      { name: 'Дрессировка', slug: 'dog-training', icon: 'PawPrint', order: 3 },
      { name: 'Зоотакси', slug: 'pet-taxi', icon: 'Car', order: 4 },
    ]
  )

  const count = await prisma.category.count()
  console.log(`Готово! Создано категорий: ${count}`)
}

main()
  .catch((e) => {
    console.error('Ошибка при засеве данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })







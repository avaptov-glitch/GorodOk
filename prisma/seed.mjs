import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load dotenv manually
const envPath = resolve(__dirname, '../.env');
try {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        let value = trimmed.substring(eqIdx + 1).trim();
        if (value.startsWith('') && value.endsWith('')) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value;
      }
    }
  }
} catch (e) {
  // .env not found, continue
}

const { PrismaClient } = await import('../src/generated/prisma/client.ts');

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
});

async function createCategoryWithChildren(parent, children) {
  const parentCategory = await prisma.category.upsert({
    where: { slug: parent.slug },
    update: {},
    create: parent,
  });

  for (const child of children) {
    await prisma.category.upsert({
      where: { slug: child.slug },
      update: {},
      create: { ...child, parentId: parentCategory.id },
    });
  }

  return parentCategory;
}

async function main() {
  console.log('Seeding categories...');

  await createCategoryWithChildren(
    { name: 'Образование', slug: 'education', icon: 'GraduationCap', order: 1 },
    [
      { name: 'Репетиторы', slug: 'tutors', icon: 'BookOpen', order: 1 },
      { name: 'Курсы иностранных языков', slug: 'language-courses', icon: 'Languages', order: 2 },
      { name: 'Уроки музыки', slug: 'music-lessons', icon: 'Music', order: 3 },
      { name: 'Подготовка к школе', slug: 'school-prep', icon: 'School', order: 4 },
    ]
  );

  await createCategoryWithChildren(
    { name: 'Спорт и фитнес', slug: 'sports-fitness', icon: 'Dumbbell', order: 2 },
    [
      { name: 'Персональный тренер', slug: 'personal-trainer', icon: 'Dumbbell', order: 1 },
      { name: 'Йога', slug: 'yoga', icon: 'Leaf', order: 2 },
      { name: 'Плавание', slug: 'swimming', icon: 'Waves', order: 3 },
      { name: 'Боевые искусства', slug: 'martial-arts', icon: 'Shield', order: 4 },
    ]
  );

  await createCategoryWithChildren(
    { name: 'Ремонт и строительство', slug: 'repair-construction', icon: 'Hammer', order: 3 },
    [
      { name: 'Сантехник', slug: 'plumber', icon: 'Droplets', order: 1 },
      { name: 'Электрик', slug: 'electrician', icon: 'Zap', order: 2 },
      { name: 'Отделочные работы', slug: 'finishing-works', icon: 'PaintBucket', order: 3 },
      { name: 'Сборка мебели', slug: 'furniture-assembly', icon: 'Armchair', order: 4 },
    ]
  );

  await createCategoryWithChildren(
    { name: 'Авто', slug: 'auto', icon: 'Car', order: 4 },
    [
      { name: 'Автосервис', slug: 'car-service', icon: 'Wrench', order: 1 },
      { name: 'Автоэлектрик', slug: 'auto-electrician', icon: 'Zap', order: 2 },
      { name: 'Автомойка', slug: 'car-wash', icon: 'Droplets', order: 3 },
      { name: 'Эвакуатор', slug: 'tow-truck', icon: 'Truck', order: 4 },
    ]
  );

  await createCategoryWithChildren(
    { name: 'IT и Digital', slug: 'it-digital', icon: 'Monitor', order: 5 },
    [
      { name: 'Веб-разработка', slug: 'web-development', icon: 'Globe', order: 1 },
      { name: 'Настройка компьютеров', slug: 'pc-setup', icon: 'Settings', order: 2 },
      { name: 'SMM', slug: 'smm', icon: 'Share2', order: 3 },
      { name: 'Дизайн', slug: 'design', icon: 'Palette', order: 4 },
    ]
  );

  await createCategoryWithChildren(
    { name: 'Красота и здоровье', slug: 'beauty-health', icon: 'Sparkles', order: 6 },
    [
      { name: 'Парикмахер', slug: 'hairdresser', icon: 'Scissors', order: 1 },
      { name: 'Маникюр', slug: 'manicure', icon: 'Hand', order: 2 },
      { name: 'Массаж', slug: 'massage', icon: 'Heart', order: 3 },
      { name: 'Косметолог', slug: 'cosmetologist', icon: 'Smile', order: 4 },
    ]
  );

  await createCategoryWithChildren(
    { name: 'Дом и быт', slug: 'home-lifestyle', icon: 'Home', order: 7 },
    [
      { name: 'Уборка', slug: 'cleaning', icon: 'Sparkles', order: 1 },
      { name: 'Переезд и грузчики', slug: 'moving', icon: 'PackageOpen', order: 2 },
      { name: 'Садовые работы', slug: 'gardening', icon: 'TreePine', order: 3 },
      { name: 'Кулинария', slug: 'cooking', icon: 'ChefHat', order: 4 },
    ]
  );

  await createCategoryWithChildren(
    { name: 'Юридические и финансовые', slug: 'legal-financial', icon: 'Scale', order: 8 },
    [
      { name: 'Юрист', slug: 'lawyer', icon: 'Scale', order: 1 },
      { name: 'Бухгалтер', slug: 'accountant', icon: 'Calculator', order: 2 },
      { name: 'Риелтор', slug: 'realtor', icon: 'Building', order: 3 },
      { name: 'Страхование', slug: 'insurance', icon: 'Shield', order: 4 },
    ]
  );

  await createCategoryWithChildren(
    { name: 'Мероприятия', slug: 'events', icon: 'PartyPopper', order: 9 },
    [
      { name: 'Фотограф', slug: 'photographer', icon: 'Camera', order: 1 },
      { name: 'Видеограф', slug: 'videographer', icon: 'Video', order: 2 },
      { name: 'Аниматор', slug: 'animator', icon: 'Star', order: 3 },
      { name: 'Ведущий', slug: 'host', icon: 'Mic', order: 4 },
    ]
  );

  await createCategoryWithChildren(
    { name: 'Животные', slug: 'animals', icon: 'PawPrint', order: 10 },
    [
      { name: 'Ветеринар', slug: 'veterinarian', icon: 'Stethoscope', order: 1 },
      { name: 'Груминг', slug: 'grooming', icon: 'Scissors', order: 2 },
      { name: 'Дрессировка', slug: 'dog-training', icon: 'PawPrint', order: 3 },
      { name: 'Зоотакси', slug: 'pet-taxi', icon: 'Car', order: 4 },
    ]
  );

  const count = await prisma.category.count();
  console.log('Done! Categories created: ' + count);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.``disconnect();
  });

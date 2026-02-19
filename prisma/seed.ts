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
    update: { name: parent.name, icon: parent.icon, order: parent.order },
    create: parent,
  })

  for (const child of children) {
    await prisma.category.upsert({
      where: { slug: child.slug },
      update: { name: child.name, icon: child.icon, order: child.order, parentId: parentCategory.id },
      create: { ...child, parentId: parentCategory.id },
    })
  }

  return parentCategory
}

async function main() {
  console.log('Засеваем категории услуг (19 рубрик)...')

  // 1. Репетиторы и обучение
  await createCategoryWithChildren(
    { name: 'Репетиторы и обучение', slug: 'education', icon: 'GraduationCap', order: 1 },
    [
      { name: 'Репетитор по математике', slug: 'math-tutor', icon: 'Calculator', order: 1 },
      { name: 'Английский язык', slug: 'english-tutor', icon: 'Languages', order: 2 },
      { name: 'Русский язык', slug: 'russian-tutor', icon: 'BookOpen', order: 3 },
      { name: 'Физика', slug: 'physics-tutor', icon: 'Atom', order: 4 },
      { name: 'Химия', slug: 'chemistry-tutor', icon: 'FlaskConical', order: 5 },
      { name: 'Подготовка к ЕГЭ/ОГЭ', slug: 'exam-prep', icon: 'FileCheck', order: 6 },
      { name: 'Подготовка к школе', slug: 'school-prep', icon: 'School', order: 7 },
      { name: 'Программирование', slug: 'programming-tutor', icon: 'Code', order: 8 },
      { name: 'Музыкальные уроки', slug: 'music-lessons', icon: 'Music', order: 9 },
      { name: 'Рисование', slug: 'drawing-lessons', icon: 'Palette', order: 10 },
      { name: 'Логопед', slug: 'speech-therapist', icon: 'MessageCircle', order: 11 },
      { name: 'Курсы иностранных языков', slug: 'language-courses', icon: 'Globe', order: 12 },
    ]
  )

  // 2. Ремонт и строительство
  await createCategoryWithChildren(
    { name: 'Ремонт и строительство', slug: 'repair-construction', icon: 'Hammer', order: 2 },
    [
      { name: 'Ремонт квартир и домов', slug: 'apartment-renovation', icon: 'Home', order: 1 },
      { name: 'Мастер на час', slug: 'handyman', icon: 'Wrench', order: 2 },
      { name: 'Сантехнические работы', slug: 'plumber', icon: 'Droplets', order: 3 },
      { name: 'Электромонтажные работы', slug: 'electrician', icon: 'Zap', order: 4 },
      { name: 'Отделочные работы', slug: 'finishing-works', icon: 'PaintBucket', order: 5 },
      { name: 'Плиточные работы', slug: 'tiling', icon: 'LayoutGrid', order: 6 },
      { name: 'Сборка мебели', slug: 'furniture-assembly', icon: 'Armchair', order: 7 },
      { name: 'Окна и балконы', slug: 'windows-balconies', icon: 'Square', order: 8 },
      { name: 'Кровельные работы', slug: 'roofing', icon: 'Tent', order: 9 },
      { name: 'Штукатурные работы', slug: 'plastering', icon: 'Layers', order: 10 },
      { name: 'Утепление', slug: 'insulation', icon: 'Thermometer', order: 11 },
    ]
  )

  // 3. Ремонт и установка техники
  await createCategoryWithChildren(
    { name: 'Ремонт и установка техники', slug: 'repair-tech', icon: 'Smartphone', order: 3 },
    [
      { name: 'Ремонт телефонов и планшетов', slug: 'phone-repair', icon: 'Smartphone', order: 1 },
      { name: 'Ремонт ноутбуков', slug: 'laptop-repair', icon: 'Laptop', order: 2 },
      { name: 'Установка кондиционеров', slug: 'ac-install', icon: 'Wind', order: 3 },
      { name: 'Ремонт холодильников', slug: 'fridge-repair', icon: 'Refrigerator', order: 4 },
      { name: 'Ремонт стиральных машин', slug: 'washer-repair', icon: 'WashingMachine', order: 5 },
      { name: 'Ремонт телевизоров', slug: 'tv-repair', icon: 'Tv', order: 6 },
      { name: 'Ремонт микроволновок', slug: 'microwave-repair', icon: 'Microwave', order: 7 },
      { name: 'Ремонт посудомоечных машин', slug: 'dishwasher-repair', icon: 'UtensilsCrossed', order: 8 },
      { name: 'Установка бытовой техники', slug: 'appliance-install', icon: 'Plug', order: 9 },
    ]
  )

  // 4. Ремонт авто
  await createCategoryWithChildren(
    { name: 'Ремонт авто', slug: 'auto', icon: 'Car', order: 4 },
    [
      { name: 'Автосервис', slug: 'car-service', icon: 'Wrench', order: 1 },
      { name: 'Автоэлектрик', slug: 'auto-electrician', icon: 'Zap', order: 2 },
      { name: 'Шиномонтаж', slug: 'tire-service', icon: 'Circle', order: 3 },
      { name: 'Диагностика', slug: 'car-diagnostics', icon: 'ScanLine', order: 4 },
      { name: 'Кузовной ремонт', slug: 'body-repair', icon: 'Paintbrush', order: 5 },
      { name: 'Детейлинг', slug: 'detailing', icon: 'Sparkles', order: 6 },
      { name: 'Автомойка', slug: 'car-wash', icon: 'Droplets', order: 7 },
      { name: 'Эвакуатор', slug: 'tow-truck', icon: 'Truck', order: 8 },
      { name: 'Антикоррозийная обработка', slug: 'anticorrosion', icon: 'ShieldCheck', order: 9 },
      { name: 'Замена стёкол', slug: 'glass-replacement', icon: 'RectangleHorizontal', order: 10 },
    ]
  )

  // 5. Компьютеры и IT
  await createCategoryWithChildren(
    { name: 'Компьютеры и IT', slug: 'it-digital', icon: 'Monitor', order: 5 },
    [
      { name: 'Компьютерная помощь', slug: 'pc-setup', icon: 'Settings', order: 1 },
      { name: 'Создание сайтов', slug: 'web-development', icon: 'Globe', order: 2 },
      { name: 'Разработка программ', slug: 'software-dev', icon: 'Code', order: 3 },
      { name: 'SMM и соцсети', slug: 'smm', icon: 'Share2', order: 4 },
      { name: 'SEO-продвижение', slug: 'seo', icon: 'Search', order: 5 },
      { name: 'Администрирование серверов', slug: 'server-admin', icon: 'Server', order: 6 },
      { name: 'Настройка 1С', slug: 'setup-1c', icon: 'Database', order: 7 },
      { name: 'Контент-маркетинг', slug: 'content-marketing', icon: 'FileText', order: 8 },
      { name: 'Мобильные приложения', slug: 'mobile-apps', icon: 'Smartphone', order: 9 },
      { name: 'Настройка рекламы', slug: 'ads-setup', icon: 'Megaphone', order: 10 },
    ]
  )

  // 6. Репетиторы и тренеры → Тренеры
  await createCategoryWithChildren(
    { name: 'Тренеры', slug: 'sports-fitness', icon: 'Dumbbell', order: 6 },
    [
      { name: 'Персональный тренер', slug: 'personal-trainer', icon: 'Dumbbell', order: 1 },
      { name: 'Фитнес', slug: 'fitness', icon: 'HeartPulse', order: 2 },
      { name: 'Йога', slug: 'yoga', icon: 'Leaf', order: 3 },
      { name: 'Плавание', slug: 'swimming', icon: 'Waves', order: 4 },
      { name: 'Танцы', slug: 'dance', icon: 'Music2', order: 5 },
      { name: 'Единоборства', slug: 'martial-arts', icon: 'Shield', order: 6 },
      { name: 'Теннис', slug: 'tennis', icon: 'CircleDot', order: 7 },
      { name: 'Оздоровительный спорт', slug: 'wellness-sport', icon: 'Heart', order: 8 },
      { name: 'Шахматы', slug: 'chess', icon: 'Crown', order: 9 },
    ]
  )

  // 7. Красота
  await createCategoryWithChildren(
    { name: 'Красота', slug: 'beauty-health', icon: 'Sparkles', order: 7 },
    [
      { name: 'Парикмахер', slug: 'hairdresser', icon: 'Scissors', order: 1 },
      { name: 'Маникюр', slug: 'manicure', icon: 'Hand', order: 2 },
      { name: 'Педикюр', slug: 'pedicure', icon: 'Footprints', order: 3 },
      { name: 'Массаж', slug: 'massage', icon: 'Heart', order: 4 },
      { name: 'Косметолог', slug: 'cosmetologist', icon: 'Smile', order: 5 },
      { name: 'Брови и ресницы', slug: 'brows-lashes', icon: 'Eye', order: 6 },
      { name: 'Визажист', slug: 'makeup-artist', icon: 'Palette', order: 7 },
      { name: 'Стилист', slug: 'stylist', icon: 'Shirt', order: 8 },
      { name: 'Эпиляция', slug: 'epilation', icon: 'Sparkle', order: 9 },
      { name: 'Татуаж', slug: 'permanent-makeup', icon: 'Pen', order: 10 },
    ]
  )

  // 8. Перевозки и курьеры
  await createCategoryWithChildren(
    { name: 'Перевозки и курьеры', slug: 'transport-delivery', icon: 'Truck', order: 8 },
    [
      { name: 'Грузоперевозки', slug: 'cargo-transport', icon: 'Truck', order: 1 },
      { name: 'Курьерская доставка', slug: 'courier', icon: 'Package', order: 2 },
      { name: 'Услуги грузчиков', slug: 'movers', icon: 'PackageOpen', order: 3 },
      { name: 'Переезд под ключ', slug: 'full-moving', icon: 'Home', order: 4 },
      { name: 'Эвакуатор', slug: 'evacuator', icon: 'CarFront', order: 5 },
      { name: 'Вывоз мусора', slug: 'waste-removal', icon: 'Trash2', order: 6 },
      { name: 'Междугородние перевозки', slug: 'intercity-transport', icon: 'Route', order: 7 },
      { name: 'Доставка продуктов', slug: 'food-delivery', icon: 'ShoppingBag', order: 8 },
    ]
  )

  // 9. Хозяйство и уборка
  await createCategoryWithChildren(
    { name: 'Хозяйство и уборка', slug: 'home-lifestyle', icon: 'Home', order: 9 },
    [
      { name: 'Уборка квартир', slug: 'cleaning', icon: 'Sparkles', order: 1 },
      { name: 'Генеральная уборка', slug: 'deep-cleaning', icon: 'SprayCan', order: 2 },
      { name: 'Химчистка мебели', slug: 'furniture-cleaning', icon: 'Armchair', order: 3 },
      { name: 'Мытьё окон', slug: 'window-cleaning', icon: 'Square', order: 4 },
      { name: 'Ремонт одежды', slug: 'clothes-repair', icon: 'Shirt', order: 5 },
      { name: 'Няни и сиделки', slug: 'nanny-caregiver', icon: 'Baby', order: 6 },
      { name: 'Садовые работы', slug: 'gardening', icon: 'TreePine', order: 7 },
      { name: 'Уборка территории', slug: 'outdoor-cleaning', icon: 'Trees', order: 8 },
      { name: 'Готовка на дом', slug: 'cooking', icon: 'ChefHat', order: 9 },
      { name: 'Стирка и глажка', slug: 'laundry', icon: 'WashingMachine', order: 10 },
    ]
  )

  // 10. Юристы
  await createCategoryWithChildren(
    { name: 'Юристы', slug: 'legal-financial', icon: 'Scale', order: 10 },
    [
      { name: 'Консультация юриста', slug: 'lawyer', icon: 'Scale', order: 1 },
      { name: 'Представительство в суде', slug: 'court-representation', icon: 'Gavel', order: 2 },
      { name: 'Составление документов', slug: 'legal-docs', icon: 'FileText', order: 3 },
      { name: 'Арбитражные споры', slug: 'arbitration', icon: 'Handshake', order: 4 },
      { name: 'Семейное право', slug: 'family-law', icon: 'Users', order: 5 },
      { name: 'Наследственное право', slug: 'inheritance-law', icon: 'ScrollText', order: 6 },
      { name: 'Бухгалтер', slug: 'accountant', icon: 'Calculator', order: 7 },
      { name: 'Риелтор', slug: 'realtor', icon: 'Building', order: 8 },
      { name: 'Страхование', slug: 'insurance', icon: 'Shield', order: 9 },
      { name: 'Проверка документов', slug: 'doc-verification', icon: 'FileSearch', order: 10 },
    ]
  )

  // 11. Дизайнеры
  await createCategoryWithChildren(
    { name: 'Дизайнеры', slug: 'designers', icon: 'Palette', order: 11 },
    [
      { name: 'Дизайн интерьеров', slug: 'interior-design', icon: 'Sofa', order: 1 },
      { name: 'Графический дизайн', slug: 'graphic-design', icon: 'PenTool', order: 2 },
      { name: 'Веб-дизайн', slug: 'web-design', icon: 'Layout', order: 3 },
      { name: 'UX/UI-дизайн', slug: 'ux-ui-design', icon: 'Figma', order: 4 },
      { name: 'Ландшафтный дизайн', slug: 'landscape-design', icon: 'TreePine', order: 5 },
      { name: '3D-визуализация', slug: '3d-visualization', icon: 'Box', order: 6 },
      { name: 'Логотипы и брендинг', slug: 'logo-branding', icon: 'Star', order: 7 },
      { name: 'Дизайн рекламы', slug: 'ad-design', icon: 'Image', order: 8 },
    ]
  )

  // 12. Фото, видео, аудио
  await createCategoryWithChildren(
    { name: 'Фото, видео, аудио', slug: 'photo-video', icon: 'Camera', order: 12 },
    [
      { name: 'Фотосессия', slug: 'photo-session', icon: 'Camera', order: 1 },
      { name: 'Видеосъёмка', slug: 'video-shooting', icon: 'Video', order: 2 },
      { name: 'Монтаж видео', slug: 'video-editing', icon: 'Film', order: 3 },
      { name: 'Фото на документы', slug: 'id-photo', icon: 'UserSquare', order: 4 },
      { name: 'Съёмка с дрона', slug: 'drone-shooting', icon: 'Plane', order: 5 },
      { name: 'Предметная съёмка', slug: 'product-photo', icon: 'ImagePlus', order: 6 },
      { name: 'Обработка фото', slug: 'photo-editing', icon: 'Wand2', order: 7 },
      { name: 'Озвучка и аудио', slug: 'voiceover', icon: 'Mic', order: 8 },
    ]
  )

  // 13. Организация мероприятий
  await createCategoryWithChildren(
    { name: 'Организация мероприятий', slug: 'events', icon: 'PartyPopper', order: 13 },
    [
      { name: 'Праздник под ключ', slug: 'full-event', icon: 'PartyPopper', order: 1 },
      { name: 'Ведущий', slug: 'host', icon: 'Mic', order: 2 },
      { name: 'Аниматор', slug: 'animator', icon: 'Star', order: 3 },
      { name: 'Декор и оформление', slug: 'event-decor', icon: 'Flower2', order: 4 },
      { name: 'Кейтеринг', slug: 'catering', icon: 'UtensilsCrossed', order: 5 },
      { name: 'Звукорежиссёр', slug: 'sound-engineer', icon: 'Volume2', order: 6 },
      { name: 'Организация свадеб', slug: 'wedding-planner', icon: 'Heart', order: 7 },
      { name: 'Аренда оборудования', slug: 'event-equipment', icon: 'Speaker', order: 8 },
    ]
  )

  // 14. Артисты
  await createCategoryWithChildren(
    { name: 'Артисты', slug: 'artists', icon: 'Music', order: 14 },
    [
      { name: 'Певцы и вокалисты', slug: 'singers', icon: 'Mic2', order: 1 },
      { name: 'Музыканты', slug: 'musicians', icon: 'Music', order: 2 },
      { name: 'Кавер-группы', slug: 'cover-bands', icon: 'Users', order: 3 },
      { name: 'Диджеи', slug: 'djs', icon: 'Disc', order: 4 },
      { name: 'Шоу-программы', slug: 'show-programs', icon: 'Sparkles', order: 5 },
      { name: 'Фокусники', slug: 'magicians', icon: 'Wand2', order: 6 },
      { name: 'Стендап', slug: 'standup', icon: 'Laugh', order: 7 },
      { name: 'Танцевальные коллективы', slug: 'dance-groups', icon: 'Music2', order: 8 },
    ]
  )

  // 15. Аренда
  await createCategoryWithChildren(
    { name: 'Аренда', slug: 'rental', icon: 'Key', order: 15 },
    [
      { name: 'Аренда автомобилей', slug: 'car-rental', icon: 'Car', order: 1 },
      { name: 'Аренда спецтехники', slug: 'heavy-equipment-rental', icon: 'Forklift', order: 2 },
      { name: 'Аренда оборудования', slug: 'equipment-rental', icon: 'Cog', order: 3 },
      { name: 'Аренда фотостудий', slug: 'studio-rental', icon: 'Camera', order: 4 },
      { name: 'Аренда инструментов', slug: 'tool-rental', icon: 'Hammer', order: 5 },
      { name: 'Аренда шатров и палаток', slug: 'tent-rental', icon: 'Tent', order: 6 },
      { name: 'Аренда костюмов', slug: 'costume-rental', icon: 'Shirt', order: 7 },
      { name: 'Аренда помещений', slug: 'venue-rental', icon: 'Building', order: 8 },
    ]
  )

  // 16. Творчество и хобби
  await createCategoryWithChildren(
    { name: 'Творчество и хобби', slug: 'creativity-hobby', icon: 'Brush', order: 16 },
    [
      { name: 'Шитьё на заказ', slug: 'custom-sewing', icon: 'Scissors', order: 1 },
      { name: 'Живопись и рисование', slug: 'painting', icon: 'Palette', order: 2 },
      { name: 'Ювелирные изделия', slug: 'jewelry', icon: 'Gem', order: 3 },
      { name: 'Вязание на заказ', slug: 'knitting', icon: 'Ribbon', order: 4 },
      { name: 'Лепка и керамика', slug: 'pottery', icon: 'Circle', order: 5 },
      { name: 'Каллиграфия', slug: 'calligraphy', icon: 'PenTool', order: 6 },
      { name: 'Флористика', slug: 'floristry', icon: 'Flower', order: 7 },
      { name: 'Изделия из дерева', slug: 'woodcraft', icon: 'TreeDeciduous', order: 8 },
    ]
  )

  // 17. Услуги для животных
  await createCategoryWithChildren(
    { name: 'Услуги для животных', slug: 'animals', icon: 'PawPrint', order: 17 },
    [
      { name: 'Ветеринар', slug: 'veterinarian', icon: 'Stethoscope', order: 1 },
      { name: 'Груминг', slug: 'grooming', icon: 'Scissors', order: 2 },
      { name: 'Дрессировка', slug: 'dog-training', icon: 'PawPrint', order: 3 },
      { name: 'Выгул собак', slug: 'dog-walking', icon: 'Footprints', order: 4 },
      { name: 'Передержка', slug: 'pet-boarding', icon: 'Home', order: 5 },
      { name: 'Перевозка животных', slug: 'pet-transport', icon: 'Car', order: 6 },
      { name: 'Зоопсихолог', slug: 'pet-psychologist', icon: 'Brain', order: 7 },
      { name: 'Стрижка когтей', slug: 'nail-trimming', icon: 'Scissors', order: 8 },
    ]
  )

  // 18. Охрана
  await createCategoryWithChildren(
    { name: 'Охрана', slug: 'security', icon: 'ShieldCheck', order: 18 },
    [
      { name: 'Охрана объектов', slug: 'object-security', icon: 'Building', order: 1 },
      { name: 'Личная охрана', slug: 'bodyguard', icon: 'UserCheck', order: 2 },
      { name: 'Видеонаблюдение', slug: 'cctv', icon: 'Eye', order: 3 },
      { name: 'Установка сигнализаций', slug: 'alarm-install', icon: 'Bell', order: 4 },
      { name: 'Пожарная безопасность', slug: 'fire-safety', icon: 'Flame', order: 5 },
      { name: 'Контроль доступа', slug: 'access-control', icon: 'KeyRound', order: 6 },
    ]
  )

  // 19. Разное
  await createCategoryWithChildren(
    { name: 'Разное', slug: 'misc', icon: 'MoreHorizontal', order: 19 },
    [
      { name: 'Психолог', slug: 'psychologist', icon: 'Brain', order: 1 },
      { name: 'Дезинсекция и обеззараживание', slug: 'pest-control', icon: 'Bug', order: 2 },
      { name: 'Доставка цветов', slug: 'flower-delivery', icon: 'Flower2', order: 3 },
      { name: 'Полиграфия', slug: 'printing', icon: 'Printer', order: 4 },
      { name: 'Нотариус', slug: 'notary', icon: 'Stamp', order: 5 },
      { name: 'Переводчик', slug: 'translator', icon: 'Languages', order: 6 },
      { name: 'Клининг после ремонта', slug: 'post-renovation-cleaning', icon: 'SprayCan', order: 7 },
      { name: 'Прочие услуги', slug: 'other-services', icon: 'HelpCircle', order: 8 },
    ]
  )

  const total = await prisma.category.count()
  const parents = await prisma.category.count({ where: { parentId: null } })
  const children = await prisma.category.count({ where: { NOT: { parentId: null } } })
  console.log(`Готово! Всего категорий: ${total} (${parents} рубрик, ${children} подкатегорий)`)
}

main()
  .catch((e) => {
    console.error('Ошибка при засеве данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

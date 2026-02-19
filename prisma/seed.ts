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
      { name: 'Математика', slug: 'education.math', icon: 'Calculator', order: 1 },
      { name: 'Русский язык', slug: 'education.russian', icon: 'BookOpen', order: 2 },
      { name: 'Литература', slug: 'education.literature', icon: 'BookOpen', order: 3 },
      { name: 'Английский язык', slug: 'education.english', icon: 'Languages', order: 4 },
      { name: 'Другие иностранные языки', slug: 'education.foreign', icon: 'Globe', order: 5 },
      { name: 'Физика', slug: 'education.physics', icon: 'Atom', order: 6 },
      { name: 'Химия', slug: 'education.chemistry', icon: 'FlaskConical', order: 7 },
      { name: 'Биология', slug: 'education.biology', icon: 'Leaf', order: 8 },
      { name: 'Информатика', slug: 'education.cs', icon: 'Monitor', order: 9 },
      { name: 'История', slug: 'education.history', icon: 'Landmark', order: 10 },
      { name: 'Обществознание', slug: 'education.social', icon: 'Users', order: 11 },
      { name: 'География', slug: 'education.geo', icon: 'Globe', order: 12 },
      { name: 'Подготовка к ЕГЭ', slug: 'education.ege', icon: 'FileCheck', order: 13 },
      { name: 'Подготовка к ОГЭ', slug: 'education.oge', icon: 'FileCheck', order: 14 },
      { name: 'Подготовка к ВПР', slug: 'education.vpr', icon: 'FileCheck', order: 15 },
      { name: 'Подготовка к школе / дошкольное развитие', slug: 'education.preschool', icon: 'School', order: 16 },
      { name: 'Начальная школа (комплексно)', slug: 'education.primary', icon: 'School', order: 17 },
      { name: 'Логопед / дефектолог', slug: 'education.speech', icon: 'MessageCircle', order: 18 },
      { name: 'Скорочтение / развитие памяти', slug: 'education.speedread', icon: 'BookOpen', order: 19 },
      { name: 'Подготовка к олимпиадам', slug: 'education.olymp', icon: 'Trophy', order: 20 },
      { name: 'Программирование (обучение)', slug: 'education.programming', icon: 'Code', order: 21 },
      { name: 'Музыкальные уроки (вокал/инструменты)', slug: 'education.music', icon: 'Music', order: 22 },
      { name: 'Рисование / живопись', slug: 'education.art', icon: 'Palette', order: 23 },
      { name: 'Шахматы (обучение)', slug: 'education.chess', icon: 'Crown', order: 24 },
    ]
  )

  // 2. Ремонт и строительство
  await createCategoryWithChildren(
    { name: 'Ремонт и строительство', slug: 'repair-construction', icon: 'Hammer', order: 2 },
    [
      { name: 'Ремонт квартир/домов под ключ', slug: 'repair-construction.turnkey', icon: 'Home', order: 1 },
      { name: 'Дизайн-проект / планировка', slug: 'repair-construction.design', icon: 'Ruler', order: 2 },
      { name: 'Демонтаж', slug: 'repair-construction.demolition', icon: 'Trash2', order: 3 },
      { name: 'Отделочные работы', slug: 'repair-construction.finish', icon: 'PaintBucket', order: 4 },
      { name: 'Штукатурка/шпаклёвка', slug: 'repair-construction.plaster', icon: 'Layers', order: 5 },
      { name: 'Покраска', slug: 'repair-construction.paint', icon: 'Paintbrush', order: 6 },
      { name: 'Обои/декоративные покрытия', slug: 'repair-construction.wallpaper', icon: 'Wallpaper', order: 7 },
      { name: 'Полы (стяжка/наливной/укладка)', slug: 'repair-construction.floors', icon: 'LayoutGrid', order: 8 },
      { name: 'Плиточные работы', slug: 'repair-construction.tiles', icon: 'Grid3X3', order: 9 },
      { name: 'Гипсокартон / перегородки', slug: 'repair-construction.gkl', icon: 'RectangleVertical', order: 10 },
      { name: 'Потолки', slug: 'repair-construction.ceilings', icon: 'ArrowUpFromLine', order: 11 },
      { name: 'Сантехника (монтаж/разводка)', slug: 'repair-construction.plumbing', icon: 'Droplets', order: 12 },
      { name: 'Электромонтаж (разводка/щит)', slug: 'repair-construction.electro', icon: 'Zap', order: 13 },
      { name: 'Отопление / тёплый пол', slug: 'repair-construction.heating', icon: 'Thermometer', order: 14 },
      { name: 'Вентиляция (быт)', slug: 'repair-construction.vent', icon: 'Wind', order: 15 },
      { name: 'Окна / балконы / остекление', slug: 'repair-construction.windows', icon: 'Square', order: 16 },
      { name: 'Двери (установка)', slug: 'repair-construction.doors', icon: 'DoorOpen', order: 17 },
      { name: 'Кровля / водостоки', slug: 'repair-construction.roof', icon: 'Tent', order: 18 },
      { name: 'Фасады / утепление', slug: 'repair-construction.facade', icon: 'Building', order: 19 },
      { name: 'Заборы / ворота / навесы', slug: 'repair-construction.fence', icon: 'Fence', order: 20 },
      { name: 'Сборка/монтаж кухонь', slug: 'repair-construction.kitchen', icon: 'CookingPot', order: 21 },
    ]
  )

  // 3. Ремонт и установка техники
  await createCategoryWithChildren(
    { name: 'Ремонт и установка техники', slug: 'repair-tech', icon: 'Smartphone', order: 3 },
    [
      { name: 'Телефоны/планшеты (ремонт)', slug: 'repair-tech.phones', icon: 'Smartphone', order: 1 },
      { name: 'Ноутбуки/ПК (ремонт)', slug: 'repair-tech.pc', icon: 'Laptop', order: 2 },
      { name: 'Телевизоры (ремонт)', slug: 'repair-tech.tv', icon: 'Tv', order: 3 },
      { name: 'Холодильники/морозилки (ремонт)', slug: 'repair-tech.fridge', icon: 'Refrigerator', order: 4 },
      { name: 'Стиральные/сушильные машины (ремонт)', slug: 'repair-tech.washer', icon: 'WashingMachine', order: 5 },
      { name: 'Посудомоечные машины (ремонт)', slug: 'repair-tech.dishwasher', icon: 'UtensilsCrossed', order: 6 },
      { name: 'Микроволновки (ремонт)', slug: 'repair-tech.microwave', icon: 'Microwave', order: 7 },
      { name: 'Духовые/варочные панели (ремонт)', slug: 'repair-tech.oven', icon: 'Flame', order: 8 },
      { name: 'Пылесосы/роботы (ремонт)', slug: 'repair-tech.vacuum', icon: 'Wind', order: 9 },
      { name: 'Кофемашины (ремонт)', slug: 'repair-tech.coffee', icon: 'Coffee', order: 10 },
      { name: 'Принтеры/МФУ (ремонт)', slug: 'repair-tech.printers', icon: 'Printer', order: 11 },
      { name: 'Установка/подключение бытовой техники', slug: 'repair-tech.install', icon: 'Plug', order: 12 },
      { name: 'Кондиционеры (монтаж)', slug: 'repair-tech.ac-install', icon: 'Snowflake', order: 13 },
      { name: 'Кондиционеры (обслуживание)', slug: 'repair-tech.ac-service', icon: 'Wrench', order: 14 },
    ]
  )

  // 4. Ремонт авто
  await createCategoryWithChildren(
    { name: 'Ремонт авто', slug: 'auto', icon: 'Car', order: 4 },
    [
      { name: 'Автосервис / ТО', slug: 'auto.service', icon: 'Wrench', order: 1 },
      { name: 'Замена масла/фильтров', slug: 'auto.oil', icon: 'Droplets', order: 2 },
      { name: 'Диагностика (компьютерная)', slug: 'auto.diag', icon: 'ScanLine', order: 3 },
      { name: 'Диагностика перед покупкой', slug: 'auto.prebuy', icon: 'Search', order: 4 },
      { name: 'Ходовая/подвеска', slug: 'auto.susp', icon: 'ArrowDownUp', order: 5 },
      { name: 'Тормоза', slug: 'auto.brakes', icon: 'CircleStop', order: 6 },
      { name: 'Рулевое', slug: 'auto.steering', icon: 'Navigation', order: 7 },
      { name: 'Двигатель (ремонт/обслуживание)', slug: 'auto.engine', icon: 'Cog', order: 8 },
      { name: 'ГРМ', slug: 'auto.timing', icon: 'Clock', order: 9 },
      { name: 'Сцепление', slug: 'auto.clutch', icon: 'Circle', order: 10 },
      { name: 'АКПП/МКПП/вариатор', slug: 'auto.gearbox', icon: 'Settings', order: 11 },
      { name: 'Автоэлектрик', slug: 'auto.electro', icon: 'Zap', order: 12 },
      { name: 'Стартер/генератор', slug: 'auto.starter', icon: 'RotateCw', order: 13 },
      { name: 'Система охлаждения', slug: 'auto.cooling', icon: 'Thermometer', order: 14 },
      { name: 'Автокондиционер (заправка/ремонт)', slug: 'auto.ac', icon: 'Snowflake', order: 15 },
      { name: 'Выхлоп', slug: 'auto.exhaust', icon: 'Wind', order: 16 },
      { name: 'Развал-схождение', slug: 'auto.align', icon: 'Ruler', order: 17 },
      { name: 'Шиномонтаж/балансировка', slug: 'auto.tire', icon: 'Circle', order: 18 },
      { name: 'Хранение шин', slug: 'auto.tire-storage', icon: 'Warehouse', order: 19 },
      { name: 'Кузовной ремонт', slug: 'auto.body', icon: 'Paintbrush', order: 20 },
      { name: 'Покраска', slug: 'auto.paint', icon: 'PaintBucket', order: 21 },
      { name: 'Полировка', slug: 'auto.polish', icon: 'Sparkle', order: 22 },
      { name: 'Детейлинг (в т.ч. химчистка салона)', slug: 'auto.detailing', icon: 'Sparkles', order: 23 },
      { name: 'Автомойка', slug: 'auto.wash', icon: 'Droplets', order: 24 },
      { name: 'Антикор', slug: 'auto.anticor', icon: 'ShieldCheck', order: 25 },
      { name: 'Стёкла (замена/ремонт)', slug: 'auto.glass', icon: 'RectangleHorizontal', order: 26 },
      { name: 'Установка доп.оборудования', slug: 'auto.extra', icon: 'Plus', order: 27 },
    ]
  )

  // 5. Компьютеры и IT
  await createCategoryWithChildren(
    { name: 'Компьютеры и IT', slug: 'it-digital', icon: 'Monitor', order: 5 },
    [
      { name: 'Компьютерная помощь (выезд)', slug: 'it-digital.help', icon: 'Settings', order: 1 },
      { name: 'Установка/настройка ОС', slug: 'it-digital.os', icon: 'Monitor', order: 2 },
      { name: 'Удаление вирусов', slug: 'it-digital.viruses', icon: 'ShieldAlert', order: 3 },
      { name: 'Настройка Wi-Fi/роутера/сети', slug: 'it-digital.wifi', icon: 'Wifi', order: 4 },
      { name: 'Восстановление данных', slug: 'it-digital.data', icon: 'HardDrive', order: 5 },
      { name: 'Сборка/апгрейд ПК', slug: 'it-digital.upgrade', icon: 'Cpu', order: 6 },
      { name: 'Настройка телефонов (перенос данных)', slug: 'it-digital.phones', icon: 'Smartphone', order: 7 },
      { name: 'Создание сайтов (лендинг)', slug: 'it-digital.site-landing', icon: 'Globe', order: 8 },
      { name: 'Создание сайтов (магазин/сервис)', slug: 'it-digital.site-service', icon: 'ShoppingCart', order: 9 },
      { name: 'Поддержка сайта', slug: 'it-digital.support', icon: 'LifeBuoy', order: 10 },
      { name: 'Разработка ПО / интеграции', slug: 'it-digital.dev', icon: 'Code', order: 11 },
      { name: 'Чат-боты / автоматизация', slug: 'it-digital.bots', icon: 'Bot', order: 12 },
      { name: 'CRM/аналитика/метрика', slug: 'it-digital.crm', icon: 'BarChart3', order: 13 },
      { name: '1С (настройка/сопровождение)', slug: 'it-digital.1c', icon: 'Database', order: 14 },
      { name: 'Реклама (настройка)', slug: 'it-digital.ads', icon: 'Megaphone', order: 15 },
      { name: 'SMM (ведение)', slug: 'it-digital.smm', icon: 'Share2', order: 16 },
      { name: 'SEO-продвижение', slug: 'it-digital.seo', icon: 'Search', order: 17 },
      { name: 'Контент-маркетинг', slug: 'it-digital.content', icon: 'FileText', order: 18 },
      { name: 'Серверы/VPS (администрирование)', slug: 'it-digital.vps', icon: 'Server', order: 19 },
    ]
  )

  // 6. Тренеры
  await createCategoryWithChildren(
    { name: 'Тренеры', slug: 'sports-fitness', icon: 'Dumbbell', order: 6 },
    [
      { name: 'Персональный тренер', slug: 'sports-fitness.personal', icon: 'Dumbbell', order: 1 },
      { name: 'Фитнес', slug: 'sports-fitness.fitness', icon: 'HeartPulse', order: 2 },
      { name: 'Йога', slug: 'sports-fitness.yoga', icon: 'Leaf', order: 3 },
      { name: 'Пилатес/стретчинг', slug: 'sports-fitness.pilates', icon: 'Leaf', order: 4 },
      { name: 'ЛФК/восстановление', slug: 'sports-fitness.lfk', icon: 'Heart', order: 5 },
      { name: 'Бег (подготовка)', slug: 'sports-fitness.run', icon: 'Timer', order: 6 },
      { name: 'Плавание (тренер)', slug: 'sports-fitness.swim', icon: 'Waves', order: 7 },
      { name: 'Танцы (тренер)', slug: 'sports-fitness.dance', icon: 'Music2', order: 8 },
      { name: 'Единоборства', slug: 'sports-fitness.martial', icon: 'Shield', order: 9 },
      { name: 'Теннис/настольный теннис', slug: 'sports-fitness.tennis', icon: 'CircleDot', order: 10 },
      { name: 'ОФП для детей', slug: 'sports-fitness.kids-ofp', icon: 'Baby', order: 11 },
      { name: 'Шахматы (спорт-секция)', slug: 'sports-fitness.chess-section', icon: 'Crown', order: 12 },
    ]
  )

  // 7. Красота
  await createCategoryWithChildren(
    { name: 'Красота', slug: 'beauty-health', icon: 'Sparkles', order: 7 },
    [
      { name: 'Парикмахер (женский)', slug: 'beauty-health.hairdresser', icon: 'Scissors', order: 1 },
      { name: 'Барбер', slug: 'beauty-health.barber', icon: 'Scissors', order: 2 },
      { name: 'Окрашивание', slug: 'beauty-health.coloring', icon: 'Palette', order: 3 },
      { name: 'Укладки/причёски', slug: 'beauty-health.styles', icon: 'Sparkles', order: 4 },
      { name: 'Маникюр', slug: 'beauty-health.manicure', icon: 'Hand', order: 5 },
      { name: 'Педикюр', slug: 'beauty-health.pedicure', icon: 'Footprints', order: 6 },
      { name: 'Наращивание ногтей', slug: 'beauty-health.nails-ext', icon: 'Hand', order: 7 },
      { name: 'Массаж (классический)', slug: 'beauty-health.massage', icon: 'Heart', order: 8 },
      { name: 'Массаж (лечебный/спорт)', slug: 'beauty-health.massage-med', icon: 'HeartPulse', order: 9 },
      { name: 'Косметолог (уход)', slug: 'beauty-health.cosmetology', icon: 'Smile', order: 10 },
      { name: 'Брови', slug: 'beauty-health.brows', icon: 'Eye', order: 11 },
      { name: 'Ресницы', slug: 'beauty-health.lashes', icon: 'Eye', order: 12 },
      { name: 'Визажист', slug: 'beauty-health.makeup', icon: 'Palette', order: 13 },
      { name: 'Стилист', slug: 'beauty-health.stylist', icon: 'Shirt', order: 14 },
      { name: 'Эпиляция/депиляция', slug: 'beauty-health.epilation', icon: 'Sparkle', order: 15 },
      { name: 'Тату', slug: 'beauty-health.tattoo', icon: 'Pen', order: 16 },
      { name: 'Пирсинг', slug: 'beauty-health.piercing', icon: 'Circle', order: 17 },
      { name: 'Перманент/татуаж', slug: 'beauty-health.permanent', icon: 'Pen', order: 18 },
    ]
  )

  // 8. Перевозки и курьеры
  await createCategoryWithChildren(
    { name: 'Перевозки и курьеры', slug: 'transport-delivery', icon: 'Truck', order: 8 },
    [
      { name: 'Грузоперевозки по городу', slug: 'transport-delivery.city', icon: 'Truck', order: 1 },
      { name: 'Грузоперевозки межгород', slug: 'transport-delivery.intercity', icon: 'Route', order: 2 },
      { name: 'Переезд под ключ', slug: 'transport-delivery.move', icon: 'Home', order: 3 },
      { name: 'Грузчики', slug: 'transport-delivery.loaders', icon: 'PackageOpen', order: 4 },
      { name: 'Доставка мебели/техники', slug: 'transport-delivery.furniture', icon: 'Armchair', order: 5 },
      { name: 'Доставка стройматериалов', slug: 'transport-delivery.materials', icon: 'Package', order: 6 },
      { name: 'Курьер (документы)', slug: 'transport-delivery.courier-docs', icon: 'FileText', order: 7 },
      { name: 'Курьер (посылки)', slug: 'transport-delivery.courier-parcels', icon: 'Package', order: 8 },
      { name: 'Экспресс-доставка', slug: 'transport-delivery.express', icon: 'Zap', order: 9 },
      { name: 'Доставка продуктов', slug: 'transport-delivery.products', icon: 'ShoppingBag', order: 10 },
      { name: 'Вывоз мусора (строительный/бытовой)', slug: 'transport-delivery.trash', icon: 'Trash2', order: 11 },
      { name: 'Вывоз старой мебели', slug: 'transport-delivery.old-furniture', icon: 'Trash2', order: 12 },
      { name: 'Доставка воды', slug: 'transport-delivery.water', icon: 'Droplets', order: 13 },
      { name: 'Доставка цветов', slug: 'transport-delivery.flowers', icon: 'Flower2', order: 14 },
      { name: 'Эвакуатор', slug: 'transport-delivery.tow', icon: 'CarFront', order: 15 },
      { name: 'Трезвый водитель', slug: 'transport-delivery.sober-driver', icon: 'Car', order: 16 },
      { name: 'Перевозка животных', slug: 'transport-delivery.pets', icon: 'PawPrint', order: 17 },
    ]
  )

  // 9. Хозяйство и уборка
  await createCategoryWithChildren(
    { name: 'Хозяйство и уборка', slug: 'home-lifestyle', icon: 'Home', order: 9 },
    [
      { name: 'Уборка (поддерживающая)', slug: 'home-lifestyle.clean-regular', icon: 'Sparkles', order: 1 },
      { name: 'Генеральная уборка', slug: 'home-lifestyle.clean-general', icon: 'SprayCan', order: 2 },
      { name: 'Уборка после ремонта', slug: 'home-lifestyle.clean-post', icon: 'SprayCan', order: 3 },
      { name: 'Мытьё окон', slug: 'home-lifestyle.windows', icon: 'Square', order: 4 },
      { name: 'Химчистка мебели', slug: 'home-lifestyle.furniture-dry', icon: 'Armchair', order: 5 },
      { name: 'Химчистка ковров', slug: 'home-lifestyle.carpets-dry', icon: 'LayoutGrid', order: 6 },
      { name: 'Уборка офисов', slug: 'home-lifestyle.office', icon: 'Building', order: 7 },
      { name: 'Домработница (регулярно)', slug: 'home-lifestyle.housekeeper', icon: 'Home', order: 8 },
      { name: 'Стирка/глажка', slug: 'home-lifestyle.laundry', icon: 'WashingMachine', order: 9 },
      { name: 'Ремонт одежды / ателье', slug: 'home-lifestyle.clothes-repair', icon: 'Shirt', order: 10 },
      { name: 'Няни', slug: 'home-lifestyle.nanny', icon: 'Baby', order: 11 },
      { name: 'Сиделки', slug: 'home-lifestyle.caregiver', icon: 'Heart', order: 12 },
      { name: 'Готовка на дом', slug: 'home-lifestyle.cooking', icon: 'ChefHat', order: 13 },
      { name: 'Садовые работы', slug: 'home-lifestyle.garden', icon: 'TreePine', order: 14 },
      { name: 'Уборка территории/снега', slug: 'home-lifestyle.snow', icon: 'Trees', order: 15 },
      { name: 'Мелкие поручения по дому', slug: 'home-lifestyle.errands', icon: 'CheckSquare', order: 16 },
    ]
  )

  // 10. Юристы и финансы
  await createCategoryWithChildren(
    { name: 'Юристы и финансы', slug: 'legal-financial', icon: 'Scale', order: 10 },
    [
      { name: 'Юристы', slug: 'legal-financial.lawyers', icon: 'Scale', order: 1 },
      { name: 'Консультация', slug: 'legal-financial.consult', icon: 'MessageCircle', order: 2 },
      { name: 'Документы (иски/претензии/договоры)', slug: 'legal-financial.docs', icon: 'FileText', order: 3 },
      { name: 'Судебное представительство', slug: 'legal-financial.court', icon: 'Gavel', order: 4 },
      { name: 'Семейное право', slug: 'legal-financial.family', icon: 'Users', order: 5 },
      { name: 'Наследство', slug: 'legal-financial.inherit', icon: 'ScrollText', order: 6 },
      { name: 'Трудовые споры', slug: 'legal-financial.labor', icon: 'Briefcase', order: 7 },
      { name: 'Защита прав потребителей', slug: 'legal-financial.consumer', icon: 'ShieldCheck', order: 8 },
      { name: 'Автоюрист/ДТП', slug: 'legal-financial.auto', icon: 'Car', order: 9 },
      { name: 'Арбитраж/споры бизнеса', slug: 'legal-financial.arbitration', icon: 'Handshake', order: 10 },
      { name: 'Регистрация ИП/ООО', slug: 'legal-financial.reg', icon: 'Building', order: 11 },
      { name: 'Взыскание долгов', slug: 'legal-financial.debts', icon: 'Banknote', order: 12 },
      { name: 'Банкротство физлиц', slug: 'legal-financial.bankruptcy', icon: 'AlertTriangle', order: 13 },
      { name: 'Бухгалтер', slug: 'legal-financial.accounting', icon: 'Calculator', order: 14 },
      { name: 'Налоги/отчётность', slug: 'legal-financial.taxes', icon: 'FileText', order: 15 },
      { name: 'Кадры', slug: 'legal-financial.hr', icon: 'Users', order: 16 },
      { name: 'Страхование', slug: 'legal-financial.insurance', icon: 'Shield', order: 17 },
      { name: 'Риелтор', slug: 'legal-financial.realtor', icon: 'Building', order: 18 },
      { name: 'Проверка документов по недвижимости', slug: 'legal-financial.realestate-check', icon: 'FileSearch', order: 19 },
    ]
  )

  // 11. Дизайнеры
  await createCategoryWithChildren(
    { name: 'Дизайнеры', slug: 'designers', icon: 'Palette', order: 11 },
    [
      { name: 'Дизайн интерьеров', slug: 'designers.interior', icon: 'Sofa', order: 1 },
      { name: '3D-визуализация', slug: 'designers.3d', icon: 'Box', order: 2 },
      { name: 'Ландшафтный дизайн', slug: 'designers.landscape', icon: 'TreePine', order: 3 },
      { name: 'Графический дизайн', slug: 'designers.graphic', icon: 'PenTool', order: 4 },
      { name: 'Логотип/фирстиль', slug: 'designers.logo', icon: 'Star', order: 5 },
      { name: 'Брендинг', slug: 'designers.branding', icon: 'Star', order: 6 },
      { name: 'Дизайн упаковки', slug: 'designers.pack', icon: 'Package', order: 7 },
      { name: 'Дизайн полиграфии', slug: 'designers.print', icon: 'Printer', order: 8 },
      { name: 'Дизайн рекламы (креативы)', slug: 'designers.ads', icon: 'Image', order: 9 },
      { name: 'Веб-дизайн', slug: 'designers.web', icon: 'Layout', order: 10 },
      { name: 'UX/UI', slug: 'designers.uxui', icon: 'Figma', order: 11 },
      { name: 'Оформление соцсетей', slug: 'designers.social', icon: 'Share2', order: 12 },
      { name: 'Презентации', slug: 'designers.presentations', icon: 'FileText', order: 13 },
      { name: 'Иллюстрации', slug: 'designers.illustrations', icon: 'Palette', order: 14 },
    ]
  )

  // 12. Фото, видео, аудио
  await createCategoryWithChildren(
    { name: 'Фото, видео, аудио', slug: 'photo-video', icon: 'Camera', order: 12 },
    [
      { name: 'Фотосессия (инд./сем./детская)', slug: 'photo-video.photo', icon: 'Camera', order: 1 },
      { name: 'Свадебный фотограф', slug: 'photo-video.wedding', icon: 'Heart', order: 2 },
      { name: 'Репортажная съёмка', slug: 'photo-video.report', icon: 'Camera', order: 3 },
      { name: 'Предметная съёмка', slug: 'photo-video.product', icon: 'ImagePlus', order: 4 },
      { name: 'Фото на документы', slug: 'photo-video.docs', icon: 'UserSquare', order: 5 },
      { name: 'Дрон-съёмка', slug: 'photo-video.drone', icon: 'Plane', order: 6 },
      { name: 'Видеосъёмка мероприятий', slug: 'photo-video.event-video', icon: 'Video', order: 7 },
      { name: 'Видеосъёмка для бизнеса', slug: 'photo-video.biz-video', icon: 'Video', order: 8 },
      { name: 'Монтаж видео', slug: 'photo-video.edit', icon: 'Film', order: 9 },
      { name: 'Моушн/анимация', slug: 'photo-video.motion', icon: 'Play', order: 10 },
      { name: 'Обработка/ретушь фото', slug: 'photo-video.retouch', icon: 'Wand2', order: 11 },
      { name: 'Озвучка/диктор', slug: 'photo-video.voice', icon: 'Mic', order: 12 },
      { name: 'Звукозапись/сведение', slug: 'photo-video.audio', icon: 'Music', order: 13 },
    ]
  )

  // 13. Организация мероприятий
  await createCategoryWithChildren(
    { name: 'Организация мероприятий', slug: 'events', icon: 'PartyPopper', order: 13 },
    [
      { name: 'Праздник под ключ', slug: 'events.turnkey', icon: 'PartyPopper', order: 1 },
      { name: 'Организация свадеб', slug: 'events.wedding', icon: 'Heart', order: 2 },
      { name: 'Организация корпоративов', slug: 'events.corporate', icon: 'Building', order: 3 },
      { name: 'Ведущий', slug: 'events.host', icon: 'Mic', order: 4 },
      { name: 'Декор/оформление', slug: 'events.decor', icon: 'Flower2', order: 5 },
      { name: 'Кейтеринг', slug: 'events.catering', icon: 'UtensilsCrossed', order: 6 },
      { name: 'Торты/кондитер на заказ', slug: 'events.cakes', icon: 'Cake', order: 7 },
      { name: 'Координатор/администратор', slug: 'events.coordinator', icon: 'ClipboardList', order: 8 },
      { name: 'Персонал (хостес/официанты)', slug: 'events.staff', icon: 'Users', order: 9 },
    ]
  )

  // 14. Артисты
  await createCategoryWithChildren(
    { name: 'Артисты', slug: 'artists', icon: 'Music', order: 14 },
    [
      { name: 'Певцы/вокалисты', slug: 'artists.singers', icon: 'Mic2', order: 1 },
      { name: 'Музыканты (соло)', slug: 'artists.musicians', icon: 'Music', order: 2 },
      { name: 'Кавер-группы', slug: 'artists.cover', icon: 'Users', order: 3 },
      { name: 'DJ', slug: 'artists.dj', icon: 'Disc', order: 4 },
      { name: 'Танцевальные коллективы', slug: 'artists.dance', icon: 'Music2', order: 5 },
      { name: 'Шоу-балет', slug: 'artists.show-ballet', icon: 'Music2', order: 6 },
      { name: 'Фокусники/иллюзионисты', slug: 'artists.magic', icon: 'Wand2', order: 7 },
      { name: 'Стендап', slug: 'artists.standup', icon: 'Laugh', order: 8 },
      { name: 'Аниматоры', slug: 'artists.animators', icon: 'Star', order: 9 },
      { name: 'Шоу-программы', slug: 'artists.show', icon: 'Sparkles', order: 10 },
      { name: 'Звукорежиссёр (выездный)', slug: 'artists.sound', icon: 'Volume2', order: 11 },
    ]
  )

  // 15. Аренда
  await createCategoryWithChildren(
    { name: 'Аренда', slug: 'rental', icon: 'Key', order: 15 },
    [
      { name: 'Аренда авто', slug: 'rental.auto', icon: 'Car', order: 1 },
      { name: 'Аренда спецтехники', slug: 'rental.special', icon: 'Truck', order: 2 },
      { name: 'Аренда инструмента', slug: 'rental.tools', icon: 'Hammer', order: 3 },
      { name: 'Аренда строительного оборудования', slug: 'rental.construction', icon: 'Cog', order: 4 },
      { name: 'Аренда генератора/компрессора', slug: 'rental.generator', icon: 'Zap', order: 5 },
      { name: 'Аренда звука/света/сцены', slug: 'rental.stage', icon: 'Speaker', order: 6 },
      { name: 'Аренда фотостудии', slug: 'rental.studio', icon: 'Camera', order: 7 },
      { name: 'Аренда видеотехники', slug: 'rental.video', icon: 'Video', order: 8 },
      { name: 'Аренда проекторов/экранов', slug: 'rental.projectors', icon: 'Monitor', order: 9 },
      { name: 'Аренда шатров/палаток', slug: 'rental.tents', icon: 'Tent', order: 10 },
      { name: 'Аренда мебели', slug: 'rental.furniture', icon: 'Armchair', order: 11 },
      { name: 'Аренда декора', slug: 'rental.decor', icon: 'Flower2', order: 12 },
      { name: 'Аренда костюмов', slug: 'rental.costumes', icon: 'Shirt', order: 13 },
      { name: 'Аренда помещений (зал/лофт)', slug: 'rental.places', icon: 'Building', order: 14 },
    ]
  )

  // 16. Творчество и хобби
  await createCategoryWithChildren(
    { name: 'Творчество и хобби', slug: 'creativity-hobby', icon: 'Brush', order: 16 },
    [
      { name: 'Шитьё на заказ', slug: 'creativity-hobby.sewing', icon: 'Scissors', order: 1 },
      { name: 'Вязание на заказ', slug: 'creativity-hobby.knitting', icon: 'Ribbon', order: 2 },
      { name: 'Вышивка/нашивки', slug: 'creativity-hobby.embroidery', icon: 'Ribbon', order: 3 },
      { name: 'Портреты/картины', slug: 'creativity-hobby.portraits', icon: 'Palette', order: 4 },
      { name: 'Роспись стен', slug: 'creativity-hobby.wallpaint', icon: 'Paintbrush', order: 5 },
      { name: 'Каллиграфия', slug: 'creativity-hobby.calligraphy', icon: 'PenTool', order: 6 },
      { name: 'Керамика/лепка', slug: 'creativity-hobby.ceramics', icon: 'Circle', order: 7 },
      { name: 'Изделия из дерева', slug: 'creativity-hobby.wood', icon: 'TreeDeciduous', order: 8 },
      { name: 'Ювелирка/гравировка', slug: 'creativity-hobby.jewelry', icon: 'Gem', order: 9 },
      { name: 'Флористика (букеты/композиции)', slug: 'creativity-hobby.floristics', icon: 'Flower', order: 10 },
      { name: 'Свечи/мыло ручной работы', slug: 'creativity-hobby.soap', icon: 'Flame', order: 11 },
      { name: 'Подарочные боксы', slug: 'creativity-hobby.giftboxes', icon: 'Gift', order: 12 },
      { name: 'Печать на сувенирах/мерче', slug: 'creativity-hobby.print', icon: 'Printer', order: 13 },
      { name: '3D-печать', slug: 'creativity-hobby.3dprint', icon: 'Box', order: 14 },
    ]
  )

  // 17. Услуги для животных
  await createCategoryWithChildren(
    { name: 'Услуги для животных', slug: 'animals', icon: 'PawPrint', order: 17 },
    [
      { name: 'Ветеринар (клиника)', slug: 'animals.vet-clinic', icon: 'Stethoscope', order: 1 },
      { name: 'Ветеринар на выезд', slug: 'animals.vet-home', icon: 'Stethoscope', order: 2 },
      { name: 'Груминг', slug: 'animals.grooming', icon: 'Scissors', order: 3 },
      { name: 'Стрижка когтей', slug: 'animals.claws', icon: 'Scissors', order: 4 },
      { name: 'Выгул собак', slug: 'animals.walk', icon: 'Footprints', order: 5 },
      { name: 'Передержка', slug: 'animals.boarding', icon: 'Home', order: 6 },
      { name: 'Зооняня', slug: 'animals.petnanny', icon: 'Heart', order: 7 },
      { name: 'Дрессировка/кинолог', slug: 'animals.trainer', icon: 'PawPrint', order: 8 },
      { name: 'Зоопсихолог', slug: 'animals.psych', icon: 'Brain', order: 9 },
      { name: 'Зоогостиница', slug: 'animals.hotel', icon: 'Building', order: 10 },
    ]
  )

  // 18. Охрана
  await createCategoryWithChildren(
    { name: 'Охрана', slug: 'security', icon: 'ShieldCheck', order: 18 },
    [
      { name: 'Охрана объектов', slug: 'security.guard-objects', icon: 'Building', order: 1 },
      { name: 'Охрана мероприятий', slug: 'security.guard-events', icon: 'PartyPopper', order: 2 },
      { name: 'Личная охрана', slug: 'security.personal', icon: 'UserCheck', order: 3 },
      { name: 'Установка сигнализаций', slug: 'security.alarms', icon: 'Bell', order: 4 },
      { name: 'Видеонаблюдение', slug: 'security.cctv', icon: 'Eye', order: 5 },
      { name: 'Домофоны', slug: 'security.intercom', icon: 'Phone', order: 6 },
      { name: 'СКУД (контроль доступа)', slug: 'security.access', icon: 'KeyRound', order: 7 },
      { name: 'Пожарная сигнализация', slug: 'security.fire', icon: 'Flame', order: 8 },
      { name: 'Пожарная безопасность (аудит/обслуживание)', slug: 'security.fire-maint', icon: 'Flame', order: 9 },
      { name: 'Тревожная кнопка', slug: 'security.panic', icon: 'AlertTriangle', order: 10 },
      { name: 'Сервис/обслуживание систем безопасности', slug: 'security.service', icon: 'Settings', order: 11 },
    ]
  )

  // 19. Разное
  await createCategoryWithChildren(
    { name: 'Разное', slug: 'misc', icon: 'MoreHorizontal', order: 19 },
    [
      { name: 'Психолог (взрослый/детский)', slug: 'misc.psychologist', icon: 'Brain', order: 1 },
      { name: 'Коуч/карьерный консультант', slug: 'misc.coach', icon: 'Target', order: 2 },
      { name: 'Переводчик (письменный/устный)', slug: 'misc.translator', icon: 'Languages', order: 3 },
      { name: 'Нотариус (справочно/переадрес)', slug: 'misc.notary', icon: 'Stamp', order: 4 },
      { name: 'Полиграфия (печать как услуга)', slug: 'misc.printing', icon: 'Printer', order: 5 },
      { name: 'Копирайтинг/редактура', slug: 'misc.copywriting', icon: 'FileText', order: 6 },
      { name: 'Набор текста/оформление документов', slug: 'misc.typing', icon: 'FileText', order: 7 },
      { name: 'Дезинсекция/дератизация/дезинфекция', slug: 'misc.pest', icon: 'Bug', order: 8 },
      { name: 'Изготовление ключей', slug: 'misc.keys', icon: 'Key', order: 9 },
      { name: 'Вскрытие/ремонт замков', slug: 'misc.locks', icon: 'Lock', order: 10 },
      { name: 'Установка/замена счётчиков', slug: 'misc.meters', icon: 'Gauge', order: 11 },
      { name: 'Ремонт велосипедов/самокатов', slug: 'misc.bike-repair', icon: 'Bike', order: 12 },
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

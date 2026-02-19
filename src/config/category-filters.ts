// Маппинг категорий и подкатегорий к модулям фильтров
// EFFECTIVE_FILTERS = GLOBAL + CATEGORY_BASE + SUBCATEGORY_ADD

import { GLOBAL_MODULE_IDS, getFilterModules, type FilterModule } from './filter-modules'

// ============================================================
// Типы
// ============================================================

export interface CategoryFilterConfig {
  slug: string
  title: string
  baseModules: string[]   // ID модулей, общие для всех подкатегорий
  subcategories: SubcategoryFilterConfig[]
}

export interface SubcategoryFilterConfig {
  slug: string
  title: string
  addModules: string[]    // ID дополнительных модулей
}

// ============================================================
// C) Категории и подкатегории с привязкой фильтров
// ============================================================

export const CATEGORIES_CONFIG: CategoryFilterConfig[] = [
  // 1. Репетиторы и обучение
  {
    slug: 'education',
    title: 'Репетиторы и обучение',
    baseModules: ['SERVICE_MODE', 'EDU_GRADE_RANGE', 'EDU_GOAL', 'EDU_GROUP_SIZE', 'EDU_TEACHING_STYLE', 'EDU_HOMEWORK_CHECK', 'EDU_SUBJECT_TOPICS'],
    subcategories: [
      { slug: 'education.math', title: 'Математика', addModules: ['EDU_EXAM_TYPE'] },
      { slug: 'education.russian', title: 'Русский язык', addModules: ['EDU_EXAM_TYPE'] },
      { slug: 'education.literature', title: 'Литература', addModules: ['EDU_EXAM_TYPE'] },
      { slug: 'education.english', title: 'Английский язык', addModules: ['EDU_LANG_LEVEL', 'EDU_LANG_ACCENT', 'EDU_EXAM_TYPE'] },
      { slug: 'education.foreign', title: 'Другие иностранные языки', addModules: ['EDU_LANG_LEVEL', 'EDU_LANG_ACCENT'] },
      { slug: 'education.physics', title: 'Физика', addModules: ['EDU_EXAM_TYPE'] },
      { slug: 'education.chemistry', title: 'Химия', addModules: ['EDU_EXAM_TYPE'] },
      { slug: 'education.biology', title: 'Биология', addModules: ['EDU_EXAM_TYPE'] },
      { slug: 'education.cs', title: 'Информатика', addModules: ['EDU_EXAM_TYPE'] },
      { slug: 'education.history', title: 'История', addModules: ['EDU_EXAM_TYPE'] },
      { slug: 'education.social', title: 'Обществознание', addModules: ['EDU_EXAM_TYPE'] },
      { slug: 'education.geo', title: 'География', addModules: ['EDU_EXAM_TYPE'] },
      { slug: 'education.ege', title: 'Подготовка к ЕГЭ', addModules: ['EDU_EXAM_TYPE'] },
      { slug: 'education.oge', title: 'Подготовка к ОГЭ', addModules: ['EDU_EXAM_TYPE'] },
      { slug: 'education.vpr', title: 'Подготовка к ВПР', addModules: ['EDU_EXAM_TYPE'] },
      { slug: 'education.preschool', title: 'Подготовка к школе / дошкольное развитие', addModules: [] },
      { slug: 'education.primary', title: 'Начальная школа (комплексно)', addModules: [] },
      { slug: 'education.speech', title: 'Логопед / дефектолог', addModules: ['EDU_SPEECH_ISSUE'] },
      { slug: 'education.speedread', title: 'Скорочтение / развитие памяти', addModules: [] },
      { slug: 'education.olymp', title: 'Подготовка к олимпиадам', addModules: ['EDU_EXAM_TYPE'] },
      { slug: 'education.programming', title: 'Программирование (обучение)', addModules: ['IT_STACK'] },
      { slug: 'education.music', title: 'Музыкальные уроки (вокал/инструменты)', addModules: ['EDU_MUSIC_INSTRUMENT'] },
      { slug: 'education.art', title: 'Рисование / живопись', addModules: ['EDU_ART_FORMAT'] },
      { slug: 'education.chess', title: 'Шахматы (обучение)', addModules: [] },
    ],
  },

  // 2. Ремонт и строительство
  {
    slug: 'repair-construction',
    title: 'Ремонт и строительство',
    baseModules: ['RC_OBJECT_TYPE', 'RC_SCOPE', 'RC_AREA_M2', 'RC_MATERIALS', 'RC_ESTIMATE', 'RC_WARRANTY'],
    subcategories: [
      { slug: 'repair-construction.turnkey', title: 'Ремонт квартир/домов под ключ', addModules: ['RC_TASK_FINISH', 'RC_TASK_PLUMB', 'RC_TASK_ELECTRO'] },
      { slug: 'repair-construction.design', title: 'Дизайн-проект / планировка', addModules: ['DES_DIRECTION', 'DES_STYLE', 'DES_REVISIONS'] },
      { slug: 'repair-construction.demolition', title: 'Демонтаж', addModules: [] },
      { slug: 'repair-construction.finish', title: 'Отделочные работы', addModules: ['RC_TASK_FINISH'] },
      { slug: 'repair-construction.plaster', title: 'Штукатурка/шпаклёвка', addModules: ['RC_TASK_FINISH'] },
      { slug: 'repair-construction.paint', title: 'Покраска', addModules: ['RC_TASK_FINISH'] },
      { slug: 'repair-construction.wallpaper', title: 'Обои/декоративные покрытия', addModules: ['RC_TASK_FINISH'] },
      { slug: 'repair-construction.floors', title: 'Полы (стяжка/наливной/укладка)', addModules: ['RC_TASK_FINISH'] },
      { slug: 'repair-construction.tiles', title: 'Плиточные работы', addModules: ['RC_TASK_FINISH'] },
      { slug: 'repair-construction.gkl', title: 'Гипсокартон / перегородки', addModules: ['RC_TASK_FINISH'] },
      { slug: 'repair-construction.ceilings', title: 'Потолки', addModules: ['RC_TASK_FINISH'] },
      { slug: 'repair-construction.plumbing', title: 'Сантехника (монтаж/разводка)', addModules: ['RC_TASK_PLUMB'] },
      { slug: 'repair-construction.electro', title: 'Электромонтаж (разводка/щит)', addModules: ['RC_TASK_ELECTRO'] },
      { slug: 'repair-construction.heating', title: 'Отопление / тёплый пол', addModules: ['RC_TASK_HEAT'] },
      { slug: 'repair-construction.vent', title: 'Вентиляция (быт)', addModules: [] },
      { slug: 'repair-construction.windows', title: 'Окна / балконы / остекление', addModules: ['RC_TASK_WINDOWS'] },
      { slug: 'repair-construction.doors', title: 'Двери (установка)', addModules: ['RC_TASK_DOORS'] },
      { slug: 'repair-construction.roof', title: 'Кровля / водостоки', addModules: ['RC_TASK_ROOF'] },
      { slug: 'repair-construction.facade', title: 'Фасады / утепление', addModules: ['RC_TASK_FACADE'] },
      { slug: 'repair-construction.fence', title: 'Заборы / ворота / навесы', addModules: ['RC_TASK_FENCE'] },
      { slug: 'repair-construction.kitchen', title: 'Сборка/монтаж кухонь', addModules: ['RC_TASK_KITCHEN'] },
    ],
  },

  // 3. Ремонт и установка техники
  {
    slug: 'repair-tech',
    title: 'Ремонт и установка техники',
    baseModules: ['TECH_DEVICE_BRAND', 'TECH_DEVICE_MODEL', 'TECH_SERVICE_PLACE', 'TECH_DIAG_FEE', 'TECH_PARTS', 'TECH_WARRANTY'],
    subcategories: [
      { slug: 'repair-tech.phones', title: 'Телефоны/планшеты (ремонт)', addModules: ['TECH_TASK_PHONE'] },
      { slug: 'repair-tech.pc', title: 'Ноутбуки/ПК (ремонт)', addModules: ['TECH_TASK_PC'] },
      { slug: 'repair-tech.tv', title: 'Телевизоры (ремонт)', addModules: ['TECH_TASK_TV'] },
      { slug: 'repair-tech.fridge', title: 'Холодильники/морозилки (ремонт)', addModules: ['TECH_TASK_APPLIANCE'] },
      { slug: 'repair-tech.washer', title: 'Стиральные/сушильные машины (ремонт)', addModules: ['TECH_TASK_APPLIANCE'] },
      { slug: 'repair-tech.dishwasher', title: 'Посудомоечные машины (ремонт)', addModules: ['TECH_TASK_APPLIANCE'] },
      { slug: 'repair-tech.microwave', title: 'Микроволновки (ремонт)', addModules: ['TECH_TASK_APPLIANCE'] },
      { slug: 'repair-tech.oven', title: 'Духовые/варочные панели (ремонт)', addModules: ['TECH_TASK_APPLIANCE'] },
      { slug: 'repair-tech.vacuum', title: 'Пылесосы/роботы (ремонт)', addModules: ['TECH_TASK_APPLIANCE'] },
      { slug: 'repair-tech.coffee', title: 'Кофемашины (ремонт)', addModules: ['TECH_TASK_APPLIANCE'] },
      { slug: 'repair-tech.printers', title: 'Принтеры/МФУ (ремонт)', addModules: ['TECH_TASK_APPLIANCE'] },
      { slug: 'repair-tech.install', title: 'Установка/подключение бытовой техники', addModules: ['TECH_TASK_INSTALL'] },
      { slug: 'repair-tech.ac-install', title: 'Кондиционеры (монтаж)', addModules: ['TECH_TASK_AC'] },
      { slug: 'repair-tech.ac-service', title: 'Кондиционеры (обслуживание)', addModules: ['TECH_TASK_AC'] },
    ],
  },

  // 4. Ремонт авто
  {
    slug: 'auto',
    title: 'Ремонт авто',
    baseModules: ['AUTO_MAKE_MODEL', 'AUTO_YEAR', 'AUTO_ENGINE_TYPE', 'AUTO_SERVICE_PLACE', 'AUTO_PARTS_POLICY'],
    subcategories: [
      { slug: 'auto.service', title: 'Автосервис / ТО', addModules: ['AUTO_TASK_TO'] },
      { slug: 'auto.oil', title: 'Замена масла/фильтров', addModules: ['AUTO_TASK_TO'] },
      { slug: 'auto.diag', title: 'Диагностика (компьютерная)', addModules: ['AUTO_TASK_DIAG'] },
      { slug: 'auto.prebuy', title: 'Диагностика перед покупкой', addModules: ['AUTO_TASK_DIAG'] },
      { slug: 'auto.susp', title: 'Ходовая/подвеска', addModules: ['AUTO_TASK_SUSP'] },
      { slug: 'auto.brakes', title: 'Тормоза', addModules: ['AUTO_TASK_BRAKES'] },
      { slug: 'auto.steering', title: 'Рулевое', addModules: ['AUTO_TASK_SUSP'] },
      { slug: 'auto.engine', title: 'Двигатель (ремонт/обслуживание)', addModules: ['AUTO_TASK_ENGINE'] },
      { slug: 'auto.timing', title: 'ГРМ', addModules: ['AUTO_TASK_ENGINE'] },
      { slug: 'auto.clutch', title: 'Сцепление', addModules: ['AUTO_TASK_GEAR'] },
      { slug: 'auto.gearbox', title: 'АКПП/МКПП/вариатор', addModules: ['AUTO_TASK_GEAR'] },
      { slug: 'auto.electro', title: 'Автоэлектрик', addModules: ['AUTO_TASK_ELECTRO'] },
      { slug: 'auto.starter', title: 'Стартер/генератор', addModules: ['AUTO_TASK_ELECTRO'] },
      { slug: 'auto.cooling', title: 'Система охлаждения', addModules: ['AUTO_TASK_ENGINE'] },
      { slug: 'auto.ac', title: 'Автокондиционер (заправка/ремонт)', addModules: ['AUTO_TASK_AC'] },
      { slug: 'auto.exhaust', title: 'Выхлоп', addModules: [] },
      { slug: 'auto.align', title: 'Развал-схождение', addModules: [] },
      { slug: 'auto.tire', title: 'Шиномонтаж/балансировка', addModules: ['AUTO_TASK_TIRE'] },
      { slug: 'auto.tire-storage', title: 'Хранение шин', addModules: ['AUTO_TASK_TIRE'] },
      { slug: 'auto.body', title: 'Кузовной ремонт', addModules: ['AUTO_TASK_BODY'] },
      { slug: 'auto.paint', title: 'Покраска', addModules: ['AUTO_TASK_BODY'] },
      { slug: 'auto.polish', title: 'Полировка', addModules: ['AUTO_TASK_BODY'] },
      { slug: 'auto.detailing', title: 'Детейлинг (в т.ч. химчистка салона)', addModules: ['AUTO_TASK_BODY'] },
      { slug: 'auto.wash', title: 'Автомойка', addModules: [] },
      { slug: 'auto.anticor', title: 'Антикор', addModules: ['AUTO_TASK_BODY'] },
      { slug: 'auto.glass', title: 'Стёкла (замена/ремонт)', addModules: ['AUTO_TASK_GLASS'] },
      { slug: 'auto.extra', title: 'Установка доп.оборудования', addModules: ['AUTO_TASK_EXTRA'] },
    ],
  },

  // 5. Компьютеры и IT
  {
    slug: 'it-digital',
    title: 'Компьютеры и IT',
    baseModules: ['IT_SCOPE', 'IT_REMOTE', 'IT_PLATFORM', 'IT_STACK'],
    subcategories: [
      { slug: 'it-digital.help', title: 'Компьютерная помощь (выезд)', addModules: ['TECH_TASK_PC'] },
      { slug: 'it-digital.os', title: 'Установка/настройка ОС', addModules: ['TECH_TASK_PC'] },
      { slug: 'it-digital.viruses', title: 'Удаление вирусов', addModules: ['TECH_TASK_PC'] },
      { slug: 'it-digital.wifi', title: 'Настройка Wi-Fi/роутера/сети', addModules: [] },
      { slug: 'it-digital.data', title: 'Восстановление данных', addModules: [] },
      { slug: 'it-digital.upgrade', title: 'Сборка/апгрейд ПК', addModules: ['TECH_TASK_PC'] },
      { slug: 'it-digital.phones', title: 'Настройка телефонов (перенос данных)', addModules: [] },
      { slug: 'it-digital.site-landing', title: 'Создание сайтов (лендинг)', addModules: ['IT_DELIVERABLES'] },
      { slug: 'it-digital.site-service', title: 'Создание сайтов (магазин/сервис)', addModules: ['IT_DELIVERABLES'] },
      { slug: 'it-digital.support', title: 'Поддержка сайта', addModules: ['IT_SLA'] },
      { slug: 'it-digital.dev', title: 'Разработка ПО / интеграции', addModules: ['IT_DELIVERABLES'] },
      { slug: 'it-digital.bots', title: 'Чат-боты / автоматизация', addModules: ['IT_DELIVERABLES'] },
      { slug: 'it-digital.crm', title: 'CRM/аналитика/метрика', addModules: [] },
      { slug: 'it-digital.1c', title: '1С (настройка/сопровождение)', addModules: ['IT_1C_MODULES'] },
      { slug: 'it-digital.ads', title: 'Реклама (настройка)', addModules: ['IT_MARKETING_CHANNELS'] },
      { slug: 'it-digital.smm', title: 'SMM (ведение)', addModules: ['IT_MARKETING_CHANNELS'] },
      { slug: 'it-digital.seo', title: 'SEO-продвижение', addModules: ['IT_MARKETING_CHANNELS'] },
      { slug: 'it-digital.content', title: 'Контент-маркетинг', addModules: ['IT_MARKETING_CHANNELS'] },
      { slug: 'it-digital.vps', title: 'Серверы/VPS (администрирование)', addModules: ['IT_SLA'] },
    ],
  },

  // 6. Тренеры
  {
    slug: 'sports-fitness',
    title: 'Тренеры',
    baseModules: ['FIT_GOAL', 'FIT_LEVEL', 'FIT_LIMITS', 'FIT_PLACE', 'FIT_DISCIPLINE'],
    subcategories: [
      { slug: 'sports-fitness.personal', title: 'Персональный тренер', addModules: [] },
      { slug: 'sports-fitness.fitness', title: 'Фитнес', addModules: [] },
      { slug: 'sports-fitness.yoga', title: 'Йога', addModules: [] },
      { slug: 'sports-fitness.pilates', title: 'Пилатес/стретчинг', addModules: [] },
      { slug: 'sports-fitness.lfk', title: 'ЛФК/восстановление', addModules: [] },
      { slug: 'sports-fitness.run', title: 'Бег (подготовка)', addModules: [] },
      { slug: 'sports-fitness.swim', title: 'Плавание (тренер)', addModules: [] },
      { slug: 'sports-fitness.dance', title: 'Танцы (тренер)', addModules: [] },
      { slug: 'sports-fitness.martial', title: 'Единоборства', addModules: [] },
      { slug: 'sports-fitness.tennis', title: 'Теннис/настольный теннис', addModules: [] },
      { slug: 'sports-fitness.kids-ofp', title: 'ОФП для детей', addModules: [] },
      { slug: 'sports-fitness.chess-section', title: 'Шахматы (спорт-секция)', addModules: [] },
    ],
  },

  // 7. Красота
  {
    slug: 'beauty-health',
    title: 'Красота',
    baseModules: ['BEAUTY_PLACE', 'BEAUTY_STYLE', 'BEAUTY_MATERIALS'],
    subcategories: [
      { slug: 'beauty-health.hairdresser', title: 'Парикмахер (женский)', addModules: ['BEAUTY_HAIR_TASKS'] },
      { slug: 'beauty-health.barber', title: 'Барбер', addModules: ['BEAUTY_HAIR_TASKS'] },
      { slug: 'beauty-health.coloring', title: 'Окрашивание', addModules: ['BEAUTY_HAIR_TASKS'] },
      { slug: 'beauty-health.styles', title: 'Укладки/причёски', addModules: ['BEAUTY_HAIR_TASKS'] },
      { slug: 'beauty-health.manicure', title: 'Маникюр', addModules: ['BEAUTY_NAIL_TASKS'] },
      { slug: 'beauty-health.pedicure', title: 'Педикюр', addModules: ['BEAUTY_NAIL_TASKS'] },
      { slug: 'beauty-health.nails-ext', title: 'Наращивание ногтей', addModules: ['BEAUTY_NAIL_TASKS'] },
      { slug: 'beauty-health.massage', title: 'Массаж (классический)', addModules: ['BEAUTY_BODY'] },
      { slug: 'beauty-health.massage-med', title: 'Массаж (лечебный/спорт)', addModules: ['BEAUTY_BODY'] },
      { slug: 'beauty-health.cosmetology', title: 'Косметолог (уход)', addModules: ['BEAUTY_COSMO_TASKS'] },
      { slug: 'beauty-health.brows', title: 'Брови', addModules: ['BEAUTY_BROW_LASH'] },
      { slug: 'beauty-health.lashes', title: 'Ресницы', addModules: ['BEAUTY_BROW_LASH'] },
      { slug: 'beauty-health.makeup', title: 'Визажист', addModules: [] },
      { slug: 'beauty-health.stylist', title: 'Стилист', addModules: [] },
      { slug: 'beauty-health.epilation', title: 'Эпиляция/депиляция', addModules: ['BEAUTY_BODY'] },
      { slug: 'beauty-health.tattoo', title: 'Тату', addModules: ['BEAUTY_TATTOO'] },
      { slug: 'beauty-health.piercing', title: 'Пирсинг', addModules: ['BEAUTY_TATTOO'] },
      { slug: 'beauty-health.permanent', title: 'Перманент/татуаж', addModules: ['BEAUTY_TATTOO'] },
    ],
  },

  // 8. Перевозки и курьеры
  {
    slug: 'transport-delivery',
    title: 'Перевозки и курьеры',
    baseModules: ['TR_TYPE', 'TR_VEHICLE', 'TR_WEIGHT', 'TR_VOLUME', 'TR_LOADERS', 'TR_EXTRA'],
    subcategories: [
      { slug: 'transport-delivery.city', title: 'Грузоперевозки по городу', addModules: [] },
      { slug: 'transport-delivery.intercity', title: 'Грузоперевозки межгород', addModules: [] },
      { slug: 'transport-delivery.move', title: 'Переезд под ключ', addModules: ['TR_LOADERS', 'TR_EXTRA'] },
      { slug: 'transport-delivery.loaders', title: 'Грузчики', addModules: ['TR_LOADERS'] },
      { slug: 'transport-delivery.furniture', title: 'Доставка мебели/техники', addModules: ['TR_EXTRA'] },
      { slug: 'transport-delivery.materials', title: 'Доставка стройматериалов', addModules: [] },
      { slug: 'transport-delivery.courier-docs', title: 'Курьер (документы)', addModules: [] },
      { slug: 'transport-delivery.courier-parcels', title: 'Курьер (посылки)', addModules: [] },
      { slug: 'transport-delivery.express', title: 'Экспресс-доставка', addModules: ['URGENCY'] },
      { slug: 'transport-delivery.products', title: 'Доставка продуктов', addModules: ['URGENCY'] },
      { slug: 'transport-delivery.trash', title: 'Вывоз мусора (строительный/бытовой)', addModules: [] },
      { slug: 'transport-delivery.old-furniture', title: 'Вывоз старой мебели', addModules: [] },
      { slug: 'transport-delivery.water', title: 'Доставка воды', addModules: [] },
      { slug: 'transport-delivery.flowers', title: 'Доставка цветов', addModules: ['URGENCY'] },
      { slug: 'transport-delivery.tow', title: 'Эвакуатор', addModules: ['URGENCY'] },
      { slug: 'transport-delivery.sober-driver', title: 'Трезвый водитель', addModules: ['URGENCY'] },
      { slug: 'transport-delivery.pets', title: 'Перевозка животных', addModules: ['TR_PETS'] },
    ],
  },

  // 9. Хозяйство и уборка
  {
    slug: 'home-lifestyle',
    title: 'Хозяйство и уборка',
    baseModules: ['HOME_AREA', 'HOME_CLEAN_TYPE', 'HOME_FREQUENCY', 'HOME_ECO', 'HOME_PETS'],
    subcategories: [
      { slug: 'home-lifestyle.clean-regular', title: 'Уборка (поддерживающая)', addModules: ['HOME_FREQUENCY'] },
      { slug: 'home-lifestyle.clean-general', title: 'Генеральная уборка', addModules: [] },
      { slug: 'home-lifestyle.clean-post', title: 'Уборка после ремонта', addModules: [] },
      { slug: 'home-lifestyle.windows', title: 'Мытьё окон', addModules: [] },
      { slug: 'home-lifestyle.furniture-dry', title: 'Химчистка мебели', addModules: [] },
      { slug: 'home-lifestyle.carpets-dry', title: 'Химчистка ковров', addModules: [] },
      { slug: 'home-lifestyle.office', title: 'Уборка офисов', addModules: [] },
      { slug: 'home-lifestyle.housekeeper', title: 'Домработница (регулярно)', addModules: ['HOME_FREQUENCY'] },
      { slug: 'home-lifestyle.laundry', title: 'Стирка/глажка', addModules: [] },
      { slug: 'home-lifestyle.clothes-repair', title: 'Ремонт одежды / ателье', addModules: [] },
      { slug: 'home-lifestyle.nanny', title: 'Няни', addModules: ['HOME_CARE'] },
      { slug: 'home-lifestyle.caregiver', title: 'Сиделки', addModules: ['HOME_CARE'] },
      { slug: 'home-lifestyle.cooking', title: 'Готовка на дом', addModules: ['HOME_CARE'] },
      { slug: 'home-lifestyle.garden', title: 'Садовые работы', addModules: ['HOME_GARDEN'] },
      { slug: 'home-lifestyle.snow', title: 'Уборка территории/снега', addModules: ['HOME_GARDEN'] },
      { slug: 'home-lifestyle.errands', title: 'Мелкие поручения по дому', addModules: ['HOME_CARE'] },
    ],
  },

  // 10. Юристы и финансы
  {
    slug: 'legal-financial',
    title: 'Юристы и финансы',
    baseModules: ['SERVICE_MODE', 'LEGAL_STAGE', 'LEGAL_FIELD', 'LEGAL_DOCS', 'FIN_TYPE'],
    subcategories: [
      { slug: 'legal-financial.lawyers', title: 'Юристы', addModules: ['LEGAL_FIELD', 'LEGAL_STAGE'] },
      { slug: 'legal-financial.consult', title: 'Консультация', addModules: ['LEGAL_STAGE'] },
      { slug: 'legal-financial.docs', title: 'Документы (иски/претензии/договоры)', addModules: ['LEGAL_DOCS'] },
      { slug: 'legal-financial.court', title: 'Судебное представительство', addModules: ['LEGAL_STAGE'] },
      { slug: 'legal-financial.family', title: 'Семейное право', addModules: ['LEGAL_FIELD'] },
      { slug: 'legal-financial.inherit', title: 'Наследство', addModules: ['LEGAL_FIELD'] },
      { slug: 'legal-financial.labor', title: 'Трудовые споры', addModules: ['LEGAL_FIELD'] },
      { slug: 'legal-financial.consumer', title: 'Защита прав потребителей', addModules: ['LEGAL_FIELD'] },
      { slug: 'legal-financial.auto', title: 'Автоюрист/ДТП', addModules: ['LEGAL_FIELD'] },
      { slug: 'legal-financial.arbitration', title: 'Арбитраж/споры бизнеса', addModules: ['LEGAL_FIELD'] },
      { slug: 'legal-financial.reg', title: 'Регистрация ИП/ООО', addModules: ['LEGAL_FIELD'] },
      { slug: 'legal-financial.debts', title: 'Взыскание долгов', addModules: ['LEGAL_FIELD'] },
      { slug: 'legal-financial.bankruptcy', title: 'Банкротство физлиц', addModules: ['LEGAL_FIELD'] },
      { slug: 'legal-financial.accounting', title: 'Бухгалтер', addModules: ['FIN_TYPE'] },
      { slug: 'legal-financial.taxes', title: 'Налоги/отчётность', addModules: ['FIN_TYPE'] },
      { slug: 'legal-financial.hr', title: 'Кадры', addModules: ['FIN_TYPE'] },
      { slug: 'legal-financial.insurance', title: 'Страхование', addModules: ['FIN_TYPE'] },
      { slug: 'legal-financial.realtor', title: 'Риелтор', addModules: ['FIN_TYPE'] },
      { slug: 'legal-financial.realestate-check', title: 'Проверка документов по недвижимости', addModules: ['FIN_TYPE'] },
    ],
  },

  // 11. Дизайнеры
  {
    slug: 'designers',
    title: 'Дизайнеры',
    baseModules: ['SERVICE_MODE', 'DES_DIRECTION', 'DES_STYLE', 'DES_FILES', 'DES_REVISIONS', 'DES_FORMATS'],
    subcategories: [
      { slug: 'designers.interior', title: 'Дизайн интерьеров', addModules: ['DES_DIRECTION'] },
      { slug: 'designers.3d', title: '3D-визуализация', addModules: ['DES_FORMATS'] },
      { slug: 'designers.landscape', title: 'Ландшафтный дизайн', addModules: ['DES_DIRECTION'] },
      { slug: 'designers.graphic', title: 'Графический дизайн', addModules: ['DES_DIRECTION'] },
      { slug: 'designers.logo', title: 'Логотип/фирстиль', addModules: ['DES_FILES'] },
      { slug: 'designers.branding', title: 'Брендинг', addModules: ['DES_FILES'] },
      { slug: 'designers.pack', title: 'Дизайн упаковки', addModules: ['DES_FILES'] },
      { slug: 'designers.print', title: 'Дизайн полиграфии', addModules: ['DES_FORMATS'] },
      { slug: 'designers.ads', title: 'Дизайн рекламы (креативы)', addModules: ['DES_FORMATS'] },
      { slug: 'designers.web', title: 'Веб-дизайн', addModules: ['DES_FORMATS'] },
      { slug: 'designers.uxui', title: 'UX/UI', addModules: ['DES_FORMATS'] },
      { slug: 'designers.social', title: 'Оформление соцсетей', addModules: ['DES_FORMATS'] },
      { slug: 'designers.presentations', title: 'Презентации', addModules: ['DES_FORMATS'] },
      { slug: 'designers.illustrations', title: 'Иллюстрации', addModules: ['DES_STYLE'] },
    ],
  },

  // 12. Фото, видео, аудио
  {
    slug: 'photo-video',
    title: 'Фото, видео, аудио',
    baseModules: ['SERVICE_MODE', 'PV_TYPE', 'PV_EVENT', 'PV_DURATION', 'PV_DELIVERABLES'],
    subcategories: [
      { slug: 'photo-video.photo', title: 'Фотосессия (инд./сем./детская)', addModules: ['PV_EVENT'] },
      { slug: 'photo-video.wedding', title: 'Свадебный фотограф', addModules: ['PV_EVENT'] },
      { slug: 'photo-video.report', title: 'Репортажная съёмка', addModules: ['PV_EVENT'] },
      { slug: 'photo-video.product', title: 'Предметная съёмка', addModules: ['PV_EVENT'] },
      { slug: 'photo-video.docs', title: 'Фото на документы', addModules: ['URGENCY'] },
      { slug: 'photo-video.drone', title: 'Дрон-съёмка', addModules: ['PV_TYPE'] },
      { slug: 'photo-video.event-video', title: 'Видеосъёмка мероприятий', addModules: ['PV_EVENT'] },
      { slug: 'photo-video.biz-video', title: 'Видеосъёмка для бизнеса', addModules: ['PV_EVENT'] },
      { slug: 'photo-video.edit', title: 'Монтаж видео', addModules: ['PV_DELIVERABLES'] },
      { slug: 'photo-video.motion', title: 'Моушн/анимация', addModules: ['PV_DELIVERABLES'] },
      { slug: 'photo-video.retouch', title: 'Обработка/ретушь фото', addModules: ['PV_DELIVERABLES'] },
      { slug: 'photo-video.voice', title: 'Озвучка/диктор', addModules: ['PV_DELIVERABLES'] },
      { slug: 'photo-video.audio', title: 'Звукозапись/сведение', addModules: ['PV_DELIVERABLES'] },
    ],
  },

  // 13. Организация мероприятий
  {
    slug: 'events',
    title: 'Организация мероприятий',
    baseModules: ['EV_TYPE', 'EV_GUESTS', 'EV_BUDGET', 'EV_SERVICES'],
    subcategories: [
      { slug: 'events.turnkey', title: 'Праздник под ключ', addModules: ['EV_SERVICES'] },
      { slug: 'events.wedding', title: 'Организация свадеб', addModules: ['EV_SERVICES'] },
      { slug: 'events.corporate', title: 'Организация корпоративов', addModules: ['EV_SERVICES'] },
      { slug: 'events.host', title: 'Ведущий', addModules: ['EV_TYPE'] },
      { slug: 'events.decor', title: 'Декор/оформление', addModules: ['EV_TYPE'] },
      { slug: 'events.catering', title: 'Кейтеринг', addModules: ['EV_GUESTS'] },
      { slug: 'events.cakes', title: 'Торты/кондитер на заказ', addModules: ['URGENCY'] },
      { slug: 'events.coordinator', title: 'Координатор/администратор', addModules: [] },
      { slug: 'events.staff', title: 'Персонал (хостес/официанты)', addModules: ['EV_GUESTS'] },
    ],
  },

  // 14. Артисты
  {
    slug: 'artists',
    title: 'Артисты',
    baseModules: ['ART_TYPE', 'ART_GENRE', 'ART_DURATION', 'ART_EQUIP'],
    subcategories: [
      { slug: 'artists.singers', title: 'Певцы/вокалисты', addModules: ['ART_GENRE'] },
      { slug: 'artists.musicians', title: 'Музыканты (соло)', addModules: ['ART_GENRE'] },
      { slug: 'artists.cover', title: 'Кавер-группы', addModules: ['ART_GENRE'] },
      { slug: 'artists.dj', title: 'DJ', addModules: ['ART_GENRE'] },
      { slug: 'artists.dance', title: 'Танцевальные коллективы', addModules: ['ART_GENRE'] },
      { slug: 'artists.show-ballet', title: 'Шоу-балет', addModules: ['ART_GENRE'] },
      { slug: 'artists.magic', title: 'Фокусники/иллюзионисты', addModules: [] },
      { slug: 'artists.standup', title: 'Стендап', addModules: [] },
      { slug: 'artists.animators', title: 'Аниматоры', addModules: ['EV_TYPE'] },
      { slug: 'artists.show', title: 'Шоу-программы', addModules: ['EV_TYPE'] },
      { slug: 'artists.sound', title: 'Звукорежиссёр (выездный)', addModules: ['ART_EQUIP'] },
    ],
  },

  // 15. Аренда
  {
    slug: 'rental',
    title: 'Аренда',
    baseModules: ['RENT_ITEM', 'RENT_DURATION', 'RENT_DELIVERY', 'RENT_DEPOSIT'],
    subcategories: [
      { slug: 'rental.auto', title: 'Аренда авто', addModules: [] },
      { slug: 'rental.special', title: 'Аренда спецтехники', addModules: [] },
      { slug: 'rental.tools', title: 'Аренда инструмента', addModules: [] },
      { slug: 'rental.construction', title: 'Аренда строительного оборудования', addModules: [] },
      { slug: 'rental.generator', title: 'Аренда генератора/компрессора', addModules: [] },
      { slug: 'rental.stage', title: 'Аренда звука/света/сцены', addModules: [] },
      { slug: 'rental.studio', title: 'Аренда фотостудии', addModules: [] },
      { slug: 'rental.video', title: 'Аренда видеотехники', addModules: [] },
      { slug: 'rental.projectors', title: 'Аренда проекторов/экранов', addModules: [] },
      { slug: 'rental.tents', title: 'Аренда шатров/палаток', addModules: [] },
      { slug: 'rental.furniture', title: 'Аренда мебели', addModules: [] },
      { slug: 'rental.decor', title: 'Аренда декора', addModules: [] },
      { slug: 'rental.costumes', title: 'Аренда костюмов', addModules: [] },
      { slug: 'rental.places', title: 'Аренда помещений (зал/лофт)', addModules: [] },
    ],
  },

  // 16. Творчество и хобби
  {
    slug: 'creativity-hobby',
    title: 'Творчество и хобби',
    baseModules: ['SERVICE_MODE', 'CR_TYPE', 'CR_MATERIAL', 'CR_SIZE', 'CR_PERSONAL', 'CR_DEADLINE'],
    subcategories: [
      { slug: 'creativity-hobby.sewing', title: 'Шитьё на заказ', addModules: [] },
      { slug: 'creativity-hobby.knitting', title: 'Вязание на заказ', addModules: [] },
      { slug: 'creativity-hobby.embroidery', title: 'Вышивка/нашивки', addModules: [] },
      { slug: 'creativity-hobby.portraits', title: 'Портреты/картины', addModules: [] },
      { slug: 'creativity-hobby.wallpaint', title: 'Роспись стен', addModules: [] },
      { slug: 'creativity-hobby.calligraphy', title: 'Каллиграфия', addModules: [] },
      { slug: 'creativity-hobby.ceramics', title: 'Керамика/лепка', addModules: [] },
      { slug: 'creativity-hobby.wood', title: 'Изделия из дерева', addModules: [] },
      { slug: 'creativity-hobby.jewelry', title: 'Ювелирка/гравировка', addModules: [] },
      { slug: 'creativity-hobby.floristics', title: 'Флористика (букеты/композиции)', addModules: ['URGENCY'] },
      { slug: 'creativity-hobby.soap', title: 'Свечи/мыло ручной работы', addModules: [] },
      { slug: 'creativity-hobby.giftboxes', title: 'Подарочные боксы', addModules: ['URGENCY'] },
      { slug: 'creativity-hobby.print', title: 'Печать на сувенирах/мерче', addModules: [] },
      { slug: 'creativity-hobby.3dprint', title: '3D-печать', addModules: ['IT_STACK'] },
    ],
  },

  // 17. Услуги для животных
  {
    slug: 'animals',
    title: 'Услуги для животных',
    baseModules: ['AN_TYPE', 'AN_WEIGHT', 'AN_PLACE', 'AN_TASK'],
    subcategories: [
      { slug: 'animals.vet-clinic', title: 'Ветеринар (клиника)', addModules: [] },
      { slug: 'animals.vet-home', title: 'Ветеринар на выезд', addModules: ['URGENCY'] },
      { slug: 'animals.grooming', title: 'Груминг', addModules: [] },
      { slug: 'animals.claws', title: 'Стрижка когтей', addModules: ['URGENCY'] },
      { slug: 'animals.walk', title: 'Выгул собак', addModules: ['URGENCY'] },
      { slug: 'animals.boarding', title: 'Передержка', addModules: [] },
      { slug: 'animals.petnanny', title: 'Зооняня', addModules: [] },
      { slug: 'animals.trainer', title: 'Дрессировка/кинолог', addModules: [] },
      { slug: 'animals.psych', title: 'Зоопсихолог', addModules: [] },
      { slug: 'animals.hotel', title: 'Зоогостиница', addModules: [] },
    ],
  },

  // 18. Охрана
  {
    slug: 'security',
    title: 'Охрана',
    baseModules: ['SEC_OBJECT', 'SEC_SYSTEM', 'SEC_RESPONSE', 'SEC_MAINT'],
    subcategories: [
      { slug: 'security.guard-objects', title: 'Охрана объектов', addModules: ['SEC_OBJECT'] },
      { slug: 'security.guard-events', title: 'Охрана мероприятий', addModules: ['SEC_OBJECT'] },
      { slug: 'security.personal', title: 'Личная охрана', addModules: [] },
      { slug: 'security.alarms', title: 'Установка сигнализаций', addModules: ['SEC_SYSTEM'] },
      { slug: 'security.cctv', title: 'Видеонаблюдение', addModules: ['SEC_SYSTEM'] },
      { slug: 'security.intercom', title: 'Домофоны', addModules: ['SEC_SYSTEM'] },
      { slug: 'security.access', title: 'СКУД (контроль доступа)', addModules: ['SEC_SYSTEM'] },
      { slug: 'security.fire', title: 'Пожарная сигнализация', addModules: ['SEC_SYSTEM'] },
      { slug: 'security.fire-maint', title: 'Пожарная безопасность (аудит/обслуживание)', addModules: ['SEC_MAINT'] },
      { slug: 'security.panic', title: 'Тревожная кнопка', addModules: ['SEC_RESPONSE'] },
      { slug: 'security.service', title: 'Сервис/обслуживание систем безопасности', addModules: ['SEC_MAINT'] },
    ],
  },

  // 19. Разное
  {
    slug: 'misc',
    title: 'Разное',
    baseModules: [],
    subcategories: [
      { slug: 'misc.psychologist', title: 'Психолог (взрослый/детский)', addModules: ['EDU_GOAL', 'SERVICE_MODE'] },
      { slug: 'misc.coach', title: 'Коуч/карьерный консультант', addModules: ['EDU_GOAL', 'SERVICE_MODE'] },
      { slug: 'misc.translator', title: 'Переводчик (письменный/устный)', addModules: ['SERVICE_MODE'] },
      { slug: 'misc.notary', title: 'Нотариус (справочно/переадрес)', addModules: ['URGENCY'] },
      { slug: 'misc.printing', title: 'Полиграфия (печать как услуга)', addModules: ['URGENCY'] },
      { slug: 'misc.copywriting', title: 'Копирайтинг/редактура', addModules: ['IT_SCOPE'] },
      { slug: 'misc.typing', title: 'Набор текста/оформление документов', addModules: ['URGENCY'] },
      { slug: 'misc.pest', title: 'Дезинсекция/дератизация/дезинфекция', addModules: ['URGENCY'] },
      { slug: 'misc.keys', title: 'Изготовление ключей', addModules: ['URGENCY'] },
      { slug: 'misc.locks', title: 'Вскрытие/ремонт замков', addModules: ['URGENCY'] },
      { slug: 'misc.meters', title: 'Установка/замена счётчиков', addModules: ['URGENCY'] },
      { slug: 'misc.bike-repair', title: 'Ремонт велосипедов/самокатов', addModules: ['URGENCY'] },
    ],
  },
]

// ============================================================
// Хелперы для получения фильтров по slug категории
// ============================================================

/** Найти конфиг категории по slug (родительской) */
export function getCategoryConfig(slug: string): CategoryFilterConfig | undefined {
  return CATEGORIES_CONFIG.find((c) => c.slug === slug)
}

/** Найти конфиг подкатегории по slug */
export function getSubcategoryConfig(slug: string): { category: CategoryFilterConfig; subcategory: SubcategoryFilterConfig } | undefined {
  for (const cat of CATEGORIES_CONFIG) {
    const sub = cat.subcategories.find((s) => s.slug === slug)
    if (sub) return { category: cat, subcategory: sub }
  }
  return undefined
}

/**
 * Собрать эффективные фильтры для slug категории/подкатегории.
 * Формула: GLOBAL + CATEGORY_BASE + SUBCATEGORY_ADD
 * Дедупликация по ID модуля.
 */
export function getEffectiveFilters(categorySlug: string): FilterModule[] {
  const globalIds = [...GLOBAL_MODULE_IDS]

  // Проверяем: это родительская категория или подкатегория?
  const catConfig = getCategoryConfig(categorySlug)
  if (catConfig) {
    // Родительская категория: GLOBAL + BASE
    const allIds = Array.from(new Set([...globalIds, ...catConfig.baseModules]))
    return getFilterModules(allIds)
  }

  const subConfig = getSubcategoryConfig(categorySlug)
  if (subConfig) {
    // Подкатегория: GLOBAL + BASE + ADD
    const allIds = Array.from(new Set([
      ...globalIds,
      ...subConfig.category.baseModules,
      ...subConfig.subcategory.addModules,
    ]))
    return getFilterModules(allIds)
  }

  // Не нашли — возвращаем только глобальные
  return getFilterModules(globalIds)
}

// Каталог модулей фильтров для витрины
// Формула сборки: EFFECTIVE_FILTERS = GLOBAL + CATEGORY_BASE + SUBCATEGORY_ADD

// ============================================================
// Типы
// ============================================================

export type FilterType = 'enum' | 'multi' | 'range' | 'toggle' | 'text'
export type FilterUI = 'select' | 'chips' | 'checkboxes' | 'slider' | 'toggle' | 'text'

export interface FilterModule {
  id: string
  label: string
  type: FilterType
  ui: FilterUI
  options?: string[]
  hint?: string
}

// ============================================================
// A) Глобальные модули (включены на всех страницах каталога)
// ============================================================

export const GLOBAL_MODULE_IDS = [
  'GEO_CITY',
  'GEO_DISTRICT',
  'PRICE_RANGE',
  'AVAILABILITY',
  'URGENCY',
  'RATING_MIN',
  'REVIEWS_ONLY',
  'EXPERIENCE_YEARS',
  'VERIFIED',
  'PAYMENT_METHOD',
] as const

// ============================================================
// B) Каталог всех модулей фильтров
// ============================================================

export const FILTER_MODULES: Record<string, FilterModule> = {
  // --- GEO / Общие ---
  GEO_CITY: {
    id: 'GEO_CITY',
    label: 'Город',
    type: 'enum',
    ui: 'select',
    options: ['Вологда', 'Череповец'],
  },
  GEO_DISTRICT: {
    id: 'GEO_DISTRICT',
    label: 'Район / округ',
    type: 'multi',
    ui: 'chips',
  },
  SERVICE_MODE: {
    id: 'SERVICE_MODE',
    label: 'Формат',
    type: 'multi',
    ui: 'chips',
    options: ['Онлайн', 'Выезд к клиенту', 'У исполнителя', 'В салоне/студии', 'В мастерской/сервисе'],
  },
  PRICE_RANGE: {
    id: 'PRICE_RANGE',
    label: 'Цена',
    type: 'range',
    ui: 'slider',
    hint: '₽ за час или за услугу (по модели исполнителя)',
  },
  AVAILABILITY: {
    id: 'AVAILABILITY',
    label: 'Доступность',
    type: 'multi',
    ui: 'chips',
    options: ['Сегодня', 'Завтра', 'На этой неделе', 'Вечером', 'Выходные'],
  },
  URGENCY: {
    id: 'URGENCY',
    label: 'Срочность',
    type: 'enum',
    ui: 'select',
    options: ['Не срочно', 'Срочно (24ч)', 'Экстренно (2–4ч)'],
  },
  RATING_MIN: {
    id: 'RATING_MIN',
    label: 'Рейтинг от',
    type: 'enum',
    ui: 'select',
    options: ['Любой', '4.0+', '4.5+', '4.8+'],
  },
  REVIEWS_ONLY: {
    id: 'REVIEWS_ONLY',
    label: 'Только с отзывами',
    type: 'toggle',
    ui: 'toggle',
  },
  EXPERIENCE_YEARS: {
    id: 'EXPERIENCE_YEARS',
    label: 'Опыт',
    type: 'enum',
    ui: 'select',
    options: ['Любой', '0–1', '1–3', '3–5', '5+'],
  },
  VERIFIED: {
    id: 'VERIFIED',
    label: 'Проверенный исполнитель',
    type: 'toggle',
    ui: 'toggle',
  },
  PAYMENT_METHOD: {
    id: 'PAYMENT_METHOD',
    label: 'Оплата',
    type: 'multi',
    ui: 'chips',
    options: ['Наличные', 'Перевод', 'Карта', 'Безнал (счёт/акт)'],
  },

  // --- Education ---
  EDU_GRADE_RANGE: {
    id: 'EDU_GRADE_RANGE',
    label: 'Класс / уровень',
    type: 'multi',
    ui: 'chips',
    options: ['Дошкольник', '1–4', '5–6', '7–9 (ОГЭ)', '10–11 (ЕГЭ)', 'ВУЗ', 'Взрослый'],
  },
  EDU_GOAL: {
    id: 'EDU_GOAL',
    label: 'Цель занятий',
    type: 'multi',
    ui: 'checkboxes',
    options: ['Подтянуть оценки', 'Домашка/разбор', 'Подготовка к экзамену', 'Олимпиады', 'Для себя', 'Поступление (ВУЗ/лицей)'],
  },
  EDU_EXAM_TYPE: {
    id: 'EDU_EXAM_TYPE',
    label: 'Экзамен',
    type: 'multi',
    ui: 'chips',
    options: ['ЕГЭ', 'ОГЭ', 'ВПР', 'Вступительные', 'Олимпиады'],
  },
  EDU_GROUP_SIZE: {
    id: 'EDU_GROUP_SIZE',
    label: 'Формат занятий',
    type: 'enum',
    ui: 'select',
    options: ['Индивидуально', 'Мини-группа', 'Группа'],
  },
  EDU_HOMEWORK_CHECK: {
    id: 'EDU_HOMEWORK_CHECK',
    label: 'Проверка ДЗ между занятиями',
    type: 'toggle',
    ui: 'toggle',
  },
  EDU_TEACHING_STYLE: {
    id: 'EDU_TEACHING_STYLE',
    label: 'Подход',
    type: 'multi',
    ui: 'chips',
    options: ['Пошагово с объяснением', 'Максимум практики', 'Диагностика пробелов + план', 'По вариантам/банку заданий'],
  },
  EDU_SUBJECT_TOPICS: {
    id: 'EDU_SUBJECT_TOPICS',
    label: 'Темы / разделы',
    type: 'text',
    ui: 'text',
    hint: 'Свободные теги + быстрые подсказки внутри предмета',
  },
  EDU_LANG_LEVEL: {
    id: 'EDU_LANG_LEVEL',
    label: 'Уровень языка',
    type: 'enum',
    ui: 'select',
    options: ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Разговорный'],
  },
  EDU_LANG_ACCENT: {
    id: 'EDU_LANG_ACCENT',
    label: 'Акцент на',
    type: 'multi',
    ui: 'chips',
    options: ['Грамматика', 'Разговор', 'Произношение', 'Письмо', 'Экзамены'],
  },
  EDU_SPEECH_ISSUE: {
    id: 'EDU_SPEECH_ISSUE',
    label: 'Запрос (логопед)',
    type: 'multi',
    ui: 'chips',
    options: ['Постановка звуков', 'ФФНР/ФНР', 'ОНР', 'Заикание', 'Дислексия/дисграфия', 'Подготовка к школе'],
  },
  EDU_MUSIC_INSTRUMENT: {
    id: 'EDU_MUSIC_INSTRUMENT',
    label: 'Инструмент / вокал',
    type: 'multi',
    ui: 'chips',
    options: ['Вокал', 'Фортепиано', 'Гитара', 'Скрипка', 'Ударные', 'Сольфеджио', 'Другое'],
  },
  EDU_ART_FORMAT: {
    id: 'EDU_ART_FORMAT',
    label: 'Формат творчества',
    type: 'multi',
    ui: 'chips',
    options: ['Академический рисунок', 'Живопись', 'Композиция', 'Скетчинг', 'Цифровая графика'],
  },

  // --- Repair & Construction ---
  RC_OBJECT_TYPE: { id: 'RC_OBJECT_TYPE', label: 'Объект', type: 'multi', ui: 'chips', options: ['Квартира', 'Дом', 'Комната', 'Офис', 'Коммерция'] },
  RC_SCOPE: { id: 'RC_SCOPE', label: 'Объём работ', type: 'enum', ui: 'select', options: ['Мелкий ремонт', 'Частично', 'Под ключ'] },
  RC_AREA_M2: { id: 'RC_AREA_M2', label: 'Площадь (м²)', type: 'range', ui: 'slider' },
  RC_MATERIALS: { id: 'RC_MATERIALS', label: 'Материалы', type: 'enum', ui: 'select', options: ['Мои', 'Исполнителя', 'Смешанно'] },
  RC_ESTIMATE: { id: 'RC_ESTIMATE', label: 'Смета/замер', type: 'multi', ui: 'chips', options: ['Бесплатный замер', 'Бесплатная смета', 'Договор'] },
  RC_WARRANTY: { id: 'RC_WARRANTY', label: 'Гарантия', type: 'toggle', ui: 'toggle' },
  RC_TASK_FINISH: { id: 'RC_TASK_FINISH', label: 'Виды работ (отделка)', type: 'multi', ui: 'checkboxes', options: ['Штукатурка', 'Шпаклёвка', 'Покраска', 'Обои', 'Плитка', 'Полы', 'Потолки', 'ГКЛ/перегородки'] },
  RC_TASK_PLUMB: { id: 'RC_TASK_PLUMB', label: 'Сантехника', type: 'multi', ui: 'checkboxes', options: ['Разводка', 'Смеситель', 'Унитаз', 'Ванна/душ', 'Протечки', 'Счётчики', 'Канализация'] },
  RC_TASK_ELECTRO: { id: 'RC_TASK_ELECTRO', label: 'Электрика', type: 'multi', ui: 'checkboxes', options: ['Разводка', 'Щит', 'Розетки/выключатели', 'Освещение', 'Автоматы/УЗО', 'Поиск неисправности'] },
  RC_TASK_HEAT: { id: 'RC_TASK_HEAT', label: 'Отопление/тёплый пол', type: 'multi', ui: 'checkboxes', options: ['Монтаж', 'Ремонт', 'Коллектор', 'Радиаторы', 'Тёплый пол', 'Пуско-наладка'] },
  RC_TASK_WINDOWS: { id: 'RC_TASK_WINDOWS', label: 'Окна/балконы', type: 'multi', ui: 'chips', options: ['Остекление', 'Регулировка', 'Утепление', 'Балкон под ключ'] },
  RC_TASK_DOORS: { id: 'RC_TASK_DOORS', label: 'Двери', type: 'multi', ui: 'chips', options: ['Установка', 'Доборы/наличники', 'Замки', 'Переустановка'] },
  RC_TASK_ROOF: { id: 'RC_TASK_ROOF', label: 'Кровля/водостоки', type: 'multi', ui: 'chips', options: ['Монтаж', 'Ремонт', 'Водостоки', 'Примыкания'] },
  RC_TASK_FACADE: { id: 'RC_TASK_FACADE', label: 'Фасад/утепление', type: 'multi', ui: 'chips', options: ['Утепление', 'Штукатурный фасад', 'Сайдинг', 'Покраска'] },
  RC_TASK_FENCE: { id: 'RC_TASK_FENCE', label: 'Заборы/ворота', type: 'multi', ui: 'chips', options: ['Забор', 'Ворота', 'Навес', 'Автоматика'] },
  RC_TASK_KITCHEN: { id: 'RC_TASK_KITCHEN', label: 'Кухни (монтаж)', type: 'multi', ui: 'chips', options: ['Сборка', 'Навес', 'Столешница', 'Врезка мойки/варочной'] },

  // --- Repair Tech ---
  TECH_DEVICE_BRAND: { id: 'TECH_DEVICE_BRAND', label: 'Бренд', type: 'text', ui: 'text' },
  TECH_DEVICE_MODEL: { id: 'TECH_DEVICE_MODEL', label: 'Модель', type: 'text', ui: 'text' },
  TECH_SERVICE_PLACE: { id: 'TECH_SERVICE_PLACE', label: 'Где ремонтируем', type: 'multi', ui: 'chips', options: ['Выезд', 'Мастерская', 'Забор/доставка'] },
  TECH_DIAG_FEE: { id: 'TECH_DIAG_FEE', label: 'Диагностика', type: 'enum', ui: 'select', options: ['Бесплатно', 'Платно', 'Зачёт в ремонт'] },
  TECH_PARTS: { id: 'TECH_PARTS', label: 'Запчасти', type: 'enum', ui: 'select', options: ['Оригинал', 'Качественный аналог', 'По согласованию'] },
  TECH_WARRANTY: { id: 'TECH_WARRANTY', label: 'Гарантия на ремонт', type: 'toggle', ui: 'toggle' },
  TECH_TASK_PHONE: { id: 'TECH_TASK_PHONE', label: 'Телефоны/планшеты', type: 'multi', ui: 'chips', options: ['Экран', 'Аккумулятор', 'Разъём', 'Вода', 'Камера', 'ПО'] },
  TECH_TASK_PC: { id: 'TECH_TASK_PC', label: 'ПК/ноутбуки', type: 'multi', ui: 'chips', options: ['Чистка', 'Переустановка ОС', 'SSD/RAM', 'Материнка', 'Питание', 'Данные'] },
  TECH_TASK_TV: { id: 'TECH_TASK_TV', label: 'Телевизоры', type: 'multi', ui: 'chips', options: ['Подсветка', 'Матрица', 'Питание', 'Разъёмы', 'ПО/Smart'] },
  TECH_TASK_APPLIANCE: { id: 'TECH_TASK_APPLIANCE', label: 'Бытовая техника', type: 'multi', ui: 'chips', options: ['Диагностика', 'Замена узла', 'ТЭН/насос', 'Утечки', 'Электроника'] },
  TECH_TASK_INSTALL: { id: 'TECH_TASK_INSTALL', label: 'Установка/подключение', type: 'multi', ui: 'chips', options: ['Встраиваемая', 'Отдельностоящая', 'Подключение воды', 'Подключение слива', 'Пуско-наладка'] },
  TECH_TASK_AC: { id: 'TECH_TASK_AC', label: 'Кондиционеры', type: 'multi', ui: 'chips', options: ['Монтаж', 'Обслуживание', 'Заправка', 'Трасса', 'Дренаж', 'Демонтаж'] },

  // --- Auto ---
  AUTO_MAKE_MODEL: { id: 'AUTO_MAKE_MODEL', label: 'Марка/модель авто', type: 'text', ui: 'text' },
  AUTO_YEAR: { id: 'AUTO_YEAR', label: 'Год', type: 'range', ui: 'slider' },
  AUTO_ENGINE_TYPE: { id: 'AUTO_ENGINE_TYPE', label: 'Двигатель', type: 'multi', ui: 'chips', options: ['Бензин', 'Дизель', 'Гибрид', 'Электро'] },
  AUTO_SERVICE_PLACE: { id: 'AUTO_SERVICE_PLACE', label: 'Формат', type: 'multi', ui: 'chips', options: ['Сервис', 'Выезд (если возможно)'] },
  AUTO_PARTS_POLICY: { id: 'AUTO_PARTS_POLICY', label: 'Запчасти клиента', type: 'enum', ui: 'select', options: ['Можно', 'Нельзя', 'По согласованию'] },
  AUTO_TASK_TO: { id: 'AUTO_TASK_TO', label: 'ТО', type: 'multi', ui: 'chips', options: ['Масло/фильтры', 'Свечи', 'Жидкости', 'Регламент'] },
  AUTO_TASK_DIAG: { id: 'AUTO_TASK_DIAG', label: 'Диагностика', type: 'multi', ui: 'chips', options: ['Компьютерная', 'Перед покупкой', 'По симптомам'] },
  AUTO_TASK_SUSP: { id: 'AUTO_TASK_SUSP', label: 'Ходовая', type: 'multi', ui: 'chips', options: ['Подвеска', 'Рулевое', 'Ступицы', 'Амортизаторы'] },
  AUTO_TASK_BRAKES: { id: 'AUTO_TASK_BRAKES', label: 'Тормоза', type: 'multi', ui: 'chips', options: ['Колодки', 'Диски', 'Суппорта', 'Тормозная жидкость'] },
  AUTO_TASK_ENGINE: { id: 'AUTO_TASK_ENGINE', label: 'Двигатель', type: 'multi', ui: 'chips', options: ['Обслуживание', 'Ремонт', 'ГРМ', 'Охлаждение'] },
  AUTO_TASK_GEAR: { id: 'AUTO_TASK_GEAR', label: 'КПП', type: 'multi', ui: 'chips', options: ['МКПП', 'АКПП', 'Вариатор', 'Сцепление'] },
  AUTO_TASK_ELECTRO: { id: 'AUTO_TASK_ELECTRO', label: 'Автоэлектрика', type: 'multi', ui: 'chips', options: ['Проводка', 'Диагностика', 'Стартер/генератор', 'Устранение ошибок'] },
  AUTO_TASK_AC: { id: 'AUTO_TASK_AC', label: 'Автокондиционер', type: 'multi', ui: 'chips', options: ['Заправка', 'Поиск утечки', 'Компрессор', 'Радиатор/трубки'] },
  AUTO_TASK_BODY: { id: 'AUTO_TASK_BODY', label: 'Кузов/ЛКП', type: 'multi', ui: 'chips', options: ['Кузовной ремонт', 'Покраска', 'Полировка', 'Антикор'] },
  AUTO_TASK_TIRE: { id: 'AUTO_TASK_TIRE', label: 'Шины', type: 'multi', ui: 'chips', options: ['Шиномонтаж', 'Балансировка', 'Хранение шин'] },
  AUTO_TASK_GLASS: { id: 'AUTO_TASK_GLASS', label: 'Стёкла', type: 'multi', ui: 'chips', options: ['Замена', 'Ремонт сколов', 'Тонировка (если есть)'] },
  AUTO_TASK_EXTRA: { id: 'AUTO_TASK_EXTRA', label: 'Доп.оборудование', type: 'multi', ui: 'chips', options: ['Сигнализация', 'Парктроник', 'Регистратор', 'Магнитола'] },

  // --- IT / Digital ---
  IT_SCOPE: { id: 'IT_SCOPE', label: 'Тип задачи', type: 'multi', ui: 'chips', options: ['Разово', 'Проект', 'Поддержка', 'Консалтинг'] },
  IT_REMOTE: { id: 'IT_REMOTE', label: 'Формат', type: 'multi', ui: 'chips', options: ['Удалённо', 'Выезд'] },
  IT_PLATFORM: { id: 'IT_PLATFORM', label: 'Платформа', type: 'multi', ui: 'chips', options: ['WordPress', '1C-Битрикс', 'Tilda', 'Shopify', 'Custom', 'Другое'] },
  IT_STACK: { id: 'IT_STACK', label: 'Стек', type: 'text', ui: 'text', hint: 'Напр.: PHP, JS, Python, React, SQL' },
  IT_DELIVERABLES: { id: 'IT_DELIVERABLES', label: 'Результат', type: 'multi', ui: 'chips', options: ['Лендинг', 'Сайт', 'Магазин', 'Интеграция', 'Автоматизация', 'Бот'] },
  IT_SLA: { id: 'IT_SLA', label: 'Срок реакции (поддержка)', type: 'enum', ui: 'select', options: ['Без SLA', '24ч', '8ч', '2ч'] },
  IT_MARKETING_CHANNELS: { id: 'IT_MARKETING_CHANNELS', label: 'Каналы', type: 'multi', ui: 'chips', options: ['Я.Директ', 'VK Ads', 'Google Ads', 'SEO', 'SMM', 'Контент'] },
  IT_1C_MODULES: { id: 'IT_1C_MODULES', label: '1С (что нужно)', type: 'multi', ui: 'chips', options: ['Обмен', 'Права', 'Отчёты', 'Печатные формы', 'Обновления'] },

  // --- Sports/Fitness ---
  FIT_GOAL: { id: 'FIT_GOAL', label: 'Цель', type: 'multi', ui: 'chips', options: ['Похудение', 'Набор массы', 'Сила', 'Выносливость', 'Осанка', 'Реабилитация'] },
  FIT_LEVEL: { id: 'FIT_LEVEL', label: 'Уровень', type: 'enum', ui: 'select', options: ['Новичок', 'Средний', 'Продвинутый'] },
  FIT_LIMITS: { id: 'FIT_LIMITS', label: 'Ограничения', type: 'multi', ui: 'chips', options: ['Спина', 'Колени', 'Суставы', 'После травмы', 'Беременность', 'Без ограничений'] },
  FIT_PLACE: { id: 'FIT_PLACE', label: 'Где тренируемся', type: 'multi', ui: 'chips', options: ['Зал', 'Дом', 'Улица', 'Бассейн', 'Студия'] },
  FIT_DISCIPLINE: { id: 'FIT_DISCIPLINE', label: 'Дисциплина', type: 'text', ui: 'text' },

  // --- Beauty/Health ---
  BEAUTY_PLACE: { id: 'BEAUTY_PLACE', label: 'Где', type: 'multi', ui: 'chips', options: ['Салон', 'На дому у мастера', 'Выезд к клиенту'] },
  BEAUTY_STYLE: { id: 'BEAUTY_STYLE', label: 'Стиль', type: 'multi', ui: 'chips', options: ['Классика', 'Нюд', 'Ярко', 'Креатив', 'По фото-примеру'] },
  BEAUTY_MATERIALS: { id: 'BEAUTY_MATERIALS', label: 'Материалы/бренды', type: 'text', ui: 'text' },
  BEAUTY_HAIR_TASKS: { id: 'BEAUTY_HAIR_TASKS', label: 'Волосы', type: 'multi', ui: 'chips', options: ['Стрижка', 'Окрашивание', 'Укладка', 'Прически', 'Уход'] },
  BEAUTY_NAIL_TASKS: { id: 'BEAUTY_NAIL_TASKS', label: 'Ногти', type: 'multi', ui: 'chips', options: ['Маникюр', 'Педикюр', 'Покрытие', 'Наращивание', 'Дизайн'] },
  BEAUTY_COSMO_TASKS: { id: 'BEAUTY_COSMO_TASKS', label: 'Косметология', type: 'multi', ui: 'chips', options: ['Уход', 'Чистка', 'Пилинг', 'Инъекции (если допускаешь)', 'Аппаратная'] },
  BEAUTY_BROW_LASH: { id: 'BEAUTY_BROW_LASH', label: 'Брови/ресницы', type: 'multi', ui: 'chips', options: ['Коррекция', 'Окрашивание', 'Ламинирование', 'Наращивание'] },
  BEAUTY_BODY: { id: 'BEAUTY_BODY', label: 'Тело', type: 'multi', ui: 'chips', options: ['Массаж', 'Лечебный', 'Спортивный', 'Эпиляция/депиляция'] },
  BEAUTY_TATTOO: { id: 'BEAUTY_TATTOO', label: 'Тату/перманент', type: 'multi', ui: 'chips', options: ['Тату', 'Пирсинг', 'Перманент', 'Коррекция'] },

  // --- Transport/Delivery ---
  TR_TYPE: { id: 'TR_TYPE', label: 'Тип перевозки', type: 'multi', ui: 'chips', options: ['По городу', 'Межгород', 'Переезд', 'Курьер', 'Эвакуатор'] },
  TR_VEHICLE: { id: 'TR_VEHICLE', label: 'Транспорт', type: 'multi', ui: 'chips', options: ['Легковая', 'Газель', 'Фургон', 'Грузовик', 'Манипулятор (если нужно)', 'Эвакуатор'] },
  TR_WEIGHT: { id: 'TR_WEIGHT', label: 'Вес (кг)', type: 'range', ui: 'slider' },
  TR_VOLUME: { id: 'TR_VOLUME', label: 'Объём (м³)', type: 'range', ui: 'slider' },
  TR_LOADERS: { id: 'TR_LOADERS', label: 'Грузчики', type: 'enum', ui: 'select', options: ['Не нужны', '1', '2', '3+'] },
  TR_EXTRA: { id: 'TR_EXTRA', label: 'Доп.услуги', type: 'multi', ui: 'chips', options: ['Сборка/разборка', 'Упаковка', 'Подъём на этаж', 'Страхование'] },
  TR_PETS: { id: 'TR_PETS', label: 'Перевозка животных', type: 'multi', ui: 'chips', options: ['Кошка', 'Собака', 'Переноска есть', 'Нужна переноска'] },

  // --- Home/Lifestyle ---
  HOME_AREA: { id: 'HOME_AREA', label: 'Площадь (м²)', type: 'range', ui: 'slider' },
  HOME_CLEAN_TYPE: { id: 'HOME_CLEAN_TYPE', label: 'Тип уборки', type: 'multi', ui: 'chips', options: ['Поддерживающая', 'Генеральная', 'После ремонта', 'Окна', 'Офис'] },
  HOME_FREQUENCY: { id: 'HOME_FREQUENCY', label: 'Регулярность', type: 'enum', ui: 'select', options: ['Разово', 'Еженедельно', '2 раза/нед', 'Ежедневно'] },
  HOME_ECO: { id: 'HOME_ECO', label: 'Эко-средства', type: 'toggle', ui: 'toggle' },
  HOME_PETS: { id: 'HOME_PETS', label: 'Есть животные', type: 'toggle', ui: 'toggle' },
  HOME_CARE: { id: 'HOME_CARE', label: 'Уход', type: 'multi', ui: 'chips', options: ['Няня', 'Сиделка', 'Домработница', 'Готовка', 'Поручения'] },
  HOME_GARDEN: { id: 'HOME_GARDEN', label: 'Участок/территория', type: 'multi', ui: 'chips', options: ['Сад', 'Снег', 'Листья', 'Газон'] },

  // --- Legal/Financial ---
  LEGAL_FIELD: { id: 'LEGAL_FIELD', label: 'Направление', type: 'multi', ui: 'chips', options: ['Семейное', 'Наследство', 'Трудовое', 'ЗПП', 'Авто/ДТП', 'Арбитраж', 'Регистрация бизнеса', 'Долги/банкротство'] },
  LEGAL_STAGE: { id: 'LEGAL_STAGE', label: 'Что нужно', type: 'multi', ui: 'chips', options: ['Консультация', 'Документы', 'Суд', 'Представительство'] },
  LEGAL_DOCS: { id: 'LEGAL_DOCS', label: 'Документы', type: 'multi', ui: 'chips', options: ['Иск', 'Претензия', 'Договор', 'Жалоба', 'Заявление'] },
  FIN_TYPE: { id: 'FIN_TYPE', label: 'Финансы/учёт', type: 'multi', ui: 'chips', options: ['Бухгалтерия', 'Налоги', 'Кадры', 'Страхование', 'Риелтор', 'Проверка недвижимости'] },

  // --- Designers ---
  DES_DIRECTION: { id: 'DES_DIRECTION', label: 'Направление', type: 'multi', ui: 'chips', options: ['Интерьер', 'Графика', 'Брендинг', 'Веб/UX', 'Иллюстрации', 'Презентации'] },
  DES_STYLE: { id: 'DES_STYLE', label: 'Стиль', type: 'text', ui: 'text', hint: 'Минимализм, премиум, ярко, строго и т.д.' },
  DES_FILES: { id: 'DES_FILES', label: 'Исходники', type: 'toggle', ui: 'toggle' },
  DES_REVISIONS: { id: 'DES_REVISIONS', label: 'Правки', type: 'enum', ui: 'select', options: ['1 круг', '2 круга', '3+', 'По договорённости'] },
  DES_FORMATS: { id: 'DES_FORMATS', label: 'Форматы', type: 'multi', ui: 'chips', options: ['Figma', 'PSD', 'AI', 'PDF', 'PNG/JPG'] },

  // --- Photo/Video/Audio ---
  PV_TYPE: { id: 'PV_TYPE', label: 'Тип съёмки', type: 'multi', ui: 'chips', options: ['Фото', 'Видео', 'Аудио', 'Дрон', 'Монтаж', 'Озвучка'] },
  PV_EVENT: { id: 'PV_EVENT', label: 'Формат', type: 'multi', ui: 'chips', options: ['Свадьба', 'Семья/дети', 'Репортаж', 'Предметка', 'Бизнес', 'Документы'] },
  PV_DURATION: { id: 'PV_DURATION', label: 'Длительность', type: 'enum', ui: 'select', options: ['до 1ч', '1–3ч', '3–6ч', 'весь день'] },
  PV_DELIVERABLES: { id: 'PV_DELIVERABLES', label: 'Результат', type: 'multi', ui: 'chips', options: ['Исходники', 'Ретушь', 'Готовый ролик', 'Короткие клипы', 'Цветокор'] },

  // --- Events ---
  EV_TYPE: { id: 'EV_TYPE', label: 'Тип мероприятия', type: 'multi', ui: 'chips', options: ['День рождения', 'Свадьба', 'Корпоратив', 'Детский праздник', 'Другое'] },
  EV_GUESTS: { id: 'EV_GUESTS', label: 'Гостей', type: 'enum', ui: 'select', options: ['до 10', '10–30', '30–80', '80+'] },
  EV_BUDGET: { id: 'EV_BUDGET', label: 'Бюджет', type: 'range', ui: 'slider' },
  EV_SERVICES: { id: 'EV_SERVICES', label: 'Нужно', type: 'multi', ui: 'chips', options: ['Ведущий', 'Декор', 'Кейтеринг', 'Торт', 'Координатор', 'Персонал'] },

  // --- Artists ---
  ART_TYPE: { id: 'ART_TYPE', label: 'Формат', type: 'multi', ui: 'chips', options: ['DJ', 'Кавер', 'Вокал', 'Музыкант', 'Танцы', 'Фокусник', 'Стендап', 'Аниматоры'] },
  ART_GENRE: { id: 'ART_GENRE', label: 'Жанр/стиль', type: 'text', ui: 'text' },
  ART_DURATION: { id: 'ART_DURATION', label: 'Сет', type: 'enum', ui: 'select', options: ['15–30 мин', '30–60 мин', '1–2 часа', 'Весь вечер'] },
  ART_EQUIP: { id: 'ART_EQUIP', label: 'Оборудование', type: 'multi', ui: 'chips', options: ['Своя аппаратура', 'Нужна аппаратура', 'Сцена/свет'] },

  // --- Rental ---
  RENT_ITEM: { id: 'RENT_ITEM', label: 'Что арендуем', type: 'text', ui: 'text' },
  RENT_DURATION: { id: 'RENT_DURATION', label: 'Срок', type: 'enum', ui: 'select', options: ['1 день', '2–3 дня', 'Неделя', 'Месяц+'] },
  RENT_DELIVERY: { id: 'RENT_DELIVERY', label: 'Доставка', type: 'toggle', ui: 'toggle' },
  RENT_DEPOSIT: { id: 'RENT_DEPOSIT', label: 'Залог', type: 'enum', ui: 'select', options: ['Без залога', 'Есть залог', 'По договору'] },

  // --- Creativity/Hobby ---
  CR_TYPE: { id: 'CR_TYPE', label: 'Тип изделия', type: 'text', ui: 'text' },
  CR_MATERIAL: { id: 'CR_MATERIAL', label: 'Материал', type: 'text', ui: 'text' },
  CR_SIZE: { id: 'CR_SIZE', label: 'Размер/формат', type: 'text', ui: 'text' },
  CR_PERSONAL: { id: 'CR_PERSONAL', label: 'Персонализация', type: 'toggle', ui: 'toggle' },
  CR_DEADLINE: { id: 'CR_DEADLINE', label: 'Срок изготовления', type: 'enum', ui: 'select', options: ['Не срочно', 'До недели', '1–2 недели', 'Срочно (1–3 дня)'] },

  // --- Animals ---
  AN_TYPE: { id: 'AN_TYPE', label: 'Питомец', type: 'multi', ui: 'chips', options: ['Кошка', 'Собака', 'Другое'] },
  AN_WEIGHT: { id: 'AN_WEIGHT', label: 'Вес', type: 'enum', ui: 'select', options: ['до 5кг', '5–15кг', '15–30кг', '30+ кг'] },
  AN_PLACE: { id: 'AN_PLACE', label: 'Где', type: 'multi', ui: 'chips', options: ['Клиника', 'Выезд', 'Передержка у исполнителя', 'У клиента'] },
  AN_TASK: { id: 'AN_TASK', label: 'Услуга', type: 'multi', ui: 'chips', options: ['Ветеринар', 'Груминг', 'Выгул', 'Передержка', 'Кинолог'] },

  // --- Security ---
  SEC_OBJECT: { id: 'SEC_OBJECT', label: 'Объект', type: 'multi', ui: 'chips', options: ['Квартира', 'Дом', 'Офис', 'Склад', 'Мероприятие'] },
  SEC_SYSTEM: { id: 'SEC_SYSTEM', label: 'Система', type: 'multi', ui: 'chips', options: ['Сигнализация', 'Видеонаблюдение', 'Домофон', 'СКУД', 'Пожарка'] },
  SEC_RESPONSE: { id: 'SEC_RESPONSE', label: 'Реагирование', type: 'enum', ui: 'select', options: ['Не нужно', 'ГБР/пульт', 'Тревожная кнопка'] },
  SEC_MAINT: { id: 'SEC_MAINT', label: 'Обслуживание', type: 'toggle', ui: 'toggle' },
}

// ============================================================
// Хелпер: получить модуль по ID
// ============================================================

export function getFilterModule(id: string): FilterModule | undefined {
  return FILTER_MODULES[id]
}

export function getFilterModules(ids: string[]): FilterModule[] {
  return ids
    .map((id) => FILTER_MODULES[id])
    .filter((m): m is FilterModule => m !== undefined)
}

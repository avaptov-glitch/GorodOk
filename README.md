# ГородОк — Маркетплейс услуг

Веб-приложение для поиска исполнителей услуг в вашем городе: репетиторы, сантехники, тренеры, мастера красоты и сотни других специалистов.

## Технологический стек

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes + Server Actions
- **БД:** PostgreSQL + Prisma ORM
- **Аутентификация:** NextAuth.js
- **Реалтайм (чат):** Socket.io
- **Деплой:** Docker + Docker Compose

## Запуск проекта

```bash
# Поднять PostgreSQL
docker-compose up -d

# Применить схему БД
npm run db:push

# Засеять начальные данные (категории)
npm run db:seed

# Запустить сервер разработки
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните значения:

```bash
cp .env.example .env
```

## Полезные команды

```bash
npm run db:push       # применить схему Prisma
npm run db:seed       # засеять категории
npm run db:studio     # веб-интерфейс для БД
npm run db:reset      # сбросить и пересоздать БД
npm run build         # проверка сборки
```

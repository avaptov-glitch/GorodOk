#!/bin/bash
set -e

# ===========================================
# ГородОк — Скрипт обновления
# Запускать на сервере после загрузки новых файлов
# ===========================================

APP_DIR="/opt/gorodok"

echo "========================================="
echo "  ГородОк — Обновление"
echo "========================================="

cd "$APP_DIR"

# --- 1. Пересборка образа ---
echo ""
echo "[1/4] Пересборка Docker образа..."
docker compose -f docker-compose.prod.yml build app

# --- 2. Применение миграций БД (через временный контейнер) ---
echo ""
echo "[2/4] Применение изменений схемы БД..."
source .env 2>/dev/null || true
docker run --rm --network gorodok_internal \
  -e DATABASE_URL="$DATABASE_URL" \
  -v "$APP_DIR/prisma:/app/prisma" \
  -v "$APP_DIR/prisma.config.ts:/app/prisma.config.ts" \
  -w /app \
  node:20-alpine \
  sh -c 'npm install prisma@7.4.0 dotenv --save-dev 2>/dev/null && npx prisma db push' \
  || echo "WARN: prisma db push failed (schema may already be up to date)"

# --- 3. Перезапуск приложения ---
echo ""
echo "[3/4] Перезапуск контейнеров..."
docker compose -f docker-compose.prod.yml up -d app

# --- 4. Очистка старых образов ---
echo ""
echo "[4/4] Очистка неиспользуемых образов..."
docker image prune -f

echo ""
echo "========================================="
echo "  Обновление завершено!"
echo "========================================="
echo ""
echo "  Проверка: curl -I https://xn--c1acsoabl.online"
echo "  Логи:     docker compose -f docker-compose.prod.yml logs -f app"
echo ""

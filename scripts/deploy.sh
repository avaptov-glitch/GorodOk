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
echo "[1/3] Пересборка Docker образа..."
docker compose -f docker-compose.prod.yml build app

# --- 2. Перезапуск приложения ---
echo ""
echo "[2/3] Перезапуск контейнеров..."
docker compose -f docker-compose.prod.yml up -d app

# --- 3. Применение миграций (если есть изменения схемы) ---
echo ""
echo "[3/3] Применение изменений схемы БД..."
sleep 5
docker compose -f docker-compose.prod.yml exec app npx prisma db push

# --- Очистка старых образов ---
echo ""
echo "Очистка неиспользуемых образов..."
docker image prune -f

echo ""
echo "========================================="
echo "  Обновление завершено!"
echo "========================================="
echo ""
echo "  Проверка: curl -I https://xn--e1afkbacfh5d.online"
echo "  Логи:     docker compose -f docker-compose.prod.yml logs -f app"
echo ""

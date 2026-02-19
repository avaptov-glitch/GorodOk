#!/bin/bash
set -e

# ===========================================
# ГородОк — Первоначальная настройка сервера
# Запускать от root на чистом Ubuntu 22.04 VPS
# ===========================================

DOMAIN="xn--e1afkbacfh5d.online"
APP_DIR="/opt/gorodok"

echo "========================================="
echo "  ГородОк — Настройка VPS"
echo "  Домен: городок.online ($DOMAIN)"
echo "========================================="

# --- 1. Обновление системы ---
echo ""
echo "[1/7] Обновление системы..."
apt update && apt upgrade -y

# --- 2. Установка Docker ---
echo ""
echo "[2/7] Установка Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "Docker установлен: $(docker --version)"
else
    echo "Docker уже установлен: $(docker --version)"
fi

# --- 3. Установка Docker Compose ---
echo ""
echo "[3/7] Проверка Docker Compose..."
if docker compose version &> /dev/null; then
    echo "Docker Compose доступен: $(docker compose version)"
else
    echo "ОШИБКА: Docker Compose не найден. Установите Docker Compose v2."
    exit 1
fi

# --- 4. Создание директории проекта ---
echo ""
echo "[4/7] Подготовка директории проекта..."
mkdir -p "$APP_DIR"
echo "Проект будет в: $APP_DIR"
echo ""
echo "  Скопируйте файлы проекта в $APP_DIR"
echo "  Например через scp:"
echo "    scp -r ./marketplace/* root@<IP_СЕРВЕРА>:$APP_DIR/"
echo ""
read -p "Файлы проекта уже скопированы в $APP_DIR? (y/n): " files_ready
if [ "$files_ready" != "y" ]; then
    echo "Скопируйте файлы и запустите скрипт снова."
    exit 0
fi

# --- 5. Настройка .env ---
echo ""
echo "[5/7] Настройка переменных окружения..."
cd "$APP_DIR"

if [ ! -f .env ]; then
    if [ -f .env.production.example ]; then
        cp .env.production.example .env
        # Генерируем безопасный NEXTAUTH_SECRET
        SECRET=$(openssl rand -base64 32)
        sed -i "s|CHANGE_ME_GENERATE_WITH_OPENSSL|$SECRET|g" .env
        echo ""
        echo "  .env создан из шаблона."
        echo "  NEXTAUTH_SECRET сгенерирован автоматически."
        echo ""
        echo "  ВАЖНО: Отредактируйте .env и замените пароль БД!"
        echo "    nano $APP_DIR/.env"
        echo ""
        read -p "Вы отредактировали .env? (y/n): " env_ready
        if [ "$env_ready" != "y" ]; then
            echo "Отредактируйте .env и запустите скрипт снова."
            exit 0
        fi
    else
        echo "ОШИБКА: .env.production.example не найден!"
        exit 1
    fi
else
    echo ".env уже существует, пропускаем."
fi

# --- 6. Получение SSL сертификата ---
echo ""
echo "[6/7] Получение SSL сертификата..."

# Сначала запускаем nginx с временным конфигом для ACME challenge
# Создаём временный nginx.conf без SSL
mkdir -p nginx
cat > nginx/nginx-temp.conf << 'NGINX_TEMP'
worker_processes auto;
events { worker_connections 1024; }
http {
    server {
        listen 80;
        server_name _;
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        location / {
            return 200 'OK';
            add_header Content-Type text/plain;
        }
    }
}
NGINX_TEMP

# Запускаем временный nginx для получения сертификата
docker compose -f docker-compose.prod.yml run -d --name gorodok_nginx_temp \
    -v "$(pwd)/nginx/nginx-temp.conf:/etc/nginx/nginx.conf:ro" \
    -v gorodok_certbot_www:/var/www/certbot \
    -p 80:80 \
    nginx:alpine nginx

# Получаем сертификат
docker compose -f docker-compose.prod.yml run --rm certbot \
    certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email "admin@$DOMAIN" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN"

# Останавливаем временный nginx
docker stop gorodok_nginx_temp 2>/dev/null || true
docker rm gorodok_nginx_temp 2>/dev/null || true

# Удаляем временный конфиг
rm -f nginx/nginx-temp.conf

echo "SSL сертификат получен!"

# --- 7. Запуск всех сервисов ---
echo ""
echo "[7/7] Запуск приложения..."

# Собираем и запускаем
docker compose -f docker-compose.prod.yml up -d --build

# Ждём пока PostgreSQL поднимется
echo "Ожидание запуска PostgreSQL..."
sleep 10

# Применяем схему БД
echo "Применение схемы базы данных..."
docker compose -f docker-compose.prod.yml exec app npx prisma db push

# Заполняем начальные данные
echo "Заполнение начальных данных..."
docker compose -f docker-compose.prod.yml exec app npx prisma db seed

echo ""
echo "========================================="
echo "  ГородОк успешно запущен!"
echo "========================================="
echo ""
echo "  Сайт: https://городок.online"
echo "  (техн: https://$DOMAIN)"
echo ""
echo "  Проверка:"
echo "    curl -I https://$DOMAIN"
echo ""
echo "  Логи:"
echo "    docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "  Управление:"
echo "    docker compose -f docker-compose.prod.yml ps"
echo "    docker compose -f docker-compose.prod.yml restart"
echo "    docker compose -f docker-compose.prod.yml down"
echo ""

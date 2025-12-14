#!/bin/bash

# Script de despliegue para Google Cloud Platform (Ubuntu 24.04 LTS con Nginx)
# Autor: MOVINGENIA S.A.C.S.
# Fecha: $(date +%Y-%m-%d)

set -e  # Salir si hay algún error

# Configuración
APP_NAME="alertas-web"
DEPLOY_USER="www-data"
WEB_ROOT="/var/www/${APP_NAME}"
NGINX_CONFIG="/etc/nginx/sites-available/${APP_NAME}"
BACKUP_DIR="/var/backups/${APP_NAME}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Despliegue GCP - Alertas Web${NC}"
echo -e "${BLUE}   MOVINGENIA S.A.C.S.${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Verificar que se ejecuta como root o con sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Error: Este script debe ejecutarse como root o con sudo${NC}"
    exit 1
fi

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json no encontrado. Ejecuta este script desde la raíz del proyecto.${NC}"
    exit 1
fi

echo -e "${YELLOW}1. Verificando sistema...${NC}"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Nginx version: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo "Node version: $(node -v)"
echo ""

# Crear backup del despliegue anterior si existe
if [ -d "$WEB_ROOT" ]; then
    echo -e "${YELLOW}2. Creando backup del despliegue anterior...${NC}"
    mkdir -p "$BACKUP_DIR"
    tar -czf "${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz" -C "$WEB_ROOT" . 2>/dev/null || true
    echo -e "${GREEN}✓ Backup creado: ${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz${NC}"
else
    echo -e "${YELLOW}2. No hay despliegue anterior, omitiendo backup...${NC}"
fi
echo ""

# Instalar dependencias y compilar
echo -e "${YELLOW}3. Instalando dependencias y compilando...${NC}"
npm ci --production=false
npm run build
echo -e "${GREEN}✓ Compilación completada${NC}"
echo ""

# Crear directorio web si no existe
echo -e "${YELLOW}4. Preparando directorio web...${NC}"
mkdir -p "$WEB_ROOT"

# Limpiar directorio web anterior
rm -rf ${WEB_ROOT}/*

# Copiar archivos compilados
cp -r dist/* "$WEB_ROOT/"
chown -R $DEPLOY_USER:$DEPLOY_USER "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"
echo -e "${GREEN}✓ Archivos desplegados en $WEB_ROOT${NC}"
echo ""

# Configurar Nginx
echo -e "${YELLOW}5. Configurando Nginx...${NC}"

# Crear configuración de Nginx
cat > "$NGINX_CONFIG" << 'NGINX_EOF'
server {
    listen 80;
    listen [::]:80;
    server_name _;  # Cambiar por tu dominio en producción
    
    root /var/www/alertas-web;
    index index.html;

    # Logs
    access_log /var/log/nginx/alertas-web-access.log;
    error_log /var/log/nginx/alertas-web-error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript 
               image/svg+xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location ~* \.(css|js|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # API Proxy (ajustar según tu backend)
    location /api/ {
        proxy_pass http://192.168.18.230:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # SPA fallback - todas las rutas van a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Denegar acceso a archivos ocultos
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
NGINX_EOF

# Habilitar sitio si no está habilitado
if [ ! -L "/etc/nginx/sites-enabled/${APP_NAME}" ]; then
    ln -s "$NGINX_CONFIG" "/etc/nginx/sites-enabled/${APP_NAME}"
    echo -e "${GREEN}✓ Sitio habilitado en Nginx${NC}"
else
    echo -e "${GREEN}✓ Sitio ya estaba habilitado${NC}"
fi
echo ""

# Probar configuración de Nginx
echo -e "${YELLOW}6. Verificando configuración de Nginx...${NC}"
if nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✓ Configuración de Nginx válida${NC}"
else
    echo -e "${RED}Error: Configuración de Nginx inválida${NC}"
    nginx -t
    exit 1
fi
echo ""

# Recargar Nginx
echo -e "${YELLOW}7. Recargando Nginx...${NC}"
systemctl reload nginx
echo -e "${GREEN}✓ Nginx recargado${NC}"
echo ""

# Verificar estado de Nginx
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx está activo y corriendo${NC}"
else
    echo -e "${RED}Error: Nginx no está corriendo${NC}"
    systemctl status nginx
    exit 1
fi
echo ""

# Limpiar builds antiguos (mantener últimos 5 backups)
echo -e "${YELLOW}8. Limpiando backups antiguos...${NC}"
if [ -d "$BACKUP_DIR" ]; then
    cd "$BACKUP_DIR"
    ls -t backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
    BACKUP_COUNT=$(ls -1 backup_*.tar.gz 2>/dev/null | wc -l)
    echo -e "${GREEN}✓ Backups mantenidos: $BACKUP_COUNT${NC}"
fi
echo ""

# Información del servidor
SERVER_IP=$(hostname -I | awk '{print $1}')

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   ✓ Despliegue completado exitosamente${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "Información del despliegue:"
echo -e "  ${BLUE}Aplicación:${NC} $APP_NAME"
echo -e "  ${BLUE}Directorio:${NC} $WEB_ROOT"
echo -e "  ${BLUE}Nginx Config:${NC} $NGINX_CONFIG"
echo -e "  ${BLUE}Backup:${NC} ${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz"
echo ""
echo -e "Acceso:"
echo -e "  ${BLUE}IP Local:${NC} http://${SERVER_IP}"
echo -e "  ${BLUE}Health Check:${NC} http://${SERVER_IP}/health"
echo ""
echo -e "${YELLOW}Notas:${NC}"
echo -e "  - Configura tu dominio en ${NGINX_CONFIG} (server_name)"
echo -e "  - Ajusta la URL del backend API si es necesario"
echo -e "  - Para SSL/HTTPS, instala certbot: sudo apt install certbot python3-certbot-nginx"
echo -e "  - Comando SSL: sudo certbot --nginx -d tudominio.com"
echo ""

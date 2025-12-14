#!/bin/bash

# Script de despliegue para producción
# Autor: MOVINGENIA S.A.C.S.
# Fecha: $(date +%Y-%m-%d)

set -e  # Salir si hay algún error

echo "================================================"
echo "   Despliegue de Alertas Web - Producción"
echo "================================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json no encontrado. Ejecuta este script desde la raíz del proyecto.${NC}"
    exit 1
fi

# Verificar Node.js instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js no está instalado.${NC}"
    exit 1
fi

echo -e "${YELLOW}1. Verificando versiones...${NC}"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo ""

# Instalar dependencias
echo -e "${YELLOW}2. Instalando dependencias...${NC}"
npm ci --production=false
echo -e "${GREEN}✓ Dependencias instaladas${NC}"
echo ""

# Limpiar build anterior
echo -e "${YELLOW}3. Limpiando build anterior...${NC}"
rm -rf dist
echo -e "${GREEN}✓ Build anterior eliminado${NC}"
echo ""

# Ejecutar build de producción
echo -e "${YELLOW}4. Compilando aplicación para producción...${NC}"
npm run build
echo -e "${GREEN}✓ Compilación exitosa${NC}"
echo ""

# Verificar que dist existe
if [ ! -d "dist" ]; then
    echo -e "${RED}Error: El directorio dist no fue creado.${NC}"
    exit 1
fi

echo -e "${YELLOW}5. Verificando archivos generados...${NC}"
ls -lh dist/
echo ""

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   ✓ Despliegue completado exitosamente${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "El contenido de la carpeta 'dist' está listo para ser desplegado."
echo ""
echo "Opciones de despliegue:"
echo "  - Copiar 'dist' a tu servidor web (nginx, apache)"
echo "  - Desplegar en servicios cloud (Vercel, Netlify, AWS S3)"
echo "  - Usar docker con el Dockerfile incluido"
echo ""

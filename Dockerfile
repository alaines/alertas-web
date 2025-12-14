# Multi-stage build para optimizar tamaño de imagen
FROM node:20-alpine AS builder

# Instalar dependencias de compilación
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar aplicación
RUN npm run build

# Etapa de producción - imagen más pequeña
FROM nginx:alpine

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados desde builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Configurar nginx para ejecutarse en primer plano
CMD ["nginx", "-g", "daemon off;"]

# Guía de Despliegue en Producción - Alertas Web

## Requisitos Previos

- Node.js 20+ y npm
- Docker (opcional)
- Servidor web (nginx/apache) o servicio cloud

## Opción 1: Despliegue Manual

### Paso 1: Compilar la aplicación

```bash
# Dar permisos de ejecución al script
chmod +x deploy.sh

# Ejecutar script de despliegue
./deploy.sh
```

### Paso 2: Configurar servidor web

#### Nginx

```bash
# Copiar archivos a directorio web
sudo cp -r dist/* /var/www/html/

# Copiar configuración de nginx
sudo cp nginx.conf /etc/nginx/sites-available/alertas-web
sudo ln -s /etc/nginx/sites-available/alertas-web /etc/nginx/sites-enabled/

# Reiniciar nginx
sudo systemctl restart nginx
```

#### Apache

```bash
# Copiar archivos
sudo cp -r dist/* /var/www/html/

# Habilitar mod_rewrite para SPA
sudo a2enmod rewrite
sudo systemctl restart apache2
```

## Opción 2: Despliegue con Docker

### Build y ejecutar con Docker

```bash
# Construir imagen
docker build -t alertas-web:latest .

# Ejecutar contenedor
docker run -d -p 8080:80 --name alertas-web alertas-web:latest
```

### O usar Docker Compose

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

La aplicación estará disponible en `http://localhost:8080`

## Opción 3: Despliegue en Servicios Cloud

### Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

### Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Desplegar
netlify deploy --prod --dir=dist
```

### AWS S3 + CloudFront

```bash
# Compilar
npm run build

# Subir a S3 (requiere AWS CLI configurado)
aws s3 sync dist/ s3://tu-bucket-name --delete

# Invalidar cache de CloudFront
aws cloudfront create-invalidation --distribution-id TU_DIST_ID --paths "/*"
```

## Configuración de Variables de Entorno

Para producción, asegúrate de configurar:

1. **API URL**: Modifica `src/api/axios.config.ts` con la URL de tu API en producción
2. **Nginx**: Ajusta el proxy en `nginx.conf` para apuntar a tu backend

## Scripts Disponibles

```json
"dev": "vite --host 0.0.0.0",          // Desarrollo
"build": "tsc -b && vite build",       // Build producción
"preview": "vite preview",              // Preview local del build
"lint": "eslint ."                      // Linting
```

## Verificación Post-Despliegue

1. ✅ Acceder a la URL de producción
2. ✅ Verificar login funcional
3. ✅ Probar navegación entre vistas
4. ✅ Verificar carga de mapas
5. ✅ Comprobar exportación de reportes
6. ✅ Validar traducciones (ES/EN)

## Troubleshooting

### Problema: Rutas 404 en refresh

**Solución**: Configurar fallback a `index.html` en servidor web (ver nginx.conf incluido)

### Problema: API no conecta

**Solución**: Verificar configuración de proxy en nginx.conf o actualizar baseURL en axios.config.ts

### Problema: Assets no cargan

**Solución**: Verificar que `base` en vite.config.ts coincida con la ruta de despliegue

## Soporte

Para más información: MOVINGENIA S.A.C.S.

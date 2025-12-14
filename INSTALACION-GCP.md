# Guía de Instalación Paso a Paso en Google Cloud Platform

## Información del Servidor
- **Plataforma**: Google Cloud Platform (GCP)
- **SO**: Ubuntu 24.04 LTS
- **Web Server**: Nginx
- **API Backend**: http://34.66.18.138:3000

---

## Paso 1: Preparar la VM en Google Cloud

### 1.1 Crear la VM (si aún no existe)
1. Ir a la consola de GCP: https://console.cloud.google.com
2. Navegar a **Compute Engine** > **VM instances**
3. Crear una nueva instancia con:
   - **Tipo de máquina**: e2-medium (2 vCPU, 4 GB RAM) - recomendado mínimo
   - **Disco de arranque**: Ubuntu 24.04 LTS
   - **Disco**: 20 GB SSD (mínimo)
   - **Región**: Elegir la más cercana a tus usuarios

### 1.2 Configurar Firewall en GCP
1. En la consola GCP, ir a **VPC Network** > **Firewall rules**
2. Crear las siguientes reglas:

**Regla HTTP:**
```
Nombre: allow-http
Dirección del tráfico: Ingress
Objetivos: Todas las instancias de la red
Filtro de origen: Rangos de IP
Rangos de IP de origen: 0.0.0.0/0
Protocolos y puertos: tcp:80
```

**Regla HTTPS:**
```
Nombre: allow-https
Dirección del tráfico: Ingress
Objetivos: Todas las instancias de la red
Filtro de origen: Rangos de IP
Rangos de IP de origen: 0.0.0.0/0
Protocolos y puertos: tcp:443
```

### 1.3 Conectarse a la VM
Desde la consola GCP, hacer clic en **SSH** para conectarse a la VM.

---

## Paso 2: Configurar el Servidor (Primera vez)

### 2.1 Actualizar el sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Instalar Node.js 20
```bash
# Descargar e instalar el repositorio de NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalación
node -v   # Debe mostrar v20.x.x
npm -v    # Debe mostrar 10.x.x
```

### 2.3 Instalar Nginx
```bash
# Instalar Nginx
sudo apt install -y nginx

# Habilitar Nginx para que inicie con el sistema
sudo systemctl enable nginx

# Iniciar Nginx
sudo systemctl start nginx

# Verificar estado
sudo systemctl status nginx
```

### 2.4 Instalar Git
```bash
sudo apt install -y git
git --version
```

---

## Paso 3: Desplegar la Aplicación

### 3.1 Clonar el repositorio
```bash
# Ir al directorio /opt (donde se guardan aplicaciones)
cd /opt

# Clonar el repositorio
sudo git clone https://github.com/alaines/alertas-web.git

# Entrar al directorio
cd alertas-web
```

### 3.2 Dar permisos de ejecución al script
```bash
sudo chmod +x deploy-gcp.sh
```

### 3.3 Ejecutar el despliegue
```bash
sudo ./deploy-gcp.sh
```

Este script hará automáticamente:
1. ✅ Instalar dependencias de Node.js
2. ✅ Compilar la aplicación (build)
3. ✅ Copiar archivos a `/var/www/alertas-web`
4. ✅ Configurar Nginx
5. ✅ Configurar proxy para la API (34.66.18.138:3000)
6. ✅ Recargar Nginx

### 3.4 Verificar el despliegue
```bash
# Verificar archivos
ls -la /var/www/alertas-web/

# Verificar configuración de Nginx
sudo nginx -t

# Ver estado de Nginx
sudo systemctl status nginx

# Probar health check
curl http://localhost/health
# Debe retornar: healthy
```

---

## Paso 4: Acceder a la Aplicación

### 4.1 Obtener la IP externa de la VM
```bash
# Obtener IP pública
curl ifconfig.me
```

O desde la consola de GCP:
1. Ir a **Compute Engine** > **VM instances**
2. Ver la columna **External IP**

### 4.2 Acceder desde el navegador
```
http://TU_IP_EXTERNA
```

### 4.3 Probar el login
- Usuario: `admin`
- Contraseña: `admin123`

---

## Paso 5: Configurar Dominio (Opcional)

### 5.1 Apuntar dominio a la IP
En tu proveedor de DNS (GoDaddy, Namecheap, Cloudflare, etc.):
1. Crear registro tipo **A**
2. Nombre: `@` (o `alertas` para subdominio)
3. Valor: `IP_EXTERNA_DE_TU_VM`
4. TTL: 3600

Ejemplo:
```
Tipo: A
Nombre: @
Valor: 34.123.45.67 (tu IP)
TTL: 3600
```

### 5.2 Actualizar configuración de Nginx
```bash
# Editar configuración
sudo nano /etc/nginx/sites-available/alertas-web

# Cambiar línea:
# De:  server_name _;
# A:   server_name tudominio.com www.tudominio.com;

# Guardar: Ctrl+O, Enter
# Salir: Ctrl+X

# Probar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

---

## Paso 6: Instalar SSL/HTTPS con Let's Encrypt

### 6.1 Instalar Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 6.2 Obtener certificado SSL
```bash
# Reemplazar con tu dominio real
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

Certbot preguntará:
1. **Email**: Para notificaciones de renovación
2. **Términos**: Aceptar (A)
3. **Redirección HTTP→HTTPS**: Sí (2)

### 6.3 Verificar renovación automática
```bash
# El timer de renovación debe estar activo
sudo systemctl status certbot.timer

# Probar renovación (no hace cambios reales)
sudo certbot renew --dry-run
```

El certificado se renovará automáticamente cada 90 días.

---

## Paso 7: Verificación Post-Instalación

### 7.1 Checklist de verificación
```bash
# ✅ Nginx corriendo
sudo systemctl status nginx

# ✅ Health check OK
curl http://localhost/health

# ✅ Aplicación accesible
curl -I http://localhost

# ✅ Ver logs sin errores
sudo tail -20 /var/log/nginx/alertas-web-error.log
```

### 7.2 Probar funcionalidades
1. ✅ Login con usuario admin
2. ✅ Navegar entre vistas (Mapa, Dashboard, Tickets, Reportes)
3. ✅ Cambiar idioma (ES/EN)
4. ✅ Ver mapa con incidentes
5. ✅ Exportar reporte (Excel/PDF)

---

## Mantenimiento y Actualizaciones

### Actualizar la aplicación
```bash
cd /opt/alertas-web
sudo git pull origin main
sudo ./deploy-gcp.sh
```

### Ver logs en tiempo real
```bash
# Logs de acceso
sudo tail -f /var/log/nginx/alertas-web-access.log

# Logs de error
sudo tail -f /var/log/nginx/alertas-web-error.log
```

### Hacer rollback a versión anterior
```bash
# Ver backups disponibles
ls -lh /var/backups/alertas-web/

# Restaurar (reemplazar TIMESTAMP con el archivo deseado)
cd /var/www/alertas-web
sudo rm -rf *
sudo tar -xzf /var/backups/alertas-web/backup_TIMESTAMP.tar.gz
sudo chown -R www-data:www-data .
sudo systemctl reload nginx
```

---

## Troubleshooting

### Problema: No puedo acceder desde navegador
**Solución:**
```bash
# 1. Verificar que Nginx está corriendo
sudo systemctl status nginx

# 2. Verificar firewall de GCP (debe tener reglas HTTP/HTTPS)
# 3. Verificar firewall de Ubuntu
sudo ufw status

# Si está activo, permitir puertos
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Problema: Error 502 Bad Gateway
**Solución:**
```bash
# Verificar que la API está disponible
curl -I http://34.66.18.138:3000/health

# Ver logs de Nginx
sudo tail -20 /var/log/nginx/alertas-web-error.log

# Recargar Nginx
sudo systemctl reload nginx
```

### Problema: Cambios no se reflejan después de actualizar
**Solución:**
```bash
# Limpiar cache del navegador o probar en modo incógnito

# O forzar rebuild completo
cd /opt/alertas-web
sudo rm -rf dist node_modules
sudo ./deploy-gcp.sh
```

---

## Información de Contacto

**Proyecto**: Alertas Web  
**Empresa**: MOVINGENIA S.A.C.S.  
**Repositorio**: https://github.com/alaines/alertas-web  
**API Backend**: http://34.66.18.138:3000  

---

## Resumen de Comandos Rápidos

```bash
# Instalación inicial completa
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git
cd /opt
sudo git clone https://github.com/alaines/alertas-web.git
cd alertas-web
sudo chmod +x deploy-gcp.sh
sudo ./deploy-gcp.sh

# Actualizar aplicación
cd /opt/alertas-web
sudo git pull origin main
sudo ./deploy-gcp.sh

# Ver logs
sudo tail -f /var/log/nginx/alertas-web-error.log

# Reiniciar Nginx
sudo systemctl reload nginx
```

# Guía de Despliegue en Google Cloud Platform

## Arquitectura
- **VM**: Ubuntu 24.04 LTS
- **Web Server**: Nginx
- **Aplicación**: Alertas Web (React + Vite)

## Pre-requisitos en la VM

### 1. Actualizar sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Node.js 20+
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # Verificar versión
```

### 3. Instalar Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 4. Configurar Firewall (GCP)
En la consola de GCP, configurar reglas de firewall:
- **Puerto 80** (HTTP): Permitir desde 0.0.0.0/0
- **Puerto 443** (HTTPS): Permitir desde 0.0.0.0/0
- **Puerto 22** (SSH): Restringir a IPs conocidas

## Despliegue

### Opción 1: Desde la VM (Recomendado)

```bash
# 1. Clonar repositorio
cd /opt
sudo git clone https://github.com/alaines/alertas-web.git
cd alertas-web

# 2. Dar permisos de ejecución
sudo chmod +x deploy-gcp.sh

# 3. Ejecutar despliegue
sudo ./deploy-gcp.sh
```

### Opción 2: Despliegue desde Local

```bash
# 1. Compilar localmente
npm run build

# 2. Comprimir build
tar -czf dist.tar.gz dist/

# 3. Copiar a VM (ajustar IP y usuario)
scp dist.tar.gz usuario@IP_VM:/tmp/

# 4. En la VM, extraer y desplegar
ssh usuario@IP_VM
cd /tmp
tar -xzf dist.tar.gz
sudo rm -rf /var/www/alertas-web/*
sudo cp -r dist/* /var/www/alertas-web/
sudo chown -R www-data:www-data /var/www/alertas-web
sudo systemctl reload nginx
```

## Configuración Post-Despliegue

### 1. Configurar Dominio

Editar `/etc/nginx/sites-available/alertas-web`:
```nginx
server_name tudominio.com www.tudominio.com;
```

Recargar nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 2. Instalar SSL/HTTPS con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado (ajustar dominio)
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Certbot configurará automáticamente HTTPS y redirección
```

### 3. Renovación automática de SSL
```bash
# Verificar timer de renovación
sudo systemctl status certbot.timer

# Probar renovación
sudo certbot renew --dry-run
```

## Configuración de Backend API

Si tu backend está en otra VM o servicio:

1. Editar `/etc/nginx/sites-available/alertas-web`
2. Modificar la sección `location /api/`:
```nginx
location /api/ {
    proxy_pass http://IP_BACKEND:PUERTO/;
    # ... resto de configuración
}
```
3. Recargar nginx: `sudo systemctl reload nginx`

## Monitoreo y Logs

### Ver logs de Nginx
```bash
# Access logs
sudo tail -f /var/log/nginx/alertas-web-access.log

# Error logs
sudo tail -f /var/log/nginx/alertas-web-error.log

# Logs generales de nginx
sudo tail -f /var/log/nginx/error.log
```

### Ver estado de Nginx
```bash
sudo systemctl status nginx
sudo nginx -t  # Verificar configuración
```

### Health Check
```bash
curl http://localhost/health
# Debe retornar: healthy
```

## Actualizaciones

### Actualizar aplicación
```bash
cd /opt/alertas-web
sudo git pull origin main
sudo ./deploy-gcp.sh
```

### Rollback a versión anterior
```bash
# Listar backups disponibles
ls -lh /var/backups/alertas-web/

# Restaurar backup específico
cd /var/www/alertas-web
sudo rm -rf *
sudo tar -xzf /var/backups/alertas-web/backup_TIMESTAMP.tar.gz
sudo chown -R www-data:www-data .
sudo systemctl reload nginx
```

## Optimizaciones de Performance

### 1. Habilitar cache de Nginx
Ya configurado en `deploy-gcp.sh` con:
- Assets estáticos: cache de 1 año
- Gzip compression habilitado

### 2. Optimizar VM (si es necesario)
```bash
# Aumentar límites de archivos abiertos
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Optimizar Nginx worker_processes
sudo nano /etc/nginx/nginx.conf
# Ajustar: worker_processes auto;
```

## Seguridad

### 1. Configurar UFW (Firewall)
```bash
sudo ufw enable
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw status
```

### 2. Actualizar sistema regularmente
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Configurar fail2ban (opcional)
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Troubleshooting

### Nginx no inicia
```bash
sudo nginx -t  # Ver errores de configuración
sudo systemctl status nginx
sudo journalctl -xeu nginx
```

### App no carga después de despliegue
```bash
# Verificar permisos
ls -la /var/www/alertas-web/

# Verificar archivos
ls -la /var/www/alertas-web/index.html

# Recargar nginx
sudo systemctl reload nginx
```

### Error 502 Bad Gateway (API)
```bash
# Verificar que backend esté corriendo
curl http://IP_BACKEND:PUERTO/health

# Revisar logs
sudo tail -f /var/log/nginx/alertas-web-error.log
```

## Scripts Útiles

### Ver espacio en disco
```bash
df -h
du -sh /var/www/alertas-web
du -sh /var/backups/alertas-web
```

### Limpiar backups antiguos manualmente
```bash
sudo find /var/backups/alertas-web -name "backup_*.tar.gz" -mtime +30 -delete
```

## Contacto

**Soporte técnico**: MOVINGENIA S.A.C.S.

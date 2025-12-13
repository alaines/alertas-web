# 🚨 Alertas Viales Web

Sistema completo de monitoreo de alertas viales en tiempo real con autenticación JWT, gestión de usuarios y panel de administración. Visualiza incidentes de Waze en un mapa interactivo con auto-refresh y notificaciones.

## 🎯 Características

### Monitoreo de Incidentes
- **🗺️ Mapa interactivo** - Leaflet con marcadores personalizados por tipo
- **🔄 Auto-refresh** - Actualización automática cada 60 segundos
- **🎯 Filtros inteligentes** - Por tipo de incidente y capas del mapa
- **📍 Información detallada** - Tipo, ubicación, prioridad, confiabilidad, tiempo transcurrido
- **🔔 Notificaciones** - Alertas de incidentes recientemente cerrados (últimos 5 min)
- **⏰ Timestamps dinámicos** - Actualización automática de tiempos relativos

### Autenticación y Seguridad
- **🔐 JWT Authentication** - Sistema seguro con tokens y refresh automático
- **👥 Roles de usuario** - Admin, Operator, Viewer con permisos diferenciados
- **🛡️ Rutas protegidas** - Acceso controlado según rol
- **🔑 Gestión de sesiones** - Persistencia en localStorage con logout automático

### Panel de Administración (Solo Admin)
- **👤 CRUD de usuarios** - Crear, editar, eliminar usuarios con modal interactivo
- **📊 Estadísticas en tiempo real** - Conteo de usuarios por rol
- **⚙️ Configuración del sistema** - Intervalos, mapa, notificaciones
- **📝 Logs de actividad** - Historial de acciones del sistema
- **🎨 Interfaz profesional** - Bootstrap 5 con diseño responsive

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build**: Vite 7
- **Mapas**: Leaflet + react-leaflet
- **Styling**: Bootstrap 5 + Font Awesome 6
- **HTTP Client**: Axios con interceptores JWT
- **Routing**: React Router DOM
- **Auth**: JWT (JSON Web Tokens)
- **Linting**: ESLint

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- Backend API en `192.168.18.230/api/v1` (con autenticación JWT)

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/alaines/alertas-web.git
cd alertas-web

# Instalar dependencias
npm install

# Configurar variables de entorno
# El archivo .env ya está configurado para desarrollo
# VITE_API_URL="http://192.168.18.230/api/v1"
```

## 🏃 Desarrollo

```bash
# Iniciar servidor de desarrollo
## 🔑 Autenticación

### Credenciales Iniciales
```
Email: admin@alertas.com
Password: admin123
Rol: ADMIN
```

**Primer inicio**:
1. Acceder con credenciales de admin
2. Ir a Panel de Administración
3. Crear usuarios adicionales (operator, viewer)
4. Asignar roles según necesidades

### Roles y Permisos
| Rol | Mapa | Incidentes | Panel Admin | Gestión Usuarios |
|-----|------|------------|-------------|------------------|
| **VIEWER** | ✅ | ✅ Ver | ❌ | ❌ |
| **OPERATOR** | ✅ | ✅ Ver | ❌ | ❌ |
| **ADMIN** | ✅ | ✅ Ver | ✅ | ✅ |
### Credenciales de Prueba
```
Email: admin@alertas.com
Password: admin123
Rol: ADMIN (acceso completo)
```

Otros usuarios (operator, viewer) deben ser creados desde el panel de administración.

## 🔧 Configuración

### Variables de Entorno (`.env`)

```env
VITE_API_URL="http://192.168.18.230/api/v1"
# JWT Authentication - No API Key needed
```

⚠️ **Nota**: Ya no se usa `VITE_API_KEY`. El sistema ahora utiliza JWT (tokens) obtenidos al hacer login.

### Axios con JWT

El sistema usa interceptores de Axios para:
- Agregar automáticamente el token JWT a todas las peticiones
- Manejar errores 401 (redirigir a login si el token expira)
- Logout automático en caso de autenticación fallida

## 📦 Build para Producción

```bash
# Compilar TypeScript y bundlear con Vite
npm run build

# Ver el resultado de build en local
npm run preview
```

## 🧹 Linting

```bash
# Verificar código con ESLint
npm run lint
```

## 📁 Estructura del Proyecto

```
alertas-web/
├── src/
│   ├── App.tsx                    # Componente principal (mapa)
│   ├── App.css                    # Estilos
│   ├── main.tsx                   # Punto de entrada con router
│   ├── index.css                  # Estilos globales
│   ├── api/
│   │   ├── axios.config.ts        # Configuración de Axios + interceptores JWT
│   │   └── incidents.ts           # Servicio para obtener incidentes
│   ├── services/
│   │   └── auth.service.ts        # Servicio de autenticación JWT
│   ├── context/
│   │   └── AuthContext.tsx        # Context API para autenticación
## 🏗️ Arquitectura

### Autenticación JWT
- **Login**: POST `/api/v1/auth/login` con email/password
- **Token**: Se guarda en localStorage y se envía automáticamente en cada petición
- **Interceptores**: Axios agrega `Authorization: Bearer {token}` a todas las requests
- **Auto-logout**: Redirección automática a login si token expira (401)

### Rutas de la Aplicación
| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | 🌍 Público | Página de autenticación |
| `/map` | 🔒 Autenticado | Mapa de incidentes con filtros |
| `/admin` | 🔒 Solo ADMIN | Panel de administración completo |

### API Endpoints Utilizados
```
Auth:
POST   /api/v1/auth/login              Login con email/password

Users:
GET    /api/v1/users                   Listar usuarios (ADMIN)
POST   /api/v1/users                   Crear usuario (ADMIN)
PATCH  /api/v1/users/{id}              Actualizar usuario (ADMIN)
## 🎨 Capturas de Pantalla

### 🔐 Login
- Formulario con email y password
- Validación en tiempo real
- Manejo de errores del servidor

### 🗺️ Mapa Principal
- Marcadores con colores según tipo de incidente
- Panel lateral con lista de incidentes
- Filtros por tipo (dropdown y layer panel sincronizados)
- Notificaciones de incidentes cerrados
- Menú de usuario con opciones según rol

### 👨‍💼 Panel de Administración
- **Usuarios**: Tabla con CRUD completo, modal de edición, estadísticas por rol
- **Configuración**: Ajustes de intervalos, mapa y notificaciones
- **Logs**: Historial de actividad del sistema

### Incidentes (Requiere Token)
```
GET /api/v1/incidents?status=active&limit=200
Authorization: Bearer {token}

Response:
[
  {
    "id": 1,
    "uuid": "uuid-string",
    "type": "ACCIDENT",
    "subtype": null,
    "city": "Lima",
    "street": "Av. Javier Prado",
    "category": "accident",
    "priority": 3,
    "status": "active",
    "pub_time": "2025-12-09T12:00:00Z",
    "reliability": 8,
    "confidence": 9,
    "lat": -12.0970,
    "lon": -77.0340
  }
]
```

## 🐛 Solución de Problemas

### No puedo hacer login
- Verifica que el backend esté corriendo en `http://192.168.18.230/api/v1`
- Prueba las credenciales: `admin@alertas.com` / `admin123`
- Revisa la consola del navegador (F12) → Network tab
- Verifica que el endpoint `/auth/login` responde correctamente

### Token expirado / 401 Unauthorized
- El sistema redirigirá automáticamente a `/login`
- Vuelve a hacer login para obtener un nuevo token
- Si persiste, verifica la configuración del backend

### El mapa no se muestra
- Verifica que Leaflet CSS esté importado en `main.tsx`
- Asegúrate de que el contenedor tiene altura y ancho definidos
- Revisa la consola del navegador (F12) para errores
- Confirma que estás autenticado y el token es válido

### Sin datos de incidentes
- Verifica la conexión a la API backend
- Revisa la URL en `.env`: `VITE_API_URL`
- Comprueba que el token se envía en el header `Authorization`
- Abre DevTools → Network → Headers para verificar

## ✅ Estado del Proyecto

### Implementado
- ✅ Sistema de autenticación JWT completo
- ✅ Roles de usuario (Admin, Operator, Viewer)
- ✅ **CRUD de usuarios** con interfaz gráfica
- ✅ Panel de administración funcional
- ✅ Auto-refresh de incidentes (60s)
- ✅ Filtros sincronizados (dropdown + layer panel)
- ✅ Marcadores personalizados por tipo
- ✅ Notificaciones de incidentes cerrados
- ✅ Rutas protegidas con ProtectedRoute
- ✅ Interceptores Axios para JWT
- ✅ Manejo de errores y loading states
- ✅ UI responsive con Bootstrap 5

### Próximas Mejoras
- [ ] Cambio de contraseña desde perfil
- [ ] Recuperación de contraseña por email
- [ ] Refresh token automático
- [ ] Logs de actividad persistentes en BD
- [ ] Exportación de reportes (PDF, Excel)
- [ ] Historial de incidentes con búsqueda
- [ ] Dashboard con estadísticas y gráficos
## 🤝 Contribuir

Este proyecto está en desarrollo activo. Para contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

- **API Documentation**: http://192.168.18.230/api/v1/docs
- **Issues**: https://github.com/alaines/alertas-web/issues
- **Backend API**: Alertas API v1.0.0

- **`JWT_AUTH.md`** - Guía completa de autenticación JWT
- **`AUTHENTICATION.md`** - Documentación técnica del sistema de auth
- **`QUICK_START.md`** - Guía rápida para comenzar
- **`API_SECURITY.md`** - Documentación de seguridad (obsoleta, usaba API Keys)

## 📄 Licencia

Proyecto de demostración. Usar libremente con fines educativos.

## 👤 Autor

Created with ❤️ by alaines

---

**Última actualización**: 9 de diciembre de 2025

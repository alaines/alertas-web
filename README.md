# 🚨 Alertas Viales Web

Aplicación web interactiva para visualizar alertas viales en tiempo real usando un mapa interactivo. Muestra incidentes reportados desde Waze con información de ubicación, tipo, prioridad y confiabilidad.

## 🎯 Características

- **🗺️ Mapa interactivo** - Visualización de incidentes en tiempo real usando Leaflet
- **🔄 Auto-refresh** - Actualización automática cada 60 segundos
- **👥 Sistema de autenticación** - Login con JWT y roles de usuario (Admin, Operator, Viewer)
- **🎨 Panel lateral** - Listado scrolleable de todos los incidentes activos
- **📍 Información detallada** - Cada incidente muestra:
  - Tipo de alerta (accidente, congestión, peligro, etc.)
  - Categoría y ubicación (ciudad y calle)
  - Prioridad y confiabilidad
  - Coordenadas GPS y tiempo transcurrido
- **🎛️ Panel de administración** - Gestión de usuarios, configuración y logs (solo Admin)
- **🔔 Notificaciones** - Sistema de alertas de incidentes cerrados
- **🌐 Diseño responsivo** - Interfaz limpia y funcional

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
npm run dev

# El servidor estará disponible en:
# http://192.168.18.230:5173/
```

El servidor se ejecuta con `--host 0.0.0.0` para ser accesible desde otras máquinas en la red.

## 🔑 Login

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
│   ├── components/
│   │   └── ProtectedRoute.tsx     # HOC para proteger rutas
│   └── pages/
│       ├── Login.tsx              # Página de login
│       └── Admin.tsx              # Panel de administración
├── public/
│   ├── control-center.png         # Background de login
│   └── favicon.ico                # Favicon
├── index.html                     # HTML principal
├── vite.config.ts                 # Configuración de Vite
├── tsconfig.json                  # Configuración de TypeScript
├── package.json                   # Dependencias y scripts
├── .env                           # Variables de entorno
├── README.md                      # Esta documentación
├── JWT_AUTH.md                    # Guía de autenticación JWT
├── AUTHENTICATION.md              # Documentación técnica de auth
└── QUICK_START.md                 # Guía rápida de inicio
```

## 🔐 Sistema de Autenticación

El sistema utiliza **JWT (JSON Web Tokens)** para autenticación segura.

### Rutas
- `/login` - Página de login (público)
- `/map` - Mapa de incidentes (requiere autenticación)
- `/admin` - Panel de administración (solo ADMIN)

### Roles de Usuario
- **ADMIN**: Acceso completo + panel de administración
- **OPERATOR**: Acceso al mapa y operaciones
- **VIEWER**: Solo lectura del mapa

Ver `JWT_AUTH.md` para documentación completa de autenticación.

## 🗺️ Endpoints de API

### Autenticación
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@alertas.com",
  "password": "admin123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "user": { ... }
}
```

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

## 📝 Desarrollo Futuro

### Completado ✅
- [x] Sistema de autenticación con JWT
- [x] Roles de usuario (Admin, Operator, Viewer)
- [x] Panel de administración
- [x] Auto-refresh de incidentes (60s)
- [x] Filtrado por tipo de incidente
- [x] Marcadores con colores según tipo
- [x] Notificaciones de incidentes cerrados
- [x] Rutas protegidas

### Pendiente 🚧
- [ ] CRUD completo de usuarios en panel admin
- [ ] Cambio de contraseña funcional
- [ ] Recuperación de contraseña por email
- [ ] Refresh token automático
- [ ] Logs de actividad persistentes
- [ ] Exportación de reportes
- [ ] Historial de incidentes
- [ ] Estadísticas avanzadas
- [ ] Tema oscuro/claro
- [ ] 2FA (autenticación de dos factores)

## 📚 Documentación Adicional

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

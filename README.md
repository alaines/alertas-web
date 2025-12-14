# Alertas Viales Web v1.1

Sistema completo de monitoreo de alertas viales en tiempo real con autenticación JWT, gestión de usuarios, sistema de tickets, dashboard de estadísticas, reportes exportables y soporte multiidioma. Visualiza incidentes de Waze y periféricos de vía en un mapa interactivo con auto-refresh y notificaciones.

## Características

### Monitoreo de Incidentes
- **Mapa interactivo** - Leaflet con marcadores personalizados por tipo
- **Auto-refresh** - Actualización automática cada 60 segundos
- **Filtros inteligentes** - Por tipo de incidente y capas del mapa
- **Información detallada** - Tipo, ubicación, prioridad, confiabilidad, tiempo transcurrido
- **Notificaciones** - Alertas de incidentes recientemente cerrados (últimos 5 min)
- **Timestamps dinámicos** - Actualización automática de tiempos relativos
- **Indicadores de tickets** - Badge azul en incidentes con tickets abiertos
- **Botones contextuales** - "Ver Ticket" o "Crear Ticket" según corresponda
- **Asociación por UUID** - Tickets vinculados a incidentes mediante UUID de Waze
- **Atribución de datos** - Créditos a Waze® y OpenStreetMap

### Gestión de Periféricos (Admin)
- **CRUD completo** - Crear, editar, eliminar dispositivos de vía
- **Tipos de dispositivos** - Cámara, Semáforo, Sensor, Cámara de Conteo
- **Estados operativos** - Activo, Inactivo, Mantenimiento
- **Ubicación geográfica** - Selector de ubicación en mapa interactivo (click-to-select)
- **Datos técnicos** - Marca, años de instalación/fabricación, IP, credenciales
- **Visualización en mapa** - Marcadores diferenciados por tipo y color por estado
- **Filtros de capas** - Mostrar/ocultar dispositivos por tipo en el mapa
- **Información detallada** - Popup con todos los datos del dispositivo
- **Acceso restringido** - Solo administradores pueden gestionar dispositivos

### Autenticación y Seguridad
- **JWT Authentication** - Sistema seguro con tokens y refresh automático
- **Roles de usuario** - Admin, Operator, Viewer con permisos diferenciados
- **Rutas protegidas** - Acceso controlado según rol
- **Gestión de sesiones** - Persistencia en localStorage con logout automático

### Panel de Administración (Solo Admin)
- **CRUD de usuarios** - Crear, editar, eliminar usuarios con modal interactivo
- **Estadísticas en tiempo real** - Conteo de usuarios por rol
- **Configuración del sistema** - Intervalos, mapa, notificaciones
- **Logs de actividad** - Historial de acciones del sistema
- **Interfaz profesional** - Bootstrap 5 con diseño responsive

### Sistema de Tickets (Operator y Admin)
- **Gestión de tickets** - Crear, actualizar y cerrar tickets vinculados a incidentes
- **Seguimiento de acciones** - Historial inmutable de eventos (auditoría completa)
- **Estados del ciclo de vida** - OPEN, IN_PROGRESS, DONE
- **Asignación de responsables** - Asignar tickets a usuarios específicos
- **Comentarios y notas** - Sistema de comentarios en tickets
- **Priorización** - Niveles de prioridad (1-5) para organización
- **Creación desde mapa** - Botón directo en cada incidente para crear ticket
- **Estadísticas visuales** - Dashboard con contadores por estado
- **Control de permisos** - Solo OPERATOR y ADMIN pueden crear/modificar tickets
- **Múltiples fuentes** - WAZE, PHONE_CALL, WHATSAPP, INSPECTOR, OTHER
- **Paginación** - Visualización de 15 tickets por página
- **Vinculación UUID** - Asociación con incidentes mediante UUID único

### Dashboard de Estadísticas
- **Métricas en tiempo real** - Incidentes activos, tickets abiertos, en progreso
- **Tiempo promedio de resolución** - Cálculo automático en horas
- **Períodos personalizables** - Hoy, Última Semana, Último Mes
- **Gráficos de estado** - Barras de progreso para tickets
- **Distribución de incidentes** - Por tipo con contadores
- **Estado de dispositivos** - Activos, en mantenimiento, inactivos
- **Actividad reciente** - Últimos tickets creados con timestamp
- **Agrupación por prioridad** - Distribución de tickets por nivel

### Sistema de Reportes (Operator y Admin)
- **3 tipos de reportes** - Incidentes, Tickets, Dispositivos
- **Filtros por fecha** - Rango personalizable de inicio y fin
- **Exportación a Excel** - Formato .xlsx con todas las columnas
- **Exportación a PDF** - Tablas formateadas con encabezados
- **Vista previa de datos** - Tabla interactiva antes de exportar
- **Contador de registros** - Total de registros en el reporte
- **Datos completos** - Incluye todos los campos relevantes
- **Reporte de incidentes** - Tipo, ubicación, prioridad, confiabilidad, fecha/hora
- **Reporte de tickets** - Estado, prioridad, tiempos de resolución, asignaciones
- **Reporte de dispositivos** - Inventario completo con estado operativo

### Soporte Multiidioma 
- **Español e Inglés** - Sistema completamente bilingüe
- **Configuración persistente** - Idioma guardado en localStorage
- **Interfaz completa traducida** - Dashboard, Reportes, Navegación
- **Reportes localizados** - Columnas y datos exportados en idioma seleccionado
- **Cambio instantáneo** - Sin necesidad de recargar la página
- **Configuración en Admin** - Selector de idioma en panel de configuración
- **99+ traducciones** - Todas las etiquetas y mensajes del sistema

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build**: Vite 7.2.7
- **Mapas**: Leaflet + react-leaflet
- **Styling**: Bootstrap 5 + Font Awesome 6
- **HTTP Client**: Axios con interceptores JWT
- **Routing**: React Router DOM
- **Auth**: JWT (JSON Web Tokens)
- **Exportación**: xlsx (Excel), jsPDF + jspdf-autotable (PDF)
- **Internacionalización**: Context API con soporte ES/EN
- **Linting**: ESLint

## Requisitos Previos

- Node.js 18+
- npm o yarn
- Backend API en `192.168.18.230/api/v1` (con autenticación JWT)

## Instalación

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

##  Desarrollo

```bash
# Iniciar servidor de desarrollo
## Autenticación

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
| Rol          |   Mapa   |  Incidentes |    Tickets    |  Dashboard  |   Reportes  |  Dispositivos  |  Panel Admin | Gestión Usuarios |
|--------------|----------|-------------|---------------|-------------|-------------|----------------|--------------|------------------|
| **VIEWER**   |    SI    |    SI Ver   |       NO      |      SI     |      NO     |      Ver       |      NO      |       NO         |
| **OPERATOR** |    SI    |    SI Ver   |    SI Crear   |      SI     |      SI     |      Ver       |      NO      |       NO         |
| **ADMIN**    |    SI    |    SI Ver   |    SI Crear   |      SI     |      SI     |    SI CRUD     |      SI      |       SI         |

### Uso del Sistema de Tickets

**Crear Ticket desde Mapa:**
1. Hacer clic en un marcador de incidente
2. En el popup, clic en "Crear Ticket"
3. Completar formulario (título, descripción, prioridad, asignado)
4. El ticket queda vinculado al incidente

**Gestionar Tickets:**
1. Navegar a sección "Tickets" (disponible para OPERATOR y ADMIN)
2. Ver lista de todos los tickets con filtros por estado
3. Hacer clic en un ticket para ver detalles completos
4. Cambiar estado (OPEN → IN_PROGRESS → DONE)
5. Agregar comentarios y notas
6. Ver historial completo de eventos auditables

### Credenciales de Prueba
```
Email: admin@alertas.com
Password: admin123
Rol: ADMIN (acceso completo)
```

Otros usuarios (operator, viewer) deben ser creados desde el panel de administración.

## Configuración

### Variables de Entorno (`.env`)

```env
VITE_API_URL="http://192.168.18.230/api/v1"
# JWT Authentication - No API Key needed
```

**Nota**: Ya no se usa `VITE_API_KEY`. El sistema ahora utiliza JWT (tokens) obtenidos al hacer login.

### Axios con JWT

El sistema usa interceptores de Axios para:
- Agregar automáticamente el token JWT a todas las peticiones
- Manejar errores 401 (redirigir a login si el token expira)
- Logout automático en caso de autenticación fallida

## Build para Producción

```bash
# Compilar TypeScript y bundlear con Vite
npm run build

# Ver el resultado de build en local
npm run preview
```

## Linting

```bash
# Verificar código con ESLint
npm run lint
```

## Estructura del Proyecto

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
│   │   ├── auth.service.ts        # Servicio de autenticación JWT
│   │   ├── user.service.ts        # Servicio de gestión de usuarios
│   │   └── ticket.service.ts      # Servicio de gestión de tickets
│   ├── types/
│   │   └── ticket.types.ts        # Interfaces y tipos para tickets
│   ├── context/
│   │   └── AuthContext.tsx        # Context API para autenticación
│   ├── components/
│   │   └── ProtectedRoute.tsx     # HOC para rutas protegidas
│   ├── pages/
│   │   ├── Login.tsx              # Página de login
│   │   ├── Admin.tsx              # Panel de administración (usuarios, config, logs)
│   │   └── Tickets.tsx            # Sistema de gestión de tickets
│   └── assets/
│       ├── react.svg              # Logo de React
│       └── bg.jpg                 # Imagen de fondo login
├── public/                        # Archivos estáticos
├── index.html                     # HTML principal
├── vite.config.ts                 # Configuración de Vite
├── tsconfig.json                  # Configuración de TypeScript
└── QUICK_START.md                 # Guía rápida de inicio
```

## Arquitectura

### Autenticación JWT
- **Login**: POST `/api/v1/auth/login` con email/password
- **Token**: Se guarda en localStorage y se envía automáticamente en cada petición
- **Interceptores**: Axios agrega `Authorization: Bearer {token}` a todas las requests
- **Auto-logout**: Redirección automática a login si token expira (401)

### Rutas de la Aplicación
| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | Público | Página de autenticación |
| `/map` | Autenticado | Mapa de incidentes con filtros y periféricos |
| `/dashboard` | Autenticado | Dashboard con estadísticas y métricas |
| `/tickets` | OPERATOR/ADMIN | Sistema de gestión de tickets |
| `/reports` | OPERATOR/ADMIN | Generación y exportación de reportes |
| `/admin` | Solo ADMIN | Panel de administración completo |

### API Endpoints Utilizados
```
Auth:
POST   /api/v1/auth/login              Login con email/password

Users:
GET    /api/v1/users                   Listar usuarios (ADMIN)
POST   /api/v1/users                   Crear usuario (ADMIN)
PATCH  /api/v1/users/{id}              Actualizar usuario (ADMIN)
DELETE /api/v1/users/{id}              Eliminar usuario (ADMIN)

Incidents:
GET    /api/v1/incidents               Listar incidentes activos
GET    /api/v1/incidents/uuid/{uuid}   Obtener incidente por UUID

Tickets:
POST   /api/v1/tickets                 Crear ticket (OPERATOR/ADMIN)
GET    /api/v1/tickets                 Listar tickets con filtros
GET    /api/v1/tickets/{id}            Obtener ticket con eventos
PATCH  /api/v1/tickets/{id}            Actualizar ticket (OPERATOR/ADMIN)
POST   /api/v1/tickets/{id}/status     Cambiar estado (OPERATOR/ADMIN)
POST   /api/v1/tickets/{id}/comments   Agregar comentario (OPERATOR/ADMIN)
GET    /api/v1/tickets/{id}/events     Obtener historial de eventos

Devices:
GET    /api/v1/devices                 Listar dispositivos
GET    /api/v1/devices/{id}            Obtener dispositivo
POST   /api/v1/devices                 Crear dispositivo (ADMIN)
PATCH  /api/v1/devices/{id}            Actualizar dispositivo (ADMIN)
DELETE /api/v1/devices/{id}            Eliminar dispositivo (ADMIN)
PATCH  /api/v1/devices/{id}/status     Cambiar estado dispositivo (ADMIN)
```
POST   /api/v1/auth/login              Login con email/password

Users:
GET    /api/v1/users                   Listar usuarios (ADMIN)
POST   /api/v1/users                   Crear usuario (ADMIN)
PATCH  /api/v1/users/{id}              Actualizar usuario (ADMIN)
DELETE /api/v1/users/{id}              Eliminar usuario (ADMIN)

Incidents:
GET    /api/v1/incidents               Listar incidentes activos
```

## Capturas de Pantalla

### Login
- Formulario con email y password
- Validación en tiempo real
- Manejo de errores del servidor

### Mapa Principal
- Marcadores con colores según tipo de incidente
- Panel lateral con lista de incidentes
- Filtros por tipo (dropdown y layer panel sincronizados)
- Notificaciones de incidentes cerrados
- Menú de usuario con opciones según rol

### Panel de Administración
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

## Solución de Problemas

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

## Estado del Proyecto

### Implementado
- Sistema de autenticación JWT completo
- Roles de usuario (Admin, Operator, Viewer)
- **CRUD de usuarios** con interfaz gráfica
- **Sistema de tickets completo** con historial auditable
- Panel de administración funcional
- Auto-refresh de incidentes (60s)
- Filtros sincronizados (dropdown + layer panel)
- Marcadores personalizados por tipo
- Notificaciones de incidentes cerrados
- Rutas protegidas con ProtectedRoute
- Interceptores Axios para JWT
- Manejo de errores y loading states
- UI responsive con Bootstrap 5
- Creación de tickets desde mapa
- Gestión de estados de tickets (OPEN, IN_PROGRESS, DONE)
- Sistema de comentarios en tickets
- Asignación de tickets a usuarios
- Estadísticas de tickets por estado

### Próximas Mejoras
- Cambio de contraseña desde perfil
- Recuperación de contraseña por email
- Refresh token automático
- Logs de actividad persistentes en BD
- Exportación de reportes (PDF, Excel)
- Historial de incidentes con búsqueda
- Dashboard con estadísticas y gráficos
- Configuración persistente en BD
- Tema oscuro/claro
- 2FA (autenticación de dos factores)
- Notificaciones push en tiempo real

## Contribuir

Este proyecto está en desarrollo activo. Para contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Soporte

- **API Documentation**: http://192.168.18.230/api/v1/docs
- **Issues**: https://github.com/alaines/alertas-web/issues
- **Backend API**: Alertas API v1.0.0

## Licencia

Proyecto de demostración. Usar libremente con fines educativos.

## Autor

Created by alaines

---

**Última actualización**: 13 de diciembre de 2025


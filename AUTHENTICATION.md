# Sistema de Autenticación

## Descripción General

El sistema implementa autenticación basada en roles con tres niveles de acceso:
- **Admin**: Acceso completo al sistema, incluido el panel de administración
- **Operator**: Acceso al mapa y funcionalidades operativas
- **Viewer**: Acceso de solo lectura al mapa

## Arquitectura

### Context API
El estado de autenticación se gestiona mediante `AuthContext` ubicado en `/src/context/AuthContext.tsx`:

```typescript
interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  image?: string;
}
```

### Funciones Principales

- `login(username, password)`: Autentica al usuario (actualmente mock)
- `logout()`: Cierra sesión y limpia localStorage
- `isAuthenticated()`: Retorna true si hay usuario activo
- `isAdmin()`: Verifica si el usuario es administrador
- `isOperator()`: Verifica si el usuario es operador

### Persistencia
El estado del usuario se guarda en localStorage para mantener la sesión entre recargas.

## Rutas Protegidas

El componente `ProtectedRoute` (`/src/components/ProtectedRoute.tsx`) protege rutas según el rol:

```typescript
<ProtectedRoute requireAdmin>
  <Admin />
</ProtectedRoute>
```

### Comportamiento
- Si no está autenticado → redirige a `/login`
- Si no tiene permisos suficientes → redirige a `/map`
- Si tiene permisos → renderiza el componente

## Rutas del Sistema

| Ruta | Componente | Requiere Auth | Nivel Mínimo |
|------|-----------|---------------|--------------|
| `/login` | Login | No | - |
| `/map` | App (Mapa) | Sí | viewer |
| `/admin` | Admin | Sí | admin |

## Login Actual (Mock)

### Credenciales de Prueba
```
Usuario: admin
Contraseña: cualquiera
Resultado: Rol Admin

Usuario: operator
Contraseña: cualquiera
Resultado: Rol Operator

Usuario: otro
Contraseña: cualquiera
Resultado: Rol Viewer
```

### Flujo de Login
1. Usuario ingresa credenciales en `/login`
2. `AuthContext.login()` crea un usuario mock basado en el username
3. Usuario y datos se guardan en localStorage
4. Redirige a `/map`

## Menú de Sistema

### Barra Superior
La barra de navegación muestra opciones según el rol:

- **Todos los usuarios**:
  - Botón "Mapa" (activo cuando está en el mapa)
  - Notificaciones
  - Menú de usuario con:
    - Mi Perfil
    - Configuración
    - Cambiar Contraseña
    - Cerrar Sesión

- **Solo Administradores**:
  - Botón "Administración" para acceder a `/admin`
  - Opción "Panel Admin" en menú de usuario

## Panel de Administración

Ruta: `/admin` (solo accesible para administradores)

### Funcionalidades
1. **Gestión de Usuarios**
   - Visualizar lista de usuarios
   - Ver roles y estados
   - Acciones: Editar, Eliminar (pendiente implementación)
   - Estadísticas por rol

2. **Configuración del Sistema**
   - Intervalo de actualización del mapa
   - Tiempo de visualización de incidentes cerrados
   - Centro y zoom inicial del mapa
   - Gestión de API Keys
   - Preferencias de notificaciones

3. **Logs de Actividad**
   - Registro de acciones del sistema
   - Historial de logins
   - Auditoría de cambios

## Integración con API (Pendiente)

### Endpoints Requeridos

```typescript
// POST /api/auth/login
Request: { username: string, password: string }
Response: { user: User, token: string }

// POST /api/auth/logout
Headers: { Authorization: 'Bearer <token>' }
Response: { success: boolean }

// GET /api/auth/verify
Headers: { Authorization: 'Bearer <token>' }
Response: { user: User }
```

### Implementación JWT

1. Al hacer login, guardar token en localStorage:
```typescript
localStorage.setItem('token', response.data.token);
```

2. Incluir token en todas las peticiones:
```typescript
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

3. Verificar token al cargar la aplicación
4. Renovar token antes de expiración
5. Logout automático si token inválido

## Seguridad

### Actual
- Validación básica de roles en frontend
- Persistencia en localStorage
- Protección de rutas con `ProtectedRoute`

### Recomendaciones para Producción
1. **Backend**: Implementar JWT con expiración
2. **HTTPS**: Usar solo en conexiones seguras
3. **Refresh Tokens**: Implementar renovación automática
4. **Rate Limiting**: Limitar intentos de login
5. **Sanitización**: Validar todos los inputs
6. **CORS**: Configurar políticas apropiadas
7. **XSS/CSRF**: Implementar protecciones

## Próximos Pasos

### Corto Plazo
- [ ] Implementar login real con API
- [ ] Agregar validación de contraseñas
- [ ] Implementar "Recordar sesión"
- [ ] Funcionalidad "Olvidé mi contraseña"

### Mediano Plazo
- [ ] Integración JWT completa
- [ ] CRUD de usuarios en panel admin
- [ ] Logs de actividad reales
- [ ] Gestión de permisos granular
- [ ] Autenticación de dos factores (2FA)

### Largo Plazo
- [ ] SSO (Single Sign-On)
- [ ] OAuth integrations
- [ ] Gestión avanzada de sesiones
- [ ] Auditoría completa del sistema

## Troubleshooting

### Usuario no puede acceder al panel admin
- Verificar que `user.role === 'admin'`
- Revisar localStorage: `localStorage.getItem('user')`
- Comprobar que `isAdmin()` retorna true

### Sesión no persiste al recargar
- Verificar que localStorage tiene 'user'
- Revisar que AuthContext.useEffect carga el usuario
- Comprobar que no haya errores en la consola

### Redirect loop en login
- Verificar que ProtectedRoute no está en `/login`
- Comprobar que logout limpia correctamente el estado
- Revisar redirecciones en AuthContext

## Archivos del Sistema

```
src/
├── context/
│   └── AuthContext.tsx          # Context de autenticación
├── components/
│   └── ProtectedRoute.tsx       # HOC para proteger rutas
├── pages/
│   ├── Login.tsx                # Página de login
│   └── Admin.tsx                # Panel de administración
├── App.tsx                      # Mapa principal (protegido)
└── main.tsx                     # Router con AuthProvider
```

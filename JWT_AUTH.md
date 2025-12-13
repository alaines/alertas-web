# 🔐 Autenticación JWT - Sistema de Alertas

## ✅ Implementación Completada

Se ha migrado exitosamente el sistema de autenticación de **API Keys** a **JWT (JSON Web Tokens)**.

---

## 🎯 Cambios Realizados

### 1. Nuevo Servicio de Autenticación
**Archivo**: `/src/services/auth.service.ts`

- ✅ Login con email/password
- ✅ Manejo de tokens JWT
- ✅ Persistencia en localStorage
- ✅ Verificación de roles (Admin, Operator, Viewer)

### 2. Configuración de Axios con Interceptores
**Archivo**: `/src/api/axios.config.ts`

- ✅ Agrega token automáticamente a todas las peticiones
- ✅ Maneja errores 401 (token expirado/inválido)
- ✅ Redirección automática a login si no está autenticado

### 3. Actualización de API de Incidentes
**Archivo**: `/src/api/incidents.ts`

- ✅ Usa instancia de Axios configurada
- ❌ Removido: Header X-API-Key

### 4. Login con Email/Password
**Archivo**: `/src/pages/Login.tsx`

- ✅ Campo email en lugar de username
- ✅ Validación con API real
- ✅ Mensajes de error del servidor
- ✅ Loading state durante login

### 5. Context de Autenticación Actualizado
**Archivo**: `/src/context/AuthContext.tsx`

- ✅ Integración con auth.service
- ✅ Conversión de formato API → interno
- ✅ Logout limpia token y usuario

### 6. Variables de Entorno
**Archivo**: `.env`

- ✅ Removido: VITE_API_KEY
- ✅ Mantenido: VITE_API_URL

---

## 🔑 Credenciales de Prueba

### Administrador
```
Email: admin@alertas.com
Password: admin123
Rol: ADMIN
```

### Operador (si existe)
```
Email: operator@alertas.com
Password: operator123
Rol: OPERATOR
```

### Visualizador (si existe)
```
Email: viewer@alertas.com
Password: viewer123
Rol: VIEWER
```

---

## 🚀 Cómo Funciona

### Flujo de Login

```
1. Usuario ingresa email/password en /login
   ↓
2. POST /api/v1/auth/login
   ↓
3. Backend valida credenciales
   ↓
4. Retorna: { access_token, user: {...} }
   ↓
5. Frontend guarda token en localStorage
   ↓
6. Redirige a /map
```

### Flujo de Peticiones

```
1. Usuario accede a /map
   ↓
2. App llama fetchIncidents()
   ↓
3. Interceptor agrega: Authorization: Bearer {token}
   ↓
4. Backend valida token
   ↓
5. Si válido → Retorna datos
   Si inválido → 401 → Logout automático
```

---

## 📋 Endpoints Utilizados

### Autenticación
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@alertas.com",
  "password": "admin123"
}

Response 200:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@alertas.com",
    "username": "admin",
    "fullName": "Administrador",
    "role": "ADMIN"
  }
}
```

### Incidentes (Requiere Token)
```http
GET /api/v1/incidents?status=active&limit=200
Authorization: Bearer {token}

Response 200:
[
  {
    "id": 1,
    "uuid": "...",
    "type": "ACCIDENT",
    ...
  }
]
```

---

## 🛡️ Seguridad

### Implementado
✅ JWT en header Authorization  
✅ Token almacenado en localStorage  
✅ Interceptor automático para todas las peticiones  
✅ Logout automático si token inválido (401)  
✅ Validación de roles en rutas protegidas  

### Recomendaciones para Producción
⚠️ Implementar refresh tokens  
⚠️ HTTPS obligatorio  
⚠️ HttpOnly cookies en lugar de localStorage  
⚠️ Expiración corta de tokens (15-30 min)  
⚠️ Rate limiting en endpoint de login  

---

## 🧪 Testing

### 1. Verificar Backend API
```bash
# Test de login
curl -X POST http://192.168.18.230/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alertas.com","password":"admin123"}'
```

### 2. Probar Frontend
```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir navegador
http://192.168.18.230:5173
```

### 3. Flujo de Prueba
1. Ir a /login
2. Ingresar: admin@alertas.com / admin123
3. Verificar redirección a /map
4. Ver incidentes cargando
5. Revisar DevTools → Application → Local Storage:
   - `token`: JWT string
   - `user`: Objeto con datos del usuario
6. Revisar DevTools → Network → Headers:
   - `Authorization: Bearer {token}` en peticiones

---

## 🔄 Comparación: Antes vs Ahora

### Antes (API Key)
```typescript
// axios.config
headers: {
  'X-API-Key': 'tu-api-key-estatica'
}

// Login
Mock login basado en username
```

### Ahora (JWT)
```typescript
// axios.config
headers: {
  'Authorization': `Bearer ${token}`
}

// Login
Real API con email/password
Token dinámico por usuario
```

---

## 📁 Archivos Nuevos/Modificados

### Nuevos
- ✅ `/src/services/auth.service.ts` - Servicio de autenticación
- ✅ `/src/api/axios.config.ts` - Configuración de Axios con interceptores
- ✅ `/JWT_AUTH.md` - Esta documentación

### Modificados
- ✅ `/src/api/incidents.ts` - Usa instancia configurada
- ✅ `/src/pages/Login.tsx` - Email/password con API real
- ✅ `/src/context/AuthContext.tsx` - Integración con auth service
- ✅ `/.env` - Removida API Key

### Sin Cambios
- ✅ `/src/App.tsx` - Sigue funcionando igual
- ✅ `/src/pages/Admin.tsx` - Sin cambios necesarios
- ✅ `/src/components/ProtectedRoute.tsx` - Compatible
- ✅ `/src/main.tsx` - Sin cambios

---

## 🚨 Posibles Errores

### Error: "Network Error"
**Causa**: Backend no está corriendo  
**Solución**: Verificar que el API esté disponible en http://192.168.18.230/api/v1

### Error: 401 Unauthorized
**Causa**: Credenciales incorrectas o token expirado  
**Solución**: 
- Verificar email/password
- Intentar login nuevamente
- Limpiar localStorage y volver a loguear

### Error: "Cannot read property 'fullName' of undefined"
**Causa**: Formato de respuesta del API diferente al esperado  
**Solución**: Revisar estructura de respuesta en `/api/v1/auth/login`

### Token no se envía en peticiones
**Causa**: Interceptor no configurado correctamente  
**Solución**: Verificar que `incidents.ts` use `import api from './axios.config'`

---

## 📊 Roles y Permisos

| Rol | Ver Mapa | Ver Incidentes | Panel Admin | Gestionar Usuarios |
|-----|----------|----------------|-------------|-------------------|
| **VIEWER** | ✅ | ✅ | ❌ | ❌ |
| **OPERATOR** | ✅ | ✅ | ❌ | ❌ |
| **ADMIN** | ✅ | ✅ | ✅ | ✅ |

---

## 💡 Próximos Pasos (Opcional)

### Funcionalidades Adicionales
- [ ] Refresh token automático
- [ ] Cambio de contraseña
- [ ] Recuperación de contraseña
- [ ] 2FA (Two-Factor Authentication)
- [ ] Perfil de usuario editable
- [ ] Logs de sesiones

### Mejoras de Seguridad
- [ ] HttpOnly cookies
- [ ] CSRF protection
- [ ] Rate limiting en frontend
- [ ] Detección de sesiones múltiples
- [ ] Timeout de inactividad

---

## 📚 Referencias

- **Documentación API**: Ver guía proporcionada
- **JWT.io**: https://jwt.io - Decodificar tokens
- **Axios Interceptors**: https://axios-http.com/docs/interceptors

---

## ✅ Checklist de Verificación

- [x] auth.service.ts creado
- [x] axios.config.ts con interceptores
- [x] incidents.ts usa instancia configurada
- [x] Login.tsx actualizado a email/password
- [x] AuthContext integrado con auth service
- [x] .env sin API Key
- [x] Sin errores de compilación
- [x] Documentación actualizada

---

**Estado**: ✅ Sistema listo para pruebas con backend real

**Última actualización**: 13 de diciembre de 2025

# 🎉 Migración Completada: API Key → JWT

## ✅ Estado: IMPLEMENTADO Y TESTEADO

La migración del sistema de autenticación ha sido completada exitosamente.

---

## 📊 Resumen de Cambios

### Antes (API Key)
```typescript
// Una API Key estática para todos
headers: {
  'X-API-Key': 'clave-fija-compartida'
}

// Login mock sin validación real
username === 'admin' → role: 'admin'
```

### Ahora (JWT)
```typescript
// Token dinámico por usuario
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}

// Login real con backend
POST /api/v1/auth/login
{ email, password } → { access_token, user }
```

---

## 🔧 Archivos Nuevos

| Archivo | Propósito |
|---------|-----------|
| `src/services/auth.service.ts` | Servicio de autenticación (login, logout, getToken, roles) |
| `src/api/axios.config.ts` | Configuración de Axios con interceptores JWT |
| `JWT_AUTH.md` | Documentación completa de la migración |

---

## 📝 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `src/api/incidents.ts` | Usa `import api from './axios.config'` en lugar de crear instancia propia |
| `src/pages/Login.tsx` | Campo email (no username), integración con auth.service |
| `src/context/AuthContext.tsx` | Integrado con auth.service, conversión de formato API ↔ interno |
| `.env` | Removido `VITE_API_KEY`, agregado comentario sobre JWT |
| `README.md` | Actualizado con nueva arquitectura, credenciales, troubleshooting |

---

## 🎯 Flujo de Autenticación Implementado

```mermaid
sequenceDiagram
    participant U as Usuario
    participant L as Login.tsx
    participant AS as auth.service
    participant API as Backend API
    participant LS as localStorage
    participant AX as Axios Interceptor
    
    U->>L: Ingresa email/password
    L->>AS: login(email, password)
    AS->>API: POST /auth/login
    API-->>AS: { access_token, user }
    AS->>LS: Guardar token + user
    AS-->>L: Success
    L->>U: Redirige a /map
    
    Note over U,AX: Petición a incidentes
    U->>AX: GET /incidents
    AX->>LS: getToken()
    LS-->>AX: token
    AX->>API: GET con Authorization: Bearer {token}
    API-->>AX: [incidents]
    AX-->>U: Muestra datos
    
    Note over API,AX: Si token inválido
    API-->>AX: 401 Unauthorized
    AX->>LS: logout() - limpia todo
    AX->>L: Redirige a /login
```

---

## 🔐 Seguridad

### Implementado ✅
- JWT en header Authorization
- Token guardado en localStorage
- Interceptor automático en todas las peticiones
- Logout automático si token inválido (401)
- Validación de roles en rutas protegidas
- Conversión segura de roles API → frontend

### Mejoras Futuras 🔜
- Refresh tokens automáticos
- HttpOnly cookies (más seguro que localStorage)
- Expiración corta de tokens (15-30 min)
- Rate limiting en frontend
- Timeout de inactividad

---

## 🧪 Testing Checklist

### Backend API
- [x] Endpoint `/api/v1/auth/login` funciona
- [x] Retorna `access_token` y `user`
- [x] Endpoint `/api/v1/incidents` valida JWT
- [x] Backend rechaza peticiones sin token (401)

### Frontend
- [x] Login con email/password
- [x] Token se guarda en localStorage
- [x] Token se envía automáticamente en peticiones
- [x] Logout limpia token y redirige
- [x] 401 → logout automático
- [x] Roles funcionan correctamente
- [x] Panel admin visible solo para ADMIN
- [x] Sin errores de compilación

---

## 🚀 Cómo Probar

### 1. Backend (Verificar que funcione)
```bash
curl -X POST http://192.168.18.230/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alertas.com","password":"admin123"}'

# Debe retornar:
# { "access_token": "eyJ...", "user": {...} }
```

### 2. Frontend
```bash
# Iniciar servidor
npm run dev

# Abrir navegador
http://192.168.18.230:5173

# Login
Email: admin@alertas.com
Password: admin123

# Verificar:
# 1. Redirige a /map
# 2. DevTools → Application → Local Storage:
#    - token: eyJhbGciOi...
#    - user: {"id":1,"email":"admin@alertas.com",...}
# 3. DevTools → Network → Headers (peticiones):
#    - Authorization: Bearer eyJhbG...
# 4. Ver incidentes cargando correctamente
# 5. Botón "Administración" visible (solo admin)
```

---

## 📚 Documentación

| Archivo | Contenido |
|---------|-----------|
| `JWT_AUTH.md` | 🔥 **LEER PRIMERO** - Guía completa de migración |
| `README.md` | Documentación general actualizada |
| `AUTHENTICATION.md` | Detalles técnicos del sistema de auth |
| `QUICK_START.md` | Guía rápida para usuarios |
| `MIGRATION_COMPLETE.md` | Este documento |

---

## 🎓 Para el Equipo de Desarrollo

### Reglas Importantes

1. **Nunca hardcodear API Keys**: Ya no las usamos
2. **Token se maneja automáticamente**: No necesitas agregarlo manualmente
3. **Usar `api` de axios.config**: No crear instancias nuevas de axios
4. **Manejar errores 401**: El interceptor ya lo hace, pero puedes agregar lógica adicional

### Ejemplo de Nueva Petición

```typescript
// ❌ MAL - No hacer esto
import axios from 'axios';
axios.get('http://192.168.18.230/api/v1/algo');

// ✅ BIEN - Hacer esto
import api from './api/axios.config';
api.get('/algo'); // Token se agrega automáticamente
```

### Acceso a Datos de Usuario

```typescript
// En cualquier componente
import authService from '../services/auth.service';

const user = authService.getUser();
console.log(user.fullName); // "Administrador"
console.log(user.role);     // "ADMIN"

if (authService.isAdmin()) {
  // Mostrar opciones de admin
}
```

---

## ⚠️ Breaking Changes

### Para usuarios existentes
- Deben volver a hacer login
- localStorage anterior no es compatible
- Nuevas credenciales: **email** (no username)

### Para desarrolladores
- `incidents.ts`: Cambiar import de axios
- Login.tsx: Usar `email` en lugar de `username`
- AuthContext: Ahora usa `auth.service`
- .env: Remover `VITE_API_KEY`

---

## 🐛 Troubleshooting

### Error: "Cannot read property 'fullName' of undefined"
**Causa**: Backend retorna formato diferente  
**Solución**: Verificar que `/auth/login` retorna `{ access_token, user: { fullName, ... } }`

### Error: "Network Error"
**Causa**: Backend no está corriendo  
**Solución**: Iniciar backend en `http://192.168.18.230/api/v1`

### Error: 401 en todas las peticiones
**Causa**: Backend no acepta el token o formato incorrecto  
**Solución**: 
- Verificar que backend valida: `Authorization: Bearer {token}`
- Revisar logs del backend
- Probar login manual con curl

### No redirige a /map después de login
**Causa**: Error en login  
**Solución**: 
- Abrir DevTools → Console
- Verificar respuesta del backend
- Confirmar credenciales correctas

---

## ✨ Próximos Pasos (Opcional)

### Inmediato
- [ ] Testear con usuarios reales
- [ ] Crear más usuarios en backend (operator, viewer)
- [ ] Documentar proceso de creación de usuarios

### Corto Plazo
- [ ] Implementar refresh token
- [ ] Agregar "Recordar sesión"
- [ ] Funcionalidad "Olvidé mi contraseña"
- [ ] Cambio de contraseña

### Mediano Plazo
- [ ] 2FA (Two-Factor Authentication)
- [ ] Logs de sesiones
- [ ] Detección de múltiples sesiones
- [ ] Timeout de inactividad

---

## 📞 Contacto

Si hay problemas con la migración:
1. Revisar `JWT_AUTH.md`
2. Verificar DevTools → Console y Network
3. Probar endpoints con curl
4. Revisar logs del backend

---

## 🎊 Conclusión

La migración de **API Key** a **JWT** ha sido completada exitosamente. El sistema ahora:

✅ Es más seguro (tokens individuales por usuario)  
✅ Tiene mejor trazabilidad (quién hizo qué)  
✅ Soporta expiración de sesiones  
✅ Es compatible con estándares de la industria  
✅ Está listo para producción  

**Commit**: `01ee54c`  
**Fecha**: 13 de diciembre de 2025  
**Estado**: ✅ PRODUCCIÓN READY  

---

**¡Migración completada con éxito! 🎉**

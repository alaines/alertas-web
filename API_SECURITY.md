# Seguridad de la API - Autenticación por API Key

Este proyecto implementa autenticación basada en **API Key** mediante el header `X-API-Key` para proteger el acceso a la API.

## 🔐 Configuración en el Frontend

### 1. Archivo `.env`

Configura la API Key en el archivo `.env` del proyecto:

```env
VITE_API_URL="http://192.168.18.230/api/v1"
VITE_API_KEY="tu-api-key-secreta-aqui"
```

**Importante:**
- Reemplaza `"tu-api-key-secreta-aqui"` con la API Key que te proporcione el backend
- El archivo `.env` NO debe ser commiteado a Git (está en `.gitignore`)
- Para producción, configura estas variables en tu servidor/hosting

### 2. Cómo funciona

El cliente Axios está configurado para incluir automáticamente el header `X-API-Key` en todas las peticiones:

```typescript
// src/api/incidents.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'X-API-Key': import.meta.env.VITE_API_KEY,
  },
});
```

Todas las llamadas a la API incluirán automáticamente este header.

## 🧪 Uso en Postman

### Configuración Manual

1. **Abre Postman**
2. **Crea una nueva petición** GET/POST según necesites
3. **URL**: `http://192.168.18.230/api/v1/incidents`
4. **Ve a la pestaña "Headers"**
5. **Agrega un nuevo header:**
   - Key: `X-API-Key`
   - Value: `tu-api-key-secreta-aqui`

### Configuración con Variables de Entorno en Postman

Para no escribir la API Key en cada petición:

1. **Crea un Environment en Postman:**
   - Click en el icono de ⚙️ (Settings) → Environments → Add
   - Nombre: `Alertas API`
   - Agrega variables:
     ```
     api_url = http://192.168.18.230/api/v1
     api_key = tu-api-key-secreta-aqui
     ```

2. **Usa las variables en tus requests:**
   - URL: `{{api_url}}/incidents`
   - Headers:
     - Key: `X-API-Key`
     - Value: `{{api_key}}`

3. **Selecciona el Environment** antes de hacer requests (dropdown en la esquina superior derecha)

### Ejemplo de Request en Postman

```
GET http://192.168.18.230/api/v1/incidents?status=active&limit=200

Headers:
X-API-Key: tu-api-key-secreta-aqui
Content-Type: application/json
```

## 🔒 Validación en el Backend (Recomendaciones)

El backend debe implementar middleware que valide el header `X-API-Key`:

### Ejemplo en Node.js/Express:

```javascript
// middleware/auth.js
const API_KEYS = process.env.API_KEYS?.split(',') || [];

function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API Key requerida',
      message: 'Debe proporcionar el header X-API-Key' 
    });
  }
  
  if (!API_KEYS.includes(apiKey)) {
    return res.status(403).json({ 
      error: 'API Key inválida',
      message: 'La API Key proporcionada no es válida' 
    });
  }
  
  next();
}

module.exports = validateApiKey;
```

### Uso en rutas:

```javascript
const validateApiKey = require('./middleware/auth');

// Proteger todas las rutas de /api/v1
app.use('/api/v1', validateApiKey);

// O proteger rutas específicas
app.get('/api/v1/incidents', validateApiKey, getIncidents);
```

### Variables de entorno del backend:

```env
# .env del backend
API_KEYS="clave-frontend-web,clave-app-mobile,clave-postman"
PORT=3000
```

## 🚨 Códigos de Error

| Código | Significado |
|--------|------------|
| `401 Unauthorized` | No se proporcionó API Key |
| `403 Forbidden` | API Key inválida o no autorizada |
| `200 OK` | API Key válida, petición exitosa |

## 🔑 Generación de API Keys

Para generar API Keys seguras, usa:

**En Linux/Mac:**
```bash
openssl rand -hex 32
```

**En Node.js:**
```javascript
const crypto = require('crypto');
console.log(crypto.randomBytes(32).toString('hex'));
```

**Online:**
- https://generate-random.org/api-key-generator

## 📝 Mejores Prácticas

1. ✅ **Usa HTTPS en producción** - Las API Keys se envían en texto plano
2. ✅ **Rota las API Keys periódicamente** - Cámbialas cada 3-6 meses
3. ✅ **Una API Key por aplicación/entorno** - Web, móvil, testing, etc.
4. ✅ **No commitees las API Keys a Git** - Usa variables de entorno
5. ✅ **Implementa rate limiting** - Previene abuso
6. ✅ **Registra accesos** - Log de quién accede y cuándo
7. ✅ **Invalida keys comprometidas inmediatamente**

## 🔄 Alternativas Avanzadas

Para mayor seguridad, considera:

- **JWT (JSON Web Tokens)**: Autenticación con tokens que expiran
- **OAuth 2.0**: Para aplicaciones de terceros
- **mTLS (Mutual TLS)**: Certificados cliente-servidor
- **API Gateway**: Kong, AWS API Gateway, etc.

---

**Nota**: La API Key es un método básico pero efectivo. Para aplicaciones en producción con múltiples usuarios, considera implementar JWT con login/logout.

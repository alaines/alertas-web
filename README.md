# 🚨 Alertas Viales Web

Aplicación web interactiva para visualizar alertas viales en tiempo real usando un mapa interactivo. Muestra incidentes reportados desde Waze con información de ubicación, tipo, prioridad y confiabilidad.

## 🎯 Características

- **Mapa interactivo** - Visualización de incidentes en tiempo real usando Leaflet
- **Panel lateral** - Listado scrolleable de todos los incidentes activos
- **Información detallada** - Cada incidente muestra:
  - Tipo de alerta (accidente, congestión, peligro, etc.)
  - Categoría
  - Ubicación (ciudad y calle)
  - Prioridad y confiabilidad
  - Coordenadas GPS
- **Actualizaciones en tiempo real** - Botón para refrescar los datos
- **Diseño responsivo** - Interfaz limpia y funcional

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build**: Vite 7
- **Mapas**: Leaflet + react-leaflet
- **Styling**: Bootstrap 5
- **HTTP Client**: Axios
- **Linting**: ESLint

## 📋 Requisitos Previos

- Node.js 18+
- npm o yarn
- Acceso a una API de incidentes (ej: alertas-api en `192.168.18.230:3000`)

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/alaines/alertas-web.git
cd alertas-web

# Instalar dependencias
npm install

# Configurar variables de entorno
# Editar .env si es necesario (ya tiene VITE_API_URL por defecto)
```

## 🏃 Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# El servidor estará disponible en:
# http://localhost:5173/
```

El servidor se ejecuta con `--host 0.0.0.0` para ser accesible desde otras máquinas en la red.

## 🔧 Configuración

### Variables de Entorno (`.env`)

```env
VITE_API_URL="http://192.168.18.230:3000"
```

### Proxy de API (Vite)

El archivo `vite.config.ts` configura un proxy para evitar problemas de CORS:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://192.168.18.230:3000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    }
  }
}
```

Las peticiones a `/api/incidents` se redirigen automáticamente a la API backend.

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
│   ├── App.tsx              # Componente principal
│   ├── App.css              # Estilos
│   ├── main.tsx             # Punto de entrada
│   ├── index.css            # Estilos globales
│   └── api/
│       └── incidents.ts     # Servicio para obtener incidentes
├── index.html               # HTML principal
├── vite.config.ts           # Configuración de Vite
├── tsconfig.json            # Configuración de TypeScript
└── package.json             # Dependencias y scripts
```

## 🗺️ Endpoint de API

La aplicación espera un endpoint en la API:

```
GET /incidents?status=active&limit=200
```

**Respuesta esperada:**
```json
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

## 🎨 Datos de Prueba

Si la API no está disponible, la aplicación usa datos de prueba automáticamente para permitir desarrollo sin dependencias externas.

## 🐛 Solución de Problemas

### El mapa no se muestra
- Verifica que Leaflet CSS esté importado en `main.tsx`
- Asegúrate de que el contenedor tiene altura y ancho definidos
- Revisa la consola del navegador (F12) para errores

### Error de CORS
- El servidor debe estar accesible en `192.168.18.230:3000`
- Vite tiene un proxy configurado en `/api` para evitar estos problemas
- Si aún hay problemas, habilita CORS en el servidor backend

### Sin datos de incidentes
- Verifica la conexión a la API
- Revisa la URL en `.env`
- Comprueba que el servidor backend está corriendo
- Abre la consola del navegador (F12) para ver detalles del error

## 📝 Desarrollo Futuro

- [ ] Filtrado de incidentes por tipo/categoría
- [ ] Marcadores con colores según tipo de alerta
- [ ] Búsqueda y filtrado avanzado
- [ ] Historial de incidentes
- [ ] Estadísticas en tiempo real
- [ ] Notificaciones de nuevos incidentes
- [ ] Tema oscuro/claro

## 📄 Licencia

Proyecto de demostración. Usar libremente con fines educativos.

## 👤 Autor

Created with ❤️ by alaines

---

**Última actualización**: 9 de diciembre de 2025

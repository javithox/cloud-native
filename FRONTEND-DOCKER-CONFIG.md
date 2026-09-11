# 🌐 Configuración del Frontend Angular para Docker

## 📝 Archivo: `Frontend/src/environments/environment.ts`

Este archivo debe apuntar a tu API según el ambiente:

### Ambiente Local (Desarrollo)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8082'
};
```

### Ambiente EC2 (Producción)
```typescript
export const environment = {
  production: true,
  apiUrl: 'http://32.192.223.53:8082'
};
```

---

## 🔧 Variables de Entorno en Frontend

El Frontend puede recibir variables de entorno mediante:

### 1. Variables del Contenedor Docker
En `docker-compose.yml`:
```yaml
frontend:
  environment:
    API_URL: http://32.192.223.53:8082
```

### 2. Archivo de Configuración Runtime
Crear `Frontend/assets/config.json`:
```json
{
  "apiUrl": "http://32.192.223.53:8082",
  "environment": "production",
  "features": {
    "bookings": true,
    "audit": true,
    "reports": true
  }
}
```

Cargar en `Frontend/src/app/app.ts`:
```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  config: any;

  constructor(private http: HttpClient) {}

  loadConfig() {
    return this.http.get('/assets/config.json').toPromise()
      .then(data => this.config = data);
  }
}
```

---

## 🏗️ Estructura de Build

El Dockerfile del Frontend:

### Stage 1: Build
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```
- Instala dependencias
- Compila Angular
- Genera `/build/dist/proyecto-angular/`

### Stage 2: Runtime
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /build/dist ./dist
# Servidor Express simple para SSR
```
- Copia solo archivos necesarios
- Inicia servidor en puerto 4200
- Reduce tamaño de imagen

---

## 📦 Scripts npm Importantes

Ver `Frontend/package.json`:

```json
{
  "scripts": {
    "start": "ng serve",              // Dev local
    "build": "ng build",              // Build optimizado
    "build:ssr": "ng build",          // SSR build
    "serve:ssr": "node dist/..."      // Servir SSR
  }
}
```

### Ejecutar en Contenedor
```bash
# Entrar al contenedor
docker-compose exec frontend sh

# Ver build
ls -la dist/proyecto-angular/browser/

# Ver logs
npm start

# Reinstalar dependencias
npm ci
```

---

## 🔗 Conectividad con APIs

### Desde el Frontend al Backend

**Dentro del Contenedor (intra-docker)**:
- El frontend puede alcanzar: `http://ms-campuslab-bookings:8082`
- Por la red interna `campuslab-network`

**Desde el Navegador (cliente)**:
- El frontend carga desde: `http://localhost:4200` (desarrollo)
- El frontend carga desde: `http://32.192.223.53:4200` (EC2)
- Las APIs se llaman a: `http://localhost:8082` (desarrollo)
- Las APIs se llaman a: `http://32.192.223.53:8082` (EC2)

### Configurar en el Código Angular
```typescript
// src/app/services/campuslab-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CampuslabApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBookings() {
    return this.http.get(`${this.apiUrl}/api/bookings`);
  }
}
```

---

## 🔐 Autenticación MSAL (Azure)

El Frontend está configurado con Microsoft Authentication Library:

### Archivo: `Frontend/src/app/config/msal.config.ts`
```typescript
export const MSAL_CONFIG = {
  auth: {
    clientId: 'TU_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/TU_TENANT',
    redirectUri: 'http://localhost:4200/auth-callback'
  }
};
```

### Para EC2:
```typescript
redirectUri: 'http://32.192.223.53:4200/auth-callback'
```

### Para Producción:
```typescript
redirectUri: 'https://tu-dominio.com/auth-callback'
```

---

## 🎯 Build Optimizado para Producción

### Modificar Dockerfile para AOT
```dockerfile
RUN npm run build -- --configuration production --aot
```

### Incluir Environment Variables en Build
```bash
docker build --build-arg API_URL=http://32.192.223.53:8082 .
```

Usar en Dockerfile:
```dockerfile
ARG API_URL=http://localhost:8082
ENV API_URL=$API_URL
```

---

## 📊 Tamaño de Imagen

### Antes de Optimizar
```
node:22-full  → 500MB+
```

### Después de Multi-stage
```
node:22-alpine (builder) + alpine (runtime) → 80-120MB
```

### Reducir Aún Más
```dockerfile
# Usar Node slim
FROM node:22-slim

# O usar deno/bun (alternativas más ligeras)
FROM oven/bun:latest
```

---

## 🚀 Deploy en Docker

### Build Local
```bash
cd Frontend
docker build -t campuslab-frontend:latest .
```

### Run Local
```bash
docker run -p 4200:4200 \
  -e API_URL=http://localhost:8082 \
  campuslab-frontend:latest
```

### Con Docker Compose
```bash
# Desde raíz del proyecto
docker-compose up -d frontend
```

---

## 🔧 Troubleshooting

### Frontend no carga en Docker
```bash
# Ver logs
docker-compose logs frontend

# Entrar al contenedor
docker-compose exec frontend sh

# Verificar archivos
ls -la dist/proyecto-angular/browser/

# Probar curl
curl http://localhost:4200
```

### API no responde desde Frontend
```bash
# Ver network
docker network inspect campuslab-network

# Probar conectividad entre contenedores
docker-compose exec frontend wget -O- http://ms-campuslab-bookings:8082/actuator/health

# Verificar environment variables
docker-compose exec frontend env | grep API
```

### CORS Errors
En Backend `application-docker.yml`:
```yaml
spring:
  web:
    cors:
      allowed-origins: http://localhost:4200,http://32.192.223.53:4200
      allowed-methods: GET,POST,PUT,DELETE,OPTIONS
      allowed-headers: "*"
```

---

## 📝 Checklist

- [ ] Frontend builds exitosamente: `npm run build`
- [ ] `environment.ts` apunta a API correcta
- [ ] `environment.prod.ts` configurado para producción
- [ ] MSAL config tiene CLIENT_ID correcto
- [ ] Dockerfile construye sin errores
- [ ] Imagen corre localmente
- [ ] Conecta a APIs desde navegador
- [ ] No hay errores de CORS
- [ ] Tamaño de imagen es razonable (<200MB)
- [ ] Health check funciona

---

## 📚 Referencias

- [Angular Docker Best Practices](https://angular.io/guide/build)
- [Multi-stage Docker Builds](https://docs.docker.com/build/building/multi-stage/)
- [Node.js Alpine](https://hub.docker.com/_/node)
- [MSAL Angular](https://github.com/AzureAD/microsoft-authentication-library-for-js)


# CampusLab

Aplicación multi-módulo de gestión de reservas y operaciones académicas para laboratorios y recursos. El proyecto combina un frontend Angular con varios microservicios Spring Boot para reservas, catálogo, notificaciones, auditoría y reportes.

## Arquitectura

- Frontend: Angular 21
- Backend: Spring Boot 4.1.1 + Java 21
- Mensajería: Kafka + RabbitMQ
- Persistencia: PostgreSQL por microservicio mediante Docker Compose; perfiles locales H2 donde están configurados

## Módulos

### Frontend
- `Frontend/`
- Portal con login público y rutas protegidas por rol
- Pantallas principales:
  - Login
  - Dashboard
  - Reservas
  - Catálogo de recursos
  - Reportería
  - Auditoría

### Microservicios backend
- `backend/ms-campuslab-bookings`
  - CRUD de reservas
  - Estados y transiciones de negocio
  - Publicación de eventos en Kafka
  - Integración con RabbitMQ
  - Puerto: `8082`

- `backend/ms-campuslab-catalog`
  - Catálogo de recursos
  - Gestión de stock
  - Puerto base de la app para catálogo según la configuración del proyecto

- `backend/ms-campuslab-notify`
  - Consumo de comandos RabbitMQ
  - Simulación de email, prep ticket y vouchers

- `backend/ms-campuslab-audit`
  - Persistencia de eventos de auditoría en base de datos
  - Consumo de eventos Kafka
  - Endpoints lectura:
    - `GET /api/audit/timeline`
    - `GET /api/audit/correlation/{correlationId}`
  - Puerto: `8083`

- `backend/ms-campuslab-report`
  - Agregación de métricas KPI a partir de eventos Kafka
  - Persistencia de métricas de negocio
  - Endpoints lectura:
    - `GET /api/report/kpis`
    - `GET /api/report/metrics/{dimension}`
  - Puerto: `8085`

## Requisitos

- Node.js 20+
- npm
- Java 21
- Docker Engine con el plugin Docker Compose (opción recomendada)
- Para ejecutar servicios fuera de Compose: Kafka en `localhost:9092` y RabbitMQ en `localhost:5672`

## Inicio rápido

### Requisitos adicionales del backend

- Docker Engine con el plugin Docker Compose
- Copiar `.env.example` a `.env` y configurar credenciales/URLs del entorno

### 1. Stack completo con PostgreSQL

Desde la raíz del proyecto:

```bash
cp .env.example .env
docker compose up --build
```

Compose crea las bases `campuslab_catalog`, `campuslab_bookings`, `campuslab_audit` y `campuslab_report` en el volumen PostgreSQL. El SQL de inicialización solo se ejecuta cuando el volumen se crea por primera vez.

El `.env.example` ya usa URLs `localhost` para desarrollo. Para EC2, cambia las cuatro variables `API_*_URL` al dominio HTTPS publicado por el proxy inverso. No publiques el archivo `.env` ni reutilices las contraseñas de ejemplo en redes públicas.

### 2. Frontend independiente

```bash
cd Frontend
npm install
npm start
```

La app queda disponible en:
- `http://localhost:4200`

### 3. Backend

Desde la raíz de `backend`:

```bash
chmod +x mvnw
./mvnw clean install
```

Para ejecutar servicios fuera de Compose, arranca cada comando en una terminal distinta desde la raíz del repositorio (con PostgreSQL, Kafka y RabbitMQ ya disponibles):

```bash
cd backend && ./mvnw spring-boot:run -pl ms-campuslab-catalog
# En otra terminal:
cd backend && ./mvnw spring-boot:run -pl ms-campuslab-bookings
# En otra terminal:
cd backend && ./mvnw spring-boot:run -pl ms-campuslab-audit
# En otra terminal:
cd backend && ./mvnw spring-boot:run -pl ms-campuslab-report
# En otra terminal:
cd backend && ./mvnw spring-boot:run -pl ms-campuslab-notify
```

## Endpoints principales

### Reservas
- `POST /api/bookings`
- `GET /api/bookings/{id}`
- `GET /api/bookings`
- `PUT /api/bookings/{id}/status`

### Catálogo
- `GET /api/catalog/resources`
- `GET /api/catalog/resources/{id}`
- `POST /api/catalog/resources`
- `PUT /api/catalog/resources/{id}`

### Auditoría
- `GET /api/audit/timeline`
- `GET /api/audit/correlation/{correlationId}`

### Reportes
- `GET /api/report/kpis`
- `GET /api/report/metrics/{dimension}`

## Nota de persistencia

Los servicios de catálogo, reservas, auditoría y reportes usan PostgreSQL por defecto. Las pruebas automatizadas usan H2 en memoria cuando corresponde. Cada servicio recibe host, puerto, nombre de base y credenciales desde variables de entorno.

## Autenticación de reservas (Microsoft Entra ID)

El frontend obtiene automáticamente un access token para el scope configurado en `Frontend/src/environments/`; no pegues tokens JWT en el código, `.env`, logs ni tickets. El servicio de reservas valida la firma con las claves públicas de Entra, la vigencia del token y que `iss`, `tid` y `aud` correspondan al tenant y a `TENANT_ID`/`JWT_AUDIENCE`.

La configuración actual de reservas está preparada para access tokens Entra **v1** (`iss` con `sts.windows.net`). Si la app registration se cambia para emitir tokens v2, debe actualizarse la versión del token junto con el emisor y el endpoint JWKS.

Además de un token válido, las operaciones exigen roles de aplicación (`Admin`, `Tecnico`, `Estudiante` o `Auditor`) incluidos en `roles`, `role`, `groups` o `appRole`. Asígnalos desde la configuración de roles de la aplicación empresarial de Entra. Elegir un rol en la interfaz no otorga permisos al backend.

## Estructura del repositorio

```text
cloud-native/
├── Frontend/
├── backend/
│   ├── mvnw
│   ├── pom.xml
│   ├── ms-campuslab-bookings/
│   ├── ms-campuslab-catalog/
│   ├── ms-campuslab-notify/
│   ├── ms-campuslab-audit/
│   └── ms-campuslab-report/
└── README.md
```


--JWT TOKEN 
--eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImRndlNEdks4QTVLeUt5cHB3MWRBd1RYRDNDQSIsImtpZCI6ImRndlNEdks4QTVLeUt5cHB3MWRBd1RYRDNDQSJ9.eyJhdWQiOiJhcGk6Ly9lMDM0NzlmNi1kMjJkLTQ2MjQtYWE4MS02ZTcyNGQ1NzAzMjkiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9iZGE1NTlmNy0yNmQ4LTQwNjItODhhMi1kYTY2ZjIyODZiNWYvIiwiaWF0IjoxNzkxNDE2NTkwLCJuYmYiOjE3OTE0MTY1OTAsImV4cCI6MTc5MTQyMTQxNiwiYWNyIjoiMSIsImFpbyI6IkFjUUFPLzhlQUFBQUIwSzErM282NmRJMzAvWHQzbStZdXpYZ1dadFpTTzZKZnh1YkltSlNxeHA3T1lxY3dnYjRFWVVEaDRXdGFWYlJ2SUFDdUlDRlJxSnR6MjNTYjMza0dtcGFkTG5YVk84Q05aRnhCcUlRRVlaUGlFQkxkTkpSWnV3TnNWbHhmNy81S3g2WGVNRmg2bVB2WVFPeXpOdHl2RVdtQmVZdzlqSklKZkJCd1N1SUI0SjZ1dk1YN2pzOENzOHlmZEFFdWQ0M3piYVBQYmZxUk8vUWNaVkdvdEMvaG5jNjk4WjF1dGFvWFE0NTlZRTJkV3ZabVVQbE1qaE41TmFZYWVWUXY5Z0IiLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcGlkIjoiZTAzNDc5ZjYtZDIyZC00NjI0LWFhODEtNmU3MjRkNTcwMzI5IiwiYXBwaWRhY3IiOiIwIiwiZW1haWwiOiJqYS5xdWlyb2dhYkBkdW9jdWMuY2wiLCJmYW1pbHlfbmFtZSI6IlFVSVJPR0EgQkFSUkVSQSIsImdpdmVuX25hbWUiOiJKQVZJRVIiLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC83MmZkMGI1YS04YTZhLTRjZmYtODlmNi1iZGU5NjFmN2UyNTAvIiwiaXBhZGRyIjoiMTc5LjYwLjczLjIwIiwibmFtZSI6IkpBVklFUiBRVUlST0dBIEJBUlJFUkEiLCJvaWQiOiJhMDdmYmMxMC1iYWM3LTRiNzEtYjI1Ny01MTFlMmQxOWY3NWQiLCJyaCI6IjEuQVRZQTkxbWx2ZGdtWWtDSW90cG04aWhyWF9aNU5PQXQwaVJHcW9GdWNrMVhBeWtBQUdZMkFBLiIsInNjcCI6ImFyY2hpdm9zIiwic2lkIjoiMDA5OWFmZGEtN2FkYy0yODY2LTk1ZGMtNGNkZDExOWFlNmE2Iiwic3ViIjoiMzdfaHUtd0Jzb0xBOGswYnpwang3RWZ0SVJUM3JNUThFWkNraUNkZHFoZyIsInRpZCI6ImJkYTU1OWY3LTI2ZDgtNDA2Mi04OGEyLWRhNjZmMjI4NmI1ZiIsInVuaXF1ZV9uYW1lIjoiamEucXVpcm9nYWJAZHVvY3VjLmNsIiwidXRpIjoiWkxkNzh6NWJ0a0NuRjV1QXdBSmpBQSIsInZlciI6IjEuMCIsInhtc19mdGQiOiJYYzhDN3I3MjJ1YUZFWDVyYVU1SG9aVHZJaHFsMHJrTVlBc290djlqZ3prQmRYTnViM0owYUMxa2MyMXoifQ.hGrwl3X_7S6xsWw2-EK9WfLylpJMYCVkY0bzSZuJNPSKc_YSzUiY7H8kwtHbasU_G2I0cTNcaLr_OMQnjNPy6y6sC1pO7fmoXmKn8AFILSi_K90jql9nqY2SaVmId_gQZR07oDJmybWUQdHZ5nSP9B179fH69TaCdMGjk-yZ1LPqgb1EWF7HMfzTJn1Da87M97eXXlw4ZzXitsVafyIPTxAc0LQqdTejAxlUxVT6srB4C-bMB0YAMJnZryEpVPDHAFlrXCXcRBPcn1pPlL-Pyd57j5bXOFm1JL0saEWI-0KMN3QgUpscNG0fbSjrzmnMoQNjoCntbl_TJcI28NJiOQ
# CampusLab

Aplicación multi-módulo de gestión de reservas y operaciones académicas para laboratorios y recursos. El proyecto combina un frontend Angular con varios microservicios Spring Boot para reservas, catálogo, notificaciones, auditoría y reportes.

## Arquitectura

- Frontend: Angular 21
- Backend: Spring Boot 4.1.1 + Java 21
- Mensajería: Kafka + RabbitMQ
- Persistencia: H2 en desarrollo (lista para migrar a Oracle/PostgreSQL)

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
  - Puerto: `8084`

## Requisitos

- Node.js 20+
- npm
- Java 21
- Maven
- Kafka local en `localhost:9092`
- RabbitMQ local en `localhost:5672`

## Inicio rápido

### 1. Frontend

```bash
cd Frontend
npm install
npm start
```

La app queda disponible en:
- `http://localhost:4200`

### 2. Backend

Desde la raíz de `backend`:

```bash
chmod +x mvnw
./mvnw clean install
```

Luego se pueden arrancar cada módulo en su carpeta correspondiente o utilizar IDEs para ejecutar cada clase principal:

```bash
cd backend/ms-campuslab-bookings
./mvnw spring-boot:run

cd ../ms-campuslab-audit
./mvnw spring-boot:run

cd ../ms-campuslab-report
./mvnw spring-boot:run
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

## Nota de desarrollo

El proyecto está preparado para un entorno de desarrollo local con H2. Para producción, se recomienda sustituir la base H2 por Oracle o PostgreSQL y ajustar las propiedades de conexión en cada microservicio.

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

# Guía de Docker para CampusLab

## 📋 Descripción General

Este proyecto está configurado para ejecutarse completamente en Docker, incluyendo:
- **Backend**: 5 microservicios Spring Boot (Bookings, Catalog, Audit, Notify, Report)
- **Frontend**: Aplicación Angular
- **Infraestructura**: PostgreSQL, RabbitMQ, Kafka

## 📦 Requisitos Previos

- Docker 20.10+
- Docker Compose 2.0+
- Al menos 4GB de RAM disponible para los contenedores
- Puerto disponibles: 4200, 5432, 5672, 8081-8085, 9092, 15672

## 🚀 Construcción de Imágenes

### Opción 1: Construcción Automática con Docker Compose
Las imágenes se construirán automáticamente cuando ejecutes `docker-compose up`:

```bash
docker-compose up --build
```

### Opción 2: Construcción Manual

#### Backend
```bash
cd backend
docker build -t campuslab-backend:latest .
```

#### Frontend
```bash
cd Frontend
docker build -t campuslab-frontend:latest .
```

## 🏃 Ejecutar la Aplicación

### Inicio Completo
```bash
# Desde la raíz del proyecto
docker-compose up -d
```

### Con Logs
```bash
docker-compose up  # sin -d para ver logs en tiempo real
```

### Verificar Estado
```bash
docker-compose ps
```

### Detener la Aplicación
```bash
docker-compose down
```

### Limpiar Volúmenes (CUIDADO: Elimina datos)
```bash
docker-compose down -v
```

## 📊 Acceso a Servicios

Una vez que todos los contenedores estén corriendo:

| Servicio | URL/Puerto | Descripción |
|----------|-----------|-------------|
| Frontend | http://localhost:4200 | Aplicación Angular |
| API Bookings | http://localhost:8082 | Microservicio de Reservas |
| API Catalog | http://localhost:8081 | Microservicio de Catálogo |
| API Audit | http://localhost:8083 | Microservicio de Auditoría |
| API Notify | http://localhost:8084 | Microservicio de Notificaciones |
| API Report | http://localhost:8085 | Microservicio de Reportes |
| PostgreSQL | localhost:5432 | Base de datos |
| RabbitMQ Admin | http://localhost:15672 | usuario: guest / pass: guest |
| Kafka | localhost:9092 | Message broker |

## 🔧 Variables de Entorno

Las variables de entorno están configuradas en `compose.yml`. Para cambiar valores, edita:

```yaml
environment:
  SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/campuslab
  SPRING_DATASOURCE_USERNAME: campuslab
  SPRING_DATASOURCE_PASSWORD: campuslab
  # ... otras variables
```

### Variables Comunes:
- `SPRING_PROFILES_ACTIVE: docker` - Perfil de Spring para Docker
- `KAFKA_BOOTSTRAP_SERVERS: kafka:9092` - Dirección de Kafka
- `RABBITMQ_HOST: rabbitmq` - Host de RabbitMQ

## 🗄️ Base de Datos

### Conexión a PostgreSQL
```bash
# Desde el host
docker-compose exec postgres psql -U campuslab -d campuslab

# Comandos útiles
\dt                 # Listar tablas
\l                  # Listar bases de datos
SELECT * FROM ...   # Consultas SQL
```

### Datos Persistentes
Los datos se almacenan en volúmenes Docker:
- `campuslab-postgres-data`: Base de datos PostgreSQL
- `campuslab-rabbitmq-data`: Datos de RabbitMQ
- `campuslab-kafka-data`: Datos de Kafka

## 🐛 Solución de Problemas

### Los contenedores no inician
```bash
# Ver logs
docker-compose logs -f nombre_servicio

# Ejemplo:
docker-compose logs -f ms-campuslab-bookings
```

### Error: "Address already in use"
Alguien más está usando ese puerto. Cambiar en `compose.yml`:
```yaml
ports:
  - "NUEVO_PUERTO:PUERTO_INTERNO"
```

### Frontend no se conecta al backend
Verificar que los microservicios estén corriendo:
```bash
docker-compose ps
```

Si alguno no está "healthy", revisar sus logs:
```bash
docker-compose logs ms-campuslab-bookings
```

### PostgreSQL no responde
Esperar a que inicie completamente (puede tardar 10-30 segundos):
```bash
docker-compose logs postgres
```

## 📝 Configuración de Perfiles Spring

Por defecto, el backend usa el perfil `docker`. Esto carga:
- Configuraciones de conexión a contenedores
- Variables de entorno para servicios internos

Para cambiar el perfil, editar en `compose.yml`:
```yaml
SPRING_PROFILES_ACTIVE: docker  # cambiar a 'dev', 'prod', etc.
```

## 🔍 Debugging

### Conectarse a un contenedor
```bash
# Bash interactivo
docker-compose exec nombre_servicio /bin/bash

# Ejemplo - Backend (Java)
docker-compose exec ms-campuslab-bookings /bin/sh

# Ejemplo - Frontend (Node)
docker-compose exec frontend sh
```

### Ver logs en tiempo real
```bash
# Todos los servicios
docker-compose logs -f

# Un servicio específico
docker-compose logs -f ms-campuslab-bookings

# Últimas 100 líneas
docker-compose logs --tail=100 ms-campuslab-bookings
```

### Estadísticas de contenedores
```bash
docker stats
```

## 🛠️ Reconstruir Imágenes

Si cambias código, necesitas reconstruir:

```bash
# Reconstruir todas las imágenes
docker-compose up --build

# Reconstruir una sola imagen
docker-compose up --build ms-campuslab-bookings
```

## 📦 Estructura de Archivos

```
.
├── compose.yml                 # Configuración Docker Compose
├── backend/
│   ├── Dockerfile              # Imagen del backend
│   ├── .dockerignore           # Archivos a ignorar en build
│   ├── pom.xml                 # Maven - dependencias
│   └── ...
├── Frontend/
│   ├── Dockerfile              # Imagen del frontend
│   ├── .dockerignore           # Archivos a ignorar en build
│   ├── package.json            # NPM - dependencias
│   └── ...
└── DOCKER.md                   # Este archivo
```

## 🚨 Notas Importantes

1. **Datos Persistentes**: Los volúmenes Docker persisten incluso después de detener contenedores
2. **Red Interna**: Los contenedores se comunican por nombres de contenedor (ej: `postgres`, `kafka`)
3. **Build Inicial**: La primera construcción puede tardar 5-10 minutos
4. **Recursos**: Asegurate de tener suficiente espacio en disco (al menos 2GB)

## 📞 Comandos Rápidos

```bash
# Iniciar todo
docker-compose up -d

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar todo
docker-compose stop

# Reiniciar todo
docker-compose restart

# Eliminar todo (con datos)
docker-compose down -v

# Ejecutar comando en contenedor
docker-compose exec nombre_servicio comando
```

## 🎯 Próximos Pasos

1. Asegúrate de que Docker está instalado: `docker --version`
2. Ejecuta `docker-compose up` desde la raíz del proyecto
3. Accede a http://localhost:4200 en tu navegador
4. Verifica que los servicios estén saludables con `docker-compose ps`

¡Listo! Tu aplicación CampusLab está corriendo en Docker.

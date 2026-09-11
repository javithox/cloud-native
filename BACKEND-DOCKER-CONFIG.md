# 🔧 Configuración del Backend para Docker

## 📝 Cambios Realizados en Configuración

### 1. Nuevo Archivo: `backend/application-docker.yml`
Configuración específica para ambiente Docker con:
- **PostgreSQL** como base de datos (en lugar de H2)
- **Kafka** en `kafka:9092` (dentro de red Docker)
- **RabbitMQ** en `rabbitmq:5672`
- **URLs internas** de servicios

```yaml
spring:
  datasource:
    url: jdbc:postgresql://postgres:5432/campuslab
    driver-class-name: org.postgresql.Driver
    username: campuslab
    password: campuslab
  kafka:
    bootstrap-servers: kafka:9092
  rabbitmq:
    host: rabbitmq
```

---

## 🏗️ Build del Backend

El Dockerfile multi-stage:

### Stage 1: Builder (Maven)
```dockerfile
FROM maven:3.9.6-eclipse-temurin-21 AS builder
# Compila todos los módulos con Maven
# Genera JAR ejecutable
```

### Stage 2: Runtime (JRE Alpine)
```dockerfile
FROM eclipse-temurin:21-jre-alpine
# Copia solo el JAR compilado
# Inicia aplicación
```

**Ventajas**:
- Imagen final ~200MB (sin Maven)
- Rápido en tiempo de ejecución
- Seguro (menos código innecesario)

---

## 🚀 Variables de Entorno por Microservicio

### ms-campuslab-bookings (Puerto 8082)
```yaml
environment:
  SPRING_PROFILES_ACTIVE: docker
  SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/campuslab
  SERVER_PORT: 8082
  CATALOG_BASE_URL: http://ms-campuslab-catalog:8081
  KAFKA_BOOTSTRAP_SERVERS: kafka:9092
  RABBITMQ_HOST: rabbitmq
```

### ms-campuslab-catalog (Puerto 8081)
```yaml
environment:
  SPRING_PROFILES_ACTIVE: docker
  SERVER_PORT: 8081
  # Configuración similar a bookings
```

### ms-campuslab-audit (Puerto 8083)
```yaml
environment:
  SPRING_PROFILES_ACTIVE: docker
  SERVER_PORT: 8083
  # Consume eventos de Kafka
  KAFKA_BOOTSTRAP_SERVERS: kafka:9092
```

### ms-campuslab-notify (Puerto 8084)
```yaml
environment:
  SPRING_PROFILES_ACTIVE: docker
  SERVER_PORT: 8084
  # Consume mensajes de RabbitMQ
  RABBITMQ_HOST: rabbitmq
```

### ms-campuslab-report (Puerto 8085)
```yaml
environment:
  SPRING_PROFILES_ACTIVE: docker
  SERVER_PORT: 8085
  # Similar a otros microservicios
```

---

## 📊 Configuración por Módulo

### pom.xml (Padre)
```xml
<java.version>21</java.version>
<packaging>pom</packaging>
<modules>
  <module>ms-campuslab-bookings</module>
  <module>ms-campuslab-catalog</module>
  <module>ms-campuslab-audit</module>
  <module>ms-campuslab-notify</module>
  <module>ms-campuslab-report</module>
</modules>
```

### Cada módulo tiene su pom.xml
```xml
<parent>
  <groupId>com.javier</groupId>
  <artifactId>backend</artifactId>
  <version>0.0.1-SNAPSHOT</version>
</parent>
```

---

## 🔗 Comunicación Entre Servicios

### Desde el Contenedor (Docker)

**Dirección por Nombre de Contenedor**:
```
ms-campuslab-bookings → http://ms-campuslab-bookings:8082
ms-campuslab-catalog  → http://ms-campuslab-catalog:8081
postgres              → jdbc:postgresql://postgres:5432
kafka                 → kafka:9092
rabbitmq              → rabbitmq:5672
```

### Red Interna (Docker)
- Todos en `campuslab-network`
- DNS automático por nombre de contenedor
- No necesita IP, solo nombre

### Desde el Host (Tu PC / EC2)
```
localhost:8082 (desarrollo local)
32.192.223.53:8082 (EC2)
```

---

## 🔄 Ciclo de Vida del Microservicio

### 1. Build
```bash
docker-compose build ms-campuslab-bookings
```
- Maven compila
- Genera JAR
- Copia a imagen final

### 2. Start
```bash
docker-compose up -d ms-campuslab-bookings
```
- Contenedor inicia
- Spring Boot carga
- Se conecta a PostgreSQL
- Se conecta a Kafka/RabbitMQ
- Escucha en puerto 8082

### 3. Health Check
```bash
docker-compose ps
# Verifica endpoint /actuator/health
```

### 4. Logs
```bash
docker-compose logs -f ms-campuslab-bookings
# Ver qué está pasando
```

---

## 🗄️ Base de Datos

### Cambio de H2 a PostgreSQL

**Antes (development)**:
```yaml
spring:
  datasource:
    url: jdbc:h2:file:/path/to/database
    driver-class-name: org.h2.Driver
```

**Ahora (docker)**:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://postgres:5432/campuslab
    driver-class-name: org.postgresql.Driver
    username: campuslab
    password: campuslab
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

### Ventajas
✅ PostgreSQL es más robusto que H2  
✅ Mejor para producción  
✅ Soporte completo de características SQL  
✅ Múltiples conexiones concurrentes  

---

## 📊 Monitoreo de Microservicios

### Health Endpoint
```bash
curl http://localhost:8082/actuator/health
curl http://32.192.223.53:8082/actuator/health
```

Respuesta esperada:
```json
{
  "status": "UP",
  "components": {
    "db": {"status": "UP"},
    "kafka": {"status": "UP"},
    "rabbitmq": {"status": "UP"}
  }
}
```

### Métricas
```bash
curl http://localhost:8082/actuator/metrics
```

### Ver Logs en Vivo
```bash
docker-compose logs -f ms-campuslab-bookings
```

---

## 🔐 Seguridad

### Credenciales en Docker Compose
Actualmente en `compose.yml`:
```yaml
environment:
  SPRING_DATASOURCE_PASSWORD: campuslab
  RABBITMQ_PASSWORD: guest
```

### Para Producción (Recomendado)
Usar `.env` con valores seguros:
```bash
# .env
POSTGRES_PASSWORD=contraseña_muy_segura_123!
RABBITMQ_PASSWORD=contraseña_muy_segura_456!
```

En `compose.yml`:
```yaml
environment:
  SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD}
```

Ejecutar:
```bash
docker-compose --env-file .env up
```

---

## 🐛 Troubleshooting

### Microservicio no inicia
```bash
docker-compose logs ms-campuslab-bookings

# Buscar errores de:
# - ConnectionRefusedError → PostgreSQL no está up
# - Cannot connect to Kafka → Kafka no está up
# - Port already in use → Puerto en uso
```

### No conecta a PostgreSQL
```bash
# Verificar que postgres esté healthy
docker-compose ps postgres

# Conectar a postgres
docker-compose exec postgres psql -U campuslab -d campuslab

# Probar desde otro contenedor
docker-compose exec ms-campuslab-bookings nc -zv postgres 5432
```

### Problemas con Kafka/RabbitMQ
```bash
# Verificar logs
docker-compose logs kafka
docker-compose logs rabbitmq

# Verificar conectividad
docker-compose exec ms-campuslab-bookings nc -zv kafka 9092
docker-compose exec ms-campuslab-bookings nc -zv rabbitmq 5672
```

---

## 📈 Actualizar Código

### Cuando cambias código del backend:

```bash
# 1. Parar servicios
docker-compose stop ms-campuslab-bookings

# 2. Traer cambios
git pull

# 3. Reconstruir imagen
docker-compose build ms-campuslab-bookings

# 4. Iniciar actualizado
docker-compose up -d ms-campuslab-bookings

# 5. Ver logs
docker-compose logs -f ms-campuslab-bookings
```

### O todo junto
```bash
docker-compose up -d --build ms-campuslab-bookings
```

---

## 🚀 Despliegue en Producción

### Cambios Necesarios

1. **Cambiar perfil**:
```yaml
SPRING_PROFILES_ACTIVE: prod
```

2. **Cambiar credenciales** (`.env`):
```bash
POSTGRES_PASSWORD=contraseña_segura
RABBITMQ_PASSWORD=contraseña_segura
```

3. **Limitar recursos**:
```yaml
deploy:
  resources:
    limits:
      memory: 1G
    reservations:
      memory: 512M
```

4. **Habilitar HTTPS**:
```yaml
SERVER_SSL_ENABLED: true
SERVER_SSL_KEY_STORE: /etc/ssl/keystore.p12
```

---

## 📋 Checklist Backend

- [ ] Maven 3.9.6+
- [ ] Java 21 instalado localmente
- [ ] `mvn clean package` exitoso
- [ ] Dockerfile construye sin errores
- [ ] Imagen base es `eclipse-temurin:21-jre-alpine`
- [ ] application-docker.yml configurado
- [ ] PostgreSQL en docker-compose tiene healthcheck
- [ ] Todos los 5 microservicios en docker-compose
- [ ] Variables de entorno correctas
- [ ] Health checks funcionan
- [ ] Logs son claros
- [ ] Puertos no colisionan

---

## 🔍 Validación Post-Deploy

```bash
# 1. Ver estado
docker-compose ps

# 2. Todos healthy?
docker-compose logs --tail=5 ms-campuslab-bookings

# 3. Probar cada API
curl http://localhost:8081/api/...  # Catalog
curl http://localhost:8082/api/...  # Bookings
curl http://localhost:8083/api/...  # Audit
curl http://localhost:8084/api/...  # Notify
curl http://localhost:8085/api/...  # Report

# 4. Base de datos llena de datos?
docker-compose exec postgres psql -U campuslab -d campuslab -c "SELECT COUNT(*) FROM information_schema.tables;"

# 5. Mensajes en Kafka?
docker-compose exec kafka kafka-topics.sh --list --bootstrap-server localhost:9092
```

---

## 📚 Referencias

- [Spring Boot Docker Documentation](https://spring.io/guides/gs/spring-boot-docker/)
- [Eclipse Temurin Docker Hub](https://hub.docker.com/_/eclipse-temurin)
- [Maven Official Docker Hub](https://hub.docker.com/_/maven)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)


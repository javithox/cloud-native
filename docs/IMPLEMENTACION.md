# CampusLab: implementación local

La solución sigue el caso funcional de CampusLab con Angular + MSAL en el frontend y microservicios Spring Boot para reservas, catálogo, auditoría y reportería. Las reservas persisten en PostgreSQL y mantienen el flujo `SOLICITADA → APROBADA → EN_PREPARACION → EN_USO → DEVUELTA`; la cancelación solo está disponible antes del uso. Al aprobar se publican comandos asíncronos en RabbitMQ y los eventos se envían a Kafka para auditoría y reportería.

## Base de datos

Los servicios JPA usan PostgreSQL mediante variables de entorno. Los valores por defecto son `localhost:5432`, base `campuslab`, usuario `campuslab` y contraseña `campuslab`. El esquema se actualiza automáticamente con `ddl-auto: update`; para producción se recomienda migrar a Flyway/Liquibase y separar una base por microservicio.

## Arranque de infraestructura

Desde la raíz del repositorio (`cloud-native/`):

```bash
sudo docker compose pull
sudo docker compose up -d
```

Esto inicia PostgreSQL en `5432`, RabbitMQ y su consola en `15672`, y Kafka en `9092`. Kafka usa la imagen oficial `apache/kafka:3.9.0` en modo KRaft, porque la imagen Bitnami anterior dejó de estar disponible en Docker Hub. También se conserva `infra/compose.yml` para ejecuciones explícitas con `-f`.

Si solo se quiere probar el catálogo sin levantar Docker, existe el perfil `local`, que usa una base H2 persistente en `backend/ms-campuslab-catalog/data/catalogdb`:

```bash
cd backend
./mvnw -f pom.xml -pl ms-campuslab-catalog -am package -DskipTests
java -Dspring.profiles.active=local -jar ms-campuslab-catalog/target/ms-campuslab-catalog-0.0.1-SNAPSHOT.jar
```

El catálogo queda disponible en `http://localhost:8081` y sus endpoints en `/api/catalog/resources`. Para el entorno integrado, no uses el perfil `local`: inicia Docker y ejecuta el servicio con la configuración PostgreSQL predeterminada.

```bash
cd Frontend
npm ci
npm start
```

## Frontend

La pantalla de reservas consume `GET /api/bookings` y permite avanzar estados mediante `PUT /api/bookings/{id}/status`. Catálogo consume `GET /api/catalog/resources`; reportería y auditoría quedan preparados para sus endpoints. En local, las URLs se encuentran en `Frontend/src/environments/environment.ts`; en AWS deben apuntar al BFF/API Gateway y no directamente a cada servicio.

## Flujo catálogo-reservas

El microservicio `ms-campuslab-catalog` es la fuente de verdad de los recursos. Al crear una reserva, `ms-campuslab-bookings` consulta `GET http://localhost:8081/api/catalog/resources/{id}`; si el recurso no existe o está inactivo, la reserva se rechaza. Al aprobarla, bookings llama al catálogo para descontar una unidad de stock. Al devolverla o cancelar una reserva aprobada, la unidad se libera nuevamente. El ajuste de stock usa bloqueo pesimista para evitar que dos aprobaciones consuman la misma disponibilidad.

Ejemplo de flujo:

```bash
# 1. Crear un recurso en catálogo
curl -X POST http://localhost:8081/api/catalog/resources \
  -H 'Content-Type: application/json' \
  -d '{"code":"LAB-01","name":"Laboratorio 1","type":"LABORATORIO","totalStock":1}'

# 2. Crear una reserva en estado SOLICITADA
curl -X POST http://localhost:8082/api/bookings \
  -H 'Content-Type: application/json' \
  -d '{"studentId":"alumno-1","studentEmail":"alumno@universidad.cl","resourceId":1,"startTime":"2030-01-10T10:00:00","endTime":"2030-01-10T11:00:00"}'

# 3. Aprobar: descuenta stock del catálogo
curl -X PUT http://localhost:8082/api/bookings/1/status \
  -H 'Content-Type: application/json' -d '{"status":"APROBADA","operatorId":"tecnico-1"}'
```

Si el catálogo está en otra máquina o contenedor, configurar `CATALOG_BASE_URL` en bookings, por ejemplo `http://catalog-svc:8081`.

## Seguridad

MSAL mantiene la autenticación corporativa en Azure AD. La selección de rol de la pantalla es únicamente una ayuda visual local y no constituye autorización: en el despliegue real los roles deben venir de claims del JWT, ser validados por Spring Security y filtrarse en el BFF/API Gateway.

## Correcciones principales

Se eliminó la implementación recursiva accidental de `getStatus` y `setStatus` en la entidad de reservas, se agregaron validaciones de rango horario y solapamiento, se incorporaron respuestas HTTP 400/409 para errores de negocio, se reemplazaron datos simulados del frontend por llamadas HTTP y se agregó una infraestructura reproducible con PostgreSQL, RabbitMQ y Kafka.

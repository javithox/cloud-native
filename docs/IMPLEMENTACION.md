# CampusLab: implementación

La aplicación usa Angular/MSAL, el BFF `ms-campuslab-bff` y microservicios Spring Boot. El flujo externo previsto es `JWT → API Gateway HTTP API → BFF → servicios de dominio`. Las llamadas del navegador pasan por `/api/bookings`, `/api/catalog`, `/api/audit` y `/api/report` en el BFF. Se conserva PostgreSQL.

## Reservas y persistencia

El flujo de estados existente es `SOLICITADA → APROBADA → EN_PREPARACION → EN_USO → DEVUELTA`, con cancelación previa al uso. Bookings consulta catálogo y descuenta/libera disponibilidad en las transiciones correspondientes. PostgreSQL persiste reservas, recursos, auditoría y métricas en bases lógicas separadas.

## Mensajería

Bookings publica en `bookings.events`; los consumidores de auditoría y reportería leen ese flujo, reintentan tres veces y, tras fallar, derivan el mensaje a su DLT. `ms-campuslab-audit` persiste el timeline en PostgreSQL y publica `audit.timeline` con `eventId` como clave para idempotencia (`compact/delete`).

RabbitMQ usa exchanges `cmd.direct`, `cmd.topic` y `cmd.dead.dlx`; colas `q.cmd.email`, `q.cmd.prep`, `q.cmd.voucher` y tres DLQ. `ms-campuslab-rabbitmq-admin` reconcilia exchanges, colas y bindings de forma idempotente.

## Compose

- `compose.yml`: perfil local de un nodo RabbitMQ y un nodo Kafka KRaft. Solo BFF y frontend publican puertos al host (loopback); PostgreSQL y consolas también quedan en loopback.
- `infra/apps/compose.yml`: aplicaciones y PostgreSQL.
- `infra/mq/compose.yml`: clúster RabbitMQ de dos nodos.
- `infra/kafka/compose.yml`: tres nodos ZooKeeper, tres brokers Kafka y Kafka UI, como solicita la pauta.

Para los Compose separados, crea `campuslab-net` y arranca mensajería antes de aplicaciones. Kafka UI está en `localhost:8088` y RabbitMQ Management en `localhost:15672`, ambos enlazados a loopback. El perfil de evaluación requiere más memoria que el perfil local.

## Identidad

El BFF valida firma, emisor v2, tenant y audiencia Entra ID, convierte roles de aplicación y aplica autorización antes de enrutar. Registra roles de aplicación `Admin`, `Tecnico`, `Estudiante` y `Auditor`; la selección visual de rol no concede permisos. En producción API Gateway debe usar JWT Authorizer con issuer `https://login.microsoftonline.com/<TENANT_ID>/v2.0`, audience `api://<API_CLIENT_ID>` e integración al BFF. No expongas puertos internos ni secretos en el repositorio.

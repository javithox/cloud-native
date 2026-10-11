# CampusLab — entrega ajustada al caso

Plataforma de reservas académicas con Angular, Spring Boot, PostgreSQL, RabbitMQ y Kafka. Se conserva **PostgreSQL**, según lo solicitado. El flujo externo queda centralizado en `JWT → API Gateway → ms-campuslab-bff → servicios de dominio`.

## Componentes

- `Frontend/`: Angular + MSAL; las llamadas del navegador pasan por el BFF.
- `backend/ms-campuslab-bff`: valida JWT de Microsoft Entra ID (emisor v2, tenant y audiencia), autoriza por rol y enruta reservas, catálogo, auditoría y reportes.
- `ms-campuslab-bookings`, `ms-campuslab-catalog`, `ms-campuslab-notify`, `ms-campuslab-audit`, `ms-campuslab-report`: microservicios de dominio.
- `ms-campuslab-rabbitmq-admin`: salud, inventario y reconciliación de colas/DLQ RabbitMQ.
- `ms-campuslab-kafka-admin`: salud, inventario y reconciliación de tópicos Kafka.
- PostgreSQL conserva las bases de reservas, catálogo, auditoría y reportería.

## Arranque local

Requisitos: Java 21, Docker Compose v2; Node.js 20+ si ejecutas Angular fuera de Docker.

```bash
cp .env.example .env
# Reemplaza las contraseñas locales y revisa tenant/audience.
docker compose up --build -d
```

- Frontend: `http://localhost:4200`
- BFF: `http://localhost:8090`
- Los puertos PostgreSQL/RabbitMQ se enlazan a `127.0.0.1`; los servicios de dominio y administradores solo están en la red interna de Compose.

Angular independiente:

```bash
cd Frontend && npm ci && npm start
```

## Entra ID y seguridad

Configura la app registration `CampusLab` para emitir **access tokens v2**, audiencia `api://<API_CLIENT_ID>` y roles de aplicación `Admin`, `Tecnico`, `Estudiante` y `Auditor`. Confirma que el scope `archivos` configurado por MSAL existe y está consentido. Ajusta `TENANT_ID`, `JWT_AUDIENCE` y `JWT_ISSUER_URI` en `.env`. En el backend, la autorización se basa en roles del JWT; una elección en la interfaz no otorga permisos y scopes genéricos no sustituyen roles.

En AWS, usa API Gateway HTTP API con JWT Authorizer (`issuer=https://login.microsoftonline.com/<TENANT_ID>/v2.0`, `audience=api://<API_CLIENT_ID>`) e integra al BFF. Publica solo la entrada TLS requerida y deja servicios de dominio/mensajería en red privada.

## Mensajería

Endpoints internos, protegidos con JWT y rol Admin:

- RabbitMQ: `GET /api/admin/rabbitmq/health`, `GET /api/admin/rabbitmq/queues`, `POST /api/admin/rabbitmq/topology/reconcile`.
- Kafka: `GET /api/admin/kafka/health`, `GET /api/admin/kafka/topics`, `POST /api/admin/kafka/topics/reconcile`.

RabbitMQ prepara `cmd.direct`, `cmd.topic`, `cmd.dead.dlx`, tres colas principales y tres DLQ. Kafka prepara `bookings.events`, `audit.timeline` y `ms-campuslab-audit.DLT` / `ms-campuslab-report.DLT`; los consumidores reintentan tres veces y luego derivan a su DLT. La reportería ofrece KPIs, reservas por hora y top recursos sin bloquear reservas.

## Perfil de evaluación

El Compose raíz es un perfil de desarrollo ligero (un nodo RabbitMQ y un Kafka KRaft). Para la topología pedida, se separaron:

- `infra/mq/compose.yml`: RabbitMQ de 2 nodos.
- `infra/kafka/compose.yml`: ZooKeeper de 3 nodos, Kafka de 3 brokers y Kafka UI.
- `infra/apps/compose.yml`: aplicaciones, PostgreSQL, BFF y administradores.

```bash
docker network inspect campuslab-net >/dev/null 2>&1 || docker network create campuslab-net
cd infra/mq && docker compose --env-file ../../.env up -d
cd ../kafka && docker compose --env-file ../../.env up -d
cd ../apps && docker compose --env-file ../../.env up -d --build
```

El perfil distribuido requiere más memoria que el Compose local.
Kafka UI queda disponible en `http://localhost:8088` y RabbitMQ Management en `http://localhost:15672`; ambos se enlazan solo a loopback. PostgreSQL se conserva como único motor de base de datos para este proyecto.

## Construcción

```bash
cd backend
bash mvnw -B -ntp -DskipTests package
```

## Higiene de secretos

Se retiró del README el JWT de prueba incluido en el ZIP de origen y no se incluyen `.env` ni `envbackup` en esta entrega. Crea tu `.env` desde el ejemplo, guarda sus valores localmente o en un secret manager y no subas tokens, cookies, contraseñas ni bases con datos reales. Si una credencial activa fue compartida, revócala o rótala.

Para el Compose separado de RabbitMQ, reemplaza `RABBITMQ_ERLANG_COOKIE` en `.env` por el resultado de `openssl rand -hex 32`; ambos nodos leen la misma variable. No uses el valor de muestra en una red compartida.

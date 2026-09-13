# Docker: levantado simple

El proyecto se levanta desde la raíz con un único archivo: `compose.yml`. No hace falta ejecutar `infra/compose.yml` por separado.

## Local

```bash
cp .env.example .env
docker compose up -d --build
docker compose ps
docker compose logs -f frontend
```

Abrir `http://localhost:4200`. Para detener sin borrar datos:

```bash
docker compose down
```

Para borrar también los volúmenes de PostgreSQL, RabbitMQ y Kafka:

```bash
docker compose down -v
```

## EC2 después de `pull origin branch2`

Desde la raíz del repositorio:

```bash
git pull origin branch2
cp .env.example .env
docker compose up -d --build
docker compose ps
```

La plantilla ya está configurada para la IP pública `3.238.17.63`. Si la IP de la instancia cambia, actualiza las cinco variables `API_*` del archivo `.env` antes de levantar los contenedores.

En el security group de EC2 deben estar publicados al menos `4200` para la web y `8081`–`8085` si el navegador va a consumir las APIs directamente. Para producción se recomienda poner un reverse proxy delante y publicar solo `80/443`.

## Actualizaciones

```bash
git pull origin branch2
docker compose up -d --build --remove-orphans
docker image prune -f
```

## Qué se corrigió

El frontend ya no contiene una IP fija: genera `runtime-config.js` al iniciar el contenedor usando las variables `API_*`. El servidor estático es un servidor Node HTTP pequeño, escucha en `0.0.0.0:4200` y soporta rutas SPA sin la incompatibilidad de wildcard de Express 5. Kafka anuncia `kafka:9092` dentro de la red Docker. Los microservicios `notify` y `report` usan los puertos publicados por Compose y sus hosts se configuran por variables de entorno. Las imágenes excluyen `node_modules`, `target`, `dist`, datos y secretos del contexto de build.

## Diagnóstico

```bash
docker compose ps
docker compose logs --tail=100 ms-campuslab-bookings
docker compose logs --tail=100 frontend
curl http://localhost:4200
curl http://localhost:8081/actuator/health
```

El build backend se ejecuta dentro de `maven:3.9.6-eclipse-temurin-21`; por eso no depende de la versión Java instalada en el host EC2.

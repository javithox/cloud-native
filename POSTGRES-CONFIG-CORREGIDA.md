# Configuración PostgreSQL corregida - CampusLab

## Qué se cambió

1. `compose.yml` ahora toma `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST` y `POSTGRES_PORT` desde `.env`, con valores por defecto seguros para el entorno Docker actual.
2. Catalog usa PostgreSQL por defecto y conserva H2 únicamente en `application-local.yml`.
3. Report usa PostgreSQL por defecto y conserva H2 únicamente en `application-local.yml`.
4. Bookings y Audit mantienen PostgreSQL.
5. Notify no recibe variables de datasource porque su módulo no declara persistencia JPA/PostgreSQL.
6. No se modifica la configuración de MSAL, HTTPS, Nginx ni las URLs del frontend.

## Bases esperadas

- `campuslab`
- `campuslab_bookings`
- `campuslab_catalog`
- `campuslab_audit`
- `campuslab_report`

## Despliegue en EC2 sin borrar los datos

Desde `~/cloud-native`:

```bash
cp .env .env.backup.$(date +%Y%m%d-%H%M%S)
git pull origin branch2
sudo docker compose config >/tmp/campuslab-compose-check.yml
sudo docker compose up --build -d
```

> No usar `docker compose down -v`: eso elimina el volumen de PostgreSQL y puede borrar las bases persistentes.

## Verificación

```bash
sudo docker ps
sudo docker logs --tail=100 campuslab-postgres
```

Comprobar las bases:

```bash
sudo docker exec -it campuslab-postgres psql -U campuslab -d campuslab -c '\l'
```

Comprobar la conexión de cada servicio:

```bash
sudo docker exec ms-campuslab-catalog env | grep SPRING_DATASOURCE
sudo docker exec ms-campuslab-bookings env | grep SPRING_DATASOURCE
sudo docker exec ms-campuslab-audit env | grep SPRING_DATASOURCE
sudo docker exec ms-campuslab-report env | grep SPRING_DATASOURCE
```

## Importante sobre el script SQL

`docker/postgres/init-multiple-dbs.sql` solo se ejecuta automáticamente cuando PostgreSQL inicializa un volumen nuevo. Si `campuslab-postgres-data` ya existe, Docker no vuelve a crear las bases.

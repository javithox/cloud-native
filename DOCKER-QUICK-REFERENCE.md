# 🚀 Docker Quick Reference - CampusLab

## Comandos Esenciales

### 🟢 Iniciar
```bash
# Iniciar todos los servicios
docker-compose up -d

# Iniciar y reconstruir imágenes (si cambió código)
docker-compose up -d --build

# Iniciar y ver logs
docker-compose up
```

### 🔴 Detener
```bash
# Detener sin eliminar
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar todo (incluyendo datos)
docker-compose down -v
```

### 📊 Estado y Logs
```bash
# Ver estado de todos los servicios
docker-compose ps

# Ver logs en tiempo real (todos)
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f ms-campuslab-bookings

# Ver últimas 100 líneas
docker-compose logs --tail=100 ms-campuslab-bookings
```

### 🔧 Acceso a Contenedores
```bash
# Conectar a un contenedor
docker-compose exec nombre_servicio /bin/sh

# Ejemplos:
docker-compose exec ms-campuslab-bookings /bin/sh
docker-compose exec frontend sh
docker-compose exec postgres psql -U campuslab -d campuslab
```

### 🛠️ Reconstruir
```bash
# Reconstruir todas las imágenes
docker-compose build

# Reconstruir una imagen específica
docker-compose build ms-campuslab-bookings
```

### 🗑️ Limpiar
```bash
# Eliminar contenedores detenidos
docker-compose rm

# Eliminar imágenes no usadas
docker image prune

# Limpiar todo (contenedores, imágenes, volúmenes)
docker system prune -a --volumes
```

---

## 🌐 URLs de Acceso

| Servicio | URL |
|----------|-----|
| **Frontend** | http://localhost:4200 |
| **API Bookings** | http://localhost:8082 |
| **API Catalog** | http://localhost:8081 |
| **API Audit** | http://localhost:8083 |
| **API Notify** | http://localhost:8084 |
| **API Report** | http://localhost:8085 |
| **PostgreSQL** | localhost:5432 |
| **RabbitMQ Admin** | http://localhost:15672 |
| **Kafka** | localhost:9092 |

---

## 📋 Credenciales

### PostgreSQL
- **Usuario**: campuslab
- **Contraseña**: campuslab
- **Base de datos**: campuslab

### RabbitMQ
- **Usuario**: guest
- **Contraseña**: guest

---

## 🐛 Solución Rápida de Problemas

| Problema | Solución |
|----------|----------|
| Servicio no inicia | `docker-compose logs -f servicio` |
| Puerto en uso | Cambiar puerto en `compose.yml` |
| Base de datos vacía | Verificar logs de PostgreSQL |
| Frontend no conecta | `docker-compose ps` - ver si están corriendo |
| Datos corruptos | `docker-compose down -v` (pierde datos) |

---

## 💡 Tips Útiles

```bash
# Reiniciar un servicio
docker-compose restart ms-campuslab-bookings

# Ver recursos usados
docker stats

# Seguimiento de eventos en tiempo real
docker-compose events

# Validar compose.yml
docker-compose config

# Pull de nuevas imágenes base
docker-compose pull

# Ejecutar comando sin entrar
docker-compose exec -T postgres psql -U campuslab -d campuslab -c "SELECT * FROM schema_version;"
```

---

## 📝 Notas Importantes

- **Datos Persistentes**: Guardados en volúmenes Docker
- **Comunicación Interna**: Use nombres de contenedor (ej: `postgres`, `kafka`)
- **Build Inicial**: Puede tardar 5-10 minutos
- **Espacio en Disco**: Necesita al menos 2GB
- **Red**: Los servicios están en red `campuslab-network`

---

## 🎯 Workflow Típico

```bash
# 1. Iniciar proyecto
docker-compose up -d

# 2. Verificar estado
docker-compose ps

# 3. Ver logs si hay problemas
docker-compose logs -f

# 4. Acceder a servicios
# Frontend: http://localhost:4200
# APIs: http://localhost:8081-8085

# 5. Detener cuando termines
docker-compose down
```

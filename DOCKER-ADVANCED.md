# ⚙️ Configuración Avanzada de Docker

## 🔧 Personalización de docker-compose.yml

### Cambiar Puertos
Si algún puerto ya está en uso, edita `compose.yml`:

```yaml
# Cambiar puerto de Frontend
frontend:
  ports:
    - "3000:4200"  # Host:Contenedor

# Cambiar puerto de microservicio
ms-campuslab-bookings:
  ports:
    - "9082:8082"  # Acceso externo en 9082
  environment:
    SERVER_PORT: 8082  # Interno sigue siendo 8082
```

### Aumentar Límite de Memoria
Si los contenedores se quedan sin memoria:

```yaml
services:
  ms-campuslab-bookings:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### Agregar Variables de Entorno
```yaml
ms-campuslab-bookings:
  environment:
    NUEVA_VARIABLE: valor
    LOG_LEVEL: DEBUG
```

### Cambiar Perfil de Spring Boot
```yaml
environment:
  SPRING_PROFILES_ACTIVE: prod  # Cambiar de 'docker' a 'prod'
```

---

## 🗄️ Configuración de Base de Datos

### Usar Oracle en lugar de PostgreSQL
Edita `backend/application-docker.yml`:

```yaml
spring:
  datasource:
    url: jdbc:oracle:thin:@oracle-host:1521:ORCL
    driver-class-name: oracle.jdbc.driver.OracleDriver
    username: system
    password: oracle
  jpa:
    properties:
      hibernate:
        dialect: org.hibernate.dialect.OracleDialect
```

### Conexión desde Host
```bash
# PostgreSQL
psql -h localhost -U campuslab -d campuslab

# O con psql en contenedor
docker-compose exec postgres psql -U campuslab -d campuslab
```

### Backup de Base de Datos
```bash
# Exportar
docker-compose exec postgres pg_dump -U campuslab campuslab > backup.sql

# Restaurar
docker-compose exec -T postgres psql -U campuslab campuslab < backup.sql
```

---

## 📦 Gestión de Imágenes

### Limpiar Imágenes No Usadas
```bash
# Ver imágenes dangling
docker images -f "dangling=true"

# Eliminar imágenes no usadas
docker image prune

# Eliminar imágenes específicas
docker rmi campuslab-backend:latest
```

### Cachear Capas de Build
Docker cachea automáticamente las capas. Para forzar rebuild sin caché:

```bash
docker-compose build --no-cache
```

### Usar Registros Privados
```yaml
services:
  ms-campuslab-bookings:
    image: private-registry.com/campuslab-bookings:latest
    # Necesita: docker login private-registry.com
```

---

## 🔐 Seguridad

### Variables Sensibles (No Hardcodear)
Crear archivo `.env`:
```bash
POSTGRES_PASSWORD=tu_contraseña_segura
RABBITMQ_PASSWORD=tu_contraseña_segura
```

Usar en `compose.yml`:
```yaml
environment:
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

Ejecutar:
```bash
docker-compose --env-file .env up
```

### Cambiar Credenciales Predeterminadas
```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: nueva_contraseña_segura

rabbitmq:
  environment:
    RABBITMQ_DEFAULT_PASS: nueva_contraseña_segura
```

---

## 📊 Monitoreo

### Health Checks
Los servicios ya tienen healthchecks. Ver estado:

```bash
docker-compose ps
# La columna STATUS mostrará "healthy" o "unhealthy"
```

### Logs Persistentes
```bash
# Guardar logs a archivo
docker-compose logs > logs.txt

# Ver logs con filtro
docker-compose logs | grep ERROR
```

### Estadísticas en Tiempo Real
```bash
docker stats --no-stream
```

---

## 🚀 Despliegue en Producción

### Modo Production
Cambiar en `compose.yml`:
```yaml
environment:
  SPRING_PROFILES_ACTIVE: prod
```

### Agregar Reverse Proxy (Nginx)
```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
    - ./ssl:/etc/nginx/ssl:ro
  depends_on:
    - frontend
    - ms-campuslab-bookings
```

### Limitar Recursos
```yaml
services:
  ms-campuslab-bookings:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

---

## 🔄 CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/docker.yml
name: Build and Push Docker Images
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build
        run: docker-compose build
      - name: Push to Registry
        run: docker push my-registry/campuslab-backend:latest
```

---

## 🐛 Debugging Avanzado

### Conectarse a Debugger Java
Agregar a `compose.yml`:
```yaml
ms-campuslab-bookings:
  environment:
    JAVA_OPTS: -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005
  ports:
    - "5005:5005"  # Puerto de debug
```

Conectar desde IDE (IntelliJ/VS Code) a `localhost:5005`

### Verificar Conectividad Entre Contenedores
```bash
# Desde un contenedor, ping a otro
docker-compose exec frontend ping ms-campuslab-bookings

# Verificar DNS
docker-compose exec frontend nslookup ms-campuslab-bookings
```

### Ver Volúmenes
```bash
docker volume ls
docker volume inspect campuslab-postgres-data
```

---

## 📋 Checklist Pre-Producción

- [ ] Cambiar credenciales por defecto
- [ ] Activar HTTPS (si aplica)
- [ ] Configurar backups automáticos
- [ ] Establecer límites de recursos
- [ ] Revisar logs de seguridad
- [ ] Probar failover y recuperación
- [ ] Documentar procedimientos de respaldo
- [ ] Usar imágenes base optimizadas (alpine)
- [ ] Mantener imágenes actualizadas
- [ ] Monitorear uso de recursos

---

## 🆘 Soporte Avanzado

### Obtener Información del Sistema
```bash
docker version
docker info
docker-compose version
docker system df
```

### Verificar Imagen
```bash
docker inspect campuslab-backend:latest
docker history campuslab-backend:latest
```

### Diagnóstico Completo
```bash
# Guardar información de diagnóstico
docker-compose logs > diagnostics.txt
docker ps -a >> diagnostics.txt
docker images >> diagnostics.txt
docker volume ls >> diagnostics.txt
```

# 📋 Resumen de Configuración Docker - CampusLab

## 🎉 ¿Qué se Ha Configurado?

Se ha completado la configuración de Docker para tu aplicación CampusLab con soporte para desarrollo local y despliegue en AWS EC2.

---

## 📁 Archivos Creados/Modificados

### Dockerfiles
- ✅ `backend/Dockerfile` - Multi-stage build para Java/Spring Boot
- ✅ `Frontend/Dockerfile` - Build y runtime para Angular
- ✅ `backend/application-docker.yml` - Configuración de Spring para Docker

### Configuración Docker Compose
- ✅ `compose.yml` - Orquestación completa con:
  - PostgreSQL
  - RabbitMQ
  - Kafka
  - 5 Microservicios Backend (Bookings, Catalog, Audit, Notify, Report)
  - Frontend Angular

### Archivos .dockerignore
- ✅ `backend/.dockerignore` - Optimización de tamaño de imagen backend
- ✅ `Frontend/.dockerignore` - Optimización de tamaño de imagen frontend

### Archivos de Configuración
- ✅ `.env` - Variables de entorno para EC2 (IP: 32.192.223.53)
- ✅ `.env.example` - Plantilla de variables de entorno

### Documentación
- ✅ `DOCKER.md` - Guía completa de Docker (141 líneas)
- ✅ `DOCKER-QUICK-REFERENCE.md` - Referencia rápida de comandos
- ✅ `DOCKER-ADVANCED.md` - Configuración avanzada y producción
- ✅ `EC2-DEPLOYMENT.md` - Guía específica para despliegue en AWS EC2

### Scripts de Automatización
- ✅ `docker-init.ps1` - Script PowerShell para Windows
- ✅ `docker-init.sh` - Script Bash para Linux/Mac
- ✅ `ec2-deploy.sh` - Script automatizado de despliegue en EC2

---

## 🚀 Guía Rápida de Uso

### Para Desarrollo Local (Windows)

```powershell
# Ejecutar desde PowerShell
.\docker-init.ps1

# O manualmente:
docker-compose up -d

# Acceder a:
# Frontend: http://localhost:4200
# API: http://localhost:8082
```

### Para AWS EC2 (32.192.223.53)

```bash
# En tu instancia EC2:
git clone <tu-repo>
cd campuslab

# Ejecutar script de despliegue
chmod +x ec2-deploy.sh
./ec2-deploy.sh

# Acceder a:
# Frontend: http://32.192.223.53:4200
# API: http://32.192.223.53:8082
```

---

## 🏗️ Arquitectura Configurada

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCKER COMPOSE NETWORK                   │
│              (campuslab-network - bridge)                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      CONTENEDORES                           │
├─────────────────────────────────────────────────────────────┤
│ 📊 INFRAESTRUCTURA                                          │
│  • postgres (5432) - Base de datos                         │
│  • rabbitmq (5672, 15672) - Message broker                │
│  • kafka (9092) - Event streaming                         │
├─────────────────────────────────────────────────────────────┤
│ 🔧 MICROSERVICIOS BACKEND (Spring Boot 4.1.1, Java 21)     │
│  • ms-campuslab-bookings (8082) - Gestión de reservas    │
│  • ms-campuslab-catalog (8081) - Catálogo de recursos    │
│  • ms-campuslab-audit (8083) - Auditoría                 │
│  • ms-campuslab-notify (8084) - Notificaciones           │
│  • ms-campuslab-report (8085) - Reportería               │
├─────────────────────────────────────────────────────────────┤
│ 🖥️  FRONTEND (Angular 21)                                   │
│  • frontend (4200) - Portal web                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Características Implementadas

### Docker Compose
- ✅ Multi-stage builds para optimizar tamaño de imágenes
- ✅ Health checks para todos los servicios
- ✅ Volúmenes persistentes para datos
- ✅ Red personalizada (campuslab-network)
- ✅ Dependencias entre servicios configuradas
- ✅ Variables de entorno parametrizadas
- ✅ Restart policies (unless-stopped)

### Backend (Java/Spring Boot)
- ✅ Configuración para Docker con profile `docker`
- ✅ PostgreSQL como base de datos
- ✅ Kafka para eventos
- ✅ RabbitMQ para comandos
- ✅ Maven multi-módulo
- ✅ JRE Alpine para tamaño mínimo

### Frontend (Angular)
- ✅ Build multi-stage con Node.js
- ✅ Servidor Express para servir la app
- ✅ SSR compatible
- ✅ Variables de entorno para API_URL
- ✅ Alpine Linux para tamaño mínimo

---

## 📊 Puertos y URLs

| Servicio | Puerto | URL Local | URL EC2 |
|----------|--------|-----------|---------|
| Frontend | 4200 | http://localhost:4200 | http://32.192.223.53:4200 |
| Bookings | 8082 | http://localhost:8082 | http://32.192.223.53:8082 |
| Catalog | 8081 | http://localhost:8081 | http://32.192.223.53:8081 |
| Audit | 8083 | http://localhost:8083 | http://32.192.223.53:8083 |
| Notify | 8084 | http://localhost:8084 | http://32.192.223.53:8084 |
| Report | 8085 | http://localhost:8085 | http://32.192.223.53:8085 |
| PostgreSQL | 5432 | localhost:5432 | No expuesto |
| RabbitMQ | 5672, 15672 | localhost:15672 | http://32.192.223.53:15672 |
| Kafka | 9092 | localhost:9092 | No expuesto |

---

## 🔐 Credenciales Predeterminadas

```
PostgreSQL:
  Usuario: campuslab
  Contraseña: campuslab
  Base de datos: campuslab

RabbitMQ:
  Usuario: guest
  Contraseña: guest
```

⚠️ **IMPORTANTE**: Cambiar en producción editando `.env`

---

## 📚 Documentación Disponible

| Archivo | Contenido |
|---------|-----------|
| `DOCKER.md` | Guía completa de setup y uso |
| `DOCKER-QUICK-REFERENCE.md` | Comandos rápidos y referencias |
| `DOCKER-ADVANCED.md` | Configuración avanzada, seguridad, CI/CD |
| `EC2-DEPLOYMENT.md` | Guía específica para AWS EC2 |

---

## 🎯 Próximos Pasos

### 1. Desarrollo Local
```bash
# Iniciar
docker-compose up -d

# Verificar
docker-compose ps

# Acceder a Frontend
# http://localhost:4200
```

### 2. Configurar Security Group en EC2
Abre estos puertos en AWS:
- 4200 (Frontend)
- 8081-8085 (APIs)
- 15672 (RabbitMQ Admin)
- 22 (SSH)

### 3. Desplegar en EC2
```bash
# SSH a tu instancia
ssh -i tu-key.pem ec2-user@32.192.223.53

# Clonar repo
git clone <tu-repo>

# Ejecutar script
./ec2-deploy.sh

# Acceder a http://32.192.223.53:4200
```

### 4. Cambiar Credenciales (Producción)
```bash
# Editar .env
nano .env

# Cambiar valores sensibles
POSTGRES_PASSWORD=nueva_contraseña
RABBITMQ_DEFAULT_PASS=nueva_contraseña

# Reiniciar
docker-compose down
docker-compose up -d
```

---

## 🐛 Solución de Problemas Comunes

| Problema | Solución |
|----------|----------|
| "Port already in use" | Cambiar puerto en `compose.yml` |
| Frontend no carga | `docker-compose logs frontend` |
| API no responde | `docker-compose logs ms-campuslab-bookings` |
| Base de datos error | `docker-compose logs postgres` |
| Servicio no inicia | Ver logs: `docker-compose logs -f nombre` |

---

## 📋 Checklist Final

### Desarrollo Local
- [ ] Docker instalado
- [ ] Docker Compose instalado
- [ ] `docker-compose build` exitoso
- [ ] `docker-compose up -d` exitoso
- [ ] Frontend accesible en http://localhost:4200
- [ ] APIs respondiendo

### AWS EC2
- [ ] Instancia EC2 ejecutándose
- [ ] Docker y Docker Compose instalados
- [ ] Código clonado
- [ ] `.env` configurado con IP: 32.192.223.53
- [ ] Security Group abierto
- [ ] `ec2-deploy.sh` ejecutado
- [ ] Frontend accesible en http://32.192.223.53:4200
- [ ] APIs respondiendo

---

## 🔗 Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Spring Boot with Docker](https://spring.io/guides/gs/spring-boot-docker/)
- [Angular Docker](https://angular.io/guide/build)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)

---

## 📞 Contacto y Soporte

Para problemas específicos:
1. Revisar logs: `docker-compose logs -f`
2. Consultar `EC2-DEPLOYMENT.md` para temas de EC2
3. Consultar `DOCKER-ADVANCED.md` para configuración avanzada

---

**Versión**: 1.0  
**Fecha**: 2026-09-11  
**Configurado para**: 32.192.223.53 (EC2)

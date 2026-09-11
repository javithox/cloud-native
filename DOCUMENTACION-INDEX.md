# 📖 Índice de Documentación - CampusLab Docker

## 🚀 Empieza Aquí

1. **[QUICK-START.md](QUICK-START.md)** - ⚡ 30 segundos para empezar
2. **[CONFIGURACION-RESUMEN.md](CONFIGURACION-RESUMEN.md)** - 📋 Lo que se configuró

---

## 📚 Documentación Principal

### Para Desarrollo Local
- **[DOCKER.md](DOCKER.md)** - Guía completa de Docker Compose (141 líneas)
  - Requisitos previos
  - Construcción de imágenes
  - Ejecución de la aplicación
  - Acceso a servicios
  - Base de datos
  - Solución de problemas
  - Reconstrucción de imágenes

- **[DOCKER-QUICK-REFERENCE.md](DOCKER-QUICK-REFERENCE.md)** - 📌 Referencia rápida
  - Comandos esenciales
  - URLs de acceso
  - Credenciales
  - Solución rápida de problemas
  - Tips útiles

### Para AWS EC2
- **[EC2-DEPLOYMENT.md](EC2-DEPLOYMENT.md)** - 🚀 Guía de despliegue en EC2
  - Requisitos previos en EC2
  - Clonación del proyecto
  - Configuración de seguridad
  - Despliegue con Docker Compose
  - Acceso a servicios
  - Monitoreo y mantenimiento
  - Solución de problemas en EC2
  - Seguridad en producción

### Configuración Técnica Específica
- **[BACKEND-DOCKER-CONFIG.md](BACKEND-DOCKER-CONFIG.md)** - 🔧 Backend (Java/Spring Boot)
  - Cambios en configuración
  - Build del backend
  - Variables de entorno
  - Comunicación entre servicios
  - Base de datos (H2 → PostgreSQL)
  - Monitoreo
  - Troubleshooting backend

- **[FRONTEND-DOCKER-CONFIG.md](FRONTEND-DOCKER-CONFIG.md)** - 🖥️ Frontend (Angular)
  - Archivo environment.ts
  - Variables de entorno
  - Estructura de build
  - Scripts npm
  - Conectividad con APIs
  - Autenticación MSAL
  - Build optimizado
  - Troubleshooting frontend

### Configuración Avanzada
- **[DOCKER-ADVANCED.md](DOCKER-ADVANCED.md)** - ⚙️ Temas avanzados
  - Personalización de docker-compose.yml
  - Configuración de base de datos
  - Gestión de imágenes
  - Seguridad
  - Monitoreo
  - Despliegue en producción
  - CI/CD Integration
  - Debugging avanzado
  - Checklist pre-producción

---

## 🛠️ Scripts de Automatización

### Windows (PowerShell)
```powershell
.\docker-init.ps1
```
Menú interactivo para:
- Iniciar servicios
- Ver estado
- Ver logs
- Parar/Limpiar

### Linux / Mac (Bash)
```bash
chmod +x docker-init.sh
./docker-init.sh
```

### AWS EC2 (Auto-Deploy)
```bash
chmod +x ec2-deploy.sh
./ec2-deploy.sh
```
Instalación automática de:
- Docker
- Docker Compose
- Construcción de imágenes
- Inicio de servicios

---

## 📁 Estructura de Archivos

```
cloud-native/
│
├── 📖 DOCUMENTACIÓN
│   ├── QUICK-START.md                    (Empieza aquí ⭐)
│   ├── CONFIGURACION-RESUMEN.md          (Resumen de cambios)
│   ├── DOCKER.md                         (Guía completa)
│   ├── DOCKER-QUICK-REFERENCE.md         (Referencia rápida)
│   ├── DOCKER-ADVANCED.md                (Temas avanzados)
│   ├── EC2-DEPLOYMENT.md                 (Despliegue AWS)
│   ├── BACKEND-DOCKER-CONFIG.md          (Config Backend)
│   ├── FRONTEND-DOCKER-CONFIG.md         (Config Frontend)
│   ├── README.md                         (Documentación original)
│   └── DOCUMENTACION-INDEX.md            (Este archivo)
│
├── 🐳 DOCKER
│   ├── compose.yml                       (Principal - Orquestación)
│   ├── .env                              (Variables - EC2)
│   ├── .env.example                      (Plantilla de .env)
│   ├── .dockerignore
│   ├── backend/Dockerfile                (Build Java)
│   ├── backend/.dockerignore
│   ├── backend/application-docker.yml    (Config Spring)
│   ├── Frontend/Dockerfile               (Build Angular)
│   └── Frontend/.dockerignore
│
├── 🚀 SCRIPTS
│   ├── docker-init.ps1                   (Windows)
│   ├── docker-init.sh                    (Linux/Mac)
│   └── ec2-deploy.sh                     (AWS EC2)
│
├── 📦 CÓDIGO
│   ├── backend/                          (Java/Spring Boot)
│   ├── Frontend/                         (Angular)
│   └── data/                             (Datos)
│
└── 📋 CONFIGURACIÓN
    ├── compose.yml                       (Docker Compose)
    └── infra/                            (Infraestructura)
```

---

## 🎯 Mapeo: "Quiero hacer X"

| Necesito... | Consulta... |
|-------------|-------------|
| Empezar rápido | QUICK-START.md |
| Entiendiendo qué cambió | CONFIGURACION-RESUMEN.md |
| Guía completa paso a paso | DOCKER.md |
| Comando rápido | DOCKER-QUICK-REFERENCE.md |
| Desplegar en AWS EC2 | EC2-DEPLOYMENT.md |
| Entender Backend/Java | BACKEND-DOCKER-CONFIG.md |
| Entender Frontend/Angular | FRONTEND-DOCKER-CONFIG.md |
| Configuración avanzada | DOCKER-ADVANCED.md |
| Seguridad en producción | DOCKER-ADVANCED.md #Seguridad |
| Debugging | DOCKER-ADVANCED.md #Debugging |
| Monitoreo | DOCKER-ADVANCED.md #Monitoreo |
| CI/CD | DOCKER-ADVANCED.md #CI/CD |

---

## 🌐 Servicios Disponibles

| Servicio | Puerto | Tipo | Acceso |
|----------|--------|------|--------|
| Frontend | 4200 | Web | http://localhost:4200 |
| API Bookings | 8082 | REST | http://localhost:8082 |
| API Catalog | 8081 | REST | http://localhost:8081 |
| API Audit | 8083 | REST | http://localhost:8083 |
| API Notify | 8084 | REST | http://localhost:8084 |
| API Report | 8085 | REST | http://localhost:8085 |
| PostgreSQL | 5432 | BD | localhost:5432 |
| RabbitMQ | 5672 | MQ | localhost:5672 |
| RabbitMQ Admin | 15672 | Web | http://localhost:15672 |
| Kafka | 9092 | Event | localhost:9092 |

---

## 📊 Tecnologías

| Componente | Versión | Imagen |
|-----------|---------|--------|
| Frontend | Angular 21 | node:22-alpine |
| Backend | Spring Boot 4.1.1 | eclipse-temurin:21-jre-alpine |
| Java | 21 | temurin:21-jre-alpine |
| PostgreSQL | 16 | postgres:16-alpine |
| RabbitMQ | 3 | rabbitmq:3-management-alpine |
| Kafka | 3.9.0 | apache/kafka:3.9.0 |

---

## 🔐 Credenciales Predeterminadas

```
PostgreSQL:
  User: campuslab
  Pass: campuslab
  DB: campuslab

RabbitMQ:
  User: guest
  Pass: guest
```

⚠️ Cambiar en producción (ver DOCKER-ADVANCED.md)

---

## 🚀 Quick Commands

```bash
# Iniciar
docker-compose up -d

# Ver estado
docker-compose ps

# Logs
docker-compose logs -f

# Parar
docker-compose stop

# Parar y limpiar
docker-compose down

# Parar, limpiar y perder datos
docker-compose down -v
```

---

## 📋 Checklist Inicial

- [ ] Docker instalado
- [ ] Docker Compose instalado
- [ ] `docker-compose build` exitoso
- [ ] `docker-compose up -d` exitoso
- [ ] `docker-compose ps` muestra todos UP
- [ ] Frontend accesible en http://localhost:4200
- [ ] API respondiendo en http://localhost:8082
- [ ] Logs sin errores críticos
- [ ] Base de datos conectada
- [ ] RabbitMQ accesible en http://localhost:15672

---

## 🎓 Camino de Aprendizaje

**Nivel 1: Principiante**
1. Lee QUICK-START.md
2. Ejecuta `docker-compose up`
3. Accede a http://localhost:4200
4. Juega con `docker-compose ps`, `logs`, etc.

**Nivel 2: Intermedio**
1. Lee DOCKER.md completo
2. Modifica compose.yml para cambiar puertos
3. Agrega variables de entorno
4. Debuggea un servicio con logs

**Nivel 3: Avanzado**
1. Lee DOCKER-ADVANCED.md
2. Desplega en AWS EC2
3. Configura HTTPS
4. Implementa CI/CD

---

## 🔗 Links Útiles

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Spring Boot & Docker](https://spring.io/guides/gs/spring-boot-docker/)
- [Angular Docker](https://angular.io/guide/build)
- [AWS EC2](https://docs.aws.amazon.com/ec2/)

---

## 📞 Soporte y FAQ

### ¿Dónde empiezo?
→ **QUICK-START.md**

### ¿Cómo despliego en AWS?
→ **EC2-DEPLOYMENT.md**

### ¿Algo no funciona?
→ Sección "Troubleshooting" en **DOCKER.md** o **EC2-DEPLOYMENT.md**

### ¿Cómo cambio configuración?
→ **DOCKER-ADVANCED.md**

### ¿Cómo aseguro la aplicación?
→ **DOCKER-ADVANCED.md** #Seguridad

---

## 🎉 ¡Listo!

1. Ve a **QUICK-START.md**
2. Ejecuta los comandos
3. Abre http://localhost:4200
4. ¡Disfruta! 🎊

---

**Última actualización**: 2026-09-11  
**Versión**: 1.0  
**IP EC2 Configurada**: 32.192.223.53  
**Mantenedor**: GitHub Copilot

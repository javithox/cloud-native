# 🚀 QUICK START - CampusLab Docker

## ⚡ 30 segundos para empezar (Windows)

```powershell
# 1. Navega a la carpeta del proyecto
cd c:\Users\javier\Desktop\cloud-native

# 2. Ejecuta
.\docker-init.ps1

# 3. Selecciona opción 1 (Iniciar todo)

# 4. Abre navegador
# http://localhost:4200
```

---

## ⚡ 30 segundos para empezar (Linux/Mac)

```bash
cd ~/campuslab

chmod +x docker-init.sh
./docker-init.sh

# Opción 1: Iniciar todo

# Abre navegador
# http://localhost:4200
```

---

## ⚡ 1 minuto para desplegar en EC2

```bash
# SSH a tu instancia
ssh -i tu-key.pem ec2-user@32.192.223.53

# Clonar
git clone <tu-repo>
cd campuslab

# Desplegar
chmod +x ec2-deploy.sh
./ec2-deploy.sh

# Abre navegador
# http://32.192.223.53:4200
```

---

## 📚 Documentación Completa

### 🎯 Por Caso de Uso

| Quiero... | Leo... |
|-----------|--------|
| Empezar rápido en desarrollo | `QUICK-START.md` (este archivo) |
| Guía completa de Docker | `DOCKER.md` |
| Comandos rápidos | `DOCKER-QUICK-REFERENCE.md` |
| Desplegar en EC2 | `EC2-DEPLOYMENT.md` |
| Configuración avanzada | `DOCKER-ADVANCED.md` |
| Entender Backend/Java | `BACKEND-DOCKER-CONFIG.md` |
| Entender Frontend/Angular | `FRONTEND-DOCKER-CONFIG.md` |
| Resumen de cambios | `CONFIGURACION-RESUMEN.md` |

---

## 📋 Requisitos Mínimos

✅ Docker (cualquier versión reciente)  
✅ Docker Compose  
✅ 4GB RAM disponible  
✅ 2GB espacio en disco  

**Verificar**:
```bash
docker --version
docker-compose --version
```

---

## 🌐 URLs de Acceso

### Desarrollo Local
```
Frontend:     http://localhost:4200
API Bookings: http://localhost:8082
API Catalog:  http://localhost:8081
```

### EC2 (32.192.223.53)
```
Frontend:     http://32.192.223.53:4200
API Bookings: http://32.192.223.53:8082
API Catalog:  http://32.192.223.53:8081
```

---

## 🎮 Controles Básicos

```bash
# Iniciar
docker-compose up -d

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar
docker-compose stop

# Limpiar (sin perder datos)
docker-compose down

# Limpiar TODO (perder datos)
docker-compose down -v
```

---

## 🔧 Archivos Clave

```
cloud-native/
├── compose.yml              ← Configuración Docker Compose
├── .env                     ← Variables de entorno (CREADO)
├── .env.example             ← Plantilla de .env
│
├── backend/
│   ├── Dockerfile           ← Build Java/Spring Boot
│   ├── .dockerignore        ← Archivos a ignorar en build
│   └── application-docker.yml  ← Config para Docker
│
├── Frontend/
│   ├── Dockerfile           ← Build Angular
│   └── .dockerignore        ← Archivos a ignorar en build
│
├── DOCKER.md                ← Guía completa
├── DOCKER-QUICK-REFERENCE.md
├── DOCKER-ADVANCED.md
├── EC2-DEPLOYMENT.md
├── BACKEND-DOCKER-CONFIG.md
├── FRONTEND-DOCKER-CONFIG.md
└── CONFIGURACION-RESUMEN.md
```

---

## 🐳 Lo Que Se Está Ejecutando

```
┌────────────────────────────────────────┐
│           DOCKER CONTAINERS            │
├────────────────────────────────────────┤
│ postgres (5432)        - Base de datos  │
│ rabbitmq (5672)        - Mensajería     │
│ kafka (9092)           - Eventos        │
│ ms-campuslab-bookings (8082) - API    │
│ ms-campuslab-catalog (8081)  - API    │
│ ms-campuslab-audit (8083)    - API    │
│ ms-campuslab-notify (8084)   - API    │
│ ms-campuslab-report (8085)   - API    │
│ frontend (4200)        - Web Angular    │
└────────────────────────────────────────┘
```

---

## 🔐 Credenciales

```
PostgreSQL:
  User: campuslab
  Pass: campuslab

RabbitMQ:
  User: guest
  Pass: guest
```

Acceso RabbitMQ: http://localhost:15672 o http://32.192.223.53:15672

---

## 📊 Ver Qué Está Pasando

```bash
# Todo
docker-compose logs -f

# Un servicio
docker-compose logs -f ms-campuslab-bookings

# Últimas 50 líneas
docker-compose logs --tail=50 ms-campuslab-bookings

# Filtrar por palabra
docker-compose logs | grep ERROR

# Estadísticas
docker stats
```

---

## 🆘 Algo No Funciona

### El Frontend no carga
```bash
docker-compose logs frontend
# Busca errores, luego:
docker-compose restart frontend
```

### Las APIs no responden
```bash
# Verificar que estén corriendo
docker-compose ps

# Ver logs de una API
docker-compose logs ms-campuslab-bookings

# Probar conectividad
curl http://localhost:8082/actuator/health
```

### Base de datos falla
```bash
docker-compose logs postgres

# Si realmente está corrupta (perderás datos):
docker-compose down -v
docker-compose up -d postgres
```

### Puerto en uso
```bash
# Cambiar puerto en compose.yml
# Línea: ports: - "NUEVO_PUERTO:PUERTO_INTERNO"
```

---

## 🚀 Actualizar Código

```bash
# 1. Traer cambios
git pull

# 2. Reconstruir y reiniciar
docker-compose up -d --build

# 3. Esperar y verificar
docker-compose ps
docker-compose logs -f
```

---

## 📱 Acceder desde Otro PC

### Misma Red Local (Wifi)
```
Tu PC:  192.168.1.100:4200
Otro:   192.168.1.100:4200  (usa tu IP local)
```

### Desde Internet (EC2)
```
http://32.192.223.53:4200
```

**Nota**: Necesita Security Group abierto en AWS

---

## 🎯 Flujo Típico del Desarrollo

```bash
# Mañana: Iniciar
docker-compose up -d

# Durante el día: Ver logs si hay problemas
docker-compose logs -f

# Cambios en código: Reconstruir
docker-compose up -d --build

# Tarde: Parar para almorzar (opcional)
docker-compose stop

# Noche: Parar todo
docker-compose down
```

---

## 🔗 Próximo Nivel

### Ver Documentación Completa
- Lee `DOCKER.md` para entender qué está pasando
- Lee `EC2-DEPLOYMENT.md` si despliegas en AWS
- Lee `DOCKER-ADVANCED.md` para configuración avanzada

### Desplegar en Producción
1. Cambiar credenciales en `.env`
2. Desplegar en EC2
3. Configurar HTTPS
4. Configurar backups

### Monitoring
1. Ver logs regularmente
2. Revisar recursos (`docker stats`)
3. Configurar alertas

---

## 📞 Ayuda Rápida

| Comando | Qué hace |
|---------|----------|
| `docker-compose up -d` | Iniciar todo |
| `docker-compose ps` | Ver estado |
| `docker-compose logs -f` | Ver logs |
| `docker-compose restart` | Reiniciar |
| `docker-compose stop` | Parar |
| `docker-compose down` | Parar y limpiar |
| `docker-compose down -v` | Parar y limpiar TODO |

---

## ✅ Validación Rápida

```bash
# Esto debería imprimir sin errores:
curl http://localhost:4200        # Frontend
curl http://localhost:8082        # API
docker-compose ps                 # Todos UP
```

---

## 🎓 Para Aprender Más

- Leer `DOCKER.md` (guía paso a paso)
- Leer `DOCKER-QUICK-REFERENCE.md` (todos los comandos)
- Ver logs: `docker-compose logs -f`
- Explorar: `docker-compose exec nombre_servicio sh`

---

**¡Listo! Ya estás corriendo CampusLab en Docker.**

Próximo paso: Abre tu navegador en http://localhost:4200

---

*Si algo no funciona, consulta la sección "🆘 Algo No Funciona" arriba.*

# 🚀 Despliegue en AWS EC2 - CampusLab

## 📍 Información de la Instancia EC2

- **IP Pública**: 32.192.223.53
- **Región**: (verifica tu región en AWS Console)
- **Tipo de Instancia**: (verifica el tipo)

---

## 🔧 Requisitos Previos en EC2

### 1. Actualizar Sistema
```bash
sudo yum update -y
# O para Ubuntu:
# sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Docker
```bash
# Amazon Linux 2 / RHEL:
sudo yum install -y docker
sudo usermod -aG docker ec2-user
sudo systemctl start docker
sudo systemctl enable docker

# Ubuntu:
# curl -fsSL https://get.docker.com -o get-docker.sh
# sudo sh get-docker.sh
# sudo usermod -aG docker ubuntu
```

### 3. Instalar Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 4. Instalar Git (si no está instalado)
```bash
sudo yum install -y git
# O: sudo apt install -y git
```

---

## 📥 Clonar el Proyecto en EC2

```bash
# SSH en tu instancia EC2
ssh -i tu-key.pem ec2-user@32.192.223.53

# Clonar repositorio
git clone <tu-repo-url> ~/campuslab
cd ~/campuslab
```

---

## 🔐 Configurar Seguridad en EC2

### Security Groups - Puertos Requeridos
Abre los siguientes puertos en AWS Security Group:

| Puerto | Protocolo | Origen | Servicio |
|--------|-----------|--------|----------|
| 22 | TCP | Tu IP | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP (futuro Nginx) |
| 443 | TCP | 0.0.0.0/0 | HTTPS (futuro) |
| 4200 | TCP | 0.0.0.0/0 | Frontend Angular |
| 8081 | TCP | 0.0.0.0/0 | API Catalog |
| 8082 | TCP | 0.0.0.0/0 | API Bookings |
| 8083 | TCP | 0.0.0.0/0 | API Audit |
| 8084 | TCP | 0.0.0.0/0 | API Notify |
| 8085 | TCP | 0.0.0.0/0 | API Report |
| 15672 | TCP | Tu IP | RabbitMQ Admin |
| 5432 | TCP | Interna | PostgreSQL (solo desde EC2) |
| 9092 | TCP | Interna | Kafka (solo desde EC2) |

### Comando para abrir puerto en Security Group
```bash
# En AWS Console o mediante AWS CLI:
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 4200 \
  --cidr 0.0.0.0/0
```

---

## 🐳 Desplegar con Docker Compose

### 1. Verificar el Archivo .env
```bash
cat .env
# Debe mostrar:
# API_URL=http://32.192.223.53:8082
```

### 2. Crear Archivos de Configuración Necesarios
```bash
# Copiar configuraciones de ejemplo
cp .env.example .env
# Editar .env con tu IP:
# nano .env
# Cambiar: API_URL=http://32.192.223.53:8082
```

### 3. Construir Imágenes (Primera Vez)
```bash
# Esto puede tardar 10-20 minutos
docker-compose build
```

### 4. Iniciar Servicios
```bash
# En background
docker-compose up -d

# O con logs
docker-compose up

# Verificar estado
docker-compose ps
```

### 5. Esperar a que Healthchecks Pasen
```bash
# Monitorear hasta que todo esté "healthy"
watch docker-compose ps

# O con logs
docker-compose logs -f
```

---

## 🌐 Acceder a la Aplicación

Desde tu navegador, accede con la IP pública de EC2:

| Servicio | URL |
|----------|-----|
| **Frontend** | http://32.192.223.53:4200 |
| **API Bookings** | http://32.192.223.53:8082 |
| **API Catalog** | http://32.192.223.53:8081 |
| **API Audit** | http://32.192.223.53:8083 |
| **API Notify** | http://32.192.223.53:8084 |
| **API Report** | http://32.192.223.53:8085 |
| **RabbitMQ Admin** | http://32.192.223.53:15672 |

**Credenciales RabbitMQ**:
- Usuario: guest
- Contraseña: guest

---

## 📊 Monitoreo y Mantenimiento

### Ver Logs
```bash
# Todos los servicios
docker-compose logs -f

# Un servicio específico
docker-compose logs -f ms-campuslab-bookings

# Últimas líneas
docker-compose logs --tail=50 ms-campuslab-bookings
```

### Ver Estado
```bash
docker-compose ps
docker stats
```

### Reiniciar Servicios
```bash
# Reiniciar uno
docker-compose restart ms-campuslab-bookings

# Reiniciar todos
docker-compose restart
```

### Detener Todo
```bash
docker-compose stop
```

### Actualizar Código
```bash
# Traer cambios
git pull

# Reconstruir
docker-compose up -d --build

# Ver cambios
docker-compose logs -f
```

---

## 🔧 Solución de Problemas en EC2

### El frontend no carga
```bash
# 1. Verificar si está corriendo
docker-compose ps frontend

# 2. Ver logs
docker-compose logs frontend

# 3. Probar conectividad
curl -I http://32.192.223.53:4200

# 4. Verificar Security Group
# Asegurar que el puerto 4200 está abierto
```

### La API no responde
```bash
# 1. Ver logs del servicio
docker-compose logs ms-campuslab-bookings

# 2. Verificar conectividad
curl http://32.192.223.53:8082/health

# 3. Verificar base de datos
docker-compose logs postgres
```

### Base de datos no inicia
```bash
# Ver logs
docker-compose logs postgres

# Limpiar volúmenes (CUIDADO: pierde datos)
docker-compose down -v
docker-compose up -d postgres
```

### Espacio en disco agotado
```bash
# Ver espacio
df -h

# Limpiar imágenes no usadas
docker image prune -a

# Limpiar contenedores parados
docker container prune

# Limpiar volúmenes no usados
docker volume prune
```

---

## 🛡️ Seguridad en Producción

### 1. Cambiar Credenciales Predeterminadas
```bash
# Editar .env
nano .env

# Cambiar:
POSTGRES_PASSWORD=contraseña_segura
RABBITMQ_DEFAULT_PASS=contraseña_segura
```

### 2. Usar HTTPS (Recomendado)
```bash
# Instalar Nginx como reverse proxy con SSL
# (Ver DOCKER-ADVANCED.md para configuración)
```

### 3. Restricción de Acceso
```bash
# En Security Group: Solo permitir acceso desde IPs conocidas
# En lugar de 0.0.0.0/0, usar tu IP específica
```

### 4. Copias de Seguridad
```bash
# Backup de base de datos
docker-compose exec postgres pg_dump -U campuslab campuslab > backup_$(date +%Y%m%d).sql

# Restaurar
docker-compose exec -T postgres psql -U campuslab campuslab < backup.sql
```

---

## 📈 Escalabilidad

### Aumentar Recursos
Editar `docker-compose.yml`:

```yaml
services:
  ms-campuslab-bookings:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Usar Instancia Más Grande
```bash
# Parar servicios
docker-compose down

# En AWS Console: Stop instancia → Cambiar tipo → Start
# Redeploy:
docker-compose up -d
```

---

## 🚀 Actualizar a HTTPS con Certbot

```bash
# 1. Instalar Certbot
sudo yum install -y certbot python3-certbot-nginx

# 2. Obtener certificado
sudo certbot certonly --standalone -d 32.192.223.53

# 3. Configurar Nginx (opcional)
# Crear nginx.conf con SSL
```

---

## 📝 Comandos Rápidos para EC2

```bash
# Conectar SSH
ssh -i tu-key.pem ec2-user@32.192.223.53

# Navegar al proyecto
cd ~/campuslab

# Iniciar
docker-compose up -d

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Detener
docker-compose stop

# Parar y limpiar
docker-compose down

# Actualizar
git pull && docker-compose up -d --build
```

---

## ✅ Checklist de Despliegue

- [ ] EC2 creada y corriendo
- [ ] Docker y Docker Compose instalados
- [ ] Código clonado en EC2
- [ ] `.env` configurado con IP pública
- [ ] Security Group abierto con puertos necesarios
- [ ] Imagen construida (`docker-compose build`)
- [ ] Servicios iniciados (`docker-compose up -d`)
- [ ] Frontend accesible en http://32.192.223.53:4200
- [ ] APIs respondiendo (prueba un endpoint)
- [ ] Base de datos conectada
- [ ] Logs monitoreados sin errores
- [ ] Credenciales cambiadas
- [ ] Backup configurado

---

## 🆘 Soporte

### Información Útil para Debugging
```bash
# Versión de Docker
docker --version
docker-compose --version

# Información de sistema
uname -a
df -h
free -h

# IP de la instancia
curl http://169.254.169.254/latest/meta-data/public-ipv4

# Ver reglas de firewall
sudo iptables -L
```

---

**Última actualización**: 2026-09-11
**IP EC2 Configurada**: 32.192.223.53

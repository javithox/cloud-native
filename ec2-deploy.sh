#!/bin/bash

# Script de despliegue automatizado para AWS EC2
# Uso: chmod +x ec2-deploy.sh && ./ec2-deploy.sh

set -e

IP_EC2="3.238.17.63"
PROJECT_NAME="campuslab"

echo "╔════════════════════════════════════════════════════════╗"
echo "║        CampusLab - EC2 Auto Deployment Script         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "🎯 Configurando para IP: $IP_EC2"
echo ""

# Función para imprimir secciones
print_section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "▶ $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# 1. Verificar Docker
print_section "1. Verificando Docker"
if ! command -v docker &> /dev/null; then
    echo "✗ Docker no está instalado"
    echo ""
    echo "📦 Instalando Docker..."
    sudo yum update -y
    sudo yum install -y docker
    sudo usermod -aG docker ec2-user
    sudo systemctl start docker
    sudo systemctl enable docker
    echo "✓ Docker instalado"
else
    echo "✓ Docker encontrado: $(docker --version)"
fi

# 2. Verificar Docker Compose
print_section "2. Verificando Docker Compose"
if ! command -v docker-compose &> /dev/null; then
    echo "✗ Docker Compose no está instalado"
    echo ""
    echo "📦 Instalando Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✓ Docker Compose instalado"
else
    echo "✓ Docker Compose encontrado: $(docker-compose --version)"
fi

# 3. Configurar archivos
print_section "3. Configurando archivos"

# Crear .env si no existe
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env con IP de EC2..."
    cat > .env << EOF
# ========== EC2 Configuration ==========
# IP Pública de EC2: $IP_EC2

POSTGRES_DB=campuslab
POSTGRES_USER=campuslab
POSTGRES_PASSWORD=campuslab
SPRING_PROFILES_ACTIVE=docker
API_URL=http://$IP_EC2:8082
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
RABBITMQ_HOST=rabbitmq
POSTGRES_HOST=postgres
CATALOG_BASE_URL=http://ms-campuslab-catalog:8081
EOF
    echo "✓ .env configurado"
else
    echo "✓ .env ya existe"
fi

# 4. Crear directorios necesarios
print_section "4. Preparando directorios"
mkdir -p ./data
mkdir -p ./logs
echo "✓ Directorios creados"

# 5. Construir imágenes
print_section "5. Construyendo imágenes Docker"
echo "⏳ Esto puede tardar 10-20 minutos..."
docker-compose build

# 6. Iniciar servicios
print_section "6. Iniciando servicios"
docker-compose up -d

# 7. Esperar a que Healthchecks pasen
print_section "7. Esperando a que servicios estén saludables"
echo "⏳ Esperando 30 segundos..."
sleep 30

# Verificar estado
echo ""
echo "📊 Estado de servicios:"
docker-compose ps

# 8. Pruebas básicas
print_section "8. Realizando pruebas de conectividad"

echo "Probando Frontend..."
if curl -s http://localhost:4200 > /dev/null; then
    echo "✓ Frontend accesible en http://$IP_EC2:4200"
else
    echo "⚠ Frontend aún está iniciando..."
fi

echo ""
echo "Probando API Bookings..."
if curl -s http://localhost:8082/actuator/health > /dev/null; then
    echo "✓ API Bookings accesible en http://$IP_EC2:8082"
else
    echo "⚠ API aún está iniciando..."
fi

# 9. Mostrar resumen
print_section "9. Resumen de Despliegue"

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                 ✓ ¡Despliegue Completado!             ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 URLs de Acceso:"
echo "   Frontend:        http://$IP_EC2:4200"
echo "   API Bookings:    http://$IP_EC2:8082"
echo "   API Catalog:     http://$IP_EC2:8081"
echo "   API Audit:       http://$IP_EC2:8083"
echo "   API Notify:      http://$IP_EC2:8084"
echo "   API Report:      http://$IP_EC2:8085"
echo "   RabbitMQ Admin:  http://$IP_EC2:15672"
echo ""
echo "🔐 Credenciales RabbitMQ:"
echo "   Usuario: guest"
echo "   Contraseña: guest"
echo ""
echo "📋 Comandos Útiles:"
echo "   Ver estado:      docker-compose ps"
echo "   Ver logs:        docker-compose logs -f"
echo "   Parar:           docker-compose stop"
echo "   Reiniciar:       docker-compose restart"
echo "   Actualizar:      git pull && docker-compose up -d --build"
echo ""
echo "📚 Documentación: Ver EC2-DEPLOYMENT.md para más información"
echo ""

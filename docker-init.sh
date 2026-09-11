#!/bin/bash

# Script de inicialización de Docker para CampusLab
# Uso: chmod +x docker-init.sh && ./docker-init.sh

echo "╔═══════════════════════════════════════════════════╗"
echo "║         CampusLab - Docker Initialize            ║"
echo "╚═══════════════════════════════════════════════════╝"

# Verificar si Docker está instalado
echo ""
echo "Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "✗ Docker no está instalado. Instálalo desde https://www.docker.com"
    exit 1
fi
echo "✓ Docker encontrado: $(docker --version)"

# Verificar si Docker Compose está disponible
echo "Verificando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "✗ Docker Compose no está instalado."
    exit 1
fi
echo "✓ Docker Compose encontrado: $(docker-compose --version)"

# Mostrar menú de opciones
echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║            Elige una opción:                       ║"
echo "╚═══════════════════════════════════════════════════╝"
echo "1. Iniciar todo (up)"
echo "2. Iniciar y reconstruir imágenes (up --build)"
echo "3. Ver estado de servicios (ps)"
echo "4. Ver logs"
echo "5. Detener todo (stop)"
echo "6. Limpiar todo (down)"
echo "7. Limpiar todo con volúmenes (down -v)"
echo "0. Salir"

read -p "Opción: " option

case $option in
    1)
        echo ""
        echo "▶ Iniciando servicios..."
        docker-compose up -d
        echo "✓ Servicios iniciados. Accede a http://localhost:4200"
        docker-compose ps
        ;;
    2)
        echo ""
        echo "▶ Construyendo imágenes e iniciando servicios..."
        docker-compose up -d --build
        echo "✓ Servicios construidos e iniciados."
        docker-compose ps
        ;;
    3)
        echo ""
        echo "▶ Estado de servicios:"
        docker-compose ps
        ;;
    4)
        echo ""
        echo "▶ Logs en tiempo real (Ctrl+C para salir):"
        docker-compose logs -f
        ;;
    5)
        echo ""
        echo "▶ Deteniendo servicios..."
        docker-compose stop
        echo "✓ Servicios detenidos."
        ;;
    6)
        echo ""
        echo "▶ Eliminando contenedores..."
        docker-compose down
        echo "✓ Contenedores eliminados."
        ;;
    7)
        echo ""
        echo "⚠  Esto eliminará todos los datos. ¿Estás seguro? (s/n)"
        read confirm
        if [ "$confirm" = "s" ]; then
            echo "▶ Eliminando todo con volúmenes..."
            docker-compose down -v
            echo "✓ Todo eliminado."
        else
            echo "Cancelado."
        fi
        ;;
    0)
        echo "Saliendo..."
        exit 0
        ;;
    *)
        echo "Opción no válida."
        exit 1
        ;;
esac

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║            URLs de Acceso:                         ║"
echo "╚═══════════════════════════════════════════════════╝"
echo "Frontend:        http://localhost:4200"
echo "API Bookings:    http://localhost:8082"
echo "API Catalog:     http://localhost:8081"
echo "API Audit:       http://localhost:8083"
echo "RabbitMQ Admin:  http://localhost:15672"
echo ""

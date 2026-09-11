#!/usr/bin/env pwsh

# Script de inicialización de Docker para CampusLab
# Uso: .\docker-init.ps1

Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         CampusLab - Docker Initialize            ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Verificar si Docker está instalado
Write-Host "`nVerificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker no está instalado. Instálalo desde https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Verificar si Docker Compose está disponible
Write-Host "Verificando Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "✓ Docker Compose encontrado: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Compose no está instalado." -ForegroundColor Red
    exit 1
}

# Mostrar menú de opciones
Write-Host "`n╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║            Elige una opción:                       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "1. Iniciar todo (up)" -ForegroundColor White
Write-Host "2. Iniciar y reconstruir imágenes (up --build)" -ForegroundColor White
Write-Host "3. Ver estado de servicios (ps)" -ForegroundColor White
Write-Host "4. Ver logs" -ForegroundColor White
Write-Host "5. Detener todo (stop)" -ForegroundColor White
Write-Host "6. Limpiar todo (down)" -ForegroundColor White
Write-Host "7. Limpiar todo con volúmenes (down -v)" -ForegroundColor White
Write-Host "0. Salir" -ForegroundColor White

$option = Read-Host "`nOpción"

switch ($option) {
    "1" {
        Write-Host "`n▶ Iniciando servicios..." -ForegroundColor Yellow
        docker-compose up -d
        Write-Host "✓ Servicios iniciados. Accede a http://localhost:4200" -ForegroundColor Green
        docker-compose ps
    }
    "2" {
        Write-Host "`n▶ Construyendo imágenes e iniciando servicios..." -ForegroundColor Yellow
        docker-compose up -d --build
        Write-Host "✓ Servicios construidos e iniciados." -ForegroundColor Green
        docker-compose ps
    }
    "3" {
        Write-Host "`n▶ Estado de servicios:" -ForegroundColor Yellow
        docker-compose ps
    }
    "4" {
        Write-Host "`n▶ Logs en tiempo real (Ctrl+C para salir):" -ForegroundColor Yellow
        docker-compose logs -f
    }
    "5" {
        Write-Host "`n▶ Deteniendo servicios..." -ForegroundColor Yellow
        docker-compose stop
        Write-Host "✓ Servicios detenidos." -ForegroundColor Green
    }
    "6" {
        Write-Host "`n▶ Eliminando contenedores..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "✓ Contenedores eliminados." -ForegroundColor Green
    }
    "7" {
        Write-Host "`n⚠  Esto eliminará todos los datos. ¿Estás seguro? (s/n)" -ForegroundColor Red
        $confirm = Read-Host
        if ($confirm -eq "s") {
            Write-Host "▶ Eliminando todo con volúmenes..." -ForegroundColor Yellow
            docker-compose down -v
            Write-Host "✓ Todo eliminado." -ForegroundColor Green
        } else {
            Write-Host "Cancelado." -ForegroundColor Yellow
        }
    }
    "0" {
        Write-Host "Saliendo..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Opción no válida." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║            URLs de Acceso:                         ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "Frontend:        http://localhost:4200" -ForegroundColor Green
Write-Host "API Bookings:    http://localhost:8082" -ForegroundColor Green
Write-Host "API Catalog:     http://localhost:8081" -ForegroundColor Green
Write-Host "API Audit:       http://localhost:8083" -ForegroundColor Green
Write-Host "RabbitMQ Admin:  http://localhost:15672" -ForegroundColor Green
Write-Host "" -ForegroundColor Green

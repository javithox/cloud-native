# Definir el nombre del módulo (se puede sobrescribir en docker-compose.yml con build.args)
ARG MODULE_NAME=ms-campuslab-bookings

# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS builder

ARG MODULE_NAME
WORKDIR /build

# Copiar archivos de configuración
COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw* ./

# Copiar módulos
COPY ms-campuslab-bookings/ ms-campuslab-bookings/
COPY ms-campuslab-catalog/ ms-campuslab-catalog/
COPY ms-campuslab-notify/ ms-campuslab-notify/
COPY ms-campuslab-audit/ ms-campuslab-audit/
COPY ms-campuslab-report/ ms-campuslab-report/
COPY src/ src/

# Compilar únicamente el módulo deseado y sus dependencias (más rápido)
RUN mvn clean package -pl ${MODULE_NAME} -am -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

ARG MODULE_NAME
WORKDIR /app

# Copiar JAR generado dentro de la carpeta del módulo especificado
COPY --from=builder /build/${MODULE_NAME}/target/*.jar app.jar

# Crear directorio para datos
RUN mkdir -p /data

# Variable de entorno para el perfil de Spring
ENV SPRING_PROFILES_ACTIVE=docker

# Exponer puerto
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD java -cp /app/app.jar org.springframework.boot.loader.JarLauncher || exit 1

# Comando de inicio
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
# Definir el módulo por defecto
ARG MODULE_NAME=ms-campuslab-bookings

# --- Stage 1: Build ---
FROM maven:3.9.6-eclipse-temurin-21 AS builder

ARG MODULE_NAME
WORKDIR /build

# 1. Copiar archivos POM y dependencias primero para aprovechar el caché de Docker
COPY pom.xml .
COPY ms-campuslab-bookings/pom.xml ms-campuslab-bookings/
COPY ms-campuslab-catalog/pom.xml ms-campuslab-catalog/
COPY ms-campuslab-notify/pom.xml ms-campuslab-notify/
COPY ms-campuslab-audit/pom.xml ms-campuslab-audit/
COPY ms-campuslab-report/pom.xml ms-campuslab-report/

# Descargar dependencias en caché
RUN mvn dependency:go-offline -B || true

# 2. Copiar el código fuente completo
COPY . .

# 3. Compilar el módulo deseado
RUN mvn clean package -pl ${MODULE_NAME} -am -DskipTests

# 4. Aislar el JAR ejecutable filtrando el archivo .original
RUN find ${MODULE_NAME}/target -maxdepth 1 -name "*.jar" ! -name "*.original*" -exec cp {} /build/app.jar \;

# --- Stage 2: Runtime ---
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copiar directamente el ejecutable unificado
COPY --from=builder /build/app.jar /app/app.jar

RUN mkdir -p /data

ENV SPRING_PROFILES_ACTIVE=docker

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
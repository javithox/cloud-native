# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /build

# Copiar archivos de configuración
COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw mvnw.cmd ./

# Copiar módulos
COPY ms-campuslab-bookings/ ms-campuslab-bookings/
COPY ms-campuslab-catalog/ ms-campuslab-catalog/
COPY ms-campuslab-notify/ ms-campuslab-notify/
COPY ms-campuslab-audit/ ms-campuslab-audit/
COPY ms-campuslab-report/ ms-campuslab-report/
COPY src/ src/

# Compilar el proyecto
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copiar JAR del stage anterior
COPY --from=builder /build/target/backend-*.jar app.jar

# Crear directorio para datos
RUN mkdir -p /data

# Variable de entorno para el perfil de Spring
ENV SPRING_PROFILES_ACTIVE=docker

# Exponer puertos (ajusta según tus microservicios)
EXPOSE 8080 8081 8082 8083 8084 8085

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD java -cp /app/app.jar org.springframework.boot.loader.JarLauncher || exit 1

# Comando de inicio
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

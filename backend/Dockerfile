ARG MODULE_NAME=ms-campuslab-bookings
FROM maven:3.9.6-eclipse-temurin-21 AS builder
ARG MODULE_NAME
WORKDIR /build
COPY pom.xml .
COPY ms-campuslab-bookings/pom.xml ms-campuslab-bookings/
COPY ms-campuslab-catalog/pom.xml ms-campuslab-catalog/
COPY ms-campuslab-notify/pom.xml ms-campuslab-notify/
COPY ms-campuslab-audit/pom.xml ms-campuslab-audit/
COPY ms-campuslab-report/pom.xml ms-campuslab-report/
RUN mvn -B dependency:go-offline || true
COPY . .
RUN mvn -B clean package -pl ${MODULE_NAME} -am -DskipTests
RUN find ${MODULE_NAME}/target -maxdepth 1 -type f -name '*.jar' ! -name '*.original' -exec cp {} /build/app.jar \\;

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /build/app.jar /app/app.jar
ENV SPRING_PROFILES_ACTIVE=docker
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

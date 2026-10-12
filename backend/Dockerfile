ARG MODULE_NAME=ms-campuslab-bookings
FROM maven:3.9.9-eclipse-temurin-21 AS builder
ARG MODULE_NAME
WORKDIR /build
COPY pom.xml .
COPY ms-campuslab-bookings/pom.xml ms-campuslab-bookings/
COPY ms-campuslab-catalog/pom.xml ms-campuslab-catalog/
COPY ms-campuslab-notify/pom.xml ms-campuslab-notify/
COPY ms-campuslab-audit/pom.xml ms-campuslab-audit/
COPY ms-campuslab-report/pom.xml ms-campuslab-report/
COPY ms-campuslab-bff/pom.xml ms-campuslab-bff/
COPY ms-campuslab-rabbitmq-admin/pom.xml ms-campuslab-rabbitmq-admin/
COPY ms-campuslab-kafka-admin/pom.xml ms-campuslab-kafka-admin/
RUN --mount=type=cache,target=/root/.m2 mvn -B -ntp dependency:go-offline || true
COPY . .
RUN --mount=type=cache,target=/root/.m2 \
    if [ -f application-docker.yml ]; then cp application-docker.yml "${MODULE_NAME}/src/main/resources/application-docker.yml"; fi \
    && mvn -B -ntp clean package -pl "${MODULE_NAME}" -am -DskipTests
RUN JAR="$(find "${MODULE_NAME}/target" -maxdepth 1 -type f -name '*.jar' ! -name '*.original' | head -n 1)" \
    && test -n "${JAR}" \
    && cp "${JAR}" /build/app.jar
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /build/app.jar /app/app.jar
ENV SPRING_PROFILES_ACTIVE=docker
EXPOSE 8080 8081 8082 8083 8084 8085 8086 8087 8090
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

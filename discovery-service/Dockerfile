# ==================================================================
#  Dockerfile — Discovery Service (Eureka)
#  Multi-stage: Stage 1 compila, Stage 2 ejecuta (imagen liviana)
# ==================================================================

# Stage 1: Build con Maven
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Copiar pom.xml primero (caché de dependencias)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar código fuente y compilar
COPY src ./src
RUN mvn clean package -DskipTests -B

# ------------------------------------------------------------------
# Stage 2: Runtime con JRE minimal (imagen mucho más pequeña)
# ------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Crear usuario no-root por seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar el JAR desde stage 1
COPY --from=builder /app/target/*.jar app.jar

# Cambiar a usuario no-root
USER appuser

# Puerto del Discovery Service
EXPOSE 8761

# Variables de entorno por defecto (override en docker-compose)
ENV JAVA_OPTS="-Xms128m -Xmx256m"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

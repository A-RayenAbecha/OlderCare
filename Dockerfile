FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy Maven build files
COPY pom.xml .

# Copy source code
COPY src ./src

# Install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Build application
RUN mvn clean package -DskipTests

# Extract JAR
RUN mv target/oldercare-app-1.0.0.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD java -cp app.jar org.springframework.boot.loader.JarLauncher

# Expose port
EXPOSE 8080

# Run application
ENTRYPOINT ["java", "-jar", "app.jar"]

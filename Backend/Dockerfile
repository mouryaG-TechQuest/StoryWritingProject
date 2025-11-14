# Multi-stage Dockerfile: build with Maven then copy artifact to lightweight JRE image
FROM maven:3.9.5-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre-focal
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar ./app.jar
ENV JAVA_OPTS="-Xms256m -Xmx512m"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]

FROM maven:3.8.8-openjdk-17

WORKDIR /app
COPY app/server/pom.xml .
COPY app/server/src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=0 /app/target/*.jar /app/app.jar

ENV TZ=Asia/Shanghai

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

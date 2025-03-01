# 使用官方Maven镜像作为构建环境
FROM maven:3.8.1-jdk-11-slim AS builder

# 指定工作目录
WORKDIR /app

# 复制pom.xml
COPY app/server/pom.xml .

# 复制源代码
COPY app/server/src ./src

# 构建应用
RUN mvn clean package -DskipTests

# 使用轻量级的JRE运行环境
FROM adoptopenjdk/openjdk11:alpine-jre

WORKDIR /app

# 从构建阶段复制jar包
COPY --from=builder /app/target/*.jar app.jar

# 暴露端口
EXPOSE 8080

# 执行命令
CMD ["java", "-jar", "app.jar"]

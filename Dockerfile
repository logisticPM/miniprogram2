# 第一阶段：构建应用
FROM maven:3.6.0-jdk-8-slim AS builder

# 设置工作目录
WORKDIR /build

# 首先只复制pom.xml文件，利用Docker缓存机制
COPY app/server/pom.xml .

# 预下载所有依赖项（会被缓存）
RUN mvn dependency:go-offline -B

# 复制源代码
COPY app/server/src ./src

# 构建应用但跳过测试
RUN mvn package -DskipTests

# 第二阶段：运行环境
FROM openjdk:8-jre-slim

# 设置工作目录
WORKDIR /app

# 设置时区
ENV TZ=Asia/Shanghai

# 设置应用端口
ENV PORT=80

# 只复制构建好的JAR文件
COPY --from=builder /build/target/*.jar app.jar

# 暴露端口
EXPOSE 80

# 启动命令
CMD ["java", "-jar", "app.jar"]

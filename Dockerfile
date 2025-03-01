# 使用官方Maven镜像运行项目
FROM maven:3.6.0-jdk-8-slim

# 设置工作目录
WORKDIR /app

# 复制整个项目
COPY app/server /app

# 配置时区
ENV TZ=Asia/Shanghai

# 暴露端口
EXPOSE 8080

# 启动命令：先构建再运行
CMD ["sh", "-c", "mvn clean package -DskipTests && java -jar target/*.jar"]

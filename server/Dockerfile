FROM openjdk:17-jdk-slim

WORKDIR /app

# 复制maven构建的jar包到镜像中
COPY target/*.jar app.jar

# 设置时区
ENV TZ=Asia/Shanghai

# 暴露8080端口
EXPOSE 8080

# 启动应用
CMD ["java", "-jar", "app.jar"] 
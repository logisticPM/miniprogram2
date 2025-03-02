FROM openjdk:17-jdk-slim

WORKDIR /app

# 创建微信云托管所需的cert目录和初始化脚本
RUN mkdir -p /app/cert \
    && echo '#!/bin/sh\necho "Initializing environment..."\nexit 0' > /app/cert/initenv.sh \
    && chmod +x /app/cert/initenv.sh

# 复制Maven构建的jar包到镜像中
COPY target/*.jar app.jar

# 设置时区
ENV TZ=Asia/Shanghai

# 暴露8080端口
EXPOSE 8080

# 启动应用
CMD ["java", "-jar", "app.jar"] 
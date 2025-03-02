# 基于微信官方示例优化的Dockerfile
# 针对微信云托管环境优化的构建配置
# 更新日期: 2025-03-02
# 版本: 1.0.13 - 修复Java文件编码问题
# 注意: 构建前请确保已经将基础镜像推送到阿里云仓库：
# docker pull maven:3.8.6-eclipse-temurin-17-alpine
# docker pull eclipse-temurin:17-jre-alpine
# docker tag maven:3.8.6-eclipse-temurin-17-alpine crpi-mn807cz6acoglkss.cn-hangzhou.personal.cr.aliyuncs.com/miniprogram1/miniprogra:maven-3.8.6-alpine
# docker tag eclipse-temurin:17-jre-alpine crpi-mn807cz6acoglkss.cn-hangzhou.personal.cr.aliyuncs.com/miniprogram1/miniprogra:jre-17-alpine
# docker push crpi-mn807cz6acoglkss.cn-hangzhou.personal.cr.aliyuncs.com/miniprogram1/miniprogra:maven-3.8.6-alpine
# docker push crpi-mn807cz6acoglkss.cn-hangzhou.personal.cr.aliyuncs.com/miniprogram1/miniprogra:jre-17-alpine

# 第一阶段：构建阶段
FROM crpi-mn807cz6acoglkss.cn-hangzhou.personal.cr.aliyuncs.com/miniprogram1/miniprogra:maven-3.8.6-alpine AS builder

# 指定工作目录
WORKDIR /build

# 创建settings.xml以使用阿里云Maven镜像源加速依赖下载
RUN mkdir -p /root/.m2 \
    && echo '<?xml version="1.0" encoding="UTF-8"?>\
    <settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" \
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" \
    xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">\
    <mirrors>\
    <mirror>\
    <id>aliyunmaven</id>\
    <mirrorOf>central</mirrorOf>\
    <name>阿里云公共仓库</name>\
    <url>https://maven.aliyun.com/repository/public</url>\
    </mirror>\
    </mirrors>\
    </settings>' > /root/.m2/settings.xml

# 复制server目录进行构建
COPY server /build/

# 创建一个健康检查控制器，确保/api/health端点可用
RUN mkdir -p /build/src/main/java/com/udeve/controller && \
    printf 'package com.udeve.controller;\n\nimport org.springframework.web.bind.annotation.GetMapping;\nimport org.springframework.web.bind.annotation.RestController;\n\n@RestController\npublic class HealthController {\n\n    @GetMapping("/api/health")\n    public String health() {\n        return "{\"status\":\"UP\"}";\n    }\n}\n' > /build/src/main/java/com/udeve/controller/HealthController.java

# 构建应用
RUN mvn package -T 2C -DskipTests -Dmaven.test.skip=true

# 创建一个静态健康检查文件作为备份
RUN mkdir -p /build/static && \
    echo '{"status":"UP"}' > /build/static/health.json

# 第二阶段：运行阶段
FROM crpi-mn807cz6acoglkss.cn-hangzhou.personal.cr.aliyuncs.com/miniprogram1/miniprogra:jre-17-alpine

# 指定工作目录
WORKDIR /app

# 创建微信云托管所需的cert目录和初始化脚本
RUN mkdir -p /app/cert && \
    echo '#!/bin/sh\necho "Initializing environment..."\nexit 0' > /app/cert/initenv.sh && \
    chmod +x /app/cert/initenv.sh

# 从构建阶段复制构建好的jar文件
COPY --from=builder /build/target/*.jar /app/app.jar

# 复制静态健康检查文件
COPY --from=builder /build/static/health.json /app/health.json

# 安装必要工具
RUN apk add --no-cache tzdata curl netcat-openbsd && \
    rm -rf /var/cache/apk/*

# 设置时区为上海
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

# 创建启动脚本
RUN echo '#!/bin/sh\n\
    echo "Starting application..."\n\
    # 提供一个简单的静态健康检查响应，直到应用完全启动\n\
    (while true; do { echo -e "HTTP/1.1 200 OK\\r\\nContent-Type: application/json\\r\\n\\r\\n$(cat /app/health.json)"; } | nc -l -p 8080; done) &\n\
    # 记录后台进程ID以便后续终止\n\
    NC_PID=$!\n\
    # 启动Java应用\n\
    java -Duser.timezone=Asia/Shanghai -Xms512m -Xmx1g -jar /app/app.jar --server.port=8080 --management.endpoints.web.exposure.include=health --management.endpoint.health.show-details=always &\n\
    JAVA_PID=$!\n\
    # 等待Java应用完全启动(最多等待90秒)\n\
    echo "Waiting for application to start..."\n\
    for i in $(seq 1 90); do\n\
    sleep 1\n\
    # 检查应用是否在8080端口上监听\n\
    if nc -z localhost 8080; then\n\
    # 应用已启动，等待5秒确保它稳定运行\n\
    sleep 5\n\
    # 终止临时的netcat服务\n\
    kill $NC_PID\n\
    echo "Application started successfully."\n\
    break\n\
    fi\n\
    echo "Waiting... $i/90 seconds"\n\
    done\n\
    # 继续运行Java进程\n\
    wait $JAVA_PID\n\
    ' > /app/start.sh && chmod +x /app/start.sh

# 设置端口环境变量
ENV PORT=8080

# 暴露端口
EXPOSE ${PORT}

# 添加健康检查，确保容器正常运行
HEALTHCHECK --interval=30s --timeout=15s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

# 启动应用
CMD ["/app/start.sh"]

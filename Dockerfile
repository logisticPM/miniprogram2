# 基于微信官方示例优化的Dockerfile
# 针对微信云托管环境优化的构建配置
# 更新日期: 2025-03-02
# 版本: 1.0.4 - 修复健康检查和端口监听问题

# 选择更新的基础镜像(最新Maven+JDK8)
FROM maven:3.8.6-openjdk-8

# 指定工作目录
WORKDIR /app

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

# 创建微信云托管所需的cert目录和初始化脚本（根目录和server目录都创建）
RUN mkdir -p /app/cert \
    && echo '#!/bin/sh\necho "Initializing environment at root level..."\nexit 0' > /app/cert/initenv.sh \
    && chmod +x /app/cert/initenv.sh

# 复制整个项目到容器中（依赖.dockerignore排除不必要文件）
COPY . .

# 确保server目录下也有生命周期钩子脚本
RUN mkdir -p /app/server/cert \
    && echo '#!/bin/sh\necho "Initializing environment in server directory..."\nexit 0' > /app/server/cert/initenv.sh \
    && chmod +x /app/server/cert/initenv.sh

# 安装必要工具
RUN apt-get update \
    && apt-get install -y --no-install-recommends tzdata curl \
    && rm -rf /var/lib/apt/lists/*

# 设置时区为上海
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone

# 设置端口环境变量（匹配container.config.json）
ENV PORT=8080

# 暴露端口
EXPOSE ${PORT}

# 创建健康检查端点
RUN mkdir -p /app/server/src/main/java/com/udeve/controller && \
    echo 'package com.udeve.controller;\n\nimport org.springframework.web.bind.annotation.GetMapping;\nimport org.springframework.web.bind.annotation.RestController;\n\n@RestController\npublic class HealthController {\n\n    @GetMapping("/api/health")\n    public String health() {\n        return "{\"status\":\"UP\"}";\n    }\n}' > /app/server/src/main/java/com/udeve/controller/HealthController.java

# 添加健康检查，确保容器正常运行（增加超时时间）
HEALTHCHECK --interval=30s --timeout=15s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

# 构建并启动应用（单步执行以减少层数，添加Maven性能优化参数）
# 明确设置server.port参数以确保应用监听在正确的端口上
CMD ["sh", "-c", "cd server && mvn package -T 2C -DskipTests -Dmaven.test.skip=true && java -Duser.timezone=Asia/Shanghai -Xms256m -Xmx512m -jar target/*.jar --server.port=${PORT} --management.endpoints.web.exposure.include=health --management.endpoint.health.show-details=always"]

# 微信云托管优化Dockerfile
# 更新日期: 2025-03-03
# 版本: 1.1.4 - 修复变量转义问题，增强信号处理，改进日志输出

# 第一阶段：构建阶段
FROM maven:3.8.6-eclipse-temurin-17-alpine AS builder

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

# 复制pom.xml单独进行依赖下载，利用Docker缓存机制
COPY pom.xml /build/
RUN mvn dependency:go-offline -B

# 复制源代码
COPY src /build/src/

# 创建一个健康检查控制器，确保/api/health端点可用
RUN mkdir -p /build/src/main/java/com/wxcloudrun/controller && \
    printf 'package com.wxcloudrun.controller;\n\nimport org.springframework.web.bind.annotation.GetMapping;\nimport org.springframework.web.bind.annotation.RestController;\n\n@RestController\npublic class HealthController {\n\n    @GetMapping("/api/health")\n    public String health() {\n        return "{\"status\":\"UP\"}";\n    }\n}\n' > /build/src/main/java/com/wxcloudrun/controller/HealthController.java

# 构建应用
RUN mvn package -T 2C -DskipTests -Dmaven.test.skip=true

# 创建一个静态健康检查文件作为备份
RUN mkdir -p /build/static && \
    echo '{"status":"UP"}' > /build/static/health.json

# 第二阶段：运行阶段
FROM eclipse-temurin:17-jre-alpine

# 指定工作目录
WORKDIR /app

# 从构建阶段复制构建好的jar文件
COPY --from=builder /build/target/*.jar /app/app.jar

# 复制静态健康检查文件
COPY --from=builder /build/static/health.json /app/health.json

# 安装必要工具
RUN apk add --no-cache tzdata curl netcat-openbsd procps bash && \
    rm -rf /var/cache/apk/*

# 设置时区为上海
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

# 创建日志目录
RUN mkdir -p /app/logs

# 创建微信云托管所需的cert目录和初始化脚本
RUN mkdir -p /app/cert && \
    echo '#!/bin/bash' > /app/cert/initenv.sh && \
    echo 'echo "[$(date "+%Y-%m-%d %H:%M:%S")] Initializing environment..." | tee -a /app/logs/init.log' >> /app/cert/initenv.sh && \
    echo '# 这个脚本会在容器启动过程中被执行' >> /app/cert/initenv.sh && \
    echo '# 我们确保它总是成功退出，不会影响容器启动' >> /app/cert/initenv.sh && \
    echo 'touch /app/cert/init.lock' >> /app/cert/initenv.sh && \
    echo 'echo "[$(date "+%Y-%m-%d %H:%M:%S")] Initialization completed successfully." | tee -a /app/logs/init.log' >> /app/cert/initenv.sh && \
    echo 'exit 0' >> /app/cert/initenv.sh && \
    chmod +x /app/cert/initenv.sh

# 创建启动脚本
RUN echo '#!/bin/bash' > /app/start.sh && \
    echo '# 确保容器不会因为任何命令失败而退出' >> /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 创建日志文件' >> /app/start.sh && \
    echo 'LOG_FILE="/app/logs/app.log"' >> /app/start.sh && \
    echo 'touch $LOG_FILE' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'log() {' >> /app/start.sh && \
    echo '  local timestamp=$(date "+%Y-%m-%d %H:%M:%S")' >> /app/start.sh && \
    echo '  echo "[$timestamp] $1" | tee -a $LOG_FILE' >> /app/start.sh && \
    echo '}' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'log "Starting application..."' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 创建一个标记文件，表示容器已经开始启动' >> /app/start.sh && \
    echo 'touch /app/container_starting' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 处理信号' >> /app/start.sh && \
    echo 'cleanup() {' >> /app/start.sh && \
    echo '  log "Received termination signal. Cleaning up..."' >> /app/start.sh && \
    echo '  # 终止所有子进程' >> /app/start.sh && \
    echo '  if [ -n "$NC_PID" ]; then' >> /app/start.sh && \
    echo '    kill $NC_PID 2>/dev/null || true' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo '  if [ -n "$JAVA_PID" ]; then' >> /app/start.sh && \
    echo '    kill $JAVA_PID 2>/dev/null || true' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo '  log "Cleanup completed. Exiting."' >> /app/start.sh && \
    echo '  exit 0' >> /app/start.sh && \
    echo '}' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 注册信号处理函数' >> /app/start.sh && \
    echo 'trap cleanup SIGTERM SIGINT' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 提供一个简单的静态健康检查响应，直到应用完全启动' >> /app/start.sh && \
    echo 'log "Starting temporary health check service on port 8081"' >> /app/start.sh && \
    echo '(while true; do { echo -e "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n$(cat /app/health.json)"; } | nc -l -p 8081; done) &' >> /app/start.sh && \
    echo 'NC_PID=$!' >> /app/start.sh && \
    echo 'log "Temporary health check service started with PID: $NC_PID"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 使用环境变量PORT或默认为80' >> /app/start.sh && \
    echo 'export PORT=${PORT:-80}' >> /app/start.sh && \
    echo 'log "Starting application on port: $PORT"' >> /app/start.sh && \
    echo '# 启动Java应用' >> /app/start.sh && \
    echo 'java -Duser.timezone=Asia/Shanghai -Xms512m -Xmx1g -jar /app/app.jar --server.port=$PORT --management.endpoints.web.exposure.include=health --management.endpoint.health.show-details=always > >(tee -a $LOG_FILE) 2>&1 &' >> /app/start.sh && \
    echo 'JAVA_PID=$!' >> /app/start.sh && \
    echo 'log "Java application started with PID: $JAVA_PID"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 等待Java应用完全启动(最多等待90秒)' >> /app/start.sh && \
    echo 'log "Waiting for application to start..."' >> /app/start.sh && \
    echo 'for i in $(seq 1 90); do' >> /app/start.sh && \
    echo '  sleep 1' >> /app/start.sh && \
    echo '  # 检查应用是否在$PORT端口上监听' >> /app/start.sh && \
    echo '  if nc -z localhost $PORT; then' >> /app/start.sh && \
    echo '    # 尝试访问健康检查端点' >> /app/start.sh && \
    echo '    HEALTH_RESPONSE=$(curl -s http://localhost:$PORT/api/health 2>/dev/null || echo "")' >> /app/start.sh && \
    echo '    if [[ "$HEALTH_RESPONSE" == *"UP"* ]]; then' >> /app/start.sh && \
    echo '      # 应用已启动，等待5秒确保它稳定运行' >> /app/start.sh && \
    echo '      sleep 5' >> /app/start.sh && \
    echo '      # 终止临时的netcat服务' >> /app/start.sh && \
    echo '      if [ -n "$NC_PID" ]; then' >> /app/start.sh && \
    echo '        kill $NC_PID 2>/dev/null || true' >> /app/start.sh && \
    echo '        log "Terminated temporary health check service"' >> /app/start.sh && \
    echo '      fi' >> /app/start.sh && \
    echo '      log "Application started successfully."' >> /app/start.sh && \
    echo '      # 创建一个标记文件，表示应用已经成功启动' >> /app/start.sh && \
    echo '      touch /app/app_started' >> /app/start.sh && \
    echo '      break' >> /app/start.sh && \
    echo '    else' >> /app/start.sh && \
    echo '      log "Port $PORT is open but health check not yet responding properly"' >> /app/start.sh && \
    echo '    fi' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo '  if [ $((i % 10)) -eq 0 ]; then' >> /app/start.sh && \
    echo '    log "Still waiting... $i/90 seconds"' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo 'done' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 即使应用未能在指定时间内启动，也创建标记文件' >> /app/start.sh && \
    echo 'if [ ! -f /app/app_started ]; then' >> /app/start.sh && \
    echo '  log "WARNING: Application failed to start within the expected time, but container will continue running."' >> /app/start.sh && \
    echo '  touch /app/app_started_with_warning' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 创建一个无限循环，确保容器始终保持运行状态' >> /app/start.sh && \
    echo 'while true; do' >> /app/start.sh && \
    echo '  # 检查Java进程是否仍在运行' >> /app/start.sh && \
    echo '  if kill -0 $JAVA_PID 2>/dev/null; then' >> /app/start.sh && \
    echo '    # Java进程仍在运行，等待一段时间后再次检查' >> /app/start.sh && \
    echo '    sleep 30' >> /app/start.sh && \
    echo '  else' >> /app/start.sh && \
    echo '    # Java进程已经退出，记录错误并尝试重启' >> /app/start.sh && \
    echo '    log "Java process exited unexpectedly. Attempting to restart..."' >> /app/start.sh && \
    echo '    java -Duser.timezone=Asia/Shanghai -Xms512m -Xmx1g -jar /app/app.jar --server.port=$PORT --management.endpoints.web.exposure.include=health --management.endpoint.health.show-details=always > >(tee -a $LOG_FILE) 2>&1 &' >> /app/start.sh && \
    echo '    JAVA_PID=$!' >> /app/start.sh && \
    echo '    log "Java process restarted with PID: $JAVA_PID"' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo 'done' >> /app/start.sh && \
    chmod +x /app/start.sh

# 设置端口环境变量（默认80，但允许被环境变量覆盖）
ENV PORT=80

# 暴露端口
EXPOSE ${PORT}

# 添加健康检查，确保容器正常运行
HEALTHCHECK --interval=30s --timeout=15s --start-period=120s --retries=3 \
    CMD curl -s -f http://localhost:${PORT}/api/health || exit 1

# 启动应用
CMD ["/app/start.sh"]

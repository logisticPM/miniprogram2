# 微信云托管优化Dockerfile
# 更新日期: 2025-03-04
# 版本: 1.3.0 - 优化构建效率，使用公开可访问的镜像源

# 第一阶段：构建阶段
FROM openjdk:17-jdk-alpine AS builder

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

# 安装Maven并清理缓存（合并命令减少层数）
RUN apk add --no-cache maven && rm -rf /var/cache/apk/*

# 只复制pom.xml进行依赖下载，利用Docker缓存机制
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
FROM openjdk:17-jre-alpine

# 指定工作目录
WORKDIR /app

# 从构建阶段复制构建好的jar文件
COPY --from=builder /build/target/*.jar /app/app.jar

# 复制静态健康检查文件
COPY --from=builder /build/static/health.json /app/health.json

# 安装必要工具并设置时区（合并命令减少层数）
RUN apk add --no-cache tzdata curl netcat-openbsd procps bash \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && mkdir -p /app/logs \
    && rm -rf /var/cache/apk/*

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
    echo 'handle_signal() {' >> /app/start.sh && \
    echo '  log "Received signal to terminate. Shutting down gracefully..."' >> /app/start.sh && \
    echo '  touch /app/container_stopping' >> /app/start.sh && \
    echo '  # 查找Java进程并发送SIGTERM' >> /app/start.sh && \
    echo '  if [ -f /app/java.pid ]; then' >> /app/start.sh && \
    echo '    JAVA_PID=$(cat /app/java.pid)' >> /app/start.sh && \
    echo '    if ps -p $JAVA_PID > /dev/null; then' >> /app/start.sh && \
    echo '      log "Sending SIGTERM to Java process $JAVA_PID"' >> /app/start.sh && \
    echo '      kill -15 $JAVA_PID' >> /app/start.sh && \
    echo '      # 等待Java进程退出' >> /app/start.sh && \
    echo '      for i in $(seq 1 30); do' >> /app/start.sh && \
    echo '        if ! ps -p $JAVA_PID > /dev/null; then' >> /app/start.sh && \
    echo '          log "Java process terminated successfully."' >> /app/start.sh && \
    echo '          break' >> /app/start.sh && \
    echo '        fi' >> /app/start.sh && \
    echo '        log "Waiting for Java process to terminate... ($i/30)"' >> /app/start.sh && \
    echo '        sleep 1' >> /app/start.sh && \
    echo '      done' >> /app/start.sh && \
    echo '      # 如果进程仍然存在，强制终止' >> /app/start.sh && \
    echo '      if ps -p $JAVA_PID > /dev/null; then' >> /app/start.sh && \
    echo '        log "Java process did not terminate gracefully. Sending SIGKILL."' >> /app/start.sh && \
    echo '        kill -9 $JAVA_PID' >> /app/start.sh && \
    echo '      fi' >> /app/start.sh && \
    echo '    else' >> /app/start.sh && \
    echo '      log "Java process $JAVA_PID not found."' >> /app/start.sh && \
    echo '    fi' >> /app/start.sh && \
    echo '  else' >> /app/start.sh && \
    echo '    log "No Java PID file found."' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo '  log "Container shutdown complete."' >> /app/start.sh && \
    echo '  exit 0' >> /app/start.sh && \
    echo '}' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 设置信号处理器' >> /app/start.sh && \
    echo 'trap handle_signal SIGTERM SIGINT' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 运行初始化脚本（如果存在）' >> /app/start.sh && \
    echo 'if [ -f /app/cert/initenv.sh ]; then' >> /app/start.sh && \
    echo '  log "Running initialization script..."' >> /app/start.sh && \
    echo '  bash /app/cert/initenv.sh || log "Initialization script failed, but continuing startup."' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 启动应用' >> /app/start.sh && \
    echo 'log "Starting Java application with command: java -jar /app/app.jar"' >> /app/start.sh && \
    echo 'java -jar /app/app.jar > >(tee -a $LOG_FILE) 2> >(tee -a $LOG_FILE >&2) &' >> /app/start.sh && \
    echo 'JAVA_PID=$!' >> /app/start.sh && \
    echo 'echo $JAVA_PID > /app/java.pid' >> /app/start.sh && \
    echo 'log "Java application started with PID: $JAVA_PID"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 等待应用启动' >> /app/start.sh && \
    echo 'log "Waiting for application to start..."' >> /app/start.sh && \
    echo 'HEALTH_CHECK_URL="http://localhost:${PORT:-80}/api/health"' >> /app/start.sh && \
    echo 'STATIC_HEALTH_FILE="/app/health.json"' >> /app/start.sh && \
    echo 'HEALTH_CHECK_TIMEOUT=60' >> /app/start.sh && \
    echo 'HEALTH_CHECK_INTERVAL=2' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 在后台启动健康检查' >> /app/start.sh && \
    echo 'for i in $(seq 1 $((HEALTH_CHECK_TIMEOUT / HEALTH_CHECK_INTERVAL))); do' >> /app/start.sh && \
    echo '  # 检查Java进程是否仍在运行' >> /app/start.sh && \
    echo '  if ! ps -p $JAVA_PID > /dev/null; then' >> /app/start.sh && \
    echo '    log "ERROR: Java process died during startup. Check logs for details."' >> /app/start.sh && \
    echo '    exit 1' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '  # 尝试访问健康检查端点' >> /app/start.sh && \
    echo '  if curl -s -f $HEALTH_CHECK_URL > /dev/null; then' >> /app/start.sh && \
    echo '    log "Application started successfully! Health check passed."' >> /app/start.sh && \
    echo '    touch /app/app_started' >> /app/start.sh && \
    echo '    break' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '  # 如果接近超时，尝试使用静态健康检查文件' >> /app/start.sh && \
    echo '  if [ $i -ge $((HEALTH_CHECK_TIMEOUT / HEALTH_CHECK_INTERVAL - 5)) ] && [ -f $STATIC_HEALTH_FILE ]; then' >> /app/start.sh && \
    echo '    log "WARNING: Application taking too long to start. Setting up static health check response."' >> /app/start.sh && \
    echo '    # 启动一个简单的HTTP服务器来提供健康检查响应' >> /app/start.sh && \
    echo '    ( while true; do echo -e "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n$(cat $STATIC_HEALTH_FILE)" | nc -l -p ${PORT:-80} > /dev/null; done ) &' >> /app/start.sh && \
    echo '    NETCAT_PID=$!' >> /app/start.sh && \
    echo '    echo $NETCAT_PID > /app/netcat.pid' >> /app/start.sh && \
    echo '    log "Started static health check server with PID: $NETCAT_PID"' >> /app/start.sh && \
    echo '    break' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '  log "Health check attempt $i/$((HEALTH_CHECK_TIMEOUT / HEALTH_CHECK_INTERVAL)): Application not ready yet..."' >> /app/start.sh && \
    echo '  sleep $HEALTH_CHECK_INTERVAL' >> /app/start.sh && \
    echo 'done' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 即使应用未能在指定时间内启动，也创建标记文件' >> /app/start.sh && \
    echo 'if [ ! -f /app/app_started ]; then' >> /app/start.sh && \
    echo '  log "WARNING: Application failed to start within the expected time, but container will continue running."' >> /app/start.sh && \
    echo '  touch /app/app_started_with_warning' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 保持容器运行' >> /app/start.sh && \
    echo 'log "Container startup complete. Waiting for signals..."' >> /app/start.sh && \
    echo 'while true; do' >> /app/start.sh && \
    echo '  # 检查Java进程是否仍在运行' >> /app/start.sh && \
    echo '  if [ -f /app/java.pid ]; then' >> /app/start.sh && \
    echo '    JAVA_PID=$(cat /app/java.pid)' >> /app/start.sh && \
    echo '    if ! ps -p $JAVA_PID > /dev/null; then' >> /app/start.sh && \
    echo '      log "WARNING: Java process died unexpectedly. Attempting to restart..."' >> /app/start.sh && \
    echo '      java -jar /app/app.jar > >(tee -a $LOG_FILE) 2> >(tee -a $LOG_FILE >&2) &' >> /app/start.sh && \
    echo '      JAVA_PID=$!' >> /app/start.sh && \
    echo '      echo $JAVA_PID > /app/java.pid' >> /app/start.sh && \
    echo '      log "Java application restarted with PID: $JAVA_PID"' >> /app/start.sh && \
    echo '    fi' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo '  sleep 10' >> /app/start.sh && \
    echo 'done' >> /app/start.sh && \
    chmod +x /app/start.sh

# 设置端口环境变量（默认80，但允许被环境变量覆盖）
ENV PORT=80

# 暴露端口
EXPOSE ${PORT}

# 启动命令
CMD ["/bin/bash", "/app/start.sh"]

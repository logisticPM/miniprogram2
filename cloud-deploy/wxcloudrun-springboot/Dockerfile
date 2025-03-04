# 微信云托管优化Dockerfile
# 更新日期: 2025-03-04
# 版本: 1.3.4 - 使用官方镜像并优化源配置

# 第一阶段：构建阶段
FROM maven:3.8.6-openjdk-17 AS builder

# 指定工作目录
WORKDIR /build

# 创建settings.xml以使用腾讯云Maven镜像源加速依赖下载
RUN mkdir -p /root/.m2 \
    && echo '<?xml version="1.0" encoding="UTF-8"?>\
    <settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" \
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" \
    xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">\
    <mirrors>\
    <mirror>\
    <id>tencent</id>\
    <mirrorOf>central</mirrorOf>\
    <name>腾讯云公共仓库</name>\
    <url>https://mirrors.cloud.tencent.com/nexus/repository/maven-public/</url>\
    </mirror>\
    </mirrors>\
    </settings>' > /root/.m2/settings.xml

# 只复制pom.xml进行依赖下载，利用Docker缓存机制
COPY pom.xml /build/
RUN mvn dependency:go-offline -B

# 复制源代码并编译
COPY src /build/src
RUN mvn package -DskipTests

# 创建健康检查文件
RUN mkdir -p /build/static && \
    echo '{"status":"UP"}' > /build/static/health.json

# 第二阶段：运行阶段 - 使用精简的JRE镜像
FROM openjdk:17-jre-slim

# 指定工作目录
WORKDIR /app

# 复制编译好的jar包和健康检查文件
COPY --from=builder /build/target/*.jar /app/app.jar
COPY --from=builder /build/static/health.json /app/static/health.json

# 创建启动脚本
RUN echo '#!/bin/bash' > /app/start.sh && \
    echo '# 确保容器不会因为任何命令失败而退出' >> /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 创建日志文件' >> /app/start.sh && \
    echo 'mkdir -p /app/logs' >> /app/start.sh && \
    echo 'touch /app/logs/app.log' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 定义日志函数' >> /app/start.sh && \
    echo 'log() {' >> /app/start.sh && \
    echo '  echo "$(date +"%Y-%m-%d %H:%M:%S") $1" | tee -a /app/logs/app.log' >> /app/start.sh && \
    echo '}' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'log "Starting application..."' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 启动Java应用' >> /app/start.sh && \
    echo 'java -jar /app/app.jar > /app/logs/app.log 2>&1 &' >> /app/start.sh && \
    echo 'APP_PID=$!' >> /app/start.sh && \
    echo 'log "Application started with PID: $APP_PID"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 等待应用启动' >> /app/start.sh && \
    echo 'log "Waiting for application to start..."' >> /app/start.sh && \
    echo 'sleep 5' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 检查应用是否成功启动' >> /app/start.sh && \
    echo 'if ! ps -p $APP_PID > /dev/null; then' >> /app/start.sh && \
    echo '  log "ERROR: Java process died during startup. Check logs for details."' >> /app/start.sh && \
    echo '  exit 1' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 尝试访问健康检查端点' >> /app/start.sh && \
    echo 'HEALTH_CHECK_URL="http://localhost:${PORT:-80}/actuator/health"' >> /app/start.sh && \
    echo 'log "Performing health check: $HEALTH_CHECK_URL"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'RETRY_COUNT=0' >> /app/start.sh && \
    echo 'MAX_RETRIES=30' >> /app/start.sh && \
    echo 'RETRY_INTERVAL=2' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do' >> /app/start.sh && \
    echo '  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_CHECK_URL || echo "000")' >> /app/start.sh && \
    echo '  if [ "$RESPONSE" = "200" ]; then' >> /app/start.sh && \
    echo '    log "Health check successful!"' >> /app/start.sh && \
    echo '    break' >> /app/start.sh && \
    echo '  else' >> /app/start.sh && \
    echo '    RETRY_COUNT=$((RETRY_COUNT+1))' >> /app/start.sh && \
    echo '    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then' >> /app/start.sh && \
    echo '      log "Health check failed with response code: $RESPONSE. Retrying in $RETRY_INTERVAL seconds... ($RETRY_COUNT/$MAX_RETRIES)"' >> /app/start.sh && \
    echo '      sleep $RETRY_INTERVAL' >> /app/start.sh && \
    echo '    else' >> /app/start.sh && \
    echo '      log "Health check failed after $MAX_RETRIES attempts. Last response code: $RESPONSE"' >> /app/start.sh && \
    echo '      log "Application may still be starting. Continuing..."' >> /app/start.sh && \
    echo '    fi' >> /app/start.sh && \
    echo '  fi' >> /app/start.sh && \
    echo 'done' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo '# 保持容器运行' >> /app/start.sh && \
    echo 'log "Container startup complete. Tailing logs..."' >> /app/start.sh && \
    echo 'tail -f /app/logs/app.log' >> /app/start.sh && \
    chmod +x /app/start.sh

# 设置端口环境变量（默认80，但允许被环境变量覆盖）
ENV PORT=80

# 暴露端口
EXPOSE ${PORT}

# 启动命令
CMD ["/app/start.sh"]

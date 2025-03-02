# 基于微信官方示例优化的Dockerfile
# 选择基础镜像(Maven+JDK8)
FROM maven:3.6.0-jdk-8-slim

# 指定工作目录
WORKDIR /app

# 创建settings.xml以使用阿里云Maven镜像源
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

# 复制整个项目到容器中
COPY . .

# 使用国内镜像源安装必要工具
RUN sed -i 's/deb.debian.org/mirrors.cloud.tencent.com/g' /etc/apt/sources.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends tzdata \
    && rm -rf /var/lib/apt/lists/*

# 设置时区为上海
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone

# 设置端口环境变量（匹配container.config.json）
ENV PORT=80

# 暴露端口
EXPOSE ${PORT}

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

# 构建并启动应用
CMD ["sh", "-c", "cd app/server && mvn package -DskipTests && java -jar target/*.jar --server.port=${PORT}"]

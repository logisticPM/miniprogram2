# 基于微信官方示例优化的Dockerfile
# 针对微信云托管环境优化的构建配置
# 更新日期: 2025-03-02

# 选择基础镜像(Maven+JDK8)
FROM maven:3.6.0-jdk-8-slim

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

# 复制整个项目到容器中（依赖.dockerignore排除不必要文件）
COPY . .

# 将APT源更新为Debian Stretch归档地址
RUN sed -i 's|http://deb.debian.org/debian|http://archive.debian.org/debian|g' /etc/apt/sources.list \
    && sed -i 's|http://security.debian.org/debian-security|http://archive.debian.org/debian-security|g' /etc/apt/sources.list \
    && echo 'Acquire::Check-Valid-Until "false";' > /etc/apt/apt.conf.d/99no-check-valid \
    && apt-get update \
    && apt-get install -y --no-install-recommends tzdata curl \
    && rm -rf /var/lib/apt/lists/*

# 设置时区为上海
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone

# 设置端口环境变量（匹配container.config.json）
ENV PORT=80

# 暴露端口
EXPOSE ${PORT}

# 添加健康检查，确保容器正常运行
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

# 构建并启动应用（单步执行以减少层数，添加Maven性能优化参数）
CMD ["sh", "-c", "cd app/server && mvn package -T 2C -DskipTests -Dmaven.test.skip=true && java -Duser.timezone=Asia/Shanghai -Xms256m -Xmx512m -jar target/*.jar --server.port=${PORT}"]

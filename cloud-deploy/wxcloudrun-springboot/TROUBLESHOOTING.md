# 微信云托管故障排查指南

## 常见问题与解决方案

### 1. 构建失败问题

#### 1.1 镜像拉取失败
- **症状**: 构建日志中出现 `pulling from host mirror.ccs.tencentyun.com failed with status code [manifests xxx]: 500 Internal Server Error`
- **原因**: 腾讯云镜像仓库可能暂时无法访问特定的基础镜像
- **解决方案**: 
  - 使用官方Docker Hub镜像，微信云托管已配置腾讯加速源
  - 通过更新其他文件（如README.md或container.config.json中的TRIGGER_REBUILD）触发重新构建
  - 不需要在Dockerfile中手动配置registry-mirrors

#### 1.2 依赖下载失败
- **症状**: 构建日志中出现 `Could not resolve dependencies for project`
- **原因**: Maven仓库连接不稳定
- **解决方案**:
  - 在Dockerfile中配置腾讯云Maven镜像源:
  ```xml
  <mirror>
    <id>tencent</id>
    <mirrorOf>central</mirrorOf>
    <name>腾讯云公共仓库</name>
    <url>https://mirrors.cloud.tencent.com/nexus/repository/maven-public/</url>
  </mirror>
  ```

### 2. 运行时问题

#### 2.1 健康检查失败
- **症状**: 部署后服务状态显示 `Readiness probe failed: dial tcp xx.xx.xx.xx:80: connect: connection refused`
- **原因**: 容器暴露端口与应用监听端口不一致
- **解决方案**:
  - 确保以下三处端口配置一致:
    1. container.config.json: `containerPort` 设为 80
    2. application.yml: `server.port=${PORT:80}`
    3. Dockerfile: `ENV PORT=80` 和 `EXPOSE ${PORT}`

#### 2.2 应用启动缓慢
- **症状**: 部署后服务启动时间过长，导致健康检查超时
- **原因**: 容器资源配置不足或应用初始化过程耗时
- **解决方案**:
  - 增加容器规格 (CPU/内存)
  - 优化应用启动过程
  - 在启动脚本中添加静态健康检查响应

### 3. 性能优化

#### 3.1 减小镜像体积
- 使用多阶段构建，仅保留运行必需的文件
- 使用轻量级基础镜像，如 `openjdk:17-jre-slim` 替代完整的 JDK 镜像
- 清理构建缓存和临时文件

#### 3.2 加速构建过程
- 利用Docker缓存机制，先复制pom.xml下载依赖，再复制源代码
- 使用腾讯云镜像源加速依赖下载
- 适当调整Maven构建参数，如 `-T 2C` 启用并行构建

## 微信云托管限制与最佳实践

1. **请求限制**:
   - 小程序/公众号中CallContainer超时时间不得超过15秒
   - 请求大小限制100K，不建议包含图片，应使用对象存储

2. **安全与配置**:
   - 如仅在小程序/公众号中使用CallContainer，可关闭公网访问
   - 默认公网域名性能有限制，仅能支持接口测试，不应用于正式环境

3. **实例管理**:
   - 最小副本为0时，半小时无请求服务将缩容到0，再次请求需重启服务
   - 要避免冷启动影响，可将最小副本数设为1（会产生持续费用）

4. **存储与架构**:
   - 容器不支持持久化存储，不应将文件直接存储在容器中
   - 容器扩缩容/重启时，写入的文件会被还原，应使用对象存储

## 常用命令与操作

### 触发重新构建
更新 `container.config.json` 中的 `TRIGGER_REBUILD` 时间戳:
```json
"envParams": {
  "TRIGGER_REBUILD": "2025-03-04-1520"
}
```

### 查看容器日志
在微信云托管控制台 -> 服务 -> 日志中查看运行日志和构建日志

### 检查健康状态
访问 `/actuator/health` 端点查看应用健康状态

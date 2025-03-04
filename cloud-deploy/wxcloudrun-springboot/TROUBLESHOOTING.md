# 微信云托管故障排除指南

## Docker构建问题

### 问题：镜像构建失败 - buildkit相关错误

**症状**：
在构建Docker镜像时遇到与buildkit相关的错误，例如：
- `pulling from host mirror.ccs.tencentyun.com failed with status code [manifests xxx]: 500 Internal Server Error`
- 日志中出现"booting buildkit"相关信息
- 构建过程卡住或失败

**解决方案**：

1. **检查并停止buildkit容器**：
   ```bash
   # 查看当前运行的容器，找到buildkit相关容器
   docker ps
   
   # 停止buildkit容器
   docker stop buildx_buildkit_容器名称
   
   # 删除buildkit容器
   docker rm buildx_buildkit_容器名称
   ```

2. **检查并切换Docker builder**：
   ```bash
   # 列出当前的builders
   docker builder ls
   
   # 如果默认builder不是使用"docker"作为driver/endpoint，切换到正确的builder
   docker builder use default
   ```

3. **重新启动构建过程**：
   ```bash
   # 重新构建镜像
   docker build -t 镜像名称 .
   ```

### 问题：镜像拉取失败

**症状**：
- 微信云托管构建日志中出现镜像拉取失败的错误
- 错误信息包含：`pulling from host mirror.ccs.tencentyun.com failed`

**解决方案**：

1. **使用稳定的基础镜像**：
   - 避免使用latest标签
   - 使用特定版本的基础镜像，如`openjdk:17-jre-alpine`而非`openjdk:latest`

2. **使用自定义镜像仓库**：
   - 将构建好的镜像推送到阿里云Docker Registry
   - 在微信云托管中使用该镜像
   - 详细配置请参考[docker-registry-config.md](./docker-registry-config.md)

3. **触发重新构建而不修改基础镜像**：
   - 通过更新环境变量`TRIGGER_REBUILD`触发重新构建
   - 在`container.config.json`中更新该变量的值

## 健康检查问题

### 问题：健康检查失败

**症状**：
- 部署日志中出现：`Readiness probe failed: dial tcp xx.xx.xx.xx:80: connect: connection refused`
- 容器启动后很快就被终止

**解决方案**：

1. **确保端口配置一致**：
   - `container.config.json`中的`containerPort`
   - `application.yml`中的`server.port`
   - Dockerfile中的`EXPOSE`指令
   - 所有端口配置应统一为80

2. **提供轻量级健康检查接口**：
   - 实现`/api/health`或`/api/ping`端点
   - 确保这些端点快速响应，不依赖于数据库或其他服务

3. **增加启动超时时间**：
   - 在启动脚本中增加适当的等待时间
   - 添加启动状态检查机制

## 资源限制问题

### 问题：容器内存不足

**症状**：
- 应用频繁重启
- 日志中出现OOM (Out of Memory)错误

**解决方案**：

1. **增加容器内存配置**：
   - 在`container.config.json`中将`mem`参数从2GB增加到2.5GB或更高

2. **优化JVM内存配置**：
   - 在启动命令中添加适当的JVM参数，如`-Xmx2g -Xms512m`

3. **减少不必要的内存消耗**：
   - 优化代码中的内存使用
   - 避免大量数据加载到内存

## 其他常见问题

### 问题：冷启动超时

**解决方案**：
- 设置最小副本数为1，避免冷启动（会产生持续费用）
- 优化应用启动时间
- 实现预热机制

### 问题：请求超时

**解决方案**：
- 记住微信云托管的请求超时限制为15秒
- 优化长时间运行的操作
- 对于需要长时间处理的任务，考虑异步处理方式

---

如有其他问题，请参考[微信云托管官方文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/basic/intro.html)或提交问题到项目仓库。

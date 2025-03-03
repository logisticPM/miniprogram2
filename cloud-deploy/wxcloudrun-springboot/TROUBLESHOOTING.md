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

### 问题：镜像拉取失败或超时

**症状**：
- 微信云托管构建日志中出现镜像拉取失败的错误
- 错误信息包含：`pulling from host mirror.ccs.tencentyun.com failed`
- 错误信息包含：`dial tcp xxx.xxx.xxx.xxx:443: i/o timeout`
- 错误信息包含：`DeadlineExceeded: openjdk:17-jre-alpine: failed to do request`

**解决方案**：

1. **使用阿里云镜像源替代Docker Hub**：
   - 修改Dockerfile，将基础镜像从Docker Hub替换为阿里云镜像仓库中的镜像
   - 例如，将 `FROM openjdk:17-jre-alpine` 替换为 `FROM registry.cn-hangzhou.aliyuncs.com/aliyun-openjdk/openjdk:17-jre-alpine`
   - 这样可以避免从国际Docker Hub拉取镜像时的网络问题

2. **在Dockerfile中添加重试机制**：
   ```dockerfile
   # 添加重试机制的示例
   RUN --mount=type=cache,target=/var/cache/apt \
       apt-get update && \
       for i in $(seq 1 3); do apt-get install -y --no-install-recommends package-name && s=0 && break || s=$? && sleep 15; done; (exit $s)
   ```

3. **使用自定义镜像仓库**：
   - 将构建好的镜像推送到阿里云Docker Registry
   - 在微信云托管中使用该镜像
   - 详细配置请参考[docker-registry-config.md](./docker-registry-config.md)

4. **触发重新构建而不修改基础镜像**：
   - 通过更新环境变量`TRIGGER_REBUILD`触发重新构建
   - 在`container.config.json`中更新该变量的值

5. **使用多阶段构建减少依赖**：
   - 使用多阶段构建，只在最终镜像中包含必要的组件
   - 减少对外部镜像的依赖

### 问题：阿里云镜像仓库访问权限错误

**症状**：
- 构建日志中出现类似以下错误：
- `ERROR: failed to solve: registry.cn-hangzhou.aliyuncs.com/aliyun-openjdk/openjdk:17-jre-alpine: pull access denied, repository does not exist or may require authorization: server message: insufficient_scope: authorization failed`

**解决方案**：

1. **使用公开可访问的Docker Hub镜像**：
   - 修改Dockerfile，将阿里云镜像源替换回Docker Hub官方镜像
   - 例如，将 `FROM registry.cn-hangzhou.aliyuncs.com/aliyun-openjdk/openjdk:17-jre-alpine` 替换为 `FROM openjdk:17-jre-alpine`
   - 这样可以避免权限问题，因为Docker Hub的官方镜像是公开可访问的

2. **关闭自定义镜像仓库设置**：
   - 在`container.config.json`中将`USE_CUSTOM_REGISTRY`和`USE_ALIYUN_MIRROR`设置为`"false"`
   - 更新`TRIGGER_REBUILD`时间戳以触发重新构建

3. **如果确实需要使用阿里云镜像**：
   - 确保微信云托管有权限访问指定的阿里云镜像仓库
   - 可能需要设置镜像仓库为公开访问
   - 或者配置适当的访问凭证

**实际案例**：

以下是一个修复了镜像拉取超时问题的Dockerfile示例：

```dockerfile
# 使用阿里云镜像源替代Docker Hub
FROM registry.cn-hangzhou.aliyuncs.com/aliyun-openjdk/openjdk:17-jdk-alpine AS builder

# 构建阶段...

# 运行阶段也使用阿里云镜像源
FROM registry.cn-hangzhou.aliyuncs.com/aliyun-openjdk/openjdk:17-jre-alpine

# 运行阶段配置...
```

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

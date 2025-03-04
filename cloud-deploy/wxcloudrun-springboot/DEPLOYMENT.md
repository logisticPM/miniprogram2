# 微信云托管部署指南

## 健康检查配置

微信云托管使用Kubernetes健康检查来监控应用状态。正确配置健康检查对于应用的稳定运行至关重要。

### 健康检查端点

应用提供了以下健康检查端点：

- `/api/health` - 主健康检查端点，返回应用状态信息
- `/api/ping` - 简单的ping测试端点，用于快速检查应用是否响应
- `/api/environment` - 环境信息端点，用于诊断配置问题

### 端口配置

应用默认使用**80端口**，可通过环境变量`PORT`覆盖。确保健康检查配置与应用实际使用的端口一致：

```yaml
readinessProbe:
  httpGet:
    path: /api/health
    port: 80  # 使用实际的应用端口
```

### 启动时间配置

应用冷启动可能需要一定时间，特别是在资源受限的环境中。建议配置足够的启动时间：

```yaml
startupProbe:
  httpGet:
    path: /api/ping
    port: 80
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 12  # 允许应用最多2分钟启动时间
```

## 常见问题排查

### 健康检查失败 - Connection Refused

如果健康检查报告"Connection Refused"错误：

1. **检查端口配置**：确保健康检查使用的端口与应用实际监听的端口一致
2. **查看应用日志**：检查应用是否成功启动并监听端口
3. **延长启动时间**：增加`initialDelaySeconds`和`failureThreshold`，给应用更多启动时间
4. **检查资源限制**：确保应用有足够的CPU和内存资源

### 应用启动缓慢

如果应用启动时间过长：

1. **优化应用启动**：减少启动时依赖的外部服务
2. **增加资源限制**：提高CPU和内存限制
3. **使用启动探针**：配置`startupProbe`，允许应用有足够的启动时间

## 环境变量配置

应用支持以下环境变量：

- `PORT` - 应用监听端口，默认为80
- `MYSQL_ADDRESS` - MySQL数据库地址
- `MYSQL_DATABASE` - MySQL数据库名称
- `MYSQL_USERNAME` - MySQL用户名
- `MySQL_PASSWORD` - MySQL密码
- `ADMIN_PASSWORD` - 管理员密码

确保在微信云托管控制台中正确配置这些环境变量。

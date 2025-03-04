# 阿里云Docker Registry配置信息

## 仓库信息
- **仓库名称**: miniprogra
- **仓库地域**: 华东1（杭州）
- **仓库类型**: 公开

## 访问地址
- **公网地址**: crpi-mn807cz6acoglkss.cn-hangzhou.personal.cr.aliyuncs.com/miniprogram1/miniprogra
- **专有网络**: crpi-mn807cz6acoglkss-vpc.cn-hangzhou.personal.cr.aliyuncs.com/miniprogram1/miniprogra

## 操作指南

### 1. 登录阿里云Docker Registry
```bash
docker login --username=starrynight crpi-mn807cz6acoglkss.cn-hangzhou.personal.cr.aliyuncs.com
```
用于登录的用户名为阿里云账号全名，密码为开通服务时设置的密码。

### 2. 从Registry中拉取镜像
```bash
docker pull crpi-mn807cz6acoglkss.cn-hangzhou.personal.cr.aliyuncs.com/miniprogram1/miniprogra:[镜像版本号]
```

### 3. 将镜像推送到Registry
```bash
docker login --username=starrynight crpi-mn807cz6acoglkss.cn-hangzhou.personal.cr.aliyuncs.com
docker tag [ImageId] crpi-mn807cz6acoglkss.cn-hangzhou.personal.cr.aliyuncs.com/miniprogram1/miniprogra:[镜像版本号]
docker push crpi-mn807cz6acoglkss.cn-hangzhou.personal.cr.aliyuncs.com/miniprogram1/miniprogra:[镜像版本号]
```

### 4. 选择合适的镜像仓库地址
- 从ECS推送镜像时，可以选择使用镜像仓库内网地址，推送速度将得到提升并且将不会损耗公网流量。
- 如果使用的机器位于VPC网络，请使用 `crpi-mn807cz6acoglkss-vpc.cn-hangzhou.personal.cr.aliyuncs.com` 作为Registry的域名登录。

## 微信云托管集成说明

为解决微信云托管镜像拉取失败问题，我们可以将构建好的镜像推送到阿里云Docker Registry，然后在微信云托管中使用这个镜像。

### 集成步骤
1. 在本地或CI/CD环境中构建Docker镜像
2. 将镜像推送到阿里云Docker Registry
3. 在微信云托管的配置中指定使用阿里云Docker Registry中的镜像

### 示例CI/CD脚本
```bash
#!/bin/bash
# 构建镜像
docker build -t wxcloudrun-springboot:v1.0 .

# 登录阿里云Docker Registry
docker login --username=starrynight --password=$REGISTRY_PASSWORD crpi-mn807cz6acoglkss.cn-hangzhou.personal.cr.aliyuncs.com

# 标记镜像
docker tag wxcloudrun-springboot:v1.0 crpi-mn807cz6acoglkss.cn-hangzhou.personal.cr.aliyuncs.com/miniprogram1/miniprogra:v1.0

# 推送镜像
docker push crpi-mn807cz6acoglkss.cn-hangzhou.personal.cr.aliyuncs.com/miniprogram1/miniprogra:v1.0
```

## 注意事项
- 确保CI/CD环境中已设置阿里云Docker Registry的访问凭证
- 镜像版本号建议使用语义化版本号或构建日期时间作为标识
- 在微信云托管中使用阿里云Docker Registry的镜像时，需要确保微信云托管有权限访问该镜像

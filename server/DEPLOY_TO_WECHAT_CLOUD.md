# 友得云客微信云托管部署指南

本文档提供将友得云客(app)项目部署到微信云托管平台的详细步骤。

## 前提条件

1. 已注册微信小程序，且为非个人小程序（企业、政府、媒体、其他组织类型）
2. 已开通微信云托管服务
3. 已有MySQL数据库和Redis服务（可使用微信云托管的MySQL和Redis服务）

## 部署步骤

### 1. 准备服务端代码

1. 确保已克隆友得云客项目代码
2. 进入服务端目录：`cd app/server`
3. 执行构建脚本：`chmod +x build.sh && ./build.sh`

### 2. 部署到微信云托管

1. 登录[微信云托管控制台](https://cloud.weixin.qq.com)
2. 创建新的服务，服务名称如：`udyk-server`
3. 上传方式选择"本地代码上传"
4. 上传`app/server`目录（包含Dockerfile和container.config.json）
5. 确认上传并等待构建完成

### 3. 配置环境变量

在微信云托管控制台中，找到刚创建的服务，配置以下环境变量：

- `MYSQL_ADDRESS`: MySQL数据库地址，格式为`host:port/database`
- `MYSQL_USERNAME`: MySQL用户名
- `MYSQL_PASSWORD`: MySQL密码
- `REDIS_ADDRESS`: Redis服务器地址
- `REDIS_PASSWORD`: Redis密码
- `SPRING_PROFILES_ACTIVE`: 设置为`prod`

### 4. 开启服务访问

1. 在"高级配置"中，开启"公网访问"
2. 记录下系统分配的公网域名

### 5. 配置小程序端

1. 进入`app/weapp`目录
2. 修改小程序配置，将API接口地址指向微信云托管服务地址
3. 使用微信开发者工具打开项目并上传

### 6. 验证部署

1. 在微信云托管控制台查看服务运行状态
2. 通过公网访问测试API接口
3. 使用开发版小程序测试功能

## 常见问题

### 数据库初始化

首次部署时，需要确保数据库已初始化。您可以在微信云托管的"云托管数据库"中导入预先准备的SQL文件。

### 文件存储

微信云托管的容器存储是临时的，建议将文件存储更改为使用对象存储服务，如微信云托管的云存储或其他兼容的对象存储服务。

### 服务扩缩容

在container.config.json中已设置了基本的扩缩容策略，可根据实际需求在微信云托管控制台中调整。

## 参考资料

- [微信云托管官方文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [Java应用部署到微信云托管](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/container/java.html) 
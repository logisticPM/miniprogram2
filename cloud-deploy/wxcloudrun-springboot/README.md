# wxcloudrun-springboot
[![GitHub license](https://img.shields.io/github/license/WeixinCloud/wxcloudrun-express)](https://github.com/WeixinCloud/wxcloudrun-express)
![GitHub package.json dependency version (prod)](https://img.shields.io/badge/maven-3.6.0-green)
![GitHub package.json dependency version (prod)](https://img.shields.io/badge/jdk-11-green)

微信云托管 Java Springboot 框架模版，实现简单的计数器读写接口，使用云托管 MySQL 读写、记录计数值。

![](https://qcloudimg.tencent-cloud.cn/raw/be22992d297d1b9a1a5365e606276781.png)

## 更新日志

### 2025-03-04 14:14 更新
- 修复镜像拉取权限问题，使用公开可访问的Docker Hub官方镜像
- 关闭自定义镜像仓库设置，提高构建稳定性
- 更新故障排除指南，添加镜像权限问题解决方案

### 2025-03-04 13:55 更新
- 添加Docker buildkit相关问题的故障排除指南
- 完善镜像构建和健康检查问题的解决方案
- 整理常见问题和解决方法到TROUBLESHOOTING.md

### 2025-03-04 13:50 更新
- 集成阿里云Docker Registry，解决镜像拉取失败问题
- 添加镜像仓库配置文档
- 优化构建流程，提高部署成功率

### 2025-03-04 13:39 更新
- 优化构建流程，减少镜像拉取失败风险
- 增加构建缓存策略，提高部署速度
- 更新部署文档，添加故障排除指南

### 2025-03-04 更新
- 优化容器配置，增加内存至2.5GB
- 修复健康检查配置，确保容器正常启动
- 统一端口配置为80，解决健康检查失败问题
- 增强错误处理和日志记录
- 添加更详细的部署文档

## 新增功能：房产小程序抢房活动

本项目新增了房产小程序抢房活动功能，支持以下特性：

- 创建抢房活动（需管理员权限）
- 参与抢房活动（需活动密码）
- 选择并抢购房间
- 查看抢购记录
- 支持多种户型和楼层选择

详细API文档请参考下方。

## 微信云托管最佳实践

本项目遵循以下微信云托管最佳实践：

1. **端口配置**
   - 统一使用80端口，确保健康检查正常工作
   - 在container.config.json、application.yml和Dockerfile中保持一致

2. **健康检查**
   - 提供轻量级健康检查接口 `/api/health` 和 `/api/ping`
   - 优化启动脚本，确保应用正确初始化

3. **资源配置**
   - 内存配置为2.5GB，确保应用稳定运行
   - CPU配置为1核，满足一般负载需求

4. **安全实践**
   - 使用环境变量管理敏感配置
   - 实现管理员密码保护关键接口

5. **数据持久化**
   - 使用MySQL存储业务数据
   - 不在容器内存储持久化文件

## 阿里云Docker Registry集成

为解决微信云托管镜像拉取失败问题，本项目集成了阿里云Docker Registry：

1. **仓库信息**
   - 仓库名称: miniprogra
   - 仓库地域: 华东1（杭州）
   - 公网地址: crpi-mn807cz6acoglkss.cn-hangzhou.personal.cr.aliyuncs.com/miniprogram1/miniprogra

2. **集成优势**
   - 提高镜像拉取成功率
   - 加快部署速度
   - 提供更稳定的镜像存储服务

3. **使用方式**
   - 详细配置请参考 [docker-registry-config.md](./docker-registry-config.md)

## 构建优化策略

为提高构建成功率和部署效率，本项目采用以下策略：

1. **镜像拉取优化**
   - 使用稳定的基础镜像版本
   - 通过环境变量触发重建而非修改基础镜像
   - 增加镜像拉取超时时间

2. **构建缓存策略**
   - 优化Maven依赖缓存
   - 分层构建Dockerfile，提高缓存命中率
   - 使用.dockerignore排除不必要文件

3. **部署稳定性**
   - 增加健康检查重试机制
   - 优化容器启动顺序
   - 实现优雅关闭和错误处理

## 云托管部署说明

本项目已针对微信云托管环境进行了优化，主要包括：

- 端口配置统一为80（可通过环境变量PORT覆盖）
- 健康检查接口优化，支持快速响应
- 容器启动脚本增强，提供更详细的启动日志
- 支持冷启动预热，减少首次访问超时问题

更多部署细节请参考`DEPLOYMENT.md`文档。

## 快速开始
前往 [微信云托管快速开始页面](https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/basic/guide.html)，选择相应语言的模板，根据引导完成部署。

## 本地调试
下载代码在本地调试，请参考[微信云托管本地调试指南](https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/guide/debug/)。

## 实时开发
代码变动时，不需要重新构建和启动容器，即可查看变动后的效果。请参考[微信云托管实时开发指南](https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/guide/debug/dev.html)

## Dockerfile最佳实践
请参考[如何提高项目构建效率](https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/scene/build/speed.html)

## 目录结构说明
~~~
.
├── Dockerfile                      Dockerfile 文件
├── LICENSE                         LICENSE 文件
├── README.md                       README 文件
├── container.config.json           模板部署「服务设置」初始化配置（二开请忽略）
├── mvnw                            mvnw 文件，处理mevan版本兼容问题
├── mvnw.cmd                        mvnw.cmd 文件，处理mevan版本兼容问题
├── pom.xml                         pom.xml文件
├── settings.xml                    maven 配置文件
├── springboot-cloudbaserun.iml     项目配置文件
├── kubernetes-deployment.yaml      Kubernetes部署配置文件
├── DEPLOYMENT.md                   部署指南文档
├── check-cloud-config.sh           云托管配置检查脚本
├── docker-registry-config.md       阿里云Docker Registry配置文档
├── TROUBLESHOOTING.md              故障排除指南文档
└── src                             源码目录
    └── main                        源码主目录
        ├── java                    业务逻辑目录
        └── resources               资源文件目录
~~~

## 环境变量
- MYSQL_ADDRESS: MySQL访问地址，如 10.0.0.1:3306
- MYSQL_USERNAME：MySQL用户名
- MySQL_PASSWORD：MySQL密码
- MYSQL_DATABASE：MySQL数据库
- PORT：应用监听端口，默认为80（重要：确保云托管服务管理接口也配置为80）
- ADMIN_PASSWORD：管理员密码，用于创建活动（默认值：9000000）

## 端口配置说明
本应用默认使用**80端口**，可通过环境变量`PORT`覆盖。请确保：

1. 在云托管控制台中，将服务端口设置为80
2. 健康检查配置使用正确的端口和路径（/api/health）
3. 如需修改端口，请同时更新以下位置：
   - 环境变量`PORT`
   - 云托管服务管理接口配置
   - Dockerfile中的EXPOSE指令

更多部署和配置信息，请参考[DEPLOYMENT.md](./DEPLOYMENT.md)文件。

## 服务 API 文档

### `GET /api/count`

获取当前计数

#### 请求参数

无

#### 响应结果

- `code`：错误码
- `data`：当前计数值

##### 响应结果示例

```json
{
  "code": 0,
  "data": 42
}
```

#### 调用示例

```
curl https://<云托管服务域名>/api/count
```



### `POST /api/count`

更新计数，自增或者清零

#### 请求参数

- `action`：`string` 类型，枚举值
  - 等于 `"inc"` 时，表示计数加一
  - 等于 `"clear"` 时，表示计数重置（清零）

##### 请求参数示例

```
{
  "action": "inc"
}
```

#### 响应结果

- `code`：错误码
- `data`：当前计数值

##### 响应结果示例

```json
{
  "code": 0,
  "data": 42
}
```

#### 调用示例

```
curl -X POST -H 'content-type: application/json' -d '{"action": "inc"}' https://<云托管服务域名>/api/count
```

### 抢房活动API

### `POST /api/activity/create`

创建抢房活动

#### 请求参数

```json
{
  "adminPassword": "9000000",
  "title": "XX楼盘抢房活动",
  "startTime": "2025-03-10T10:00:00",
  "endTime": "2025-03-15T18:00:00",
  "password": "123456",
  "buildingNumber": "1号楼",
  "unitCount": 2,
  "floorCount": 18,
  "houseTypes": ["A", "B", "C"]
}
```

### `GET /api/activity/list`

获取活动列表

### `GET /api/activity/{id}`

获取活动详情

### `POST /api/activity/verify`

验证活动密码

```json
{
  "activityId": 1,
  "password": "123456"
}
```

### `GET /api/activity/{id}/rooms`

获取活动房间列表

### `POST /api/activity/grab`

抢购房间

```json
{
  "activityId": 1,
  "roomIds": [1, 2, 3],
  "phoneNumber": "13800138000",
  "password": "123456"
}
```

### `GET /api/activity/record/{phoneNumber}`

获取用户抢购记录

## 使用注意
如果不是通过微信云托管控制台部署模板代码，而是自行复制/下载模板代码后，手动新建一个服务并部署，需要在「服务设置」中补全以下环境变量，才可正常使用，否则会引发无法连接数据库，进而导致部署失败。
- MYSQL_ADDRESS
- MYSQL_PASSWORD
- MYSQL_USERNAME
以上三个变量的值请按实际情况填写。如果使用云托管内MySQL，可以在控制台MySQL页面获取相关信息。

此外，抢房活动功能需要额外配置以下环境变量：
- ADMIN_PASSWORD：管理员密码，用于创建活动（默认值：9000000）

## License

[MIT](./LICENSE)

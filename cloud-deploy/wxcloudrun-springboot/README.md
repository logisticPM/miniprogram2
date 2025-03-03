# wxcloudrun-springboot
[![GitHub license](https://img.shields.io/github/license/WeixinCloud/wxcloudrun-express)](https://github.com/WeixinCloud/wxcloudrun-express)
![GitHub package.json dependency version (prod)](https://img.shields.io/badge/maven-3.6.0-green)
![GitHub package.json dependency version (prod)](https://img.shields.io/badge/jdk-11-green)

微信云托管 Java Springboot 框架模版，实现简单的计数器读写接口，使用云托管 MySQL 读写、记录计数值。

![](https://qcloudimg.tencent-cloud.cn/raw/be22992d297d1b9a1a5365e606276781.png)

## 新增功能：房产小程序抢房活动

本项目新增了房产小程序抢房活动功能，支持以下特性：

- 创建抢房活动（需管理员权限）
- 参与抢房活动（需活动密码）
- 选择并抢购房间
- 查看抢购记录
- 支持多种户型和楼层选择

详细API文档请参考下方。

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
└── src                             源码目录
    └── main                        源码主目录
        ├── java                    业务逻辑目录
        └── resources               资源文件目录
~~~


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

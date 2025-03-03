# 房产小程序抢房活动部署指南

本文档提供了房产小程序抢房活动后端系统的详细部署步骤，包括环境配置、数据库设置和系统部署。

## 系统要求

- Java 17
- Maven 3.6.0+
- MySQL 8.0+
- 微信云托管环境

## 部署步骤

### 1. 准备工作

1. 确保您有一个微信小程序，并已开通微信云托管服务
2. 获取微信小程序的 AppID 和 AppSecret
3. 在微信云托管控制台创建一个新的环境（如开发环境、生产环境）

### 2. 数据库配置

系统使用 MySQL 数据库存储抢房活动和房间信息。数据库表结构已在 `container.config.json` 文件中定义，包括：

- `Activities` 表：存储抢房活动信息
- `Rooms` 表：存储房间信息

部署时，系统会自动创建这些表。如需手动创建，可执行以下 SQL 语句：

```sql
CREATE TABLE IF NOT EXISTS `Activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL COMMENT '活动标题',
  `start_time` datetime NOT NULL COMMENT '开始时间',
  `end_time` datetime NOT NULL COMMENT '结束时间',
  `password` varchar(50) NOT NULL COMMENT '活动密码',
  `building_number` varchar(50) NOT NULL COMMENT '楼号',
  `unit_count` int NOT NULL COMMENT '单元数',
  `floor_count` int NOT NULL COMMENT '楼层数',
  `house_types` varchar(255) NOT NULL COMMENT '户型列表，JSON格式',
  `status` int NOT NULL DEFAULT '0' COMMENT '状态：0-未开始，1-进行中，2-已结束',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `Rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_id` int NOT NULL COMMENT '活动ID',
  `unit` int NOT NULL COMMENT '单元号',
  `floor` int NOT NULL COMMENT '楼层',
  `room_number` varchar(20) NOT NULL COMMENT '房间号',
  `house_type` varchar(20) NOT NULL COMMENT '户型',
  `status` int NOT NULL DEFAULT '0' COMMENT '状态：0-可抢，1-已抢',
  `phone_number` varchar(20) DEFAULT NULL COMMENT '抢购人手机号',
  `grab_time` datetime DEFAULT NULL COMMENT '抢购时间',
  PRIMARY KEY (`id`),
  KEY `idx_activity_id` (`activity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### 3. 环境变量配置

在微信云托管控制台，为您的服务配置以下环境变量：

- `MYSQL_ADDRESS`：MySQL 数据库地址，格式为 `host:port`
- `MYSQL_USERNAME`：MySQL 数据库用户名
- `MYSQL_PASSWORD`：MySQL 数据库密码
- `ADMIN_PASSWORD`：管理员密码，用于创建活动（默认值：9000000）

### 4. 部署方式

#### 方式一：通过微信云托管控制台部署

1. 在微信云托管控制台创建一个新服务
2. 选择「代码上传」方式，上传本项目代码
3. 配置所需的环境变量
4. 点击「部署」按钮

#### 方式二：通过 GitHub Actions 自动部署

本项目已配置 GitHub Actions 工作流，可实现代码推送后自动部署到微信云托管。

1. Fork 本项目到您的 GitHub 账号
2. 在 GitHub 仓库设置中添加以下 Secrets：
   - `WX_CLOUD_ENV`：微信云托管环境 ID
   - `WX_CLOUD_API_KEY`：微信云托管 API 密钥
   - `WX_CLOUD_API_TOKEN`：微信云托管 API 令牌
3. 推送代码到 `main` 分支，触发自动部署

### 5. 验证部署

部署完成后，可通过以下方式验证系统是否正常运行：

1. 访问服务的基础 URL，例如：`https://<您的服务域名>/`
2. 尝试创建一个抢房活动：
   ```
   POST /api/activity/create
   {
     "adminPassword": "9000000",
     "title": "测试抢房活动",
     "startTime": "2025-03-10T10:00:00",
     "endTime": "2025-03-15T18:00:00",
     "password": "123456",
     "buildingNumber": "1号楼",
     "unitCount": 2,
     "floorCount": 18,
     "houseTypes": ["A", "B", "C"]
   }
   ```
3. 获取活动列表：`GET /api/activity/list`

## 常见问题

### 数据库连接失败

- 检查环境变量 `MYSQL_ADDRESS`、`MYSQL_USERNAME` 和 `MYSQL_PASSWORD` 是否正确配置
- 确保 MySQL 数据库已启动且可访问
- 检查数据库用户是否有足够的权限

### 活动创建失败

- 确保管理员密码正确（默认为 9000000，可通过环境变量 `ADMIN_PASSWORD` 修改）
- 检查请求参数格式是否正确
- 查看服务日志以获取详细错误信息

### 抢房失败

- 确保活动密码正确
- 检查活动是否在进行中（未开始或已结束的活动无法抢房）
- 确保房间未被抢购
- 检查请求参数格式是否正确

## 性能优化建议

对于高并发抢房场景，建议进行以下优化：

1. 配置足够的服务实例数量，建议至少 3 个实例
2. 考虑使用 Redis 缓存热点数据，减轻数据库压力
3. 实现请求限流机制，防止恶意请求
4. 优化数据库索引，特别是 `Rooms` 表的 `activity_id` 字段
5. 考虑使用消息队列处理抢房请求，避免直接写入数据库

## 联系支持

如遇到部署或使用问题，请联系系统管理员或提交 GitHub Issue。

# 房产小程序 - 微信云托管版

本项目是一个房产小程序的微信云托管版本，移除了与微信小程序前后端交互以及云部署无关的代码，专注于微信云托管部署。

## 项目结构

- `weapp/` - 微信小程序前端代码
- `wxcloudrun-springboot/` - 微信云托管后端服务（SpringBoot）
- `cloudfunctions/` - 微信云函数
- `.github/workflows/` - GitHub Actions工作流配置

## 部署步骤

### 1. 部署后端服务到微信云托管

#### 方式一：本地代码包上传

1. 登录[微信云托管控制台](https://cloud.weixin.qq.com/)
2. 创建新的环境（如果没有）
3. 创建新的服务
4. 选择"代码上传"方式部署
5. 上传`wxcloudrun-springboot`目录下的代码
6. 在服务配置中设置以下环境变量：
   - `MYSQL_ADDRESS`: 数据库地址
   - `MYSQL_USERNAME`: 数据库用户名
   - `MYSQL_PASSWORD`: 数据库密码
7. 点击"部署"按钮

#### 方式二：GitHub自动部署

1. 将项目代码推送到GitHub仓库
2. 登录[微信云托管控制台](https://cloud.weixin.qq.com/)
3. 创建新的服务或选择现有服务
4. 选择"源码部署" > "GitHub"
5. 按照提示授权并选择您的仓库和分支
6. 指定代码根目录为`cloud-deploy/wxcloudrun-springboot`
7. 配置自动部署触发器
8. 设置必要的环境变量
9. 点击"确认"开始部署

### 2. 部署微信小程序

1. 打开微信开发者工具
2. 导入`weapp`目录
3. 修改`weapp/config.js`文件中的配置：
   ```javascript
   // 云环境ID，替换为您的实际环境ID
   cloudEnv: 'your-cloud-env-id',
   // 服务名称，替换为您的实际服务名称
   serviceName: 'your-service-name',
   ```
4. 上传并发布小程序

### 3. 部署云函数（如需要）

1. 在微信开发者工具中，选择"云开发"
2. 上传`cloudfunctions`目录下的云函数

## GitHub工作流集成

本项目已配置GitHub Actions工作流，可以自动构建后端服务。工作流配置文件位于`.github/workflows/deploy.yml`。

当代码推送到主分支时，GitHub Actions会自动执行以下步骤：
1. 检出代码
2. 设置JDK 17环境
3. 使用Maven构建后端服务
4. 列出构建产物

要完成自动部署，您需要在微信云托管控制台中配置GitHub集成，详细步骤请参考`DEPLOY_GUIDE.md`文档中的"通过GitHub工作流自动部署"部分。

## 注意事项

1. 确保微信小程序的AppID与云托管环境关联
2. 数据库需要提前创建并导入必要的表结构
3. 云函数需要在云开发控制台中正确配置权限
4. 使用GitHub自动部署时，确保仓库中包含必要的配置文件（Dockerfile、container.config.json）

## 技术栈

- 前端：微信小程序原生框架 + Vant UI
- 后端：Java 17 + SpringBoot 2.7
- 数据库：MySQL 8
- CI/CD：GitHub Actions 
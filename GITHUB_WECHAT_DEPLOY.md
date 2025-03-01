# 从GitHub部署到微信云托管指南

本文档详细说明如何通过GitHub部署应用到微信云托管服务。

## 部署前准备

1. 确保你已经有以下文件：
   - 项目根目录的`Dockerfile`
   - 项目根目录的`container.config.json`
   - Spring Boot应用程序代码

2. GitHub仓库设置：
   - 创建一个新的GitHub仓库
   - 将本地代码推送到该仓库

## 部署步骤

### 1. 连接GitHub仓库

1. 登录[微信云托管控制台](https://cloud.weixin.qq.com/)
2. 选择你的环境（如"生产环境"）
3. 在左侧菜单中选择"服务列表"
4. 创建一个新服务或选择现有服务
5. 在服务详情页面，选择"部署"选项卡
6. 点击"源码部署"，然后选择"GitHub"
7. 按照指引授权微信云托管访问你的GitHub账号
8. 选择包含你应用程序代码的仓库
9. 选择包含`Dockerfile`的分支（通常是`main`或`master`）

### 2. 配置部署选项

1. 选择部署方式为"Dockerfile部署"
2. 选择Dockerfile路径（默认为根目录的`Dockerfile`）
3. 设置环境变量（如果需要修改`container.config.json`中的默认值）
4. 配置自动构建触发器（建议：当推送到主分支时自动构建）
5. 点击"确认"开始部署

### 3. 监控部署进度

1. 在"部署"选项卡中可以看到部署历史和当前部署状态
2. 部署过程通常包括：代码拉取、镜像构建、容器启动
3. 可以查看每个步骤的日志来诊断可能的问题

### 4. 验证部署

1. 部署成功后，在"概览"选项卡中可以看到服务的访问URL
2. 使用提供的URL测试你的应用程序
3. 检查应用日志确保一切正常运行

## 故障排除

### 构建失败

- 检查Dockerfile语法
- 确保Maven构建成功（可以在本地先测试）
- 查看构建日志了解具体错误

### 容器启动失败

- 检查环境变量配置是否正确
- 确认数据库连接信息是否正确
- 查看容器日志了解具体错误

### 应用程序错误

- 查看应用程序日志
- 确认Spring配置是否正确
- 测试数据库连接是否成功

## 最佳实践

1. 使用`application-cloud.properties`存储云环境特定配置
2. 在`container.config.json`中设置合适的资源限制
3. 使用GitHub Actions进行自动化测试
4. 采用分支策略，先在测试环境验证后再部署到生产环境
5. 定期检查和更新依赖版本

---
## 附录：重要文件说明

### Dockerfile

多阶段构建Dockerfile，用于构建Spring Boot应用并生成运行镜像。

### container.config.json

微信云托管配置文件，定义了容器运行所需的环境变量、资源限制等。

### application.properties / application-cloud.properties

Spring Boot应用配置文件，通过`spring.profiles.active=cloud`激活云环境专用配置。 
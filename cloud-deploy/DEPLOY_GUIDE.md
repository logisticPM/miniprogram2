# 微信云托管部署指南

本文档详细说明如何将友得云客房产小程序部署到微信云托管平台。

## 前提条件

1. 已注册微信小程序，并获取AppID
2. 已开通微信云开发和微信云托管
3. 已安装微信开发者工具
4. 如需通过GitHub自动部署，需要有GitHub账号并创建代码仓库

## 部署流程

### 一、准备工作

1. 登录[微信公众平台](https://mp.weixin.qq.com/)
2. 确认已开通云开发和云托管服务
3. 记录云环境ID，将在后续步骤中使用

### 二、部署后端服务

#### 1. 创建云托管服务

1. 登录[微信云托管控制台](https://cloud.weixin.qq.com/)
2. 选择或创建环境
3. 点击"新建服务"
4. 服务名称填写：`springboot-service`（可自定义）
5. 选择代码上传方式：`本地代码/代码包`或`GitHub源码`

#### 2A. 通过本地代码包上传

1. 将`wxcloudrun-springboot`目录打包成zip文件
2. 在云托管控制台上传zip文件
3. 设置以下环境变量：
   - `MYSQL_ADDRESS`: 数据库连接地址（如使用云托管MySQL，可在MySQL页面获取）
   - `MYSQL_USERNAME`: 数据库用户名
   - `MYSQL_PASSWORD`: 数据库密码
4. 点击"确认"，等待部署完成

#### 2B. 通过GitHub源码部署

1. 将项目代码推送到GitHub仓库
2. 确保仓库中包含以下文件：
   - `Dockerfile`: 定义如何构建Docker镜像
   - `container.config.json`: 微信云托管的容器配置文件
3. 在云托管控制台选择"GitHub源码"部署方式
4. 按照提示授权微信云托管访问您的GitHub账号
5. 选择要部署的仓库和分支
6. 指定代码根目录（通常为`wxcloudrun-springboot`）
7. 配置自动部署触发器（可选）：
   - 代码推送时自动部署
   - 定时自动部署
8. 设置必要的环境变量
9. 点击"确认"开始部署

#### 3. 配置数据库

1. 在云托管控制台创建MySQL实例（如果没有）
2. 记录数据库连接信息
3. 使用MySQL客户端连接数据库
4. 导入`wxcloudrun-springboot/src/main/resources/db.sql`文件初始化数据库

### 三、部署微信小程序

#### 1. 配置小程序

1. 打开微信开发者工具
2. 导入`weapp`目录
3. 修改`weapp/config.js`文件：
   ```javascript
   // 云环境ID，替换为您的实际环境ID
   cloudEnv: 'your-cloud-env-id',
   // 服务名称，替换为您的实际服务名称
   serviceName: 'springboot-service',
   ```

#### 2. 配置云开发

1. 在微信开发者工具中，点击"云开发"
2. 确认已创建云环境，并与当前项目关联
3. 初始化云环境（如果是首次使用）

#### 3. 部署云函数（如需要）

1. 在微信开发者工具中，选择"云开发" > "云函数"
2. 上传`cloudfunctions`目录下的云函数
3. 确保云函数权限配置正确

#### 4. 上传并发布小程序

1. 在微信开发者工具中，点击"上传"
2. 填写版本号和项目备注
3. 等待审核通过后发布

### 四、通过GitHub工作流自动部署（可选）

如果您希望通过GitHub Actions自动构建和部署项目，可以按照以下步骤配置：

#### 1. 准备GitHub仓库

1. 创建GitHub仓库并推送代码
2. 确保仓库结构正确，包含必要的文件：
   - `wxcloudrun-springboot/Dockerfile`
   - `wxcloudrun-springboot/container.config.json`
   - `wxcloudrun-springboot/pom.xml`等项目文件

#### 2. 配置GitHub Actions工作流

1. 在项目根目录创建`.github/workflows`目录
2. 创建`deploy.yml`文件，内容如下：
   ```yaml
   name: Build and Deploy to WeChat CloudRun

   on:
     push:
       branches: [ main ]  # 修改为您的主分支名

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Set up JDK 17
           uses: actions/setup-java@v3
           with:
             java-version: '17'
             distribution: 'temurin'
             
         - name: Build with Maven
           run: cd wxcloudrun-springboot && mvn clean package -DskipTests
           
         # 此步仅用于调试，实际部署由微信云托管自动完成
         - name: List files
           run: ls -la wxcloudrun-springboot/target
   ```

3. 推送工作流文件到GitHub仓库

#### 3. 在微信云托管中配置GitHub集成

1. 登录微信云托管控制台
2. 选择您的服务
3. 在"部署"选项卡中，选择"源码部署"
4. 选择"GitHub"作为代码来源
5. 按照提示授权并选择您的仓库和分支
6. 配置自动部署触发器（当GitHub Actions工作流完成时自动部署）
7. 点击"确认"完成配置

### 五、验证部署

1. 在微信开发者工具中预览小程序
2. 检查小程序是否能正常连接到云托管服务
3. 测试主要功能是否正常工作

### 六、常见问题

#### 1. 云托管服务无法访问

- 检查环境变量配置是否正确
- 查看云托管日志，排查可能的错误
- 确认服务是否正常启动

#### 2. 数据库连接失败

- 检查数据库连接信息是否正确
- 确认数据库是否允许外部连接
- 检查数据库用户权限

#### 3. 小程序无法调用云函数

- 确认云函数已正确部署
- 检查云函数权限设置
- 查看云函数调用日志

#### 4. GitHub自动部署失败

- 检查GitHub Actions工作流日志
- 确认微信云托管的GitHub集成配置正确
- 验证Dockerfile和container.config.json文件是否正确

## 参考资源

- [微信云托管文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [SpringBoot部署到云托管](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/container/deploy.html)
- [微信小程序云开发指南](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [GitHub Actions文档](https://docs.github.com/cn/actions)
- [微信云托管GitHub集成](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/container/deploy-github.html) 
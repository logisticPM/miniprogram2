# 微信小程序本地调试指南

本文档提供了如何在本地环境中调试微信小程序并连接到微信云托管服务的详细步骤。

## 1. 配置文件设置

在开始本地调试前，请确保正确配置以下文件：

### 1.1 config.js

打开 `weapp/config.js` 文件，确保以下配置正确：

```javascript
// 是否为开发环境
const isDev = true; // 设置为true启用开发环境

// 云开发环境配置
const config = {
  // ...
  // 云环境ID，替换为您的实际环境ID（在微信云托管控制台可以找到）
  cloudEnv: 'your-cloud-env-id', // 请替换为您的云环境ID
  // 服务名称，替换为您的实际服务名称（在微信云托管控制台可以找到）
  serviceName: 'your-service-name', // 请替换为您的服务名称
  // ...
  enableDebugLog: true // 启用调试日志
};
```

**重要提示：** 您需要将 `your-cloud-env-id` 和 `your-service-name` 替换为您在微信云托管控制台中看到的实际值。

## 2. 查找云环境ID和服务名称

1. 登录[微信云托管控制台](https://cloud.weixin.qq.com/)
2. 选择您的小程序项目
3. 在左侧菜单中，点击"云托管"
4. 在概览页面，您可以找到：
   - **环境ID**：通常显示在页面顶部
   - **服务名称**：在"服务列表"中可以找到

## 3. 使用微信开发者工具

### 3.1 导入项目

1. 打开微信开发者工具
2. 点击"项目" -> "导入项目"
3. 选择 `weapp` 目录作为项目目录
4. 输入您的小程序AppID
5. 点击"导入"

### 3.2 启用调试模式

1. 点击开发者工具右上角的"详情"
2. 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"
3. 勾选"开启调试模式"

## 4. 调试技巧

### 4.1 查看调试日志

我们已经在代码中添加了调试日志功能。在开发者工具的"调试器"面板中，选择"Console"标签页可以查看这些日志。

日志包括：
- API请求和响应
- 云环境初始化信息
- 登录状态信息

### 4.2 网络请求调试

1. 在开发者工具的"调试器"面板中，选择"Network"标签页
2. 可以查看所有网络请求的详细信息，包括：
   - 请求URL
   - 请求方法
   - 状态码
   - 响应数据

### 4.3 常见问题排查

#### 无法连接到云托管服务

如果遇到无法连接到云托管服务的问题，请检查：

1. `config.js` 中的 `cloudEnv` 和 `serviceName` 是否正确
2. 云托管服务是否正常运行
3. 网络请求是否有错误响应（查看Console日志）

#### 登录状态问题

如果遇到登录状态问题：
- 检查 `request.js` 中的 token 处理逻辑
- 使用开发者工具的"Storage"面板查看本地存储的 token

## 5. 切换环境

要在开发环境和生产环境之间切换，只需修改 `config.js` 中的 `isDev` 变量：

```javascript
// 切换为true时使用开发环境，false时使用生产环境
const isDev = true; // 或 false
```

## 6. 部署到生产环境

当您完成本地调试并准备部署到生产环境时：

1. 将 `config.js` 中的 `isDev` 设置为 `false`
2. 确保所有API路径和配置都正确
3. 使用微信开发者工具上传代码

## 7. 联系与支持

如果您在本地调试过程中遇到任何问题，请参考：
- 微信官方文档：https://developers.weixin.qq.com/miniprogram/dev/framework/
- 微信云托管文档：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html 